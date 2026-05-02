/**
 * scripts/scrape-companycasuals.ts
 *
 * Polite scraper for catalog.companycasuals.com.
 *
 * The storefront is SAP Hybris with a Vue.js front-end that loads products via
 * `POST /<category-path>/getProducts.json`. The endpoint is publicly callable
 * with a JSON body `{page, size}` and returns rich product data (code, name,
 * description, images, price text). We iterate the 14 top-level categories,
 * paginate at size=200, dedupe by product code (women's/youth overlap apparel
 * cats), and emit one row per unique SKU.
 *
 * Output: tmp/scraped-blanks-companycasuals.json
 *
 * Usage:
 *   npx tsx scripts/scrape-companycasuals.ts                # full pull
 *   npx tsx scripts/scrape-companycasuals.ts --only bags    # one cat
 *   npx tsx scripts/scrape-companycasuals.ts --limit 20     # global cap
 */
import fs from "node:fs/promises";
import path from "node:path";

const UA = "GAPHCatalogBot/1.0 (+admin@gaprinthub.com)";
const BASE = "https://catalog.companycasuals.com";
const REQUEST_DELAY_MS = 1000;
const PAGE_SIZE = 200;

type CatConfig = {
  /** key used for --only filter and output diagnostics. */
  key: string;
  /** URL path under BASE (no leading getProducts.json). */
  path: string;
  /** Slug of our top-level category. */
  ourCategory: "apparel-headwear";
  /** Slug of the subcategory under apparel-headwear that this maps to. */
  ourSubcategory: string;
};

const CATS: CatConfig[] = [
  { key: "tshirts",           path: "/T-Shirts/c/tshirts",                       ourCategory: "apparel-headwear", ourSubcategory: "t-shirts" },
  { key: "polosknits",        path: "/Polos-Knits/c/polosknits",                 ourCategory: "apparel-headwear", ourSubcategory: "polos-knits" },
  { key: "sweatshirtsfleece", path: "/Sweatshirts-Fleece/c/sweatshirtsfleece",   ourCategory: "apparel-headwear", ourSubcategory: "sweatshirts-fleece" },
  { key: "caps",              path: "/Caps/c/caps",                              ourCategory: "apparel-headwear", ourSubcategory: "caps" },
  { key: "activewear",        path: "/Activewear/c/activewear",                  ourCategory: "apparel-headwear", ourSubcategory: "activewear" },
  { key: "outerwear",         path: "/Outerwear/c/outerwear",                    ourCategory: "apparel-headwear", ourSubcategory: "outerwear" },
  { key: "wovenshirts",       path: "/Woven-Shirts/c/wovenshirts",               ourCategory: "apparel-headwear", ourSubcategory: "woven-dress-shirts" },
  { key: "bottoms",           path: "/Bottoms/c/bottoms",                        ourCategory: "apparel-headwear", ourSubcategory: "bottoms" },
  { key: "workwear",          path: "/Workwear/c/workwear",                      ourCategory: "apparel-headwear", ourSubcategory: "workwear" },
  { key: "bags",              path: "/Bags/c/bags",                              ourCategory: "apparel-headwear", ourSubcategory: "bags" },
  { key: "accessories",       path: "/Accessories/c/accessories",                ourCategory: "apparel-headwear", ourSubcategory: "accessories" },
  { key: "personalprotection",path: "/Personal-Protection/c/personalprotection", ourCategory: "apparel-headwear", ourSubcategory: "personal-protection" },
  { key: "ladieswomens",      path: "/Women%27s/c/ladieswomens",                 ourCategory: "apparel-headwear", ourSubcategory: "womens" },
  { key: "youth",             path: "/Youth/c/youth",                            ourCategory: "apparel-headwear", ourSubcategory: "youth" },
];

type ScrapedRow = {
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

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function postJson<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${url} → ${res.status}`);
  return res.json() as Promise<T>;
}

/** companycasuals product names start with the brand
 *  ("Nike Commute Sling Bag", "Port Authority Polo"). Match against our known
 *  brand list to extract; otherwise leave brand undefined. */
const KNOWN_BRANDS = [
  "Nike", "Carhartt", "Champion", "Gildan", "Jerzees", "OGIO", "Bella+Canvas",
  "Bella + Canvas", "Brooks Brothers", "Bulwark", "Comfort Colors", "CornerStone",
  "Cotopaxi", "District", "Eddie Bauer", "MERCER+METTLE", "Mercer+Mettle",
  "New Era", "Next Level Apparel", "Next Level", "Port Authority", "Port & Company",
  "Rabbit Skins", "Red Kap", "Richardson", "Russell Outdoors", "Sport-Tek",
  "The North Face", "TravisMathew", "Volunteer Knitwear", "WonderWink", "Wink",
  "Allmade", "Holloway", "Augusta", "Sanmar", "SanMar",
  "Port & Co", "Port & Company", "Port and Company",
];

function extractBrand(title: string): string | null {
  for (const b of KNOWN_BRANDS) {
    if (title.startsWith(b + " ") || title === b) return b;
  }
  // Fallback: nothing matched — leave brand null (importer can show full title)
  return null;
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    // numeric entities like &#153; (™), &#174; (®) — strip rather than decode
    // since they're decorative and look noisy in tile UI without proper rendering.
    .replace(/&#\d+;/g, "")
    // any other named entity → drop
    .replace(/&[a-zA-Z]+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Make a stable, lowercase, hyphenated slug with a `cc-` prefix to avoid
 *  collision with premier-* and other supplier imports. */
function toSlug(code: string): string {
  return (
    "cc-" +
    code
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

/** Make a string into something safe for our internal short_description. */
function shorten(s: string, max = 220): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).replace(/\s+\S*$/, "") + "…";
}

async function scrapeCategory(
  cat: CatConfig,
  globalLimit: number | null,
  collectedSoFar: number,
  seenCodes: Set<string>,
): Promise<ScrapedRow[]> {
  const out: ScrapedRow[] = [];
  let page = 0;
  let totalPages = 1;
  let totalCount = 0;
  while (page < totalPages) {
    if (globalLimit !== null && collectedSoFar + out.length >= globalLimit) break;
    const url = `${BASE}${cat.path}/getProducts.json`;
    type Resp = {
      results: Array<{
        code: string;
        name: string;
        url: string;
        description?: string;
        styleNumber?: string;
        images?: Array<{ url?: string; format?: string }>;
      }>;
      pagination: { numberOfPages: number; totalNumberOfResults: number };
    };
    let data: Resp;
    try {
      data = await postJson<Resp>(url, { page, size: PAGE_SIZE });
    } catch (e) {
      console.error(`  [${cat.key}] page=${page} ERROR ${(e as Error).message}; skipping rest of this cat`);
      break;
    }
    if (page === 0) {
      totalPages = data.pagination?.numberOfPages ?? 1;
      totalCount = data.pagination?.totalNumberOfResults ?? 0;
      console.log(`  [${cat.key}] ${totalCount} SKUs in ${totalPages} pages (size=${PAGE_SIZE})`);
    }
    let pageNew = 0;
    for (const r of data.results ?? []) {
      if (!r.code) continue;
      if (seenCodes.has(r.code)) continue;
      seenCodes.add(r.code);
      // Titles often contain HTML markup like "The North Face<sup>&#174;</sup>".
      // Clean before storing and before brand-matching.
      const title = stripHtml(r.name ?? "") || `Product ${r.code}`;
      const brand = extractBrand(title);
      const desc = stripHtml(r.description ?? "");
      const supplierUrl = r.url?.startsWith("http")
        ? r.url
        : `${BASE}${r.url ?? `/p/${encodeURIComponent(r.code)}`}`;
      // Listing JSON only carries 128W thumbnails; the bigger PDP images live
      // under different sys_master ids and aren't constructable from this URL.
      // Prefix `https:` to bare protocol-relative URLs.
      let img = (r.images ?? [])[0]?.url ?? null;
      if (img && img.startsWith("//")) img = "https:" + img;

      const row: ScrapedRow = {
        slug: toSlug(r.code),
        supplierCode: r.code,
        styleNumber: r.styleNumber ?? null,
        title,
        brand,
        description: desc,
        imageUrl: img,
        supplierUrl,
        ourCategory: cat.ourCategory,
        ourSubcategory: cat.ourSubcategory,
        sourceCategoryKey: cat.key,
      };
      out.push(row);
      pageNew += 1;
      if (globalLimit !== null && collectedSoFar + out.length >= globalLimit) break;
    }
    if (page === 0 || pageNew > 0 || (page + 1) % 5 === 0) {
      console.log(`    page ${page + 1}/${totalPages}: +${pageNew} new (cat total ${out.length})`);
    }
    page += 1;
    if (page < totalPages) await delay(REQUEST_DELAY_MS);
  }
  return out;
}

function parseArgs(): { only: string | null; limit: number | null } {
  const args = process.argv.slice(2);
  let only: string | null = null;
  let limit: number | null = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--only") only = args[++i] ?? null;
    else if (a === "--limit") limit = Number(args[++i]) || null;
  }
  return { only, limit };
}

async function main() {
  const { only, limit } = parseArgs();
  const cats = only ? CATS.filter((c) => c.key === only) : CATS;
  if (cats.length === 0) {
    console.error(`No matching cat for --only=${only}. Valid keys: ${CATS.map((c) => c.key).join(", ")}`);
    process.exit(1);
  }
  console.log(`Scraping ${cats.length} cat(s): ${cats.map((c) => c.key).join(", ")}`);
  if (limit) console.log(`Global SKU limit: ${limit}`);

  const all: ScrapedRow[] = [];
  const seen = new Set<string>();
  for (const cat of cats) {
    if (limit !== null && all.length >= limit) break;
    console.log(`\n=== ${cat.key} (→ ${cat.ourCategory}/${cat.ourSubcategory}) ===`);
    const rows = await scrapeCategory(cat, limit, all.length, seen);
    all.push(...rows);
    console.log(`  → ${rows.length} new unique products from ${cat.key}; running total ${all.length}`);
    if (cats.length > 1) await delay(REQUEST_DELAY_MS);
  }

  const tmpDir = path.join(process.cwd(), "tmp");
  await fs.mkdir(tmpDir, { recursive: true });
  const outFile = path.join(
    tmpDir,
    only ? `scraped-blanks-companycasuals-${only}.json` : "scraped-blanks-companycasuals.json",
  );
  await fs.writeFile(outFile, JSON.stringify(all, null, 2));
  console.log(`\nWrote ${all.length} products to ${outFile}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
