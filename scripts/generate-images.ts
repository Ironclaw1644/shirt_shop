/**
 * scripts/generate-images.ts
 *
 * Reads content/image-manifest.json and generates WebP assets into
 * public/images/generated/. Optionally regenerates a single slug:
 *   npm run generate:images                # generate missing
 *   npm run generate:images -- --all       # regenerate all
 *   npm run generate:images -- --regenerate hero-flagship
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import manifest from "../content/image-manifest.json";
import { generateImage } from "../lib/gemini/image";

type ManifestEntry = {
  slug: string;
  title: string;
  aspect: string;
  prompt: string;
};

type Manifest = {
  imageDefaults: { style: string; brandPalette: string; composition: string };
  images: ManifestEntry[];
};

const m = manifest as Manifest;
const OUT_DIR = path.join(process.cwd(), "public", "images", "generated");

const args = process.argv.slice(2);
const regenerateAll = args.includes("--all");
const regenerateIdx = args.indexOf("--regenerate");
const regenerateSlug = regenerateIdx >= 0 ? args[regenerateIdx + 1] : null;

async function ensureDir() {
  await fs.mkdir(OUT_DIR, { recursive: true });
}

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function generateOne(entry: ManifestEntry) {
  const outPath = path.join(OUT_DIR, `${entry.slug}.webp`);
  const shouldSkip =
    !regenerateAll && !regenerateSlug && (await exists(outPath));
  if (shouldSkip) {
    console.log(`• skip (exists) ${entry.slug}`);
    return;
  }
  if (regenerateSlug && regenerateSlug !== entry.slug) {
    return;
  }

  console.log(`→ generating ${entry.slug} (${entry.aspect})…`);
  try {
    const { base64, mimeType } = await generateImage({
      prompt: entry.prompt,
      aspect: entry.aspect,
      brandPalette: m.imageDefaults.brandPalette,
      style: m.imageDefaults.style,
    });
    const buf = Buffer.from(base64, "base64");
    const pipeline = sharp(buf);

    // resize to reasonable max width while keeping aspect
    const targetWidth = entry.aspect.startsWith("16:") || entry.aspect.includes("1200") ? 1600 : 1400;
    await pipeline
      .resize({ width: targetWidth, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(outPath);

    const promptLogPath = path.join(OUT_DIR, `${entry.slug}.prompt.txt`);
    await fs.writeFile(promptLogPath, entry.prompt, "utf8");

    console.log(`  ✓ wrote ${path.relative(process.cwd(), outPath)} (${mimeType})`);
  } catch (err) {
    console.error(`  ✕ ${entry.slug}:`, (err as Error).message);
  }
}

async function run() {
  await ensureDir();
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY missing in env — aborting.");
    process.exit(1);
  }
  for (const entry of m.images) {
    await generateOne(entry);
  }
  console.log("Done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
