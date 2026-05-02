/**
 * scripts/scrape-premier.ts
 *
 * Polite scraper for the "premier-*" supplier sites that share a backend:
 *   - premiercorporateawards.com
 *   - premierdrinkware.com
 *   - premiercustomcolor.com
 *   - premierpersonalizedgifts.com
 *   - premiersportawards.com
 *
 * Each site exposes:
 *   - /sitemap.xml listing category URLs of the form
 *     {base}/...?prices=NO&cust=NO&id=X&subId=Y&desc=Category+Name
 *   - Server-rendered category HTML with product cards (.card.product_card)
 *     containing .product_title, "Part #: X" text, and an <img> on Cloudinary.
 *
 * Output: tmp/scraped-blanks-{site-slug}.json with one row per product.
 *
 * Usage:
 *   npx tsx scripts/scrape-premier.ts --site drinkware [--limit 20]
 */
import * as cheerio from "cheerio";
import fs from "node:fs/promises";
import path from "node:path";

const UA = "GAPHCatalogBot/1.0 (+admin@gaprinthub.com)";
const REQUEST_DELAY_MS = 1000;

type SiteId =
  | "drinkware"
  | "corporateawards"
  | "customcolor"
  | "personalizedgifts"
  | "sportawards";

type SiteConfig = {
  id: SiteId;
  baseUrl: string;
  /** Top-level category for our taxonomy. */
  ourCategory: string;
  /** Maps the supplier's `desc=` query param value to our subcategory slug.
   *  Falls back to a default subcategory if not in the map. */
  subcategoryMap: Record<string, string>;
  /** Used when the supplier's category isn't in subcategoryMap. */
  defaultSubcategory: string;
};

const SITES: Record<SiteId, SiteConfig> = {
  drinkware: {
    id: "drinkware",
    baseUrl: "https://premierdrinkware.com",
    ourCategory: "drinkware",
    subcategoryMap: {
      // Order matters: more specific keys first (the matcher iterates and
      // returns on the first substring match).
      "40 oz. Tumblers": "40oz-tumblers",
      "Wine Tumblers": "wine-sets",
      "Wine Sets": "wine-sets",
      "Stemless": "wine-sets",
      "Coffee and Travel Mugs": "mugs",
      "Coffee Mugs": "mugs",
      "Beverage Holders and Growlers": "growlers",
      "Beverage Holders": "growlers",
      "Bottle Openers": "bottle-openers",
      "Water Bottles": "water-bottles",
      "Shaker Bottles": "shaker-bottles",
      "Leatherette Flask Gift Sets": "flasks",
      "Coasters": "coasters",
      "20 oz. Tumblers": "tumblers",
      "30 oz. Tumblers": "tumblers",
      "16 oz. Tumblers": "tumblers",
      "12 oz. Tumblers": "tumblers",
      "Pilsner": "tumblers",
      "Pints": "tumblers",
      "Tumblers": "tumblers",
      "Mugs": "mugs",
      "Wine": "wine-sets",
      "Bamboo": "wine-sets",
      "Flasks": "flasks",
      "Polar Camel": "polar-camel",
      "Growlers": "growlers",
      "Full Color": "tumblers",
      "Accessories": "tumblers",
    },
    defaultSubcategory: "tumblers",
  },
  corporateawards: {
    id: "corporateawards",
    baseUrl: "https://premiercorporateawards.com",
    ourCategory: "corporate-awards",
    subcategoryMap: {
      "Wood Plaques": "plaques",
      "Plaques": "plaques",
      "Crystal": "crystal-awards",
      "Crystal Awards": "crystal-awards",
      "Glass": "glass-awards",
      "Glass Awards": "glass-awards",
      "Acrylic": "acrylic-awards",
      "Acrylic Awards": "acrylic-awards",
      "Clocks": "clocks",
      "Display Cases": "display-cases",
      "Desk Pieces": "desk-pieces",
      "Name Plates": "name-plates",
      "Office Signage": "office-signage",
      "Perpetual Plaques": "perpetual-plaques",
      "Gavels": "gavels",
    },
    defaultSubcategory: "plaques",
  },
  customcolor: {
    id: "customcolor",
    baseUrl: "https://premiercustomcolor.com",
    ourCategory: "photo-gifts",
    subcategoryMap: {
      "Mugs": "novelty",
      "Coolers": "coolers",
      "Keychains": "keychains",
      "Phone": "phone-accessories",
      "Phone Accessories": "phone-accessories",
      "Patches": "patches",
      "Apparel": "photo-apparel",
      "Photo Apparel": "photo-apparel",
      "Pet": "pet-items",
      "Pet Items": "pet-items",
      "Cutting Boards": "novelty",
      "Acrylic Awards": "novelty",
      "Acrylic": "novelty",
    },
    defaultSubcategory: "novelty",
  },
  personalizedgifts: {
    id: "personalizedgifts",
    baseUrl: "https://premierpersonalizedgifts.com",
    ourCategory: "personalized-gifts",
    subcategoryMap: {
      "Luggage Tags": "leatherette",
      "Wallets": "leatherette",
      "Leatherette": "leatherette",
      "Cutting Boards": "cutting-boards",
      "Frames": "frames",
      "Ornaments": "ornaments",
      "Acrylic": "acrylic-pieces",
      "Acrylic Pieces": "acrylic-pieces",
      "Glass": "glass-pieces",
      "Glass Pieces": "glass-pieces",
      "Journals": "journals-portfolios",
      "Portfolios": "journals-portfolios",
      "Money Clips": "money-clips",
      "Pet ID Tags": "pet-tags",
      "Pet Tags": "pet-tags",
      "Jewelry": "jewelry-stamping",
      "Flasks": "leatherette",
    },
    defaultSubcategory: "leatherette",
  },
  sportawards: {
    id: "sportawards",
    baseUrl: "https://premiersportawards.com",
    ourCategory: "sports-academic-awards",
    subcategoryMap: {
      "Resins": "resin-trophies",
      "Resin": "resin-trophies",
      "Resin Trophies": "resin-trophies",
      "Medals": "medals",
      "Cup Trophies": "cup-trophies",
      "Cups": "cup-trophies",
      "Crystal": "crystal-sport-awards",
      "Crystal Sport Awards": "crystal-sport-awards",
      "Ribbons": "ribbons",
      "Award Ribbons": "ribbons",
      "Championship Rings": "championship-rings",
      "Rings": "championship-rings",
      "Chenille": "chenille-pins",
      "Chenille Pins": "chenille-pins",
      "Dog Tags": "dog-tags",
      "Academic Awards": "academic-awards",
      "Academic": "academic-awards",
      "Custom Insert Medals": "custom-insert-medals",
    },
    defaultSubcategory: "resin-trophies",
  },
};

type ScrapedProduct = {
  /** Stable site-prefixed slug we'll use as the product id. */
  slug: string;
  title: string;
  supplierPartNumber: string;
  imageUrl: string;
  supplierUrl: string;
  targetCategory: string;
  targetSubcategory: string;
  rawCategoryDesc: string;
  sourceSite: SiteId;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function pickSubcategory(
  cfg: SiteConfig,
  rawDesc: string,
): string {
  // Exact match first.
  if (cfg.subcategoryMap[rawDesc]) return cfg.subcategoryMap[rawDesc];
  // Fuzzy match: any map key contained in the raw desc (case-insensitive).
  const lower = rawDesc.toLowerCase();
  for (const [key, sub] of Object.entries(cfg.subcategoryMap)) {
    if (lower.includes(key.toLowerCase())) return sub;
  }
  return cfg.defaultSubcategory;
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchPolite(url: string, retries = 3): Promise<string> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, "Accept": "text/html,application/xml" },
      });
      if (res.status >= 500) {
        lastErr = new Error(`HTTP ${res.status}`);
      } else if (!res.ok) {
        throw new Error(`HTTP ${res.status} on ${url}`);
      } else {
        return await res.text();
      }
    } catch (err) {
      lastErr = err;
    }
    await sleep(1500 * (attempt + 1));
  }
  throw lastErr;
}

async function getCategoryUrls(cfg: SiteConfig): Promise<string[]> {
  const sitemapUrl = `${cfg.baseUrl}/sitemap.xml`;
  let xml: string;
  try {
    xml = await fetchPolite(sitemapUrl);
  } catch (err) {
    console.warn(`! sitemap.xml unavailable for ${cfg.id}: ${(err as Error).message}`);
    return [];
  }
  const $ = cheerio.load(xml, { xmlMode: true });
  const urls: string[] = [];
  $("url loc").each((_, el) => {
    const u = $(el).text().trim();
    if (u && /[?&]desc=/.test(u) && u.startsWith(cfg.baseUrl)) urls.push(u);
  });
  return Array.from(new Set(urls));
}

function parseCategoryHtml(
  cfg: SiteConfig,
  catUrl: string,
  html: string,
): ScrapedProduct[] {
  const out: ScrapedProduct[] = [];
  const $ = cheerio.load(html);

  // Pull the desc query param to determine our subcategory.
  let rawDesc = "";
  try {
    const u = new URL(catUrl);
    rawDesc = (u.searchParams.get("desc") ?? "").replace(/\+/g, " ");
  } catch {
    // ignore
  }
  const targetSubcategory = pickSubcategory(cfg, rawDesc);

  $(".card.product_card").each((_, card) => {
    const $card = $(card);
    const title = $card.find(".product_title").first().text().trim();
    const partText = $card.find(".card-text").first().text().trim();
    const partMatch = partText.match(/Part\s*#?:?\s*([A-Z0-9-]+)/i);
    const supplierPartNumber = partMatch ? partMatch[1] : "";
    let imageUrl = $card.find("img").first().attr("src") ?? "";
    // Drop the cropping params from the URL so we get the original-resolution
    // image (Cloudinary lets us swap c_pad,b_transparent,w_300,h_300 for a
    // larger preset). Keep q_auto,f_auto.
    imageUrl = imageUrl.replace(
      /upload\/q_auto,c_pad,b_transparent,w_\d+,h_\d+\/?/,
      "upload/q_auto,f_auto,w_800/",
    );
    if (!title || !supplierPartNumber || !imageUrl) return;
    out.push({
      slug: `${cfg.id}-${slugify(supplierPartNumber + "-" + title).slice(0, 70)}`,
      title,
      supplierPartNumber,
      imageUrl,
      supplierUrl: catUrl,
      targetCategory: cfg.ourCategory,
      targetSubcategory,
      rawCategoryDesc: rawDesc,
      sourceSite: cfg.id,
    });
  });
  return out;
}

async function scrapeSite(
  siteId: SiteId,
  opts: { limit?: number; perCat?: number },
): Promise<ScrapedProduct[]> {
  const cfg = SITES[siteId];
  console.log(`→ scraping ${cfg.baseUrl} (limit=${opts.limit ?? "none"}, perCat=${opts.perCat ?? "none"})`);
  const catUrls = await getCategoryUrls(cfg);
  console.log(`  found ${catUrls.length} category URLs in sitemap`);

  const seen = new Set<string>();
  const products: ScrapedProduct[] = [];
  for (const u of catUrls) {
    if (opts.limit !== undefined && products.length >= opts.limit) break;
    let html: string;
    try {
      html = await fetchPolite(u);
    } catch (err) {
      console.warn(`  ! ${u}: ${(err as Error).message}`);
      continue;
    }
    const items = parseCategoryHtml(cfg, u, html);
    let takenFromThisCat = 0;
    for (const it of items) {
      if (seen.has(it.slug)) continue;
      if (opts.perCat !== undefined && takenFromThisCat >= opts.perCat) break;
      seen.add(it.slug);
      products.push(it);
      takenFromThisCat++;
      if (opts.limit !== undefined && products.length >= opts.limit) break;
    }
    process.stdout.write(`  + ${u.split("?")[1]?.slice(0, 60)}… → took ${takenFromThisCat} of ${items.length} (total ${products.length})\n`);
    await sleep(REQUEST_DELAY_MS);
  }
  return products;
}

async function main() {
  const args = process.argv.slice(2);
  const siteIdx = args.indexOf("--site");
  const limitIdx = args.indexOf("--limit");
  const perCatIdx = args.indexOf("--per-cat");
  const siteId = (siteIdx >= 0 ? args[siteIdx + 1] : "drinkware") as SiteId;
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : undefined;
  const perCat = perCatIdx >= 0 ? Number(args[perCatIdx + 1]) : undefined;
  if (!SITES[siteId]) {
    console.error(`Unknown site: ${siteId}. Choose: ${Object.keys(SITES).join(", ")}`);
    process.exit(1);
  }
  const out = await scrapeSite(siteId, { limit, perCat });
  const dir = path.join(process.cwd(), "tmp");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `scraped-blanks-${siteId}${limit ? `-pilot${limit}` : ""}.json`);
  await fs.writeFile(file, JSON.stringify(out, null, 2));
  console.log(`✓ wrote ${out.length} products → ${file}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
