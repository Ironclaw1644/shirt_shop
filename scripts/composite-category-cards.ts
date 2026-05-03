/**
 * scripts/composite-category-cards.ts
 *
 * Generates the 6 newly-populated category hero cards by COMPOSITING actual
 * product images (one representative product per populated subcategory) on a
 * cream backdrop. No AI generation — each item in the hero is the exact
 * supplier photo, just resized and laid out in a clean grid.
 *
 *   npx tsx scripts/composite-category-cards.ts
 *   npx tsx scripts/composite-category-cards.ts --only apparel-headwear
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { categories } from "../lib/catalog/categories";
import {
  productsInSubcategory,
  type SampleProduct,
} from "../lib/catalog/sample-products";

const OUT_DIR = path.join(process.cwd(), "public", "images", "generated");
const UA = "GAPHCatalogBot/1.0 (+admin@gaprinthub.com)";

// 1600x1200 (4:3) cream canvas.
const CANVAS_W = 1600;
const CANVAS_H = 1200;
const CREAM = { r: 250, g: 250, b: 247, alpha: 1 };

// 7 categories. custom-printing uses local AI-generated product images
// (heroPromptKey → /images/generated/<key>.webp); the others use supplier
// CDN URLs.
const TARGETS = [
  "custom-printing",
  "apparel-headwear",
  "drinkware",
  "corporate-awards",
  "photo-gifts",
  "personalized-gifts",
  "sports-academic-awards",
];

async function fetchImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "image/avif,image/webp,*/*" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) {
      console.log(`  ✕ ${res.status} ${url.slice(0, 80)}…`);
      return null;
    }
    return Buffer.from(await res.arrayBuffer());
  } catch (err) {
    console.log(`  ✕ fetch error ${(err as Error).message} ${url.slice(0, 80)}…`);
    return null;
  }
}

/** Resolve a product's image to bytes. Prefer supplier imageUrl (remote);
 *  fall back to the AI-generated local file derived from heroPromptKey. */
async function resolveProductImage(p: SampleProduct): Promise<Buffer | null> {
  if (p.imageUrl) return fetchImage(p.imageUrl);
  const localPath = path.join(
    process.cwd(),
    "public",
    "images",
    "generated",
    `${p.heroPromptKey.replace(":", "-")}.webp`,
  );
  try {
    return await fs.readFile(localPath);
  } catch {
    console.log(`  ✕ no image for ${p.slug} (${localPath})`);
    return null;
  }
}

/** Keywords to match in the product title for each subcategory, so the picked
 *  representative actually IS that kind of item. Falls back to first-by-slug
 *  if no products match. Keys are subcategory slugs. */
const TITLE_KEYWORDS: Record<string, RegExp> = {
  // drinkware
  tumblers: /\btumbler\b/i,
  mugs: /\bmug\b/i,
  "water-bottles": /\bwater bottle\b/i,
  flasks: /\bflask\b/i,
  "wine-sets": /\bwine\b/i,
  coasters: /\bcoaster\b/i,
  "bottle-openers": /\bbottle opener\b/i,
  growlers: /\bgrowler|beverage holder\b/i,
  // apparel-headwear
  "t-shirts": /\b(t-shirt|tee|t shirt)\b/i,
  "polos-knits": /\bpolo\b/i,
  "sweatshirts-fleece": /\b(hoodie|sweatshirt|fleece|pullover)\b/i,
  caps: /\b(cap|hat|trucker)\b/i,
  activewear: /\b(performance|active|moisture[- ]?wick|athletic)\b/i,
  outerwear: /\b(jacket|coat|vest|softshell|parka)\b/i,
  "woven-dress-shirts": /\b(woven|button[- ]?down|dress shirt|oxford)\b/i,
  bottoms: /\b(pant|short|trouser|chino)\b/i,
  workwear: /\b(workwear|safety|hi[- ]?vis|carhartt)\b/i,
  bags: /\b(bag|tote|backpack|duffel)\b/i,
  accessories: /\b(scarf|glove|sock|belt|tie)\b/i,
  "personal-protection": /\b(safety|mask|glove|hi[- ]?vis|vest)\b/i,
  womens: /\b(women|ladies|v[- ]?neck)\b/i,
  youth: /\byouth\b/i,
  // corporate-awards
  plaques: /\bplaque\b/i,
  "crystal-awards": /\bcrystal\b/i,
  "glass-awards": /\bglass\b/i,
  "acrylic-awards": /\bacrylic\b/i,
  clocks: /\bclock\b/i,
  "perpetual-plaques": /\bperpetual\b/i,
  gavels: /\bgavel\b/i,
  // photo-gifts
  coolers: /\bcooler\b/i,
  keychains: /\bkeychain|key chain\b/i,
  "phone-accessories": /\bphone\b/i,
  patches: /\bpatch\b/i,
  "photo-apparel": /\b(onesie|baby|bib|t-shirt|shirt)\b/i,
  "pet-items": /\bpet\b/i,
  novelty: /\b(plaque|hardboard|hoop|mdf)\b/i,
  // personalized-gifts
  leatherette: /\bleatherette\b/i,
  "cutting-boards": /\bcutting board|charcuterie\b/i,
  frames: /\b(frame|photo)\b/i,
  ornaments: /\bornament\b/i,
  "acrylic-pieces": /\bacrylic\b/i,
  "glass-pieces": /\b(glass|crystal)\b/i,
  "journals-portfolios": /\b(journal|portfolio|notebook)\b/i,
  "money-clips": /\b(money clip|wallet)\b/i,
  "pet-tags": /\bpet|tag\b/i,
  "jewelry-stamping": /\b(jewelry|jewellery|stamping|necklace)\b/i,
  // sports-academic-awards
  "resin-trophies": /\bresin\b/i,
  medals: /\bmedal\b/i,
  "cup-trophies": /\b(cup|trophy)\b/i,
  "crystal-sport-awards": /\bcrystal\b/i,
  ribbons: /\bribbon\b/i,
  "championship-rings": /\bring\b/i,
  "chenille-pins": /\bchenille|pin\b/i,
  "dog-tags": /\bdog tag\b/i,
  "academic-awards": /\b(academic|scholar|honor|spelling|debate|chess|drama|math|science|english|history)\b/i,
  "custom-insert-medals": /\b(insert|holder)\b/i,
};

/** Pick one representative product per populated subcategory. Prefer products
 *  whose title matches the subcategory's keyword regex; fall back to first by
 *  slug if none match. Skips products whose imageUrl is null/missing. */
function pickRepresentatives(catSlug: string): { subName: string; product: SampleProduct }[] {
  const cat = categories.find((c) => c.slug === catSlug);
  if (!cat) return [];
  const out: { subName: string; product: SampleProduct }[] = [];
  for (const sub of cat.subcategories) {
    const all = productsInSubcategory(catSlug, sub.slug)
      .filter((p) => {
        // Has a remote image URL OR a local AI-generated fallback (heroPromptKey).
        if (p.imageUrl) return !p.imageUrl.includes("128W-null");
        return !!p.heroPromptKey;
      })
      .sort((a, b) => a.slug.localeCompare(b.slug));
    if (all.length === 0) continue;
    const re = TITLE_KEYWORDS[sub.slug];
    const match = re ? all.find((p) => re.test(p.title)) : null;
    out.push({ subName: sub.name, product: match ?? all[0] });
  }
  return out;
}

/** Pick a (cols, rows, cellW, cellH) tuple for N items so the grid fits a
 *  4:3 canvas. Last row may be partial; caller centers it. */
function pickGrid(N: number): { cols: number; rows: number; cellW: number; cellH: number } {
  if (N <= 4) return { cols: N, rows: 1, cellW: CANVAS_W / N, cellH: CANVAS_H };
  if (N <= 8) return { cols: 4, rows: 2, cellW: 400, cellH: 600 };
  if (N <= 12) return { cols: 4, rows: 3, cellW: 400, cellH: 400 };
  if (N <= 16) return { cols: 4, rows: 4, cellW: 400, cellH: 300 };
  // Cap at 16 items max; caller should slice if more.
  return { cols: 4, rows: 4, cellW: 400, cellH: 300 };
}

async function buildCard(catSlug: string) {
  const reps = pickRepresentatives(catSlug);
  if (reps.length === 0) {
    console.log(`${catSlug}: no products`);
    return;
  }
  // Cap at 16 items (a full 4×4 grid); enough variety, fits cleanly.
  const items = reps.slice(0, 16);
  console.log(`${catSlug}: composing ${items.length} item${items.length === 1 ? "" : "s"}`);

  const grid = pickGrid(items.length);
  const padTop = Math.round((CANVAS_H - grid.rows * grid.cellH) / 2);

  // Inset each tile so items have visible breathing room.
  const TILE_PAD = 12;
  const tileInnerW = Math.round(grid.cellW - 2 * TILE_PAD);
  const tileInnerH = Math.round(grid.cellH - 2 * TILE_PAD);

  const composites: sharp.OverlayOptions[] = [];
  for (let i = 0; i < items.length; i++) {
    const { product, subName } = items[i];
    const buf = await resolveProductImage(product);
    if (!buf) continue;

    let resized: Buffer;
    try {
      resized = await sharp(buf)
        .resize({
          width: tileInnerW,
          height: tileInnerH,
          fit: "contain",
          background: CREAM,
          kernel: "lanczos3",
        })
        .toBuffer();
    } catch (err) {
      console.log(`  ✕ resize error for ${product.slug}: ${(err as Error).message}`);
      continue;
    }

    const row = Math.floor(i / grid.cols);
    const col = i % grid.cols;
    // Center partial last row.
    const isLastRow = row === grid.rows - 1;
    const itemsInRow =
      isLastRow && items.length % grid.cols !== 0
        ? items.length % grid.cols
        : grid.cols;
    const rowLeftStart = Math.round((CANVAS_W - itemsInRow * grid.cellW) / 2);
    const left = rowLeftStart + col * grid.cellW + TILE_PAD;
    const top = padTop + row * grid.cellH + TILE_PAD;

    composites.push({ input: resized, left, top });
    console.log(`  ✓ ${subName.padEnd(28)} ${product.slug}`);
  }

  if (composites.length === 0) {
    console.log(`  ✕ no images fetched, skipping`);
    return;
  }

  const outPath = path.join(OUT_DIR, `category-${catSlug}.webp`);
  await sharp({
    create: {
      width: CANVAS_W,
      height: CANVAS_H,
      channels: 4,
      background: CREAM,
    },
  })
    .composite(composites)
    .webp({ quality: 88 })
    .toFile(outPath);

  console.log(`  → wrote ${path.relative(process.cwd(), outPath)}`);
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  const targets = only ? [only] : TARGETS;

  for (const catSlug of targets) {
    await buildCard(catSlug);
  }
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
