/**
 * Compose all design elements into a single offscreen canvas matching the
 * mockup photo dimensions. The result is fed as the `uDesign` texture to
 * the WebGL shader.
 *
 * Coordinate system: elements' anchors are normalized 0..1 in photo UV;
 * sizes are in inches and scaled to pixels using a per-product
 * pixelsPerInch derived from the photo's intrinsic size.
 */
import { rasterizeImage, rasterizeText } from "@/lib/designer/rasterize";
import type { DesignElement2D } from "./types";

/**
 * Approximate pixels-per-inch for the design canvas. The mockup photo
 * frames a ~28" tall garment in ~75% of the canvas height, so:
 *   pxPerIn ≈ photoHeightPx * 0.75 / 28
 * For a 1024x1024 photo, that's ~27 px/inch — fine for screen preview.
 * The flat artwork export (export-flat.ts) handles real 300dpi output.
 */
const GARMENT_HEIGHT_FRACTION = 0.75;
const GARMENT_HEIGHT_INCHES = 28;

export function pixelsPerInch(canvasHeight: number): number {
  return (canvasHeight * GARMENT_HEIGHT_FRACTION) / GARMENT_HEIGHT_INCHES;
}

export async function composeDesignCanvas(
  elements: DesignElement2D[],
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");
  ctx.clearRect(0, 0, width, height);

  const pxPerIn = pixelsPerInch(height);

  for (const el of elements) {
    const raster =
      el.type === "text"
        ? await rasterizeText(el)
        : await rasterizeImage(el);

    const wPx = el.anchor.widthIn * pxPerIn;
    const hPx = el.anchor.heightIn * pxPerIn;
    const cx = el.anchor.x * width;
    const cy = el.anchor.y * height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(el.anchor.rotation);
    ctx.drawImage(raster.canvas, -wPx / 2, -hPx / 2, wPx, hPx);
    ctx.restore();
  }

  return canvas;
}
