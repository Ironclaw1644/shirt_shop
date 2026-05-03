/**
 * scripts/import-scraped-blanks.ts
 *
 * Reads tmp/scraped-blanks-*.json files produced by scripts/scrape-premier.ts
 * and emits lib/catalog/imported-blanks.ts — a single file exporting a
 * `importedBlanks: SampleProduct[]` array. sample-products.ts re-exports
 * this array concatenated with the existing seedProducts.
 *
 * Each imported product is "quote-only" (no price, no add-to-cart) and uses
 * the supplier's hot-linked Cloudinary image URL via the new imageUrl /
 * imageSource / originalImageUrl / supplierUrl fields.
 *
 * Usage:
 *   npx tsx scripts/import-scraped-blanks.ts          # imports every tmp/scraped-blanks-*.json
 *   npx tsx scripts/import-scraped-blanks.ts --dry    # prints what would be written, no file changes
 */
import fs from "node:fs/promises";
import path from "node:path";

/**
 * Normalized shape consumed by buildEntry. Both premier-style and
 * companycasuals-style scrape outputs are mapped into this before emission.
 */
type ScrapedProduct = {
  slug: string;
  title: string;
  supplierPartNumber: string;
  imageUrl: string;
  supplierUrl: string;
  targetCategory: string;
  targetSubcategory: string;
  /** Optional richer fields available from JSON-API supplier (e.g. companycasuals). */
  description?: string;
  brand?: string;
};

/** Premier scraper output. */
type PremierRaw = {
  slug: string;
  title: string;
  supplierPartNumber: string;
  imageUrl: string;
  supplierUrl: string;
  targetCategory: string;
  targetSubcategory: string;
  rawCategoryDesc?: string;
  sourceSite?: string;
};

/** Companycasuals scraper output (lib/scripts/scrape-companycasuals.ts). */
type CompanyCasualsRaw = {
  slug: string;
  supplierCode: string;
  styleNumber: string | null;
  title: string;
  brand: string | null;
  description: string;
  imageUrl: string | null;
  supplierUrl: string;
  ourCategory: string;
  ourSubcategory: string;
  sourceCategoryKey: string;
};

function normalize(raw: PremierRaw | CompanyCasualsRaw): ScrapedProduct | null {
  // CompanyCasuals: discriminate on presence of `ourCategory`.
  if ("ourCategory" in raw) {
    if (!raw.imageUrl) return null; // skip products with no image
    // Drop sanmar "no image available" placeholders — they render as broken tiles.
    const fname = raw.imageUrl.split("/").pop() || "";
    if (/^128W-null\./i.test(fname) || /^1200W-null\./i.test(fname)) return null;
    return {
      slug: raw.slug,
      title: raw.title,
      supplierPartNumber: raw.supplierCode,
      imageUrl: raw.imageUrl,
      supplierUrl: raw.supplierUrl,
      targetCategory: raw.ourCategory,
      targetSubcategory: raw.ourSubcategory,
      description: raw.description,
      brand: raw.brand ?? undefined,
    };
  }
  // Premier
  return {
    slug: raw.slug,
    title: raw.title,
    supplierPartNumber: raw.supplierPartNumber,
    imageUrl: raw.imageUrl,
    supplierUrl: raw.supplierUrl,
    targetCategory: raw.targetCategory,
    targetSubcategory: raw.targetSubcategory,
  };
}

const TMP = path.join(process.cwd(), "tmp");
const OUT = path.join(process.cwd(), "lib", "catalog", "imported-blanks.ts");

function escapeQuotes(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function cleanTitle(raw: string): string {
  return raw
    // Variant-B parse artifact: corporateawards titles came in as "Description:Foo"
    .replace(/^Description\s*:?\s*/i, "")
    // HTML entities that may have slipped through
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Upgrade Cloudinary image URLs to better-served variants:
 *   1. w_800 → w_1600 (retina-sharp source for Next/Image to slice)
 *   2. f_png → f_auto (lets Cloudinary pick AVIF/WebP — 84% smaller for sportawards)
 *   3. drop fl_attachment (forces Content-Disposition: attachment, breaks inline rendering)
 *   4. ensure w_1600,c_limit is present so width-less URLs (sportawards) get capped too
 * Sanmar URLs are upgraded out-of-band by scripts/enrich-companycasuals-images.ts.
 */
function upgradeImageUrl(url: string): string {
  if (!url.includes("res.cloudinary.com")) return url;
  // Pick out the transform segment (between /upload/ and the next /v\d+).
  const m = url.match(/\/upload\/([^/]+)\/(v\d+\/.+)$/);
  if (!m) return url;
  const transforms = m[1].split(",").filter(Boolean);
  const cleaned: string[] = [];
  let hasWidth = false;
  let hasCrop = false;
  for (const t of transforms) {
    if (t === "fl_attachment") continue; // strip — forces download
    if (t === "f_png") {
      cleaned.push("f_auto");
      continue;
    }
    if (/^w_\d+$/.test(t)) {
      cleaned.push("w_1600");
      hasWidth = true;
      continue;
    }
    if (/^c_/.test(t)) hasCrop = true;
    cleaned.push(t);
  }
  if (!hasWidth) cleaned.push("w_1600");
  if (!hasCrop) cleaned.push("c_limit");
  return url.replace(m[0], `/upload/${cleaned.join(",")}/${m[2]}`);
}

function buildEntry(p: ScrapedProduct): string {
  const title = cleanTitle(p.title);
  const upgradedImageUrl = upgradeImageUrl(p.imageUrl);
  const supplierDesc = p.description ? cleanTitle(p.description).slice(0, 600) : null;
  // Brief shopper-facing copy. If the supplier provided a description, use the
  // first ~150 chars; otherwise fall back to the title-only blurb.
  const shortDescription = supplierDesc
    ? supplierDesc.length > 200
      ? supplierDesc.slice(0, 199).replace(/\s+\S*$/, "") + "…"
      : supplierDesc
    : `${title} — supplier blank, quote on request. Decorate with print, embroidery, engraving, or sublimation depending on the substrate.`;
  const description = supplierDesc
    ? `**Supplier blank** — ${title} (Part #${p.supplierPartNumber}).\n\n` +
      `${supplierDesc}\n\n` +
      `**Quote-priced** — Pricing for blanks varies by quantity, decoration method, and lead time. Click "Request a quote" and we'll respond within one business day with tier pricing and shipping.\n\n` +
      `**Decoration options** — Add screen print, embroidery, DTF, sublimation, laser engraving, or UV print depending on the substrate. We'll match the right method to your art.`
    : `**Supplier blank** — ${title} (Part #${p.supplierPartNumber}). Stocked from our wholesale partner network.\n\n` +
      `**Quote-priced** — Pricing for blanks varies by quantity, decoration method, and lead time. Click "Request a quote" and we'll respond within one business day with tier pricing and shipping.\n\n` +
      `**Decoration options** — Add screen print, embroidery, DTF, sublimation, laser engraving, or UV print depending on the substrate. We'll match the right method to your art.\n\n` +
      `**Lead time** — Most decorated blanks ship in 1-7 business days from approval. Larger orders quoted on request.`;

  const brand = p.brand ? p.brand : "Premier";

  return `  {
    slug: "${escapeQuotes(p.slug)}",
    categorySlug: "${escapeQuotes(p.targetCategory)}",
    subcategorySlug: "${escapeQuotes(p.targetSubcategory)}",
    title: "${escapeQuotes(title)}",
    shortDescription: "${escapeQuotes(shortDescription)}",
    description: ${JSON.stringify(description)},
    basePriceCents: null,
    priceStatus: "quote",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: [],
    brand: "${escapeQuotes(brand)}",
    heroPromptKey: "${escapeQuotes(p.slug)}",
    imageSource: "supplier-cdn",
    imageUrl: "${escapeQuotes(upgradedImageUrl)}",
    originalImageUrl: "${escapeQuotes(upgradedImageUrl)}",
    supplierUrl: "${escapeQuotes(p.supplierUrl)}",
  },`;
}

async function main() {
  const dryRun = process.argv.includes("--dry");
  const files = (await fs.readdir(TMP).catch(() => [])).filter(
    (f) => f.startsWith("scraped-blanks-") && f.endsWith(".json"),
  );
  if (files.length === 0) {
    console.error(`No scraped-blanks-*.json files found in ${TMP}. Run scripts/scrape-premier.ts first.`);
    process.exit(1);
  }
  console.log(`Reading ${files.length} scrape file(s):`);
  const all: ScrapedProduct[] = [];
  let droppedNoImage = 0;
  for (const f of files) {
    const raw = await fs.readFile(path.join(TMP, f), "utf8");
    const items = JSON.parse(raw) as Array<PremierRaw | CompanyCasualsRaw>;
    let kept = 0;
    for (const item of items) {
      const norm = normalize(item);
      if (norm) {
        all.push(norm);
        kept += 1;
      } else {
        droppedNoImage += 1;
      }
    }
    console.log(`  ${f}: ${items.length} products (kept ${kept})`);
  }
  if (droppedNoImage > 0) console.log(`  Dropped ${droppedNoImage} products with no image`);
  // De-duplicate by slug.
  const seen = new Set<string>();
  const unique = all.filter((p) => {
    if (seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
  console.log(`Total unique: ${unique.length}`);

  const fileBody = `/**
 * lib/catalog/imported-blanks.ts
 *
 * Auto-generated by scripts/import-scraped-blanks.ts — do not edit by hand.
 * Re-run the importer to regenerate.
 *
 * These are quote-only blank products (no Add to Cart, no price). Images are
 * hot-linked from supplier CDN via imageUrl. Manager image overrides will
 * persist in Supabase via seo_meta (Phase 1) → dedicated columns (Phase 4).
 */
import type { SampleProduct } from "./sample-products";

export const importedBlanks: SampleProduct[] = [
${unique.map(buildEntry).join("\n")}
];
`;

  if (dryRun) {
    console.log("--- dry run — would write ---");
    console.log(fileBody.slice(0, 800) + "\n...");
    return;
  }
  await fs.writeFile(OUT, fileBody);
  console.log(`✓ wrote ${unique.length} entries → ${OUT}`);
  console.log("Next: ensure sample-products.ts imports `importedBlanks` and concatenates it into sampleProducts, then run npm run db:seed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
