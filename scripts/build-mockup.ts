/**
 * scripts/build-mockup.ts
 *
 * Generate the photoreal-mockup asset bundle for one product view:
 *   - photo.jpg     studio-style nano-banana-2 photo (or pre-existing input)
 *   - disp.png      depth/displacement map (Depth Anything v2 small)
 *   - light.png     fold lighting derived from the photo's luminance
 *   - color.png     alpha mask: where the recolorable garment material is
 *   - zone-{key}.png  alpha mask per print zone (rectangle from anchor2D)
 *
 * Usage:
 *   npx tsx scripts/build-mockup.ts <slug> [--view front|back|sleeve]
 *                                          [--regenerate-photo]
 *                                          [--input <path>]
 *
 * Examples:
 *   npx tsx scripts/build-mockup.ts bella-canvas-3001-tee --regenerate-photo
 *   npx tsx scripts/build-mockup.ts bella-canvas-3001-tee --input /tmp/tee.jpg
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { generateImage } from "../lib/gemini/image";
import { productBySlug, type PlacementZone } from "../lib/catalog/sample-products";

// ─── Args ──────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const slug = args[0];
if (!slug) {
  console.error("Usage: npx tsx scripts/build-mockup.ts <slug> [--view front|back|sleeve] [--regenerate-photo] [--input <path>]");
  process.exit(1);
}
const viewIdx = args.indexOf("--view");
const view = (viewIdx >= 0 ? args[viewIdx + 1] : "front") as "front" | "back" | "sleeve";
const regeneratePhoto = args.includes("--regenerate-photo");
const inputIdx = args.indexOf("--input");
const inputPath = inputIdx >= 0 ? args[inputIdx + 1] : null;

const productMaybe = productBySlug(slug);
if (!productMaybe) {
  console.error(`Unknown product slug: ${slug}`);
  process.exit(1);
}
const product = productMaybe;

const OUT_DIR = path.join(process.cwd(), "public", "mockups", slug, view);

// ─── Prompt templates ──────────────────────────────────────────────────────

/**
 * Store-style product photo — clean, even, e-commerce catalog look.
 * The intent is "image suitable for a product detail page" not "lifestyle ad".
 */
function studioPhotoPrompt(productTitle: string, viewKey: string): string {
  const angleByView: Record<string, string> = {
    front: "front-facing flat hang shot, hanging on a thin invisible mannequin so the silhouette and chest area are clearly visible",
    back: "back-facing flat hang shot, hanging on a thin invisible mannequin so the back panel is clearly visible",
    sleeve: "three-quarter angle highlighting the sleeve area, hanging on a thin invisible mannequin",
  };
  return [
    `Studio product photograph of a plain white ${productTitle}.`,
    angleByView[viewKey] ?? angleByView.front,
    "Pure neutral light gray seamless background (RGB ~230,230,230). Even diffuse studio lighting from the front and slightly above with very soft shadows that reveal the cloth folds. No models, no hands, no props, no logos, no text. The garment fabric is matte cotton with a natural drape.",
    "Composition: garment centered, tightly framed, full garment visible with ~10% padding around it. Sharp focus throughout.",
    "photorealistic, ultra-detailed, commercial e-commerce product photography, square 1:1 aspect ratio.",
  ].join(" ");
}

// ─── Depth Anything v2 (Transformers.js) ───────────────────────────────────

async function runDepthEstimation(photoPath: string, outPath: string): Promise<void> {
  // Lazy import — model download is expensive on first run.
  const { pipeline, RawImage } = await import("@huggingface/transformers");
  console.log("  loading Depth Anything v2 small (cached after first run)...");
  const depthEstimator = await pipeline("depth-estimation", "onnx-community/depth-anything-v2-small");
  const image = await RawImage.read(photoPath);
  console.log("  estimating depth...");
  const result = await depthEstimator(image);
  // result is { predicted_depth: Tensor, depth: RawImage }
  const depthImage = (result as { depth: { save: (p: string) => Promise<void> } }).depth;
  await depthImage.save(outPath);
}

// ─── Light map: normalized luminance ───────────────────────────────────────

async function buildLightMap(photoPath: string, outPath: string) {
  // Convert to grayscale, normalize so the median is mid-gray (128). The
  // result encodes "is this pixel brighter or darker than the cloth average"
  // — used to multiply over the design to add/subtract fold shadows.
  const img = sharp(photoPath).removeAlpha().toColorspace("b-w");
  const stats = await img.clone().stats();
  const median = stats.channels[0].mean; // approx; mean is fine for diffuse photos
  const offset = 128 - median;
  await img
    .linear(1.0, offset) // shift luminance so mean ≈ 128
    .png()
    .toFile(outPath);
}

// ─── Color mask: chroma-key the seamless background ────────────────────────

async function buildColorMask(dispPath: string, outPath: string) {
  // The depth map already cleanly separates the garment (close to camera =
  // bright) from the background (far = dark). Threshold + smooth.
  const { data, info } = await sharp(dispPath)
    .removeAlpha()
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const out = Buffer.alloc(width * height);
  for (let i = 0; i < width * height; i++) {
    // Soft threshold: depth <40 → bg, 40..80 → ramp, >80 → garment.
    const v = data[i];
    out[i] = v < 40 ? 0 : v > 80 ? 255 : Math.round(((v - 40) / 40) * 255);
  }
  await sharp(out, { raw: { width, height, channels: 1 } })
    .blur(1.0)
    .png()
    .toFile(outPath);
}

// ─── Zone masks: rectangles derived from anchor2D ──────────────────────────

async function buildZoneMasks(photoPath: string, zones: PlacementZone[]) {
  const { width, height } = await sharp(photoPath).metadata();
  if (!width || !height) throw new Error("Could not read photo dimensions");
  for (const zone of zones) {
    if (!zone.anchor2D) {
      console.log(`  ⏭  zone "${zone.key}" has no anchor2D — skipping (hand-author this mask)`);
      continue;
    }
    const { centerXY, widthPct, heightPct } = zone.anchor2D;
    const w = Math.round(width * widthPct);
    const h = Math.round(height * heightPct);
    const x = Math.round(width * centerXY[0] - w / 2);
    const y = Math.round(height * centerXY[1] - h / 2);
    const svg = Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
         <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="white" rx="${Math.min(w, h) * 0.04}" />
       </svg>`,
    );
    const outPath = path.join(OUT_DIR, `zone-${zone.key}.png`);
    // Compose SVG over a black canvas; rasterize to grayscale PNG.
    const blackBg = await sharp({
      create: { width, height, channels: 3, background: "#000000" },
    })
      .png()
      .toBuffer();
    await sharp(blackBg)
      .composite([{ input: svg, blend: "over" }])
      .toColorspace("b-w")
      .png()
      .toFile(outPath);
    console.log(`  ✓ zone-${zone.key}.png`);
  }
}

// ─── Photo: gen via nano-banana-2 OR copy from --input ─────────────────────

async function ensurePhoto(): Promise<string> {
  const photoPath = path.join(OUT_DIR, "photo.jpg");
  if (inputPath) {
    console.log(`  copying input photo from ${inputPath}`);
    await sharp(inputPath).jpeg({ quality: 92 }).toFile(photoPath);
    return photoPath;
  }
  if (regeneratePhoto || !(await fileExists(photoPath))) {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error(
        "GOOGLE_API_KEY not set; pass --input <path> or set the key in .env.local",
      );
    }
    const prompt = studioPhotoPrompt(product.title, view);
    console.log("  calling nano-banana-2 with store-style prompt...");
    const img = await generateImage({ prompt, aspect: "1:1" });
    const bytes = Buffer.from(img.base64, "base64");
    // Convert whatever Gemini returned to a clean square JPG.
    await sharp(bytes).resize(1024, 1024, { fit: "cover" }).jpeg({ quality: 92 }).toFile(photoPath);
    return photoPath;
  }
  console.log(`  using existing photo ${path.relative(process.cwd(), photoPath)}`);
  return photoPath;
}

async function fileExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  console.log(`Building mockup for ${slug} / ${view}`);
  console.log(`  output: ${path.relative(process.cwd(), OUT_DIR)}/`);

  const photoPath = await ensurePhoto();

  console.log("→ disp.png");
  await runDepthEstimation(photoPath, path.join(OUT_DIR, "disp.png"));

  console.log("→ light.png");
  await buildLightMap(photoPath, path.join(OUT_DIR, "light.png"));

  console.log("→ color.png");
  await buildColorMask(path.join(OUT_DIR, "disp.png"), path.join(OUT_DIR, "color.png"));

  console.log("→ zone-*.png");
  await buildZoneMasks(photoPath, product.placementZones ?? []);

  console.log(`Done.`);
}

main().catch((err) => {
  console.error("FATAL:", err);
  process.exit(1);
});
