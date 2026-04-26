/**
 * Self-contained WebGL2 renderer that composites:
 *   photo + displacement + lighting + zone + design  →  one final image.
 *
 * The renderer owns its textures and program; it exposes setters for
 * per-frame inputs (garment color, active zone, design canvas) and a
 * render() method to draw on the supplied canvas.
 */
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./shaders";

export type MockupRenderInputs = {
  photoUrl: string;
  dispUrl: string;
  lightUrl: string;
  colorUrl: string;
  /** Map from zone key → mask URL. */
  zoneMaskUrls: Record<string, string>;
};

export type MockupRenderer = {
  /** Update active zone (must match a key in zoneMaskUrls). */
  setActiveZone: (zoneKey: string | null) => void;
  /** Update garment hex color (e.g. '#1a1a1a'). */
  setGarmentColor: (hex: string) => void;
  /** Provide the offscreen design canvas — its current pixels are sampled. */
  setDesignCanvas: (canvas: HTMLCanvasElement | null) => void;
  /** Show or hide the zone outline overlay. */
  setShowZone: (show: boolean) => void;
  /** Tune displacement intensity (0..0.05). */
  setDispStrength: (s: number) => void;
  /** Render once. Call after any setter changes (or on every RAF tick). */
  render: () => void;
  /** Free GPU resources. */
  dispose: () => void;
  /** Resize the underlying canvas drawing buffer to match its CSS size. */
  resize: () => void;
};

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, source);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) ?? "";
    gl.deleteShader(sh);
    throw new Error(`Shader compile failed: ${log}`);
  }
  return sh;
}

function linkProgram(gl: WebGL2RenderingContext, vs: WebGLShader, fs: WebGLShader): WebGLProgram {
  const p = gl.createProgram()!;
  gl.attachShader(p, vs);
  gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p) ?? "";
    throw new Error(`Program link failed: ${log}`);
  }
  return p;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${url}`));
    img.src = url;
  });
}

function uploadImageTexture(
  gl: WebGL2RenderingContext,
  img: HTMLImageElement,
  internalFormat: number,
  format: number,
): WebGLTexture {
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, format, gl.UNSIGNED_BYTE, img);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  return tex;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "").trim();
  const v =
    m.length === 3
      ? m.split("").map((c) => parseInt(c + c, 16))
      : [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
  return [v[0] / 255, v[1] / 255, v[2] / 255];
}

export async function createMockupRenderer(
  canvas: HTMLCanvasElement,
  inputs: MockupRenderInputs,
): Promise<MockupRenderer> {
  const gl = canvas.getContext("webgl2", { antialias: true, premultipliedAlpha: false });
  if (!gl) throw new Error("WebGL2 not supported");

  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = linkProgram(gl, vs, fs);
  gl.useProgram(program);

  // Fullscreen quad
  const quadBuf = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Load fixed textures
  const [photoImg, dispImg, lightImg, colorImg] = await Promise.all([
    loadImage(inputs.photoUrl),
    loadImage(inputs.dispUrl),
    loadImage(inputs.lightUrl),
    loadImage(inputs.colorUrl),
  ]);
  const photoTex = uploadImageTexture(gl, photoImg, gl.RGBA, gl.RGBA);
  const dispTex = uploadImageTexture(gl, dispImg, gl.RGBA, gl.RGBA);
  const lightTex = uploadImageTexture(gl, lightImg, gl.RGBA, gl.RGBA);
  const colorTex = uploadImageTexture(gl, colorImg, gl.RGBA, gl.RGBA);

  // Load all zone masks up front (small grayscale PNGs)
  const zoneTexs: Record<string, WebGLTexture> = {};
  for (const [key, url] of Object.entries(inputs.zoneMaskUrls)) {
    const img = await loadImage(url);
    zoneTexs[key] = uploadImageTexture(gl, img, gl.RGBA, gl.RGBA);
  }

  // 1x1 white texture for "no active zone"
  const allWhite = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, allWhite);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 255, 255]),
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // Design texture is dynamic; we (re)create on canvas changes.
  let designTex: WebGLTexture | null = null;
  let designSourceCanvas: HTMLCanvasElement | null = null;
  let designVersion = 0;
  let lastDesignVersion = -1;

  function uploadDesign() {
    if (!designSourceCanvas) {
      // Empty 1x1 transparent
      if (!designTex) {
        designTex = gl!.createTexture()!;
        gl!.bindTexture(gl!.TEXTURE_2D, designTex);
        gl!.texImage2D(
          gl!.TEXTURE_2D,
          0,
          gl!.RGBA,
          1,
          1,
          0,
          gl!.RGBA,
          gl!.UNSIGNED_BYTE,
          new Uint8Array([0, 0, 0, 0]),
        );
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
        gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
      }
      return;
    }
    if (!designTex) {
      designTex = gl!.createTexture()!;
    }
    gl!.bindTexture(gl!.TEXTURE_2D, designTex);
    gl!.pixelStorei(gl!.UNPACK_FLIP_Y_WEBGL, false);
    gl!.texImage2D(
      gl!.TEXTURE_2D,
      0,
      gl!.RGBA,
      gl!.RGBA,
      gl!.UNSIGNED_BYTE,
      designSourceCanvas,
    );
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
  }
  uploadDesign();

  // Uniform locations
  const uPhoto = gl.getUniformLocation(program, "uPhoto");
  const uDisp = gl.getUniformLocation(program, "uDisp");
  const uLight = gl.getUniformLocation(program, "uLight");
  const uColor = gl.getUniformLocation(program, "uColor");
  const uZone = gl.getUniformLocation(program, "uZone");
  const uDesign = gl.getUniformLocation(program, "uDesign");
  const uGarment = gl.getUniformLocation(program, "uGarment");
  const uDispStrength = gl.getUniformLocation(program, "uDispStrength");
  const uShowZone = gl.getUniformLocation(program, "uShowZone");
  gl.uniform1i(uPhoto, 0);
  gl.uniform1i(uDisp, 1);
  gl.uniform1i(uLight, 2);
  gl.uniform1i(uColor, 3);
  gl.uniform1i(uZone, 4);
  gl.uniform1i(uDesign, 5);

  // State
  let activeZoneKey: string | null = null;
  let garmentColor: [number, number, number] = [1, 1, 1];
  let showZone = true;
  let dispStrength = 0.012;

  function bindAllTextures() {
    gl!.activeTexture(gl!.TEXTURE0);
    gl!.bindTexture(gl!.TEXTURE_2D, photoTex);
    gl!.activeTexture(gl!.TEXTURE1);
    gl!.bindTexture(gl!.TEXTURE_2D, dispTex);
    gl!.activeTexture(gl!.TEXTURE2);
    gl!.bindTexture(gl!.TEXTURE_2D, lightTex);
    gl!.activeTexture(gl!.TEXTURE3);
    gl!.bindTexture(gl!.TEXTURE_2D, colorTex);
    gl!.activeTexture(gl!.TEXTURE4);
    const zoneTex = activeZoneKey ? zoneTexs[activeZoneKey] : allWhite;
    gl!.bindTexture(gl!.TEXTURE_2D, zoneTex ?? allWhite);
    gl!.activeTexture(gl!.TEXTURE5);
    if (designTex) gl!.bindTexture(gl!.TEXTURE_2D, designTex);
  }

  function render() {
    if (designVersion !== lastDesignVersion) {
      uploadDesign();
      lastDesignVersion = designVersion;
    }
    gl!.viewport(0, 0, canvas.width, canvas.height);
    gl!.clearColor(0.96, 0.96, 0.96, 1);
    gl!.clear(gl!.COLOR_BUFFER_BIT);
    gl!.uniform3f(uGarment, garmentColor[0], garmentColor[1], garmentColor[2]);
    gl!.uniform1f(uDispStrength, dispStrength);
    gl!.uniform1f(uShowZone, showZone ? 1.0 : 0.0);
    bindAllTextures();
    gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }
  resize();

  return {
    setActiveZone(zoneKey) {
      activeZoneKey = zoneKey;
    },
    setGarmentColor(hex) {
      garmentColor = hexToRgb(hex);
    },
    setDesignCanvas(c) {
      designSourceCanvas = c;
      designVersion += 1;
    },
    setShowZone(show) {
      showZone = show;
    },
    setDispStrength(s) {
      dispStrength = s;
    },
    render,
    resize,
    dispose() {
      gl!.deleteProgram(program);
      gl!.deleteShader(vs);
      gl!.deleteShader(fs);
      gl!.deleteBuffer(quadBuf);
      gl!.deleteTexture(photoTex);
      gl!.deleteTexture(dispTex);
      gl!.deleteTexture(lightTex);
      gl!.deleteTexture(colorTex);
      gl!.deleteTexture(allWhite);
      Object.values(zoneTexs).forEach((t) => gl!.deleteTexture(t));
      if (designTex) gl!.deleteTexture(designTex);
    },
  };
}
