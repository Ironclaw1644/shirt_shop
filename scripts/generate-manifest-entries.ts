/**
 * One-shot: append image-manifest.json entries for every imported product
 * that doesn't already have a manifest entry. Idempotent — re-runnable.
 *
 *   npx tsx scripts/generate-manifest-entries.ts
 */
import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { importedProducts } from "../lib/catalog/imported-products";
import type { SampleProduct } from "../lib/catalog/sample-products";

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

const MANIFEST_PATH = path.join(process.cwd(), "content", "image-manifest.json");

function categoryGuidance(categorySlug: string): string {
  switch (categorySlug) {
    case "custom-printing":
      return "Editorial flat-lay or three-quarter product shot on a warm paper-grain backdrop, soft north-window light, gentle shadows, paper / kraft / charcoal palette with one ink-crimson accent. Print-shop craft mood.";
    case "apparel-headwear":
      return "Garment laid flat or hung on a wooden hanger against a paper or concrete backdrop, soft diffused daylight, 50–85mm lens, generic blank garment with no visible logos or trademark text. Editorial wardrobe mood.";
    case "corporate-awards":
      return "Dramatic moody lighting against a deep charcoal velvet or matte black surface, single warm tungsten spotlight, brass / walnut / crystal palette. Premium, dignified, magazine-spread quality.";
    case "drinkware":
      return "Warm window light, paper or warm wood surface, 85mm lens, subtle engraved or printed accent visible. Generic non-branded vessel. Cozy editorial mood.";
    case "photo-gifts":
      return "Bright, joyful, full-color personalization on a clean paper or white studio backdrop, soft daylight, 50mm lens. Commercial product photography, no real human faces or trademark text.";
    case "personalized-gifts":
      return "Warm intimate setting — paper, linen, or warm wood surface — with engraved cream-on-leatherette or warm walnut grain. Generic non-branded item. Gift-ready, magazine still-life mood.";
    case "sports-academic-awards":
      return "Stadium-quality warm tungsten lighting against a deep charcoal backdrop, low hero angle, brass / walnut / ribbon palette. Championship-season serious — not cartoonish.";
    case "bulk-blanks":
      return "Warehouse-table flat-lay of WHOLESALE BLANK goods — no printed graphics, no logos, no text on any item. Stack or row arrangement on a kraft, paper, or concrete surface. Warm overhead daylight, 35mm lens. Wholesale-supply mood.";
    default:
      return "Editorial product photography on a paper backdrop, soft daylight, 50mm lens, brand-safe.";
  }
}

function buildPrompt(p: SampleProduct): string {
  const lead = `Photograph of "${p.title}" — ${p.shortDescription}`;
  const guidance = categoryGuidance(p.categorySlug);
  return `${lead} ${guidance} Final image must show no real trademarks, brand logos, or readable text on the product itself.`;
}

function entryForProduct(p: SampleProduct): ManifestEntry {
  return {
    slug: p.heroPromptKey.replace(":", "-"),
    title: `${p.title} hero`,
    aspect: "4:3",
    prompt: buildPrompt(p),
  };
}

async function main() {
  const raw = await fs.readFile(MANIFEST_PATH, "utf8");
  const manifest = JSON.parse(raw) as Manifest;

  const existing = new Set(manifest.images.map((e) => e.slug));
  const additions: ManifestEntry[] = [];
  for (const p of importedProducts) {
    const entry = entryForProduct(p);
    if (existing.has(entry.slug)) continue;
    additions.push(entry);
  }

  if (additions.length === 0) {
    console.log("No new entries to add.");
    return;
  }

  manifest.images.push(...additions);
  const next = JSON.stringify(manifest, null, 2) + "\n";
  await fs.writeFile(MANIFEST_PATH, next, "utf8");
  console.log(`Added ${additions.length} entries to image-manifest.json.`);
  console.log(`Manifest now has ${manifest.images.length} total entries.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
