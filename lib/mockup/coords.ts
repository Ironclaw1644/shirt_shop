/**
 * Coordinate helpers for mapping pointer events on the WebGL canvas back
 * to normalized photo UV space (0..1, top-left origin).
 *
 * The canvas may be smaller than the photo's intrinsic size; we just
 * normalize relative to the canvas bounding rect.
 */

export type UV = { u: number; v: number };

export function pointerToUV(canvas: HTMLCanvasElement, clientX: number, clientY: number): UV {
  const rect = canvas.getBoundingClientRect();
  const u = (clientX - rect.left) / rect.width;
  const v = (clientY - rect.top) / rect.height;
  return { u: Math.max(0, Math.min(1, u)), v: Math.max(0, Math.min(1, v)) };
}

/**
 * Pixel-perfect zone hit-test against a pre-loaded mask image. Returns
 * true if the mask is bright at the given UV.
 *
 * Uses an offscreen canvas snapshot of the mask for sampling — call
 * loadZoneSampler once per mask to avoid re-decoding the PNG per click.
 */
export type ZoneSampler = (uv: UV) => number;

export async function loadZoneSampler(maskUrl: string): Promise<ZoneSampler> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const im = new Image();
    im.crossOrigin = "anonymous";
    im.onload = () => resolve(im);
    im.onerror = () => reject(new Error(`failed to load ${maskUrl}`));
    im.src = maskUrl;
  });
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("2d context unavailable");
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, c.width, c.height);
  return ({ u, v }: UV) => {
    const x = Math.min(width - 1, Math.max(0, Math.floor(u * width)));
    const y = Math.min(height - 1, Math.max(0, Math.floor(v * height)));
    return data[(y * width + x) * 4] / 255;
  };
}
