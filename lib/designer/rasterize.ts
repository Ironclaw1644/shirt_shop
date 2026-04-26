import type { ImageElement, TextElement } from "./types";

export type RasterResult = {
  canvas: HTMLCanvasElement;
  /** Width-to-height ratio of the rasterized content (used to scale the decal). */
  aspect: number;
};

const TEXT_PADDING = 12;
/** Pixel resolution per inch of decal size — drives texture sharpness. */
const PX_PER_INCH = 64;

async function loadFont(family: string, sizePx: number): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(`${sizePx}px "${family}"`);
  } catch {
    // best-effort
  }
}

/**
 * Rasterize text to a transparent canvas sized snugly around the glyphs.
 * Returns the canvas and its width:height ratio for decal sizing.
 */
export async function rasterizeText(el: TextElement): Promise<RasterResult> {
  const { content, fontFamily, fontSize, fillColor } = el;
  const sizePx = Math.max(12, Math.round(fontSize * 2)); // 2x density for crisp rendering
  await loadFont(fontFamily, sizePx);

  const measureCanvas = document.createElement("canvas");
  const measureCtx = measureCanvas.getContext("2d");
  if (!measureCtx) throw new Error("2d context unavailable");
  measureCtx.font = `${sizePx}px "${fontFamily}", sans-serif`;
  measureCtx.textBaseline = "alphabetic";

  const lines = (content || " ").split("\n");
  const lineHeight = sizePx * 1.2;
  const widths = lines.map((line) => measureCtx.measureText(line).width);
  const maxWidth = Math.max(...widths, 1);
  const totalHeight = lineHeight * lines.length;

  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(maxWidth + TEXT_PADDING * 2);
  canvas.height = Math.ceil(totalHeight + TEXT_PADDING * 2);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.font = `${sizePx}px "${fontFamily}", sans-serif`;
  ctx.fillStyle = fillColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  lines.forEach((line, i) => {
    const y = TEXT_PADDING + lineHeight * (i + 0.5);
    ctx.fillText(line, canvas.width / 2, y);
  });

  return { canvas, aspect: canvas.width / canvas.height };
}

export async function rasterizeImage(el: ImageElement): Promise<RasterResult> {
  const img = await loadImage(el.src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.drawImage(img, 0, 0);
  return { canvas, aspect: img.naturalWidth / img.naturalHeight };
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Decal physical dimensions (model units) given the element's anchor.sizeIn
 * and its source aspect ratio.
 */
export function decalSize(aspect: number, sizeIn: number, inchesPerUnit: number) {
  const longestUnits = sizeIn / inchesPerUnit;
  if (aspect >= 1) {
    return { width: longestUnits, height: longestUnits / aspect };
  }
  return { width: longestUnits * aspect, height: longestUnits };
}

export { PX_PER_INCH };
