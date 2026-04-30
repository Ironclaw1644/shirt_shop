import type { Category } from "./categories";

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

export type PlacementAnchor2D = {
  /** Center of the print zone in normalized photo UV coords (0..1, top-left origin). */
  centerXY: [number, number];
  /** Zone width as a fraction of photo width. */
  widthPct: number;
  /** Zone height as a fraction of photo height. */
  heightPct: number;
  /** Optional in-plane rotation of the zone in radians (0 for upright). */
  rotation?: number;
};

export type PlacementZone = {
  key: string;
  label: string;
  widthIn: number;
  heightIn: number;
  /** Optional 3D anchor — present only on products with a model3D. */
  anchor3D?: PlacementAnchor3D;
  /** Optional 2D anchor — present on products with a mockup2D. */
  anchor2D?: PlacementAnchor2D;
};

export type Mockup2DView = {
  /** View key — typically 'front', 'back', or 'sleeve'. */
  key: string;
  label: string;
  /** Public URL of the studio photo. */
  photoUrl: string;
  /** Public URL of the displacement map (grayscale PNG). */
  dispUrl: string;
  /** Public URL of the lighting/shadow map (grayscale PNG, mid-gray = neutral). */
  lightUrl: string;
  /** Public URL of the garment color mask (grayscale PNG, white = recolorable area). */
  colorUrl: string;
  /** Map from zone key → public URL of the zone mask PNG. */
  zoneMasks: Record<string, string>;
  /**
   * Strength of the displacement warp applied to the design, as a fraction
   * of photo width. Default 0.012. Tune higher for visible cloth folds.
   */
  dispStrength?: number;
};

export type Product2DMockup = {
  views: Mockup2DView[];
  /** Default garment color in hex; falls back to white. */
  defaultGarmentColor?: string;
  /** Optional named color presets (label → hex). Falls back to product.options.Color. */
  colorPresets?: Array<{ label: string; hex: string }>;
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
  /** Optional 2D photo-mockup bundle — when set, the designer uses photoreal 2D wrap. */
  mockup2D?: Product2DMockup;
};

/**
 * Active catalog — 6 products, each mirrored from a printtales.com source page.
 * Pricing tiers, options, and overview copy track the printtales product they reference.
 * Adding a new entry: see plan/take-out-menus pattern (per-entry referenceImageUrl
 * in content/image-manifest.json + alter-only prompt).
 */
const seedProducts: SampleProduct[] = [
  {
    slug: "take-out-menus",
    categorySlug: "custom-printing",
    subcategorySlug: "menus",
    title: "Take-Out Menus",
    shortDescription: "Take-out menus printed on premium paper — smudge- and crease-resistant for repeat handling.",
    description:
      "**Premium paper, real-world durability** — Printed on premium paper stock with a finish that resists smudges and creases through repeat handling. Built to look fresh after dozens of trips through customer hands, delivery bags, and back-of-house chaos.\n\n" +
      "**Sized to fit your menu** — Choose 8.5x11 for a focused single-page layout, or step up to 11x17 when you need room for a fuller spread. Available flat or folded depending on how you want it to travel.\n\n" +
      "**Easy to read at a glance** — Full-color printing keeps food photography sharp, bold headlines pull customers in, and clearly grouped sections (appetizers, mains, sides, drinks) help them find what they want fast.\n\n" +
      "**Designed for how you reach customers** — In-store handouts at the counter, inserts in delivery bags, mailers to local households, add-ons for pickup orders. A daily-use menu built for restaurants, cafés, food trucks, and delivery brands looking to drive takeout and repeat orders.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["8.5x11", "11x17"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 250, unitCents: 40 },
      { minQty: 500, unitCents: 22 },
      { minQty: 1000, unitCents: 14 },
      { minQty: 2500, unitCents: 9 },
      { minQty: 5000, unitCents: 6 },
    ],
    badges: ["Restaurant Favorite"],
    heroPromptKey: "product:take-out-menus",
  },
  {
    slug: "standard-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Standard Business Cards",
    shortDescription: "Sturdy 14pt premium cardstock — full-color and built for handing out.",
    description:
      "**Premium 14pt cardstock** — Full-color printing on a sturdy 14pt premium cardstock with a smooth, fade-resistant finish. Heavy enough to feel substantial in hand without bulking out a wallet.\n\n" +
      "**Single or double-sided** — Print one side for a clean signature card, or both sides to fit your full message — contact info on the front, services or social on the back.\n\n" +
      "**Square or rounded corners** — Standard square corners give a classic editorial look; rounded corners feel modern and travel better in pockets without dog-earing.\n\n" +
      "**Built for handing out** — Standard 2 × 3.5 trim sized to drop into wallets, business card holders, and rolodex slots. Quick turnaround for events and last-minute meetings.",
    basePriceCents: 100,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["2 x 3.5"],
      "Paper Type": ["Sturdy 14 pt"],
      "Printing Sides": ["One Side", "Two Side"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 100 },
      { minQty: 100, unitCents: 15 },
      { minQty: 250, unitCents: 10 },
      { minQty: 500, unitCents: 6 },
      { minQty: 1000, unitCents: 4 },
      { minQty: 2500, unitCents: 3 },
    ],
    badges: ["Fast Turnaround"],
    heroPromptKey: "product:standard-business-cards",
  },
  {
    slug: "tri-fold-brochures",
    categorySlug: "custom-printing",
    subcategorySlug: "brochures",
    title: "Tri-Fold Brochures",
    shortDescription: "Full-color tri-fold brochures on premium gloss or matte text — scored and folded.",
    description:
      "**Real paper, real impact** — Printed full color on premium gloss or matte text. Choose 28 lb matte for a soft hand, 80 lb gloss for shine without weight, or 100 lb heavy gloss for a substantial brochure feel.\n\n" +
      "**Sized for the rack** — Standard 8.5 × 11, 8.5 × 14, and 11 × 17 sheet sizes, each scored and folded into a tri-fold or bi-fold for clean six-panel storytelling.\n\n" +
      "**Fold types that work** — Tri-fold for traditional six-panel layouts, bi-fold for a feature-rich four-panel layout that still slides into a #10 envelope.\n\n" +
      "**Built to be read** — Full-bleed printing pushes color to the edge; safe-zone layouts keep your headline clean. Great for product info, restaurant menus, real estate, healthcare, event programs, and conference handouts.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["8.5x11", "8.5x14", "11x17"],
      Folding: ["Tri Fold", "Bi Fold"],
      "Paper Type": ["28 lb. Matte", "80 lb. Gloss", "100 lb. Gloss"],
      Bleed: ["Full Bleed", "No Bleed"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 25, unitCents: 77 },
      { minQty: 100, unitCents: 60 },
      { minQty: 250, unitCents: 45 },
      { minQty: 500, unitCents: 30 },
      { minQty: 1000, unitCents: 20 },
      { minQty: 2500, unitCents: 14 },
    ],
    heroPromptKey: "product:tri-fold-brochures",
  },
  {
    slug: "full-color-flyers",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers",
    title: "Full-Color Flyers",
    shortDescription: "High-definition full-color flyers on premium 28 lb matte paper.",
    description:
      "**Eye-catching color** — Full-color HD printing on premium 28 lb matte paper. Sharp text, vibrant photography, and a clean professional finish that stands up to handling.\n\n" +
      "**Right-sized for the message** — Pick from compact 5.5 × 8.5 handouts, classic 8.5 × 11 letter, or oversized 11 × 17 for events and promotions.\n\n" +
      "**Single or double-sided** — Single side for budget runs and quick promo drops; double-sided to fit more content per piece — front for the headline, back for the call to action.\n\n" +
      "**Built for distribution** — Mass marketing, direct-mail inserts, in-store handouts, real estate listings, event flyers, restaurant promos, retail sales — all in one print run.",
    basePriceCents: 150,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 2,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["5.5 x 8.5", "8.5 x 11", "11 x 17"],
      "Printing Sides": ["One Side", "Two Side"],
      "Paper Type": ["28 lb Matte"],
      Bleed: ["Full Bleed", "No Bleed"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 150 },
      { minQty: 50, unitCents: 25 },
      { minQty: 100, unitCents: 18 },
      { minQty: 250, unitCents: 12 },
      { minQty: 500, unitCents: 8 },
      { minQty: 1000, unitCents: 5 },
      { minQty: 2500, unitCents: 4 },
    ],
    heroPromptKey: "product:full-color-flyers",
  },
  {
    slug: "kiss-cut-stickers",
    categorySlug: "custom-printing",
    subcategorySlug: "stickers",
    title: "Kiss-Cut Stickers",
    shortDescription: "Premium adhesive vinyl with backing intact — peel-on-demand for batch handouts.",
    description:
      "**Vibrant and durable** — Printed on premium adhesive vinyl with scratch-, water-, and fade-resistant inks. Outdoor-rated for windows, water bottles, laptops, helmets, and walls.\n\n" +
      "**Kiss-cut backing intact** — Cut through the vinyl but not the backing, so stickers stay on the sheet for clean batch handouts, packaging inserts, swag bags, and easy peel-on-demand.\n\n" +
      "**Pick your material** — Standard glossy vinyl by default; choose holographic for rainbow shimmer, or glow-in-the-dark for novelty and night visibility.\n\n" +
      "**Many sizes for any use** — Twelve standard sizes from 2 × 4 inch up to 4 × 12 inch — pick the size that fits your design and your application surface.",
    basePriceCents: 300,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: [
        "2 x 4",
        "2 x 8",
        "3 x 5",
        "3 x 8",
        "3 x 10",
        "3 x 11",
        "3 x 12",
        "4 x 4",
        "4 x 6",
        "4 x 8",
        "4 x 10",
        "4 x 12",
      ],
      Material: ["Standard Vinyl", "Glow in the Dark", "Holographic"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 300 },
      { minQty: 25, unitCents: 132 },
      { minQty: 50, unitCents: 80 },
      { minQty: 100, unitCents: 55 },
      { minQty: 250, unitCents: 35 },
      { minQty: 500, unitCents: 22 },
      { minQty: 1000, unitCents: 15 },
      { minQty: 2000, unitCents: 10 },
      { minQty: 5000, unitCents: 7 },
    ],
    heroPromptKey: "product:kiss-cut-stickers",
  },
  {
    slug: "yard-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Custom Yard Signs",
    shortDescription: "Heavy white coroplast yard signs — UV-rated for up to 5 years of outdoor use.",
    description:
      "**Built to last outdoors** — Printed on heavy white coroplast plastic with UV-resistant inks; rated for up to 5 years of outdoor exposure without fading. Stands up to wind, rain, and sun.\n\n" +
      "**Sized to be seen** — Standard 18 × 12, 18 × 24, and 24 × 36 inch sizes, plus custom sizes on request. Single- or double-sided printing for max visibility from all angles.\n\n" +
      "**White or black coroplast** — Pick white coroplast for full-color brightness, or black coroplast for a clean modern look that frames bold-color graphics.\n\n" +
      "**Hardware included** — Comes with your choice of a standard H-wire stand for quick installation, or a heavy-duty wire stand for higher-wind environments and longer placements.",
    basePriceCents: 1900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["18x12", "18x24", "24x36", "Custom Size"],
      "Printing Sides": ["One Side", "Two Side"],
      "Plastic Type": ["White Coroplast", "Black Coroplast"],
      Stand: ["Standard H wire stand", "Heavy duty wire stand"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1900 },
      { minQty: 5, unitCents: 1500 },
      { minQty: 10, unitCents: 1200 },
      { minQty: 25, unitCents: 1000 },
    ],
    heroPromptKey: "product:yard-signs",
  },
];

export const sampleProducts: SampleProduct[] = seedProducts;

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
