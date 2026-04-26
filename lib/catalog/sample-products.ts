import type { Category } from "./categories";
import { importedProducts } from "./imported-products";
import { importedProductsBatch2 } from "./imported-products-batch-2";
import { importedProductsBatch3 } from "./imported-products-batch-3";
import { importedProductsBatch4 } from "./imported-products-batch-4";

export type Vec3 = [number, number, number];

export type PlacementAnchor3D = {
  /** World-space position on the model where the decal centers. */
  position: Vec3;
  /** Outward surface normal at that position (decal projects along -normal). */
  normal: Vec3;
  /** Up direction for decal orientation (e.g. [0,1,0] for chest, [0,0,1] for sleeve). */
  up: Vec3;
  /** Largest decal edge allowed at this zone, in inches (clamps user resize). */
  maxSizeIn: number;
};

export type PlacementZone = {
  key: string;
  label: string;
  widthIn: number;
  heightIn: number;
  /** Optional 3D anchor — present only on products with a model3D. */
  anchor3D?: PlacementAnchor3D;
};

export type Product3DModel = {
  /** Optional GLB to load. If absent, the viewer uses the procedural tee mesh. */
  url?: string;
  /** Camera distance from origin in model units. */
  cameraDistance: number;
  /** Inches → world-units factor (the procedural tee is built so 1in ≈ 0.04 units). */
  inchesPerUnit: number;
  /** Default base color for the garment material. */
  defaultColor?: string;
};

export type SampleProduct = {
  slug: string;
  categorySlug: Category["slug"];
  subcategorySlug?: string;
  title: string;
  shortDescription: string;
  description: string;
  basePriceCents: number | null;
  priceStatus: "confirmed" | "placeholder" | "quote";
  minQty: number;
  leadTimeDays: number;
  decorationMethods: string[];
  placementZones?: PlacementZone[];
  options?: Record<string, string[]>;
  brand?: string;
  heroPromptKey: string;
  tierBreaks?: { minQty: number; unitCents: number }[];
  badges?: string[];
  /** Optional 3D model metadata — when set, the designer renders the 3D viewer. */
  model3D?: Product3DModel;
};

/**
 * Hand-curated seed products across the original seven categories.
 * Pricing uses publicly referenced placeholder figures — `priceStatus` flags which
 * need operator confirmation. Overlap SKUs (e.g. tumblers) use distinct copy.
 */
const seedProducts: SampleProduct[] = [
  // ─── Custom Printing ──────────────────────────────────────────────────────
  {
    slug: "standard-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Standard Business Cards",
    shortDescription: "14pt C2S with matte or gloss finish — our pressroom workhorse.",
    description:
      "Full-color both sides on 14pt coated cover. Matte, gloss, or uncoated finish. Ships in 1-7 business days once a proof is approved.",
    basePriceCents: 2900,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 3,
    decorationMethods: ["offset-print", "digital-print"],
    options: {
      Quantity: ["100", "250", "500", "1000", "2500", "5000"],
      Finish: ["Matte", "Gloss", "Uncoated"],
      Stock: ["14pt", "16pt", "Economy 12pt"],
    },
    tierBreaks: [
      { minQty: 100, unitCents: 29 },
      { minQty: 500, unitCents: 15 },
      { minQty: 1000, unitCents: 9 },
      { minQty: 5000, unitCents: 5 },
    ],
    heroPromptKey: "product:standard-business-cards",
    badges: ["Fast Turnaround"],
  },
  {
    slug: "foil-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Foil Business Cards",
    shortDescription: "Metallic foil accents on heavyweight 32pt silk.",
    description:
      "Gold, silver, copper, or rose gold foil on 32pt silk-laminated stock. Spot foil or all-over.",
    basePriceCents: 9900,
    priceStatus: "confirmed",
    minQty: 250,
    leadTimeDays: 7,
    decorationMethods: ["offset-print", "foil"],
    options: {
      Quantity: ["250", "500", "1000", "2500"],
      Foil: ["Gold", "Silver", "Copper", "Rose Gold"],
    },
    heroPromptKey: "product:foil-business-cards",
    badges: ["Premium"],
  },
  {
    slug: "tri-fold-brochures",
    categorySlug: "custom-printing",
    subcategorySlug: "brochures",
    title: "Tri-Fold Brochures",
    shortDescription: "100lb gloss text, full color both sides, scored and folded.",
    description:
      "Classic 8.5×11 tri-fold, 100lb gloss text, full color both sides, scored and folded in-house.",
    basePriceCents: 14900,
    priceStatus: "confirmed",
    minQty: 250,
    leadTimeDays: 4,
    decorationMethods: ["offset-print", "digital-print"],
    options: {
      Quantity: ["250", "500", "1000", "2500", "5000"],
      Paper: ["100lb Gloss", "100lb Matte", "80lb Uncoated"],
    },
    heroPromptKey: "product:tri-fold-brochures",
  },
  {
    slug: "full-color-flyers",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers",
    title: "Full-Color Flyers",
    shortDescription: "100lb gloss, 8.5×11 or 5.5×8.5, full bleed.",
    description: "Event flyers, promos, takeouts — same or next-day digital on stock or offset at volume.",
    basePriceCents: 8900,
    priceStatus: "confirmed",
    minQty: 250,
    leadTimeDays: 2,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["5.5×8.5", "8.5×11", "11×17"],
      Paper: ["100lb Gloss", "100lb Matte", "80lb Text"],
    },
    heroPromptKey: "product:full-color-flyers",
  },
  {
    slug: "edd-m-postcards",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards",
    title: "EDDM Postcards",
    shortDescription: "USPS Every Door Direct Mail, full color, ready-to-mail.",
    description: "6.5×9 oversized EDDM-qualified postcards printed on 14pt gloss. We also handle the mailing paperwork.",
    basePriceCents: 39900,
    priceStatus: "confirmed",
    minQty: 500,
    leadTimeDays: 5,
    decorationMethods: ["offset-print"],
    options: {
      Quantity: ["500", "1000", "2500", "5000", "10000"],
    },
    heroPromptKey: "product:eddm-postcards",
  },
  {
    slug: "vinyl-banner-custom",
    categorySlug: "custom-printing",
    subcategorySlug: "banners",
    title: "Custom Vinyl Banner",
    shortDescription: "13oz scrim vinyl, grommeted, full-color single-sided.",
    description: "Outdoor-rated 13oz scrim vinyl with hemmed edges and brass grommets every 2 feet. Specify any size.",
    basePriceCents: 4500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["2×4", "3×6", "4×8", "Custom"],
      Finish: ["Single Sided", "Double Sided"],
    },
    heroPromptKey: "product:vinyl-banner",
  },
  {
    slug: "real-estate-yard-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Real-Estate Yard Signs",
    shortDescription: "24×18 corrugated plastic, full color, with optional H-stake.",
    description: "Standard 24×18 corrugated plastic yard signs, full-color single or double-sided, H-stake optional.",
    basePriceCents: 1500,
    priceStatus: "confirmed",
    minQty: 10,
    leadTimeDays: 3,
    decorationMethods: ["digital-print"],
    options: {
      Sides: ["Single", "Double"],
      Stake: ["None", "H-Stake", "Step Stake"],
    },
    heroPromptKey: "product:yard-signs",
  },
  {
    slug: "kiss-cut-stickers",
    categorySlug: "custom-printing",
    subcategorySlug: "stickers",
    title: "Kiss-Cut Stickers",
    shortDescription: "Custom die-line, 3-mil vinyl, weather resistant.",
    description: "Any shape, kiss-cut on a backer sheet. 3-mil vinyl with laminate for UV + scratch resistance.",
    basePriceCents: 7900,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["2×2", "3×3", "4×4", "Custom"],
      Laminate: ["Gloss", "Matte"],
    },
    heroPromptKey: "product:kiss-cut-stickers",
  },
  {
    slug: "dtf-gangup-sheet",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "DTF Gang-Up Sheet",
    shortDescription: "22×any-length DTF sheet — arrange as many designs as you can fit.",
    description: "High-detail direct-to-film transfers. We gang your artwork onto 22-inch sheets and ship ready-to-press.",
    basePriceCents: 1800,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["dtf"],
    options: {
      Length: ['12"', '24"', '36"', "Custom"],
    },
    heroPromptKey: "product:dtf-gangup",
  },
  {
    slug: "retractable-banner-stand",
    categorySlug: "custom-printing",
    subcategorySlug: "banner-stands",
    title: "Retractable Banner Stand",
    shortDescription: "33×81 premium retractable with padded travel bag.",
    description: "Premium aluminum retractable banner stand, 33×81, with a padded carry bag and full-color printed graphic.",
    basePriceCents: 17500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    heroPromptKey: "product:retractable-banner",
  },

  // ─── Apparel & Headwear ───────────────────────────────────────────────────
  {
    slug: "bella-canvas-3001-tee",
    categorySlug: "apparel-headwear",
    subcategorySlug: "t-shirts",
    title: "BELLA+CANVAS 3001 Tee",
    shortDescription: "Ring-spun 100% cotton tee — the team-event favorite.",
    description: "Unisex ring-spun cotton tee in 50+ colors. Blank bulk-priced or decorated with screen print, DTF, or embroidery. Equivalent blanks available — ask if you need a specific spec.",
    basePriceCents: 399,
    priceStatus: "confirmed",
    minQty: 12,
    leadTimeDays: 7,
    decorationMethods: ["screen-print", "dtf", "heat-transfer", "embroidery"],
    brand: "BELLA+CANVAS",
    options: {
      Size: ["XS", "S", "M", "L", "XL", "2XL", "3XL"],
      Color: ["White", "Black", "Heather Grey", "Navy", "Red", "Kelly", "Sand Dune"],
    },
    placementZones: [
      {
        key: "left-chest",
        label: "Left Chest",
        widthIn: 3.5,
        heightIn: 3.5,
        anchor3D: {
          position: [-4, 6, 0.4],
          normal: [0, 0, 1],
          up: [0, 1, 0],
          maxSizeIn: 4.5,
        },
      },
      {
        key: "full-front",
        label: "Full Front",
        widthIn: 12,
        heightIn: 14,
        anchor3D: {
          position: [0, 0, 0.4],
          normal: [0, 0, 1],
          up: [0, 1, 0],
          maxSizeIn: 14,
        },
      },
      {
        key: "full-back",
        label: "Full Back",
        widthIn: 12,
        heightIn: 14,
        anchor3D: {
          position: [0, 0, -0.4],
          normal: [0, 0, -1],
          up: [0, 1, 0],
          maxSizeIn: 14,
        },
      },
      {
        key: "sleeve",
        label: "Sleeve",
        widthIn: 3,
        heightIn: 3,
        anchor3D: {
          position: [12, 5, 0.4],
          normal: [0, 0, 1],
          up: [0, 1, 0],
          maxSizeIn: 4,
        },
      },
    ],
    tierBreaks: [
      { minQty: 12, unitCents: 1299 },
      { minQty: 24, unitCents: 1099 },
      { minQty: 72, unitCents: 899 },
      { minQty: 144, unitCents: 749 },
      { minQty: 500, unitCents: 599 },
    ],
    heroPromptKey: "product:bc-3001-tee",
    badges: ["Bulk Favorite"],
    model3D: {
      cameraDistance: 60,
      inchesPerUnit: 1,
      defaultColor: "#d1d5db",
    },
  },
  {
    slug: "comfort-colors-1717",
    categorySlug: "apparel-headwear",
    subcategorySlug: "t-shirts",
    title: "Comfort Colors 1717 Garment-Dyed Tee",
    shortDescription: "6.1 oz ring-spun, lived-in pigment dye — a team-store staple.",
    description: "Heavyweight garment-dyed tee, pigment-dyed for an instant lived-in look. Screen print holds beautifully on this stock.",
    basePriceCents: 1199,
    priceStatus: "confirmed",
    minQty: 12,
    leadTimeDays: 7,
    decorationMethods: ["screen-print", "dtf", "embroidery"],
    brand: "Comfort Colors",
    options: {
      Size: ["S", "M", "L", "XL", "2XL"],
      Color: ["Pepper", "Crimson", "Ivory", "Washed Denim", "Sandstone", "Chalky Mint"],
    },
    placementZones: [
      { key: "left-chest", label: "Left Chest", widthIn: 3.5, heightIn: 3.5 },
      { key: "full-front", label: "Full Front", widthIn: 12, heightIn: 14 },
      { key: "full-back", label: "Full Back", widthIn: 12, heightIn: 14 },
    ],
    heroPromptKey: "product:comfort-colors-1717",
  },
  {
    slug: "port-authority-k500-polo",
    categorySlug: "apparel-headwear",
    subcategorySlug: "polos-knits",
    title: "Port Authority K500 Silk-Touch Polo",
    shortDescription: "Silk-touch poly/cotton polo — corporate-cart ready.",
    description: "Wrinkle-resistant polo with knit collar. Embroiders cleanly. Order blank or decorated.",
    basePriceCents: 1499,
    priceStatus: "confirmed",
    minQty: 12,
    leadTimeDays: 7,
    decorationMethods: ["embroidery", "heat-transfer"],
    brand: "Port Authority",
    options: {
      Size: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      Color: ["Black", "Navy", "White", "Red", "Royal", "Steel Grey"],
    },
    placementZones: [
      { key: "left-chest", label: "Left Chest", widthIn: 3.5, heightIn: 3.5 },
      { key: "right-chest", label: "Right Chest", widthIn: 3.5, heightIn: 3.5 },
      { key: "sleeve", label: "Sleeve", widthIn: 3, heightIn: 3 },
    ],
    heroPromptKey: "product:port-authority-polo",
  },
  {
    slug: "gildan-18500-hoodie",
    categorySlug: "apparel-headwear",
    subcategorySlug: "sweatshirts-fleece",
    title: "Gildan 18500 Heavy Blend Hoodie",
    shortDescription: "50/50 pouch-pocket hoodie — bulletproof for fundraisers.",
    description: "The workhorse hoodie. Decorates crisply, survives sideline duty, ships in every size youth–5XL.",
    basePriceCents: 1899,
    priceStatus: "confirmed",
    minQty: 12,
    leadTimeDays: 7,
    decorationMethods: ["screen-print", "embroidery", "dtf"],
    brand: "Gildan",
    options: {
      Size: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
      Color: ["Black", "Navy", "Sport Grey", "Maroon", "Forest", "Safety Orange"],
    },
    placementZones: [
      { key: "left-chest", label: "Left Chest", widthIn: 4, heightIn: 4 },
      { key: "full-front", label: "Full Front", widthIn: 12, heightIn: 14 },
      { key: "full-back", label: "Full Back", widthIn: 12, heightIn: 14 },
      { key: "sleeve", label: "Sleeve", widthIn: 3, heightIn: 3 },
    ],
    heroPromptKey: "product:gildan-hoodie",
    badges: ["Team Favorite"],
  },
  {
    slug: "richardson-112-trucker",
    categorySlug: "apparel-headwear",
    subcategorySlug: "caps",
    title: "Richardson 112 Trucker Cap",
    shortDescription: "Snap-back trucker — the cap you actually wear.",
    description: "Structured five-panel trucker with mesh back. Holds embroidery, patches, and rich-stitch 3D logos.",
    basePriceCents: 1099,
    priceStatus: "confirmed",
    minQty: 24,
    leadTimeDays: 9,
    decorationMethods: ["embroidery", "leather-patch", "3d-embroidery"],
    brand: "Richardson",
    options: {
      Color: ["Black", "Charcoal/Black", "Navy", "Red/White", "Heather Grey/Black"],
    },
    placementZones: [
      { key: "front-center", label: "Front Center", widthIn: 4, heightIn: 2.25 },
      { key: "side", label: "Side Panel", widthIn: 2, heightIn: 1.75 },
      { key: "back", label: "Back", widthIn: 3, heightIn: 1.5 },
    ],
    heroPromptKey: "product:richardson-112",
  },
  {
    slug: "heavyweight-workwear-pocket-tee",
    categorySlug: "apparel-headwear",
    subcategorySlug: "workwear",
    title: "Heavyweight Workwear Pocket Tee",
    shortDescription: "6.75oz heavyweight workwear tee — for trades and jobsites.",
    description: "Heavyweight pocket tee built for trades and jobsites. Decorates well with screen print and bold embroidery. Specific brand spec available on request.",
    basePriceCents: 2499,
    priceStatus: "confirmed",
    minQty: 12,
    leadTimeDays: 9,
    decorationMethods: ["screen-print", "embroidery"],
    options: {
      Size: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      Color: ["Black", "Heather Grey", "Navy", "Tan", "Forest"],
    },
    heroPromptKey: "product:heavyweight-workwear-pocket-tee",
  },
  {
    slug: "port-authority-bg204-tote",
    categorySlug: "apparel-headwear",
    subcategorySlug: "bags",
    title: "Port Authority BG204 Canvas Tote",
    shortDescription: "Heavy canvas tote — conference-ready in 48 hours.",
    description: "12oz cotton canvas tote with contrast straps. Ships within two days for rush events.",
    basePriceCents: 799,
    priceStatus: "confirmed",
    minQty: 24,
    leadTimeDays: 4,
    decorationMethods: ["screen-print", "heat-transfer", "embroidery"],
    brand: "Port Authority",
    options: {
      Color: ["Natural/Black", "Natural/Navy", "Natural/Red", "Black/Black"],
    },
    placementZones: [
      { key: "front-center", label: "Front Center", widthIn: 9, heightIn: 9 },
    ],
    heroPromptKey: "product:pa-tote",
  },

  // ─── Corporate Awards ─────────────────────────────────────────────────────
  {
    slug: "walnut-piano-plaque",
    categorySlug: "corporate-awards",
    subcategorySlug: "plaques",
    title: "Walnut Piano-Finish Plaque",
    shortDescription: "Laser-engraved walnut plaque with brass presentation plate.",
    description: "Premium walnut with a piano-finish, brass engraving plate, and optional gold border. Perfect for years-of-service programs.",
    basePriceCents: 8900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["laser-engraving"],
    options: {
      Size: ['8"×10"', '9"×12"', '10.5"×13"'],
    },
    heroPromptKey: "product:walnut-plaque",
  },
  {
    slug: "crystal-diamond-tower",
    categorySlug: "corporate-awards",
    subcategorySlug: "crystal-awards",
    title: "Crystal Diamond Tower",
    shortDescription: "Optical crystal faceted tower — annual recognition headline.",
    description: "Clear optical crystal, precision-faceted, sand-etched on the front face. Heavy, satisfying presence.",
    basePriceCents: 14900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 10,
    decorationMethods: ["laser-engraving", "sand-etch"],
    options: {
      Size: ['7"', '9"', '11"'],
    },
    heroPromptKey: "product:crystal-tower",
    badges: ["Premium"],
  },
  {
    slug: "acrylic-jewel-award",
    categorySlug: "corporate-awards",
    subcategorySlug: "acrylic-awards",
    title: "Acrylic Jewel Award",
    shortDescription: "UV-printed acrylic with chromed base — full color at volume.",
    description: '1" thick jewel-cut acrylic with full-color UV print. Great for sales milestones at quantity — 50 units, no sweat.',
    basePriceCents: 6900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 8,
    decorationMethods: ["uv-print", "laser-engraving"],
    heroPromptKey: "product:acrylic-jewel",
  },
  {
    slug: "executive-desk-clock",
    categorySlug: "corporate-awards",
    subcategorySlug: "clocks",
    title: "Executive Desk Clock",
    shortDescription: "Rosewood + chrome desk clock with engraving plate.",
    description: "Quartz movement, rosewood base, brushed chrome face, engraving plate sized for a 4-line dedication.",
    basePriceCents: 7900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["laser-engraving"],
    heroPromptKey: "product:desk-clock",
  },

  // ─── Drinkware ────────────────────────────────────────────────────────────
  {
    slug: "polar-camel-20oz-tumbler",
    categorySlug: "drinkware",
    subcategorySlug: "polar-camel",
    title: "Polar Camel 20oz Vacuum Tumbler",
    shortDescription: "Double-wall stainless — laser engraves to a clean silver finish.",
    description: "Bulk-decorated tumblers for weddings, teams, and corporate gifting. Laser engraving reveals silver beneath the powder coat for a premium mark.",
    basePriceCents: 1299,
    priceStatus: "confirmed",
    minQty: 12,
    leadTimeDays: 7,
    decorationMethods: ["laser-engraving", "uv-print"],
    options: {
      Color: ["Black", "White", "Navy", "Red", "Sage", "Mauve", "Stainless"],
    },
    tierBreaks: [
      { minQty: 12, unitCents: 1599 },
      { minQty: 50, unitCents: 1399 },
      { minQty: 100, unitCents: 1199 },
      { minQty: 500, unitCents: 999 },
    ],
    heroPromptKey: "product:polar-camel-20oz",
    badges: ["Bulk Favorite"],
  },
  {
    slug: "ceramic-11oz-mug",
    categorySlug: "drinkware",
    subcategorySlug: "mugs",
    title: "Ceramic 11oz Mug",
    shortDescription: "White ceramic — sublimated full-color wrap.",
    description: "Glossy white ceramic mug, dye-sublimation printed in full color. Great for single-gift personalization and 500-unit runs alike.",
    basePriceCents: 799,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["sublimation"],
    options: {
      Color: ["White", "Two-Tone Black", "Two-Tone Red"],
    },
    placementZones: [
      { key: "wrap", label: "Full Wrap", widthIn: 8.5, heightIn: 3.5 },
    ],
    heroPromptKey: "product:ceramic-mug",
  },
  {
    slug: "slate-coaster-set",
    categorySlug: "drinkware",
    subcategorySlug: "coasters",
    title: "Slate Coaster Set",
    shortDescription: "4-pack natural slate — laser engraves white.",
    description: "Four natural-edge slate coasters with cork feet. Laser engrave monograms, names, wedding dates, or logos.",
    basePriceCents: 2499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["laser-engraving"],
    heroPromptKey: "product:slate-coasters",
  },

  // ─── Photo Gifts ──────────────────────────────────────────────────────────
  {
    slug: "color-cooler-bag",
    categorySlug: "photo-gifts",
    subcategorySlug: "coolers",
    title: "Full-Color Photo Cooler Bag",
    shortDescription: "12-can insulated cooler — all-over color print.",
    description: "Sublimated 12-can cooler bag with your photo or graphic printed edge-to-edge. Ships in 1-7 business days.",
    basePriceCents: 2999,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["sublimation"],
    heroPromptKey: "product:photo-cooler",
  },
  {
    slug: "photo-metal-keychain",
    categorySlug: "photo-gifts",
    subcategorySlug: "keychains",
    title: "Photo Metal Keychain",
    shortDescription: "Aluminum 2-sided keychain — sublimated photo finish.",
    description: "Two-sided aluminum keychain with full-color photo print. Perfect for keepsakes, memorials, and class gifts.",
    basePriceCents: 999,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["sublimation"],
    heroPromptKey: "product:photo-keychain",
  },
  {
    slug: "custom-patch-morale",
    categorySlug: "photo-gifts",
    subcategorySlug: "patches",
    title: "Custom Morale Patch",
    shortDescription: "3-inch embroidered or PVC patch — hook-loop backing.",
    description: "Choose embroidery or rubber PVC, with hook-and-loop backing. Bulk morale patches for teams, leagues, and first responders.",
    basePriceCents: 599,
    priceStatus: "confirmed",
    minQty: 50,
    leadTimeDays: 12,
    decorationMethods: ["embroidery", "pvc"],
    heroPromptKey: "product:custom-patch",
  },

  // ─── Personalized Gifts ──────────────────────────────────────────────────
  {
    slug: "leatherette-journal",
    categorySlug: "personalized-gifts",
    subcategorySlug: "leatherette",
    title: "Leatherette Journal",
    shortDescription: "Premium leatherette journal — laser engraves cream.",
    description: "A5 leatherette journal with refillable lined pages. Laser engraves a warm cream mark on black, brown, navy, or wine finish.",
    basePriceCents: 3499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["laser-engraving"],
    options: {
      Color: ["Black/Silver", "Rustic/Gold", "Navy/Silver", "Wine/Gold"],
    },
    heroPromptKey: "product:leatherette-journal",
  },
  {
    slug: "walnut-cutting-board",
    categorySlug: "personalized-gifts",
    subcategorySlug: "cutting-boards",
    title: "Walnut Cutting Board",
    shortDescription: "Solid walnut — engraved with names, dates, or monograms.",
    description: "Solid walnut cutting board with juice groove. Custom monograms or last names engraved center front.",
    basePriceCents: 5499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 6,
    decorationMethods: ["laser-engraving"],
    options: {
      Size: ['12"×9"', '14"×11"', '16"×12"'],
    },
    heroPromptKey: "product:walnut-cutting-board",
  },
  {
    slug: "personalized-tumbler-20oz",
    categorySlug: "personalized-gifts",
    subcategorySlug: "leatherette",
    title: "Personalized 20oz Tumbler",
    shortDescription: "Single-name tumbler — one-off laser engraving in 1-7 business days.",
    description: "Same Polar Camel body, but for one-of-one gifts. Quick-turn engraving with name, date, or a short line of text. Ships in 1-7 business days.",
    basePriceCents: 2499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["laser-engraving"],
    options: {
      Color: ["Black", "Stainless", "Rose Gold", "Sage"],
    },
    heroPromptKey: "product:personalized-tumbler",
    badges: ["Gift-Ready"],
  },

  // ─── Sports & Academic Awards ─────────────────────────────────────────────
  {
    slug: "resin-soccer-trophy",
    categorySlug: "sports-academic-awards",
    subcategorySlug: "resin-trophies",
    title: "Resin Soccer Trophy",
    shortDescription: "Detailed resin figure — full-color, every-player finish.",
    description: "Hand-painted resin soccer figure on a weighted base, with a free engraving plate. Built for season-end leagues — we ship 500 unit runs in 10 days.",
    basePriceCents: 1499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 10,
    decorationMethods: ["laser-engraving"],
    options: {
      Size: ['6"', '8"', '10"', '12"'],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1499 },
      { minQty: 25, unitCents: 1199 },
      { minQty: 100, unitCents: 999 },
      { minQty: 250, unitCents: 849 },
    ],
    heroPromptKey: "product:resin-soccer",
    badges: ["League Favorite"],
  },
  {
    slug: "2in-sport-medal",
    categorySlug: "sports-academic-awards",
    subcategorySlug: "medals",
    title: "2-inch Sport Medal w/ Ribbon",
    shortDescription: "Die-cast 2-inch medal with full-color insert and ribbon.",
    description: "Classic 2-inch medal with choice of insert (every sport + victory/torch/place) and choice of neck ribbon.",
    basePriceCents: 399,
    priceStatus: "confirmed",
    minQty: 10,
    leadTimeDays: 7,
    decorationMethods: ["digital-insert", "laser-engraving"],
    tierBreaks: [
      { minQty: 10, unitCents: 399 },
      { minQty: 100, unitCents: 299 },
      { minQty: 500, unitCents: 219 },
      { minQty: 1000, unitCents: 189 },
    ],
    heroPromptKey: "product:sport-medal",
  },
  {
    slug: "cup-trophy-classic",
    categorySlug: "sports-academic-awards",
    subcategorySlug: "cup-trophies",
    title: "Classic Cup Trophy",
    shortDescription: "Polished brass cup with walnut riser and engraved plate.",
    description: "Classic cup on a tiered walnut base. Engraved front plate plus optional year plates for multi-year awards.",
    basePriceCents: 4999,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 9,
    decorationMethods: ["laser-engraving"],
    options: {
      Size: ['10"', '14"', '18"', '24"'],
    },
    heroPromptKey: "product:cup-trophy",
  },
  {
    slug: "academic-honor-roll-medal",
    categorySlug: "sports-academic-awards",
    subcategorySlug: "academic-awards",
    title: "Honor Roll Medal",
    shortDescription: "2-inch medal with Honor Roll insert and school-color ribbon.",
    description: "End-of-quarter honor roll medals with free ribbon choice. Bulk pricing holds through 2,000 units.",
    basePriceCents: 349,
    priceStatus: "confirmed",
    minQty: 25,
    leadTimeDays: 7,
    decorationMethods: ["digital-insert"],
    heroPromptKey: "product:honor-roll-medal",
  },
];

/**
 * Full catalog = seed + imported expansion batches (Phase 3 + continuation).
 * Imported batches are sourced from competitor catalogs; see each file for details.
 */
export const sampleProducts: SampleProduct[] = [
  ...seedProducts,
  ...importedProducts,
  ...importedProductsBatch2,
  ...importedProductsBatch3,
  ...importedProductsBatch4,
];

export function productBySlug(slug: string): SampleProduct | undefined {
  return sampleProducts.find((p) => p.slug === slug);
}

export function productsInCategory(categorySlug: string): SampleProduct[] {
  return sampleProducts.filter((p) => p.categorySlug === categorySlug);
}

export function productsInSubcategory(
  categorySlug: string,
  subcategorySlug: string,
): SampleProduct[] {
  return sampleProducts.filter(
    (p) => p.categorySlug === categorySlug && p.subcategorySlug === subcategorySlug,
  );
}
