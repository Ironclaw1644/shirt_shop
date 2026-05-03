/**
 * scripts/gemini-composite-cards.ts
 *
 * Generates category hero cards by sending multiple ACTUAL product photos to
 * Gemini 2.5 Flash Image (Nano Banana 2) and asking it to compose them into
 * a single natural catalog collage. Each item must remain visually faithful
 * to its source photo — the model only re-arranges and re-lights, it does
 * not invent or alter items.
 *
 *   npx tsx scripts/gemini-composite-cards.ts
 *   npx tsx scripts/gemini-composite-cards.ts --only drinkware
 *
 * Falls back to the deterministic sharp grid (composite-category-cards.ts)
 * if Gemini fails or returns nothing usable.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { categories } from "../lib/catalog/categories";
import {
  productsInSubcategory,
  type SampleProduct,
} from "../lib/catalog/sample-products";
import {
  generateImageFromReferences,
  type ReferenceImageInput,
} from "../lib/gemini/image";

const OUT_DIR = path.join(process.cwd(), "public", "images", "generated");
const UA = "GAPHCatalogBot/1.0 (+admin@gaprinthub.com)";

// 7 categories. custom-printing uses local AI-generated product images;
// the others use supplier CDN URLs.
const TARGETS = [
  "custom-printing",
  "apparel-headwear",
  "drinkware",
  "corporate-awards",
  "photo-gifts",
  "personalized-gifts",
  "sports-academic-awards",
];

// Title-keyword filters (copy from composite-category-cards.ts; keeps picks
// matching the subcategory name, so e.g. "Tumblers" gets a real tumbler).
const TITLE_KEYWORDS: Record<string, RegExp> = {
  tumblers: /\btumbler\b/i,
  mugs: /\bmug\b/i,
  "water-bottles": /\bwater bottle\b/i,
  flasks: /\bflask\b/i,
  "wine-sets": /\bwine\b/i,
  coasters: /\bcoaster\b/i,
  "bottle-openers": /\bbottle opener\b/i,
  growlers: /\bgrowler|beverage holder\b/i,
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
  plaques: /\bplaque\b/i,
  "crystal-awards": /\bcrystal\b/i,
  "glass-awards": /\bglass\b/i,
  "acrylic-awards": /\bacrylic\b/i,
  clocks: /\bclock\b/i,
  "perpetual-plaques": /\bperpetual\b/i,
  gavels: /\bgavel\b/i,
  coolers: /\bcooler\b/i,
  keychains: /\bkeychain|key chain\b/i,
  "phone-accessories": /\bphone\b/i,
  patches: /\bpatch\b/i,
  "photo-apparel": /\b(onesie|baby|bib|t-shirt|shirt)\b/i,
  "pet-items": /\bpet\b/i,
  novelty: /\b(plaque|hardboard|hoop|mdf)\b/i,
  leatherette: /\bleatherette\b/i,
  "cutting-boards": /\bcutting board|charcuterie\b/i,
  frames: /\b(frame|photo)\b/i,
  ornaments: /\bornament\b/i,
  "glass-pieces": /\b(glass|crystal)\b/i,
  "money-clips": /\b(money clip|wallet)\b/i,
  "resin-trophies": /\bresin\b/i,
  "cup-trophies": /\b(cup|trophy)\b/i,
  ribbons: /\bribbon\b/i,
  "championship-rings": /\bring\b/i,
  "chenille-pins": /\bchenille|pin\b/i,
  "dog-tags": /\bdog tag\b/i,
  "academic-awards": /\b(academic|honor|achievement)\b/i,
  "custom-insert-medals": /\b(insert|holder)\b/i,
  // custom-printing
  "business-cards": /\bbusiness card\b/i,
  "postcards-mailing": /\bpostcard\b/i,
  "flyers-brochures-booklets": /\b(flyer|brochure|booklet)\b/i,
  "restaurant-print": /\bmenu\b/i,
  "forms-certificates": /\b(form|certificate|invoice)\b/i,
  "stickers-decals": /\b(sticker|decal)\b/i,
  magnets: /\bmagnet\b/i,
  "dtf-transfers": /\b(dtf|transfer)\b/i,
  "banners-stands-flags": /\b(banner|flag|stand)\b/i,
  "yard-signs": /\b(yard sign|sign)\b/i,
  "posters-large-format": /\b(poster|fathead)\b/i,
  "promo-office": /\b(door hanger|mouse pad|cd label)\b/i,
};

function pickRepresentatives(
  catSlug: string,
): { subName: string; product: SampleProduct }[] {
  const cat = categories.find((c) => c.slug === catSlug);
  if (!cat) return [];
  const out: { subName: string; product: SampleProduct }[] = [];
  for (const sub of cat.subcategories) {
    const all = productsInSubcategory(catSlug, sub.slug)
      .filter((p) => {
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

async function fetchRemote(url: string): Promise<Buffer> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "image/avif,image/webp,*/*" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`fetch ${res.status} ${url.slice(0, 80)}`);
  return Buffer.from(await res.arrayBuffer());
}

async function resolveImage(p: SampleProduct): Promise<Buffer | null> {
  try {
    if (p.imageUrl) return await fetchRemote(p.imageUrl);
    const localPath = path.join(
      process.cwd(),
      "public",
      "images",
      "generated",
      `${p.heroPromptKey.replace(":", "-")}.webp`,
    );
    return await fs.readFile(localPath);
  } catch (err) {
    console.log(`  ✕ image resolve failed for ${p.slug}: ${(err as Error).message}`);
    return null;
  }
}

function buildPrompt(catName: string, items: { subName: string }[]): string {
  const itemList = items.map((i, n) => `${n + 1}. ${i.subName}`).join("\n");
  return [
    `Combine the ${items.length} attached reference photos into a SINGLE overhead 4:3 e-commerce category hero image for the "${catName}" category.`,
    ``,
    `THE ITEMS YOU MUST INCLUDE (one per reference photo, in any order):`,
    itemList,
    ``,
    `CRITICAL CONSTRAINTS — read carefully:`,
    `- Each reference photo represents one product that MUST appear in the final image. Use the EXACT visual appearance from the reference: same colors, same shape, same proportions, same materials, same printed design, same labels.`,
    `- Do NOT invent items. Do NOT add extra products that weren't in the references. Do NOT modify items to look "cooler."`,
    `- Do NOT merge two items into one composite product. Each reference is a separate physical product.`,
    `- Your job is purely COMPOSITION and LIGHTING — arrange the actual items into a clean overhead catalog collage and re-light to look unified.`,
    ``,
    `STYLE:`,
    `- Soft cream paper studio backdrop, slightly textured.`,
    `- 85mm-equivalent lens look, overhead camera angle, sharp focus throughout.`,
    `- Soft natural diffused window daylight from upper-left, gentle realistic shadows.`,
    `- Generous breathing room between items so each is clearly visible — not piled up, not overlapping heavily.`,
    `- Photoreal commercial product photography, magazine-quality but understated (no glamour staging, no models, no lifestyle scene).`,
    `- 4:3 aspect ratio, designed for an e-commerce category card.`,
    `- No text overlays. No invented logos. No real trademarks.`,
  ].join("\n");
}

function redact(text: string): string {
  const key = process.env.GOOGLE_API_KEY;
  if (!key) return text;
  return text.split(key).join("[REDACTED_GOOGLE_API_KEY]");
}

async function buildCard(catSlug: string) {
  const cat = categories.find((c) => c.slug === catSlug);
  if (!cat) {
    console.log(`${catSlug}: category not found`);
    return;
  }
  const reps = pickRepresentatives(catSlug);
  if (reps.length === 0) {
    console.log(`${catSlug}: no representative products`);
    return;
  }
  // Cap at 12 items — Gemini composes more reliably with fewer references,
  // and 12 is plenty for visual variety.
  const items = reps.slice(0, 12);
  console.log(
    `${catSlug}: composing ${items.length} item${items.length === 1 ? "" : "s"} via Gemini`,
  );

  // Resolve all images first; if any fails, skip the slot.
  const refs: ReferenceImageInput[] = [];
  const usedItems: typeof items = [];
  for (const it of items) {
    const buf = await resolveImage(it.product);
    if (!buf) continue;
    refs.push({ data: buf, mimeType: "image/jpeg" });
    usedItems.push(it);
    console.log(`  • ${it.subName.padEnd(28)} ${it.product.slug}`);
  }
  if (refs.length === 0) {
    console.log(`  ✕ no images resolved`);
    return;
  }

  const prompt = buildPrompt(cat.name, usedItems);
  console.log(`  → asking Gemini (${refs.length} refs, ~${prompt.length} char prompt)…`);

  let base64: string | null = null;
  let mimeType = "image/png";
  try {
    const result = await generateImageFromReferences({
      prompt,
      aspect: "4:3",
      referenceImages: refs,
    });
    base64 = result.base64;
    mimeType = result.mimeType;
  } catch (err) {
    console.log(`  ✕ Gemini error: ${redact((err as Error).message)}`);
    return;
  }

  const inputBuf = Buffer.from(base64, "base64");
  const outPath = path.join(OUT_DIR, `category-${catSlug}.webp`);
  // Resize to a consistent 1600 wide (no upscale), 4:3 enforced via cover.
  await sharp(inputBuf)
    .resize({ width: 1600, height: 1200, fit: "cover", kernel: "lanczos3" })
    .webp({ quality: 88 })
    .toFile(outPath);

  const promptLogPath = path.join(OUT_DIR, `category-${catSlug}.prompt.txt`);
  await fs.writeFile(promptLogPath, prompt, "utf8");

  console.log(
    `  ✓ wrote ${path.relative(process.cwd(), outPath)} (${mimeType} → webp)`,
  );
}

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("GOOGLE_API_KEY missing in env — aborting.");
    process.exit(1);
  }
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
  console.error(redact(err.message ?? String(err)));
  process.exit(1);
});
