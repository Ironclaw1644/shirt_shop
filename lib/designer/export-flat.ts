import type { DesignElement, ImageElement, TextElement } from "./types";
import type { PlacementZone } from "@/lib/catalog/sample-products";
import { rasterizeImage, rasterizeText } from "./rasterize";

/**
 * Render the production artwork: a flat composite of every decal at
 * print resolution (300dpi within the active zone's print area).
 *
 * One PNG per zone; we use the first element's zone as the dominant zone
 * for MVP (all elements typically share a zone).
 *
 * @returns data URL of the composite PNG, or null if there are no elements.
 */
export async function exportFlatArtwork(
  elements: DesignElement[],
  zones: PlacementZone[],
): Promise<string | null> {
  if (elements.length === 0) return null;
  const dominantZoneKey = elements[0].zoneKey;
  const zone = zones.find((z) => z.key === dominantZoneKey) ?? zones[0];
  if (!zone) return null;

  const dpi = 300;
  const widthPx = Math.max(64, Math.round(zone.widthIn * dpi));
  const heightPx = Math.max(64, Math.round(zone.heightIn * dpi));
  const inchesPerPx = zone.widthIn / widthPx;

  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, widthPx, heightPx);

  // Layout each element relative to the zone center.
  for (const el of elements) {
    if (el.zoneKey !== dominantZoneKey) continue;
    const raster =
      el.type === "text"
        ? await rasterizeText(el as TextElement)
        : await rasterizeImage(el as ImageElement);
    const sizeIn = el.anchor.sizeIn;
    const longestPx = sizeIn / inchesPerPx;
    const drawW = raster.aspect >= 1 ? longestPx : longestPx * raster.aspect;
    const drawH = raster.aspect >= 1 ? longestPx / raster.aspect : longestPx;
    const cx = widthPx / 2;
    const cy = heightPx / 2;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(el.anchor.rotation);
    ctx.drawImage(raster.canvas, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}
