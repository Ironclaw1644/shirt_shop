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
import dotenv from "dotenv";
// Match Next.js convention: load .env.local first (overrides), then .env.
dotenv.config({ path: ".env.local" });
dotenv.config();
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
  /** Optional source photo. When set, the script alters this image instead of
   *  hallucinating from text. Use this for product entries that should mirror
   *  a real catalog photo (e.g. supplier-site product shots). */
  referenceImageUrl?: string;
};

type Manifest = {
  imageDefaults: { style: string; brandPalette: string };
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

  // CLI --reference overrides the manifest's referenceImageUrl when both are present
  // for the explicit regen target. Otherwise the manifest's value (if any) wins.
  const refUrl =
    referenceUrl && regenerateSlug === entry.slug ? referenceUrl : entry.referenceImageUrl;

  // Product entries skip the global brandPalette + style injection. That injection
  // (crimson/charcoal/gold + "commercial product photography") was producing the
  // AI-templated editorial look on every product. Marketing entries (hero-, category-,
  // og-, how-, city-) keep it so their on-brand styling is preserved.
  const isProduct = entry.slug.startsWith("product-");
  const baseInput = {
    prompt: entry.prompt,
    aspect: entry.aspect,
    ...(isProduct
      ? {}
      : { brandPalette: m.imageDefaults.brandPalette, style: m.imageDefaults.style }),
  };

  console.log(
    `→ generating ${entry.slug} (${entry.aspect})${refUrl ? " [ref]" : ""}${isProduct ? " [no-defaults]" : ""}…`,
  );
  try {
    const { base64, mimeType } = refUrl
      ? await generateImageFromReference({ ...baseInput, referenceImageUrl: refUrl })
      : await generateImage(baseInput);
    const buf = Buffer.from(base64, "base64");
    const pipeline = sharp(buf);

    // For product-* entries: pad to exact 4:3 (1400x1050) with cream backdrop so
    // the PDP gallery (aspect-[4/3] container) doesn't letterbox. Cream matches
    // the page bg-paper-warm. Non-product entries use the legacy resize logic.
    const isProduct = entry.slug.startsWith("product-");
    if (isProduct) {
      const fit = (entry as { fit?: "contain" | "cover" }).fit ?? "contain";
      await pipeline
        .resize({
          width: 1400,
          height: 1050,
          fit,
          kernel: "lanczos3",
          ...(fit === "contain" ? { background: { r: 250, g: 250, b: 247 } } : {}),
        })
        .webp({ quality: 95, effort: 6 })
        .toFile(outPath);
    } else {
      const targetWidth = entry.aspect.startsWith("16:") || entry.aspect.includes("1200") ? 1600 : 1400;
      await pipeline
        .resize({ width: targetWidth, withoutEnlargement: true })
        .webp({ quality: 86 })
        .toFile(outPath);
    }

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
