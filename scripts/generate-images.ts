/**
 * scripts/generate-images.ts
 *
 * Reads content/image-manifest.json and generates WebP assets into
 * public/images/generated/.
 *
 *   npm run generate:images                            # generate missing
 *   npm run generate:images -- --all                   # regenerate all
 *   npm run generate:images -- --regenerate <slug>     # regenerate one
 *   npm run generate:images -- --filter <prefix>       # only slugs starting with prefix
 *   npm run generate:images -- --regenerate <slug> --reference <url>
 *                                                      # alter a real reference photo
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import manifest from "../content/image-manifest.json";
import { generateImage, generateImageFromReference } from "../lib/gemini/image";

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

function redact(text: string): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return text;
  return text.split(key).join("[REDACTED_GOOGLE_API_KEY]");
}

const args = process.argv.slice(2);
const regenerateAll = args.includes("--all");
const regenerateIdx = args.indexOf("--regenerate");
const regenerateSlug = regenerateIdx >= 0 ? args[regenerateIdx + 1] : null;
const filterIdx = args.indexOf("--filter");
const filterPrefix = filterIdx >= 0 ? args[filterIdx + 1] : null;
const referenceIdx = args.indexOf("--reference");
const referenceUrl = referenceIdx >= 0 ? args[referenceIdx + 1] : null;

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

  console.log(`→ generating ${entry.slug} (${entry.aspect})${referenceUrl ? " [ref]" : ""}…`);
  try {
    const { base64, mimeType } = referenceUrl && regenerateSlug === entry.slug
      ? await generateImageFromReference({
          referenceImageUrl: referenceUrl,
          prompt: entry.prompt,
          aspect: entry.aspect,
          brandPalette: m.imageDefaults.brandPalette,
          style: m.imageDefaults.style,
        })
      : await generateImage({
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
    console.error(`  ✕ ${entry.slug}:`, redact((err as Error).message));
  }
}

async function run() {
  await ensureDir();
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY missing in env — aborting.");
    process.exit(1);
  }
  const entries = filterPrefix
    ? m.images.filter((e) => e.slug.startsWith(filterPrefix))
    : m.images;
  if (filterPrefix) {
    console.log(`Filter "${filterPrefix}" matched ${entries.length} of ${m.images.length} entries.`);
  }
  for (const entry of entries) {
    await generateOne(entry);
  }
  console.log("Done.");
}

run().catch((err) => {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(redact(msg));
  process.exit(1);
});
