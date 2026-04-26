import type { DesignElement2D, ImageElement2D, TextElement2D } from "./types";
import type { PlacementZone } from "@/lib/catalog/sample-products";
import { rasterizeImage, rasterizeText } from "@/lib/designer/rasterize";

/**
 * Render production artwork: a flat composite of every decal at print
 * resolution (300dpi within the dominant zone). Returns a data URL or null
 * if there are no elements.
 */
export async function exportFlatArtwork2D(
  elements: DesignElement2D[],
  zones: PlacementZone[],
): Promise<string | null> {
  if (elements.length === 0) return null;
  const dominantZoneKey = elements[0].zoneKey;
  const zone = zones.find((z) => z.key === dominantZoneKey) ?? zones[0];
  if (!zone) return null;

  const dpi = 300;
  const widthPx = Math.max(64, Math.round(zone.widthIn * dpi));
  const heightPx = Math.max(64, Math.round(zone.heightIn * dpi));
  const pxPerIn = widthPx / zone.widthIn;

  const canvas = document.createElement("canvas");
  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, widthPx, heightPx);

  for (const el of elements) {
    if (el.zoneKey !== dominantZoneKey) continue;
    const raster =
      el.type === "text"
        ? await rasterizeText(el as TextElement2D)
        : await rasterizeImage(el as ImageElement2D);

    const wPx = el.anchor.widthIn * pxPerIn;
    const hPx = el.anchor.heightIn * pxPerIn;
    // Element anchor (x,y) is in normalized photo UV coords. The print zone
    // occupies a slice of the photo per zone.anchor2D — we map element
    // position relative to the zone's center.
    if (!zone.anchor2D) continue;
    const zoneCx = zone.anchor2D.centerXY[0];
    const zoneCy = zone.anchor2D.centerXY[1];
    const zoneWPctRecip = 1 / zone.anchor2D.widthPct;
    const zoneHPctRecip = 1 / zone.anchor2D.heightPct;
    // dx,dy = element offset from zone center as fraction of zone size
    const dx = (el.anchor.x - zoneCx) * zoneWPctRecip;
    const dy = (el.anchor.y - zoneCy) * zoneHPctRecip;
    const cx = widthPx / 2 + dx * widthPx;
    const cy = heightPx / 2 + dy * heightPx;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(el.anchor.rotation);
    ctx.drawImage(raster.canvas, -wPx / 2, -hPx / 2, wPx, hPx);
    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}
