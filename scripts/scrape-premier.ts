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
  /** Parser flavor — drives both how to enumerate category URLs and how to
   *  parse a category page's product cards. The four "premier-line" sites
   *  share the legacy backend; sport-awards is on a newer framework. */
  flavor: "premier-legacy" | "sport-awards";
};

const SITES: Record<SiteId, SiteConfig> = {
  drinkware: {
    id: "drinkware",
    baseUrl: "https://premierdrinkware.com",
    flavor: "premier-legacy",
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
    flavor: "premier-legacy",
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
    flavor: "premier-legacy",
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
    flavor: "premier-legacy",
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
    flavor: "sport-awards",
    ourCategory: "sports-academic-awards",
    subcategoryMap: {
      // Specific award types first (so e.g. "Insert Holder Medals" beats
      // the bare "Medals" alias, and "Crystal Sport" beats "Crystal").
      "Insert Holder Medals": "custom-insert-medals",
      "Custom Insert Medals": "custom-insert-medals",
      "Crystal Sport Awards": "crystal-sport-awards",
      "Award Ribbons": "ribbons",
      "Championship Rings": "championship-rings",
      "Chenille Pins": "chenille-pins",
      "Completed Plastic Cups": "cup-trophies",
      "Completed Metal Cups": "cup-trophies",
      "Cup Trophies": "cup-trophies",
      // Academic-award topics (categories 36-47 on sport-awards)
      "Victory": "academic-awards",
      "Torch": "academic-awards",
      "Achievement": "academic-awards",
      "Place": "academic-awards",
      "Participant": "academic-awards",
      "Sportsmanship": "academic-awards",
      "Lamp of Knowledge": "academic-awards",
      "Graduate": "academic-awards",
      "Attendance": "academic-awards",
      "Honor Roll": "academic-awards",
      "Star Performer": "academic-awards",
      "Spelling": "academic-awards",
      "Reading": "academic-awards",
      "Science": "academic-awards",
      "Math": "academic-awards",
      "Computer": "academic-awards",
      "Art": "academic-awards",
      "Drama": "academic-awards",
      "Debate": "academic-awards",
      "Chess": "academic-awards",
      "Pinewood Derby": "academic-awards",
      "Music": "academic-awards",
      "Band": "academic-awards",
      "Orchestra": "academic-awards",
      "Academic Awards": "academic-awards",
      "Academic": "academic-awards",
      // Generic medal / cup keys come AFTER the specific ones above.
      "Medals": "medals",
      "Resins": "resin-trophies",
      "Resin Trophies": "resin-trophies",
      "Resin": "resin-trophies",
      "Cups": "cup-trophies",
      "Crystal": "crystal-sport-awards",
      "Ribbons": "ribbons",
      "Rings": "championship-rings",
      "Chenille": "chenille-pins",
      "Dog Tags": "dog-tags",
      "Golf Awards": "resin-trophies",
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
  if (cfg.flavor === "sport-awards") {
    // No sitemap — enumerate /categories/N/products from the homepage navigation.
    const home = await fetchPolite(`${cfg.baseUrl}/`);
    const $ = cheerio.load(home);
    const urls = new Set<string>();
    $("a[href^='/categories/'][href$='/products']").each((_, el) => {
      const href = $(el).attr("href");
      if (href) urls.add(`${cfg.baseUrl}${href}`);
    });
    return Array.from(urls);
  }
  // premier-legacy: try sitemap.xml first; fall back to homepage scrape if
  // the sitemap is empty or only redirects to a sister domain (pgifts case).
  const sitemapUrl = `${cfg.baseUrl}/sitemap.xml`;
  const fromSitemap: string[] = [];
  try {
    const xml = await fetchPolite(sitemapUrl);
    const $ = cheerio.load(xml, { xmlMode: true });
    $("url loc").each((_, el) => {
      const u = $(el).text().trim();
      if (u && /[?&]desc=/.test(u) && u.startsWith(cfg.baseUrl)) fromSitemap.push(u);
    });
  } catch (err) {
    console.warn(`! sitemap.xml unavailable for ${cfg.id}: ${(err as Error).message}`);
  }
  if (fromSitemap.length > 0) return Array.from(new Set(fromSitemap));

  // Sitemap empty or unusable → enumerate from homepage navigation.
  console.log(`  (sitemap empty for ${cfg.id}; enumerating from homepage)`);
  const home = await fetchPolite(`${cfg.baseUrl}/`);
  const $ = cheerio.load(home);
  const urls = new Set<string>();
  $('a[href*="desc="]').each((_, el) => {
    let href = $(el).attr("href");
    if (!href) return;
    if (href.startsWith("index.php")) href = `${cfg.baseUrl}/${href}`;
    if (href.startsWith("/")) href = `${cfg.baseUrl}${href}`;
    if (href.startsWith(cfg.baseUrl)) urls.add(href);
  });
  return Array.from(urls);
}

function normalizeCloudinaryUrl(url: string): string {
  // Both site flavors use the same Cloudinary CDN. Strip the small thumbnail
  // crop params and ask for a width-800 auto-format image so the storefront
  // gets crisp images (Next/Image will downscale per breakpoint).
  return url
    .replace(
      /upload\/q_auto,c_pad,b_transparent,w_\d+,h_\d+\/?/,
      "upload/q_auto,f_auto,w_800/",
    )
    .replace(
      /upload\/f_auto,q_auto,c_pad,b_transparent,w_\d+,h_\d+\/?/,
      "upload/q_auto,f_auto,w_800/",
    );
}

function parseCategoryHtml(
  cfg: SiteConfig,
  catUrl: string,
  html: string,
): ScrapedProduct[] {
  if (cfg.flavor === "sport-awards") {
    return parseSportAwardsCategory(cfg, catUrl, html);
  }
  return parsePremierLegacyCategory(cfg, catUrl, html);
}

function parsePremierLegacyCategory(
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

  // Variant A: drinkware + personalizedgifts use `.card.product_card`.
  $(".card.product_card").each((_, card) => {
    const $card = $(card);
    const title = $card.find(".product_title").first().text().trim();
    const partText = $card.find(".card-text").first().text().trim();
    const partMatch = partText.match(/Part\s*#?:?\s*([A-Z0-9-]+)/i);
    const supplierPartNumber = partMatch ? partMatch[1] : "";
    const rawImg = $card.find("img").first().attr("src") ?? "";
    const imageUrl = normalizeCloudinaryUrl(rawImg);
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

  // Variant B: corporateawards + customcolor use `.prodDeetsInWrap` with
  // a different inner layout. Inside each block:
  //   <img src="...cloudinary.../large/PARTNUMBER--HASH.png">
  //   <span class="subTitles">Part #:&nbsp;</span><strong>PARTNUMBER</strong>
  //   <br/>Title text<br/>...
  $(".prodDeetsInWrap").each((_, card) => {
    const $card = $(card);
    const rawImg = $card.find("img").first().attr("src") ?? "";
    const imageUrl = normalizeCloudinaryUrl(rawImg);
    const supplierPartNumber = $card.find("strong").first().text().trim();
    // Extract the title by walking the HTML directly: it's the text node that
    // follows <strong>PARTNUMBER</strong><br/> and stops at the next <span>
    // (which begins "Size:", "Material:", etc.) OR end of wrapper.
    let title = "";
    if (supplierPartNumber) {
      const wrapHtml = $card.html() ?? "";
      const idx = wrapHtml.indexOf(`<strong>${supplierPartNumber}</strong>`);
      if (idx >= 0) {
        const afterPart = wrapHtml.slice(idx + `<strong>${supplierPartNumber}</strong>`.length);
        // Drop any leading <br/> tags + whitespace, then read until next tag
        const m = afterPart.match(/^(?:<br\s*\/?>|\s)*([^<]+)/);
        if (m) {
          title = m[1]
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&apos;/g, "'")
            .replace(/\s+/g, " ")
            .trim();
        }
      }
    }
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

function parseSportAwardsCategory(
  cfg: SiteConfig,
  catUrl: string,
  html: string,
): ScrapedProduct[] {
  // Sport-awards delivers products via a JS framework but the HTML still
  // embeds: an <h*> page heading (the category name) followed by N pairs of
  // (heading=product title, modal-toggle id=part number). All headings come
  // first in document order, then all part numbers. Pair them by index.
  const $ = cheerio.load(html);
  const headings: string[] = [];
  const parts: string[] = [];
  // Walk the whole HTML in document order so we know which group came first.
  $("h1, h2, h3, h4, h5, input.modal-toggle").each((_, el) => {
    if (el.tagName === "input") {
      const id = $(el).attr("id");
      if (id) parts.push(id);
    } else {
      const text = $(el).text().trim();
      if (text) headings.push(text.replace(/&quot;/g, '"'));
    }
  });
  if (parts.length === 0) return [];
  // First heading is the category page name; the next N are product titles.
  const rawDesc = headings[0] ?? "";
  const titles = headings.slice(1, 1 + parts.length);
  const targetSubcategory = pickSubcategory(cfg, rawDesc);
  const out: ScrapedProduct[] = [];
  // Find all cloudinary product images on the page and index by part number.
  const imageByPart = new Map<string, string>();
  $('img, a[href*="cloudinary.com"]').each((_, el) => {
    const url = $(el).attr("src") ?? $(el).attr("href") ?? "";
    const m = url.match(/large\/([A-Z0-9-]+)--[a-f0-9]+\.(?:png|jpe?g|webp)/i);
    if (m && !imageByPart.has(m[1])) {
      imageByPart.set(m[1], normalizeCloudinaryUrl(url));
    }
  });
  for (let i = 0; i < parts.length; i++) {
    const supplierPartNumber = parts[i];
    const title = titles[i] ?? "";
    const imageUrl = imageByPart.get(supplierPartNumber) ?? "";
    if (!title || !imageUrl) continue;
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
  }
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
  const siteArg = (siteIdx >= 0 ? args[siteIdx + 1] : "drinkware");
  const limit = limitIdx >= 0 ? Number(args[limitIdx + 1]) : undefined;
  const perCat = perCatIdx >= 0 ? Number(args[perCatIdx + 1]) : undefined;

  const dir = path.join(process.cwd(), "tmp");
  await fs.mkdir(dir, { recursive: true });

  const targets: SiteId[] = siteArg === "all"
    ? (Object.keys(SITES) as SiteId[])
    : [siteArg as SiteId];

  for (const siteId of targets) {
    if (!SITES[siteId]) {
      console.error(`Unknown site: ${siteId}. Choose: all, ${Object.keys(SITES).join(", ")}`);
      process.exit(1);
    }
    const out = await scrapeSite(siteId, { limit, perCat });
    const file = path.join(dir, `scraped-blanks-${siteId}${limit ? `-pilot${limit}` : ""}.json`);
    await fs.writeFile(file, JSON.stringify(out, null, 2));
    console.log(`✓ wrote ${out.length} products → ${file}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
