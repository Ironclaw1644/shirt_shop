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
  /** Provenance of the currently-displayed product image. Defaults to "ai" for
   *  legacy entries that use the Gemini-generated `/images/generated/...` path. */
  imageSource?: "ai" | "supplier-cdn" | "manager-upload" | "manager-url";
  /** When set, product card and PDP render this URL via <Image> instead of the
   *  generated path derived from heroPromptKey. Required for supplier-cdn and
   *  manager-* image sources. */
  imageUrl?: string;
  /** Auto-imported source URL — preserved so the manager's "Revert to original"
   *  action has something to fall back to. */
  originalImageUrl?: string;
  /** Link back to the supplier's product page; manager-only reference, not
   *  shown in the storefront. */
  supplierUrl?: string;
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
    subcategorySlug: "restaurant-print",
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
    subcategorySlug: "flyers-brochures-booklets",
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
    subcategorySlug: "flyers-brochures-booklets",
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
    subcategorySlug: "stickers-decals",
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
  {
    slug: "foil-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Foil Business Cards",
    shortDescription: "Heavy 100lb cards with metallic foil accents — gold, silver, copper, holographic, and more.",
    description:
      "**Premium foil finishes** — Choose from gold, silver, copper, holographic, pink metallic, bright blue, or red foil to make your name pop. Foil is applied on the front side for a luxe metallic accent that catches the light.\n\n" +
      "**Heavy 100lb cardstock** — Printed on premium 100lb gloss stock. Heavier than standard cards with a substantial in-hand feel that backs up the foil treatment.\n\n" +
      "**Square or rounded corners** — Standard square corners for a classic editorial look, or rounded corners for a softer modern profile that wears in better in pockets.\n\n" +
      "**Built for high-end first impressions** — Perfect for creative professionals, luxury brands, real estate agents, and anyone whose card needs to stand out at networking events and across-the-table introductions.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "foil"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["Heavy 100lb Gloss"],
      "Printing Sides": ["One Side", "Two Side"],
      "Foil Color": ["Silver", "Red", "Bright Blue", "Copper", "Holographic", "Pink Metallic", "Gold"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 500, unitCents: 20 },
      { minQty: 1000, unitCents: 13 },
      { minQty: 2500, unitCents: 9 },
    ],
    badges: ["Premium"],
    heroPromptKey: "product:foil-business-cards",
  },
  {
    slug: "silk-laminated-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Silk Laminated Business Cards",
    shortDescription: "Silky-smooth laminated cards on heavy 100lb stock — water and tear resistant.",
    description:
      "**Silk-smooth touch** — Soft silky-matte lamination across both faces gives an unmistakable luxury hand-feel. Stands out the moment your card lands in another hand.\n\n" +
      "**Heavy 100lb stock** — Printed on premium 100lb cardstock for substantial weight and durability. The lamination adds a protective layer that resists water, tearing, and smudging through years of wallet wear.\n\n" +
      "**Optional premium accents** — Add spot UV, embossing, or foil accents to elevate critical elements like logos and names.\n\n" +
      "**Built for high-end brands** — Architects, designers, premium real-estate agents, hospitality groups, and luxury retail — anywhere first-impression material matters.",
    basePriceCents: 1500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["digital-print", "lamination"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["Sturdy 100lb"],
      "Printing Sides": ["Single Sided", "Double Sided"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1500 },
      { minQty: 500, unitCents: 13 },
      { minQty: 1000, unitCents: 9 },
      { minQty: 2500, unitCents: 7 },
    ],
    heroPromptKey: "product:silk-laminated-business-cards",
  },
  {
    slug: "vinyl-banners",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Custom Vinyl Banners",
    shortDescription: "Heavy 13oz vinyl banners — fade-resistant outdoor-rated for up to 5 years.",
    description:
      "**Built for outdoor** — Printed on heavy 13oz scrim-reinforced vinyl with fade-resistant inks. Rated for up to 5 years of outdoor exposure; withstands wind, rain, and sun without compromising color.\n\n" +
      "**Sized to your space** — Standard sizes 3×5, 3×6, 3×8, 4×8, 5×10 plus custom dimensions on request. Pick what fits your message and the wall, fence, or pole you're hanging it on.\n\n" +
      "**Three material grades** — Matte 13oz scrim-reinforced vinyl for non-glare display, gloss 13oz for high-impact color, or economy 8oz polypropylene for short-term indoor use.\n\n" +
      "**Hardware ready** — Hemmed edges and brass grommets at the corners come standard for easy hanging. Pole-pocket and reinforced-edge options available for stand-alone displays and frame mounting.",
    basePriceCents: 4500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["3' x 5'", "3' x 6'", "3' x 8'", "4' x 8'", "5' x 10'", "Custom Size"],
      "Banner Type": [
        "Matte 13 oz. Scrim-Reinforced Vinyl",
        "Gloss 13 oz. Scrim-Reinforced Vinyl",
        "Economy 8 oz. Polypropylene",
      ],
      "Printing Sides": ["One Side", "Two Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 4500 },
      { minQty: 5, unitCents: 3500 },
      { minQty: 10, unitCents: 3000 },
    ],
    heroPromptKey: "product:vinyl-banners",
  },
  {
    slug: "fabric-banners",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Fabric Banners",
    shortDescription: "Wrinkle-resistant tension-cloth banners — washable and travel-friendly.",
    description:
      "**Wrinkle-resistant tension cloth** — Printed on premium polyester tension fabric with a smooth wrinkle-resistant finish. Rolls and folds without creasing — easy to ship, store, and re-deploy.\n\n" +
      "**Reusable and washable** — Fade-resistant inks survive machine washing, so you can bring the banner back to fresh color season after season.\n\n" +
      "**Hardware-ready hemming** — Choose grommets with bravo tabs, top-and-bottom pole pockets, top-only pole pockets, or no hemming for fully custom mounting.\n\n" +
      "**Indoor and outdoor** — Suitable for trade shows, retail displays, event backdrops, and outdoor mounting. Lightweight construction makes setup and teardown a one-person job.",
    basePriceCents: 5500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "dye-sublimation"],
    options: {
      Size: ["Custom Size"],
      Material: ["Wrinkle Resistant Tension Cloth Fabric"],
      Finishing: [
        "Grommet With Bravo Tab",
        "Pole Pockets (Top & Bottom)",
        "Pole Pockets (Top Only)",
        "No Hem & No Grommets",
      ],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 5500 },
      { minQty: 5, unitCents: 4500 },
      { minQty: 10, unitCents: 4000 },
    ],
    heroPromptKey: "product:fabric-banners",
  },
  {
    slug: "retractable-banner-stand",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Retractable Banner Stand",
    shortDescription: "33×78 retractable banner stand with portable aluminum base — sets up in seconds.",
    description:
      "**Pull-up display** — Premium 33-inch wide by 78-inch tall retractable banner. The graphic rolls up cleanly into the base for transport and pulls up in seconds at the destination.\n\n" +
      "**Pick your stand grade** — Banner-only for replacement, standard aluminum stand, heavy-duty for daily use, extra-sturdy for trade shows, or bamboo wooden stand for premium retail displays.\n\n" +
      "**Tear-resistant graphic** — Printed on durable matte vinyl with high-resolution full-color graphics. Built to handle repeated rolling without creasing or fading.\n\n" +
      "**Travel ready** — Lightweight aluminum base with carry bag. Sets up in under a minute. Perfect for trade shows, conferences, retail displays, marketing events, and corporate promotions.",
    basePriceCents: 12500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Type: [
        "Banner Only",
        "Banner & Standard Stand",
        "Banner & Heavy Duty Stand",
        "Banner & Extra Sturdy Stand",
        "Banner & Bamboo Wooden Stand",
      ],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 12500 },
      { minQty: 3, unitCents: 11500 },
      { minQty: 5, unitCents: 10500 },
    ],
    heroPromptKey: "product:retractable-banner-stand",
  },
  {
    slug: "foam-board-posters",
    categorySlug: "custom-printing",
    subcategorySlug: "posters-large-format",
    title: "Foam Board Posters",
    shortDescription: "High-resolution posters mounted on rigid foam core — lightweight and warp-resistant.",
    description:
      "**Rigid display, lightweight** — Mounted on high-quality foam core that resists bending and warping. The lightweight rigid panel stands up on an easel, hangs from a wall, or fits a frame.\n\n" +
      "**Custom sizes** — Order to your exact dimensions in feet. We trim each panel clean to spec.\n\n" +
      "**Choose your finish** — Matte for soft non-glare display in high-light environments, or gloss for vivid color punch under spot lighting.\n\n" +
      "**White or black core** — White foam core matches a clean modern look; black foam core gives a sharp framed-edge effect for trade shows and gallery installs.",
    basePriceCents: 3500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "mounting"],
    options: {
      Size: ["Custom Size"],
      "Poster Finishing": ["Matte Finish", "Gloss Finish"],
      "Foam Board Type": ["White Board", "Black Board"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 3500 },
      { minQty: 5, unitCents: 3000 },
      { minQty: 10, unitCents: 2500 },
    ],
    heroPromptKey: "product:foam-board-posters",
  },
  {
    slug: "full-color-notepads",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Full-Color Notepads",
    shortDescription: "Padded full-color notepads on 70lb paper with chipboard back.",
    description:
      "**Premium writing paper** — 70lb paper with smooth ink lay-down for clean writing without smudging or bleed-through. Each pad has a sturdy chipboard back for stable writing on the go.\n\n" +
      "**Padded edge binding** — 50 sheets per pad, glue-bound for clean tear-off and reliable durability across the life of the pad.\n\n" +
      "**Three sizes** — Compact 4.25 × 5.5 for desk-side notes, classic 5.5 × 8.5 for general use, or full-size 8.5 × 11 for meetings and project planning.\n\n" +
      "**Branded keepsake** — Full-color custom printing on the top sheet, visible across the whole pad stack. Perfect for corporate branding, promotional giveaways, conference handouts, and office stationery.",
    basePriceCents: 700,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["4.25 x 5.5", "5.5 x 8.5", "8.5 x 11"],
      "Pads per Pack": ["4", "8", "16", "32"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 700 },
      { minQty: 4, unitCents: 500 },
      { minQty: 8, unitCents: 400 },
      { minQty: 16, unitCents: 300 },
      { minQty: 32, unitCents: 250 },
    ],
    heroPromptKey: "product:full-color-notepads",
  },
  {
    slug: "magnet-calendars",
    categorySlug: "custom-printing",
    subcategorySlug: "magnets",
    title: "Magnet Calendars",
    shortDescription: "Branded magnet calendars sized for refrigerators and office boards — daily-visibility marketing.",
    description:
      "**365-day visibility** — Full-color magnet calendar designed to live on refrigerators, file cabinets, and office boards for a full year of brand exposure. Daily-glance reminders for clients.\n\n" +
      "**Multiple sizes** — Pick from 3×4, 4×6, 4×9, 5×7, or 6×9 inch depending on your design density and how prominent you want the magnet on its surface.\n\n" +
      "**Direct-mail compatible** — Sized for standard mailers; works as a holiday postcard or open-house giveaway and a year-round branded keepsake at the same time.\n\n" +
      "**Built for relationship marketing** — Real estate agents, financial planners, doctors' offices, and local service businesses use these for client retention and referral generation.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['3" x 4"', '4" x 6"', '4" x 9"', '5" x 7"', '6" x 9"'],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 250, unitCents: 50 },
      { minQty: 500, unitCents: 35 },
      { minQty: 1000, unitCents: 25 },
      { minQty: 2000, unitCents: 18 },
      { minQty: 5000, unitCents: 14 },
    ],
    heroPromptKey: "product:magnet-calendars",
  },
  {
    slug: "table-tents",
    categorySlug: "custom-printing",
    subcategorySlug: "restaurant-print",
    title: "Table Tents",
    shortDescription: "Freestanding 5×7 table tents — premium cardstock with double-sided printing.",
    description:
      "**Eye-level promotion** — Freestanding table tent designed to sit on tables, counters, and shelves at customer eye level. Front and back sides for maximum exposure from any angle.\n\n" +
      "**Premium cardstock** — Printed on heavy cardstock with optional gloss, matte, or UV coating that resists spills, oil, and repeated handling in restaurant and event environments.\n\n" +
      "**5×7 standard size** — Compact enough to fit comfortably on dining tables without crowding place settings; tall enough to be seen across the room.\n\n" +
      "**Built for hospitality** — Restaurant specials, café menus, hotel info cards, conference table directions, retail promos. Self-standing — no easel or holder needed.",
    basePriceCents: 300,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ['5" x 7"'],
      Sides: ["Front Only", "Front and Back"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 300 },
      { minQty: 25, unitCents: 150 },
      { minQty: 50, unitCents: 120 },
      { minQty: 100, unitCents: 95 },
      { minQty: 250, unitCents: 75 },
      { minQty: 500, unitCents: 60 },
    ],
    heroPromptKey: "product:table-tents",
  },
  {
    slug: "heavy-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Heavy Business Cards",
    shortDescription: "Premium 32pt heavy business cards — substantial weight and luxurious feel.",
    description:
      "**Substantial 32pt cardstock** — Printed on heavyweight 32pt premium cardstock. Twice as thick as standard cards, with a noticeable heft that signals quality the moment they're handed over.\n\n" +
      "**Choose your finish** — Matte for soft elegance, gloss for vivid color punch, or uncoated for natural paper texture. Pick the finish that matches your brand's tone.\n\n" +
      "**Square or rounded corners** — Square for a classic editorial look, or rounded corners for a softer modern profile that wears in better in pockets.\n\n" +
      "**Built to last** — Heavyweight construction resists bending, dog-earing, and wear. These cards keep their crisp edges through months of wallet life.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["Heavy 32pt"],
      Finish: ["Matte", "Gloss", "Uncoated"],
      "Printing Sides": ["One Side", "Two Side"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 100, unitCents: 30 },
      { minQty: 500, unitCents: 20 },
      { minQty: 1000, unitCents: 13 },
      { minQty: 2500, unitCents: 9 },
    ],
    heroPromptKey: "product:heavy-business-cards",
  },
  {
    slug: "linen-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Linen Business Cards",
    shortDescription: "Premium 100lb cards with a refined linen-textured finish.",
    description:
      "**Linen texture, refined feel** — Subtle woven texture across the surface gives these cards a tactile presence that stands out from smooth-coated alternatives.\n\n" +
      "**100lb premium cardstock** — Substantial weight on a quality stock. The linen texture is embossed into the paper itself, not a coating — won't smudge or wear off.\n\n" +
      "**Square or rounded corners** — Classic squared edges for a traditional look, or rounded corners for modern softness.\n\n" +
      "**Built for design pros** — Architects, designers, fine-art studios, premium real estate, luxury hospitality — anywhere a tactile first impression matters.",
    basePriceCents: 1500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["100lb White Card"],
      "Printing Sides": ["Single Sided", "Double Sided"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1500 },
      { minQty: 500, unitCents: 9 },
      { minQty: 1000, unitCents: 7 },
      { minQty: 2500, unitCents: 5 },
    ],
    heroPromptKey: "product:linen-business-cards",
  },
  {
    slug: "high-gloss-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "High Gloss Laminated Business Cards",
    shortDescription: "Premium 100lb cards with high-gloss lamination — vibrant color, water and smudge resistant.",
    description:
      "**High-gloss lamination** — Mirror-bright finish enhances every color in your design. Photos pop, gradients sing, and dark backgrounds get serious depth.\n\n" +
      "**Built to survive wallets** — The protective laminate layer resists smudges, water, and wear through repeat handling — your cards look fresh after months in a wallet.\n\n" +
      "**Heavy 100lb stock** — Premium 100lb cardstock underneath for substantial heft and a quality feel.\n\n" +
      "**Best for vivid designs** — Photo-heavy designs, bold gradients, deep colors, brand-forward layouts — the high-gloss finish delivers the most visual punch.",
    basePriceCents: 1800,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 6,
    decorationMethods: ["digital-print", "lamination"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["Sturdy 100lb"],
      "Printing Sides": ["Single Sided", "Double Sided"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1800 },
      { minQty: 500, unitCents: 11 },
      { minQty: 1000, unitCents: 8 },
      { minQty: 2500, unitCents: 6 },
    ],
    heroPromptKey: "product:high-gloss-business-cards",
  },
  {
    slug: "standard-postcards",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards-mailing",
    title: "Standard Postcards",
    shortDescription: "Full-color postcards on premium 14pt cardstock — direct mail and handout ready.",
    description:
      "**Premium 14pt cardstock** — Heavy 14pt paper feels substantial in hand and won't curl or warp through the mail.\n\n" +
      "**Common postal sizes** — Pick from 4×6, 5×7, or 6×9 inches. Standard postal-rated sizes that qualify for First-Class postcard rates.\n\n" +
      "**Single or double-sided** — Print one side for budget runs, both sides to maximize messaging — image on the front, message and address area on the back.\n\n" +
      "**Built for marketing** — Direct mail campaigns, in-store handouts, save-the-dates, real estate listings, restaurant promos, event reminders.",
    basePriceCents: 100,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["4 x 6", "5 x 7", "6 x 9"],
      "Paper Type": ["14pt Gloss", "14pt Matte", "16pt Premium"],
      "Printing Sides": ["One Side", "Two Side"],
      Coating: ["Gloss UV", "Matte", "Uncoated"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 100 },
      { minQty: 100, unitCents: 20 },
      { minQty: 500, unitCents: 10 },
      { minQty: 1000, unitCents: 6 },
      { minQty: 2500, unitCents: 4 },
    ],
    heroPromptKey: "product:standard-postcards",
  },
  {
    slug: "eddm-postcards",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards-mailing",
    title: "EDDM Postcards",
    shortDescription: "USPS Every Door Direct Mail postcards on 14pt cardstock — mailing-ready bundles.",
    description:
      "**EDDM-compliant sizes** — Oversized 6.5×9, 8.5×11, or 9×12 sizes that qualify for USPS Every Door Direct Mail at the lowest mailing rates. Skip the mailing list.\n\n" +
      "**Premium 14pt cardstock** — Heavy 14pt gloss or matte cardstock for a quality feel and crisp full-color print that won't fade through processing.\n\n" +
      "**We handle the mailing prep** — Pre-printed indicia, bundle-ready cuts, and mail-facing instructions handled in-house. Drop the bundles at any post office.\n\n" +
      "**Hyper-local marketing** — Saturate every address in a route, neighborhood, or zip code. Restaurant openings, real estate, dental practices, contractors, retail launches.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["6.5 x 9", "8.5 x 11", "9 x 12"],
      "Paper Type": ["14pt Gloss", "14pt Matte"],
      "Printing Sides": ["One Side", "Two Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 500, unitCents: 50 },
      { minQty: 1000, unitCents: 35 },
      { minQty: 2500, unitCents: 22 },
      { minQty: 5000, unitCents: 18 },
    ],
    heroPromptKey: "product:eddm-postcards",
  },
  {
    slug: "foil-postcards",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards-mailing",
    title: "Foil Postcards",
    shortDescription: "Premium postcards with metallic foil accents — gold, silver, copper, holographic.",
    description:
      "**Metallic foil accents** — Gold, silver, copper, rose gold, or holographic foil applied as a spot accent. Catches light beautifully and makes your design pop.\n\n" +
      "**Heavy premium cardstock** — Printed on substantial cardstock that holds the foil treatment cleanly. Won't crack or peel through mail handling.\n\n" +
      "**5×7 standard size** — Sized for standard postal rates while maximizing visual impact. Slim form factor fits standard mailers cleanly.\n\n" +
      "**Built for premium campaigns** — Wedding save-the-dates, product launches, luxury real estate, gallery openings, premium events.",
    basePriceCents: 300,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 6,
    decorationMethods: ["digital-print", "foil"],
    options: {
      Size: ["5 x 7"],
      "Foil Color": ["Gold", "Silver", "Copper", "Rose Gold", "Holographic"],
      "Printing Sides": ["One Side", "Two Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 300 },
      { minQty: 250, unitCents: 50 },
      { minQty: 500, unitCents: 32 },
      { minQty: 1000, unitCents: 20 },
      { minQty: 2500, unitCents: 14 },
    ],
    heroPromptKey: "product:foil-postcards",
  },
  {
    slug: "bi-fold-menus",
    categorySlug: "custom-printing",
    subcategorySlug: "restaurant-print",
    title: "Bi-Fold Menus",
    shortDescription: "Bi-fold restaurant menus on premium gloss or matte text — scored and folded.",
    description:
      "**Four-panel layout** — Bi-fold menus fold once for a clean four-panel layout — perfect for showcasing categories, highlighting specials, and keeping the menu scannable.\n\n" +
      "**Premium paper choices** — 100lb gloss text for vibrant color, 80lb matte for a soft refined feel, or 14pt cover for a substantial dining-table presence.\n\n" +
      "**Sized for the table** — Standard 8.5×11, 8.5×14, or 11×17 sheet sizes, each scored and folded in-house for clean creases.\n\n" +
      "**Built for repeat use** — Optional gloss or matte lamination resists food stains, drink spills, and oil from busy service.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["8.5x11", "8.5x14", "11x17"],
      "Paper Type": ["100lb Gloss Text", "80lb Matte Text", "14pt Cover"],
      Lamination: ["None", "Gloss", "Matte"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 100, unitCents: 50 },
      { minQty: 250, unitCents: 35 },
      { minQty: 500, unitCents: 22 },
      { minQty: 1000, unitCents: 16 },
    ],
    heroPromptKey: "product:bi-fold-menus",
  },
  {
    slug: "tri-fold-menus",
    categorySlug: "custom-printing",
    subcategorySlug: "restaurant-print",
    title: "Tri-Fold Menus",
    shortDescription: "Tri-fold restaurant menus — six panels for full menu storytelling.",
    description:
      "**Six-panel storytelling** — Tri-fold layout opens to reveal six panels — appetizers, mains, sides, drinks, desserts, and your story all in one piece.\n\n" +
      "**Premium menu paper** — 100lb gloss text for full-color punch, 80lb matte for a quiet sophisticated feel, or 14pt cover for table-side weight.\n\n" +
      "**Sized to fit** — 8.5×11 or 11×17 sheets scored and tri-folded for clean creases that flatten without curling.\n\n" +
      "**Optional lamination** — Add gloss or matte lamination to extend menu life through the rigors of service: spills, smudges, and repeat handling.",
    basePriceCents: 250,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["8.5x11", "11x17"],
      "Paper Type": ["100lb Gloss Text", "80lb Matte Text", "14pt Cover"],
      Lamination: ["None", "Gloss", "Matte"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 250 },
      { minQty: 100, unitCents: 55 },
      { minQty: 250, unitCents: 40 },
      { minQty: 500, unitCents: 25 },
      { minQty: 1000, unitCents: 18 },
    ],
    heroPromptKey: "product:tri-fold-menus",
  },
  {
    slug: "flat-table-menus",
    categorySlug: "custom-printing",
    subcategorySlug: "restaurant-print",
    title: "Flat Table Menus",
    shortDescription: "Single-sheet flat table menus — premium paper for dining-table service.",
    description:
      "**Single-sheet layout** — Flat unfolded menu sized to sit on a dining table or counter. Clean top-to-bottom layout that's easy to scan.\n\n" +
      "**Premium paper choices** — 100lb gloss text, 80lb matte, or 14pt cover for table-side substance.\n\n" +
      "**Multiple sizes** — Standard letter (8.5×11), legal (8.5×14), or oversized (11×17) for fuller menus and signage-style layouts.\n\n" +
      "**Lamination options** — Add gloss or matte lamination to make the menu spill-proof and reusable across hundreds of services.",
    basePriceCents: 150,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["8.5x11", "8.5x14", "11x17"],
      "Paper Type": ["100lb Gloss Text", "80lb Matte Text", "14pt Cover"],
      Lamination: ["None", "Gloss", "Matte"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 150 },
      { minQty: 100, unitCents: 40 },
      { minQty: 250, unitCents: 28 },
      { minQty: 500, unitCents: 18 },
      { minQty: 1000, unitCents: 12 },
    ],
    heroPromptKey: "product:flat-table-menus",
  },
  {
    slug: "door-hangers",
    categorySlug: "custom-printing",
    subcategorySlug: "promo-office",
    title: "Door Hangers",
    shortDescription: "Premium die-cut door hangers — perforated hang hole, full-color print.",
    description:
      "**Pre-cut hang hole** — Die-cut hanging hole sized for standard interior door knobs. No cutting or assembly needed.\n\n" +
      "**Heavy 14pt cardstock** — Premium gloss or matte cardstock that won't bend or curl when hung. Survives wind, rain, and door-to-door delivery.\n\n" +
      "**Standard 4.25 × 11 size** — Hospitality-industry standard size that fits door-knob hooks at hotels, apartments, and residential neighborhoods.\n\n" +
      "**Built for promotions** — Real estate \"we have buyers\" drops, restaurant takeout menus, neighborhood services, hotel housekeeping cards, political canvassing.",
    basePriceCents: 100,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ['4.25" x 11"'],
      "Paper Type": ["14pt Gloss", "14pt Matte", "16pt Premium"],
      "Printing Sides": ["One Side", "Two Side"],
      Perforation: ["Standard Hang Hole", "Tear-off Coupon"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 100 },
      { minQty: 100, unitCents: 30 },
      { minQty: 250, unitCents: 20 },
      { minQty: 500, unitCents: 13 },
      { minQty: 1000, unitCents: 9 },
      { minQty: 2500, unitCents: 7 },
    ],
    heroPromptKey: "product:door-hangers",
  },
  {
    slug: "coasters",
    categorySlug: "custom-printing",
    subcategorySlug: "restaurant-print",
    title: "Custom Paper Coasters",
    shortDescription: "Premium absorbent paperboard coasters — branded bar service essentials.",
    description:
      "**Heavy absorbent paperboard** — Pulpboard coasters absorb condensation cleanly without sticking to glasses or staining tables. Industry-standard 60-80pt thickness.\n\n" +
      "**Round or square shapes** — Pick the classic 4-inch round, modern 3.5×3.5 square, or compact 3.5-inch round to match your bar's aesthetic.\n\n" +
      "**Full-color print** — Custom artwork, logos, drink specials, or social handles printed in full color on the top side.\n\n" +
      "**Built for hospitality** — Bars, restaurants, breweries, cafés, weddings, branded promotional events. Coasters live on the table — daily impressions for your brand.",
    basePriceCents: 50,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Shape: ['4" Round', '3.5" Square', '3.5" Round'],
      "Paper Type": ["Heavy Pulpboard"],
      "Printing Sides": ["One Side", "Two Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 50 },
      { minQty: 250, unitCents: 20 },
      { minQty: 500, unitCents: 13 },
      { minQty: 1000, unitCents: 9 },
      { minQty: 2500, unitCents: 6 },
      { minQty: 5000, unitCents: 4 },
    ],
    heroPromptKey: "product:coasters",
  },
  {
    slug: "holiday-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards-mailing",
    title: "Holiday Cards",
    shortDescription: "Custom holiday greeting cards — full-color print, optional foil accents.",
    description:
      "**Premium 14pt cardstock** — Substantial cardstock that makes holiday cards feel important. Won't bend in mailers or curl with humidity.\n\n" +
      "**5×7 folded greeting size** — Industry-standard greeting card size that fits all standard envelope formats. Folds cleanly to a 5×7 finished card.\n\n" +
      "**Optional foil accents** — Add gold, silver, copper, or holographic foil to titles for a luxe seasonal look. Catches the candlelight beautifully.\n\n" +
      "**Branded year-end** — Corporate holiday greetings, family photo cards, year-end thank-yous to clients, save-the-dates for January events.",
    basePriceCents: 200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "foil"],
    options: {
      Size: ["5 x 7"],
      "Paper Type": ["14pt Gloss", "14pt Matte"],
      "Printing Sides": ["One Side", "Two Side"],
      "Foil Accent": ["None", "Gold", "Silver", "Copper", "Holographic"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 200 },
      { minQty: 50, unitCents: 80 },
      { minQty: 100, unitCents: 50 },
      { minQty: 250, unitCents: 32 },
      { minQty: 500, unitCents: 20 },
      { minQty: 1000, unitCents: 14 },
    ],
    heroPromptKey: "product:holiday-cards",
  },
  {
    slug: "mesh-banners",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Mesh Banners",
    shortDescription: "Perforated mesh vinyl banners — wind-resistant outdoor displays for fences and storefronts.",
    description:
      "**Wind-friendly mesh** — Perforated 8 oz vinyl with thousands of small holes that let wind pass through. No more billowing or tearing in gusty conditions.\n\n" +
      "**Built for outdoor longevity** — Fade-resistant inks plus weather-rated vinyl rated for years of outdoor exposure. Color stays vivid through sun, rain, and seasonal cycles.\n\n" +
      "**Hardware-ready hemming** — Choose hem & grommets, hem only, no-hem grommets only, or pole pockets (top & bottom or top only) to match your mounting setup.\n\n" +
      "**Built for big visibility** — Construction site fences, sporting event fences, scaffolding wraps, parking-lot displays, large storefront windows. Anywhere you need maximum visibility without wind drag.",
    basePriceCents: 4500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["Custom Size"],
      Material: ["8 oz Perforated Vinyl"],
      Finishing: [
        "Hem & Grommets",
        "Hem Only",
        "No Hem / Grommets Only",
        "No Hem & No Grommets",
        "Pole Pockets (Top & Bottom)",
        "Pole Pockets (Top Only)",
      ],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 4500 },
      { minQty: 5, unitCents: 3500 },
      { minQty: 10, unitCents: 3000 },
    ],
    heroPromptKey: "product:mesh-banners",
  },
  {
    slug: "tabletop-banner-stand",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Tabletop Banner Stand",
    shortDescription: "Compact tabletop banner stand — perfect for trade show counters and conference reception desks.",
    description:
      "**Counter-height display** — Compact tabletop stand sized to sit on a trade-show table, conference reception desk, or retail counter. Pulls focus without towering over conversation.\n\n" +
      "**Two display sizes** — Compact 8\"×11\" for tight counter spaces, or larger 11\"×17\" when you need a fuller graphic.\n\n" +
      "**Banner only or with stand** — Order banner-only for graphic refreshes on an existing stand, or get the full kit with sturdy aluminum tabletop hardware.\n\n" +
      "**Travel ready** — Lightweight, collapsible base. Banner rolls into the stand for transport. Setup takes 30 seconds at the venue.",
    basePriceCents: 4500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['11" x 17"', '8" x 11"'],
      Type: ["Banner Only", "Banner & Tabletop Stand"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 4500 },
      { minQty: 5, unitCents: 3800 },
    ],
    heroPromptKey: "product:tabletop-banner-stand",
  },
  {
    slug: "x-frame-banner-stand",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "X-Frame Banner Stand",
    shortDescription: "Lightweight collapsible X-frame banner stand — travel-friendly trade-show display.",
    description:
      "**X-shaped support** — Collapsible X-frame mounts the banner taut with corner grommets. No wrinkles, no sagging, even after multiple setups.\n\n" +
      "**Two standard sizes** — 24\"×63\" for compact venues, 32\"×71\" for high-visibility booth backdrops.\n\n" +
      "**Banner only or full kit** — Replacement graphic for an existing stand, or the complete X-frame package with carry bag.\n\n" +
      "**Built for the road** — Lightweight aluminum frame folds flat. Sets up in under a minute. Perfect for trade shows, retail pop-ups, conference booths, lobby displays.",
    basePriceCents: 8500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['24" x 63"', '32" x 71"'],
      Type: ["Banner Only", "Banner & X-Frame Stand"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 8500 },
      { minQty: 3, unitCents: 7500 },
    ],
    heroPromptKey: "product:x-frame-banner-stand",
  },
  {
    slug: "real-estate-yard-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Real Estate Yard Signs",
    shortDescription: "Standard 24×18 real estate yard signs — durable corrugated plastic for property listings.",
    description:
      "**Industry-standard 24×18** — Sized to the real-estate market standard. Fits all common stake hardware, sign-rider attachments, and brokerage branding requirements.\n\n" +
      "**Heavy coroplast plastic** — White corrugated plastic with UV-resistant inks. Rated for years of outdoor exposure across seasons.\n\n" +
      "**Single or double-sided** — Print one side for budget runs, both sides to be visible to traffic from both directions on residential streets.\n\n" +
      "**Portrait or landscape** — Pick the orientation that matches your brokerage template and sign-rider conventions.",
    basePriceCents: 1199,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['24" x 18"'],
      Sides: ["Single Side", "Double Side"],
      Orientation: ["Portrait", "Landscape"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1199 },
      { minQty: 5, unitCents: 999 },
      { minQty: 10, unitCents: 849 },
      { minQty: 25, unitCents: 749 },
    ],
    heroPromptKey: "product:real-estate-yard-signs",
  },
  {
    slug: "a-frame-sidewalk-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "A-Frame Sidewalk Signs",
    shortDescription: "Foldable A-frame sidewalk signs with printed or chalkboard faces — storefront ready.",
    description:
      "**Storefront staple** — A-frame design folds flat for indoor storage, opens to a sturdy two-sided display on the sidewalk in front of your shop.\n\n" +
      "**Printed or chalkboard faces** — Print both sides with permanent graphics, or order with chalkboard faces for daily-changeable specials and event listings.\n\n" +
      "**Sized for visibility** — 24×36 standard size for restaurants and retail, or compact 20×30 for tight sidewalks and shop entryways.\n\n" +
      "**Plastic or aluminum frame** — Plastic frame for budget-friendly daily use, or aluminum for premium long-term durability and a heavier wind-resistant base.",
    basePriceCents: 6500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['24" x 36"', '20" x 30"'],
      Material: ["Plastic", "Aluminum"],
      Faces: ["Both Sides Printed", "Chalkboard"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 6500 },
      { minQty: 3, unitCents: 5500 },
    ],
    heroPromptKey: "product:a-frame-sidewalk-signs",
  },
  {
    slug: "adhesive-window-decals",
    categorySlug: "custom-printing",
    subcategorySlug: "stickers-decals",
    title: "Adhesive Window Decals",
    shortDescription: "Adhesive vinyl window decals — bright color, removable adhesive backing.",
    description:
      "**Premium 6 mil vinyl** — Heavy-duty 6 mil adhesive vinyl in white or clear. White vinyl shows full-color graphics; clear vinyl lets background show through for layered effects.\n\n" +
      "**Removable adhesive** — Strong-tack adhesive holds securely but lifts cleanly from glass when you want to swap displays. No goo, no residue.\n\n" +
      "**Front or back adhesive** — Front adhesive sticks to the outside of the glass (visible from outside, reverse from inside). Back adhesive sticks to the inside of the glass (visible from outside through the glass).\n\n" +
      "**Built for storefronts** — Hours-of-operation, sale promotions, brand graphics, contact info, social media handles, holiday displays. Custom shapes cut to your spec.",
    basePriceCents: 1500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["Custom Size"],
      Material: ["6 mil White Vinyl", "6 mil Clear Vinyl"],
      "Adhesive Side": ["Front Adhesive", "Back Adhesive"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1500 },
      { minQty: 10, unitCents: 1100 },
      { minQty: 25, unitCents: 900 },
    ],
    heroPromptKey: "product:adhesive-window-decals",
  },
  {
    slug: "see-through-window-decals",
    categorySlug: "custom-printing",
    subcategorySlug: "stickers-decals",
    title: "See-Through Window Decals",
    shortDescription: "One-way perforated window decals — see out from inside, full-color graphics outside.",
    description:
      "**One-way visibility** — Perforated 65/35 vinyl appears as a solid graphic from outside but lets you see out clearly from inside. Maintains daylight in your space without sacrificing display real estate.\n\n" +
      "**Full-color exterior print** — High-resolution graphics on the outward-facing side. Photos, brand graphics, and bold typography all reproduce sharply.\n\n" +
      "**Optional gloss lamination** — Add a clear gloss laminate to extend outdoor life and resist sun fade and minor scuffs.\n\n" +
      "**Built for retail and offices** — Storefront windows, conference room glass, vehicle rear windows, restaurant front windows. Anywhere you want exterior brand presence without blocking interior light.",
    basePriceCents: 2500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["Custom Size"],
      Material: ["Perforated 65/35 Vinyl"],
      Lamination: ["None", "Gloss"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 2500 },
      { minQty: 5, unitCents: 2000 },
      { minQty: 10, unitCents: 1700 },
    ],
    heroPromptKey: "product:see-through-window-decals",
  },
  {
    slug: "vinyl-lettering",
    categorySlug: "custom-printing",
    subcategorySlug: "stickers-decals",
    title: "Vinyl Decals & Lettering",
    shortDescription: "Custom vinyl decals and lettering — die-cut for windows, walls, and vehicles.",
    description:
      "**Weatherproof vinyl** — Premium adhesive vinyl with fade-resistant inks and UV protection. Built for outdoor exposure on windows, walls, and vehicle surfaces.\n\n" +
      "**Multiple finishes** — Choose gloss for shine, matte for subtle elegance, clear for ghost-text effects, or metallic for premium signage applications.\n\n" +
      "**Die cut or transfer mask** — Die-cut shapes for logo decals and graphics; transfer mask delivery for multi-character lettering that installs as one piece on the destination surface.\n\n" +
      "**Built to apply anywhere** — Storefront windows, vehicle wraps, wall murals, equipment branding, custom signage. Custom-shaped, custom-sized, install in minutes.",
    basePriceCents: 800,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "die-cut"],
    options: {
      Size: ["Custom Size"],
      "Cut Type": ["Die Cut", "Transfer Mask for Lettering"],
      Finish: ["Gloss", "Matte", "Clear", "Metallic"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 800 },
      { minQty: 10, unitCents: 600 },
      { minQty: 25, unitCents: 450 },
    ],
    heroPromptKey: "product:vinyl-lettering",
  },
  {
    slug: "feather-flags",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Feather Flags",
    shortDescription: "Tall feather flags with full-color print — eye-catching outdoor advertising.",
    description:
      "**Eye-level outdoor visibility** — Tall feather-shaped flags wave gently in the breeze, catching attention from blocks away. Tested in real outdoor conditions to resist fraying and color fade.\n\n" +
      "**Three height options** — 8' tall for compact storefronts, 11' for standard outdoor placement, or 15' for high-impact roadside visibility.\n\n" +
      "**Single or double-sided** — Single-sided is budget-friendly and shows through to the back; double-sided uses an opaque liner so each side reads cleanly.\n\n" +
      "**Pick your stand** — Flag-only for graphic replacement, ground stake for grass installation, or cross base for hardscape and indoor use.",
    basePriceCents: 5500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "dye-sublimation"],
    options: {
      Size: ["8' Tall", "11' Tall", "15' Tall"],
      Sides: ["One Side", "Two Side"],
      Stand: ["Flag Only", "Flag & Ground Stake", "Flag & Cross Base"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 5500 },
      { minQty: 3, unitCents: 4800 },
      { minQty: 5, unitCents: 4200 },
    ],
    heroPromptKey: "product:feather-flags",
  },
  {
    slug: "fabric-popup-banners",
    categorySlug: "custom-printing",
    subcategorySlug: "banners-stands-flags",
    title: "Fabric Pop-Up Banners",
    shortDescription: "Curved or straight fabric pop-up banner displays — full trade-show booth in a portable kit.",
    description:
      "**Trade-show booth in a bag** — Pop-up frame expands from a portable carry bag into a full backdrop in under 5 minutes. The fabric panel attaches via velcro for a seamless surface.\n\n" +
      "**Curved or straight** — Curved profile gives a softer enveloping booth feel; straight profile maximizes flat graphic real estate for messaging-heavy designs.\n\n" +
      "**Two standard sizes** — 8' wide × 8' tall for single-booth setups, 10' × 8' for double-booth widths and headlining displays.\n\n" +
      "**Wrinkle-resistant tension fabric** — Premium polyester fabric that arrives wrinkle-free and stays taut on the frame. Re-deployable across hundreds of events.",
    basePriceCents: 35000,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["digital-print", "dye-sublimation"],
    options: {
      Size: ["8' x 8'", "10' x 8'"],
      Type: ["Curved", "Straight"],
      Material: ["Tension Fabric"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 35000 },
      { minQty: 3, unitCents: 31000 },
    ],
    heroPromptKey: "product:fabric-popup-banners",
  },
  {
    slug: "carbonless-2part",
    categorySlug: "custom-printing",
    subcategorySlug: "forms-certificates",
    title: "2-Part Carbonless Forms",
    shortDescription: "White/canary 2-part NCR carbonless forms — padded sets for instant customer copies.",
    description:
      "**Two-color sets** — White top sheet for office files, canary yellow second sheet for the customer. Pressure transfer copies the writing automatically — no carbon paper, no smudging.\n\n" +
      "**Padded sets** — Glue-bound at the top edge. Tear off a complete set after writing, hand the customer their copy, file the white original.\n\n" +
      "**Three standard sizes** — Half-sheet 5.5×8.5 for receipts, letter 8.5×11 for service tickets, or legal 8.5×14 for full-detail invoices.\n\n" +
      "**Built for the field** — Service businesses, contractors, mobile sales, restaurants, repair shops, delivery services. Anywhere you need an immediate carbon-free copy.",
    basePriceCents: 250,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 6,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["5.5 x 8.5", "8.5 x 11", "8.5 x 14"],
      "Sheets per Pad": ["25", "50", "100"],
      "Printing Sides": ["One Side", "Two Side"],
      Numbering: ["None", "Sequential Numbering"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 250 },
      { minQty: 50, unitCents: 100 },
      { minQty: 100, unitCents: 70 },
      { minQty: 250, unitCents: 50 },
      { minQty: 500, unitCents: 35 },
      { minQty: 1000, unitCents: 25 },
    ],
    heroPromptKey: "product:carbonless-2part",
  },
  {
    slug: "carbonless-3part",
    categorySlug: "custom-printing",
    subcategorySlug: "forms-certificates",
    title: "3-Part Carbonless Forms",
    shortDescription: "White/canary/pink 3-part NCR forms — built for invoices, work orders, and POs.",
    description:
      "**Three-color sets** — White top sheet (office), canary yellow middle (customer), pink bottom (field). Pressure transfer copies the writing through all three sheets cleanly.\n\n" +
      "**Padded sets** — Glue-bound at the top edge. Tear off a complete 3-part set after writing — distribute copies in seconds.\n\n" +
      "**Three standard sizes** — Half-sheet 5.5×8.5 for compact receipts, letter 8.5×11 for service work orders, or legal 8.5×14 for invoices and POs with full line-item detail.\n\n" +
      "**Built for service operations** — Plumbing, HVAC, auto repair, contractors, delivery dispatch, retail returns. Anywhere multiple parties need a real-time copy of the same record.",
    basePriceCents: 350,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 6,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["5.5 x 8.5", "8.5 x 11", "8.5 x 14"],
      "Sheets per Pad": ["25", "50", "100"],
      "Printing Sides": ["One Side", "Two Side"],
      Numbering: ["None", "Sequential Numbering"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 350 },
      { minQty: 50, unitCents: 140 },
      { minQty: 100, unitCents: 95 },
      { minQty: 250, unitCents: 70 },
      { minQty: 500, unitCents: 50 },
      { minQty: 1000, unitCents: 35 },
    ],
    heroPromptKey: "product:carbonless-3part",
  },
  {
    slug: "full-color-booklets",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Full-Color Booklets",
    shortDescription: "Saddle-stitched full-color booklets on premium paper — catalogs, programs, lookbooks.",
    description:
      "**Saddle-stitched binding** — Two-staple binding on the spine fold. Pages turn cleanly and lay flat enough for spread reading. Suitable for booklets up to 64 pages.\n\n" +
      "**Premium paper choices** — 100lb gloss text for vivid color, 80lb matte for a soft refined feel, or 14pt cover for a substantial perfect-bound feel.\n\n" +
      "**Three standard sizes** — Compact 5.5×8.5 for pocket guides, classic 8.5×11 for catalogs and programs, or oversized 11×17 for lookbooks and presentation pieces.\n\n" +
      "**Built for storytelling** — Product catalogs, event programs, real estate brochures, gallery lookbooks, fundraising appeals, conference handouts. Multi-page presentations that need to feel substantial.",
    basePriceCents: 350,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["5.5 x 8.5", "8.5 x 11", "11 x 17"],
      Pages: ["8", "16", "24", "32", "48", "64"],
      "Paper Type": ["100lb Gloss Text", "80lb Matte Text", "14pt Cover"],
      Binding: ["Saddle Stitch"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 350 },
      { minQty: 25, unitCents: 200 },
      { minQty: 100, unitCents: 130 },
      { minQty: 250, unitCents: 90 },
      { minQty: 500, unitCents: 65 },
      { minQty: 1000, unitCents: 48 },
    ],
    heroPromptKey: "product:full-color-booklets",
  },
  {
    slug: "acrylic-photo-prints",
    categorySlug: "custom-printing",
    subcategorySlug: "posters-large-format",
    title: "Acrylic Photo Prints",
    shortDescription: "Premium acrylic-mounted photo prints — gallery-quality wall art with a glossy finish.",
    description:
      "**Acrylic face-mount** — Photo printed on premium photo paper, mounted face-down on a 0.25-inch clear acrylic panel. The glossy acrylic acts like a built-in finish coat — colors deepen, blacks get glossy, photos look gallery-grade.\n\n" +
      "**Custom sizes** — Order to your exact dimensions in inches. Common sizes: 12×18, 16×24, 24×36, or larger up to 48×72 for gallery installations.\n\n" +
      "**Hardware included** — Standoff hardware ships with each print for clean wall-floating installation. Optional French-cleat hangers available for flush wall mount.\n\n" +
      "**Built for premium display** — Photographer portfolios, real-estate listing offices, restaurant feature walls, corporate art installations, gallery shows, executive office decor.",
    basePriceCents: 8500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["digital-print", "mounting"],
    options: {
      Size: ["Custom Size"],
      Thickness: ['1/4" Acrylic', '3/8" Acrylic'],
      Hardware: ["Standoff Mounts", "French Cleat", "None"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 8500 },
      { minQty: 5, unitCents: 7000 },
      { minQty: 10, unitCents: 6000 },
    ],
    heroPromptKey: "product:acrylic-photo-prints",
  },
  {
    slug: "custom-size-posters",
    categorySlug: "custom-printing",
    subcategorySlug: "posters-large-format",
    title: "Custom Size Posters",
    shortDescription: "Custom-size posters on premium poster paper — gallery, event, and indoor display ready.",
    description:
      "**Premium poster paper** — Heavy 100lb satin or matte poster paper for sharp full-color printing and a substantial in-hand feel.\n\n" +
      "**Custom dimensions** — Order any size in inches up to 36×48 standard, or larger by request. Trim cut clean to your spec.\n\n" +
      "**Choose your finish** — Satin for vibrant color with low glare, matte for soft museum-style display in high-light environments.\n\n" +
      "**Built for short-term display** — Event posters, gallery announcements, retail signage, classroom decor, conference rooms, dorm walls. For long-term outdoor use, see foam-mounted or coroplast options.",
    basePriceCents: 1500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["Custom Size"],
      "Paper Type": ["100lb Satin", "100lb Matte"],
      Lamination: ["None", "Gloss", "Matte"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1500 },
      { minQty: 5, unitCents: 1200 },
      { minQty: 10, unitCents: 1000 },
      { minQty: 25, unitCents: 800 },
    ],
    heroPromptKey: "product:custom-size-posters",
  },
  {
    slug: "car-door-magnets",
    categorySlug: "custom-printing",
    subcategorySlug: "magnets",
    title: "Car Door Magnets",
    shortDescription: "Heavy 30 mil magnetic vehicle signs — removable mobile branding for service vehicles.",
    description:
      "**Heavy 30 mil magnetic stock** — Premium 30 mil magnetic vinyl with strong hold on steel vehicle doors. Won't slide or flap at highway speeds.\n\n" +
      "**Three standard sizes** — Compact 12×18 for sedans and small trucks, standard 24×18 for service vans, or oversized 24×36 for box trucks and large fleet vehicles.\n\n" +
      "**Removable branding** — Lifts cleanly off without damaging the paint. Perfect for businesses where the vehicle doubles as a personal car off-hours.\n\n" +
      "**Built for service fleets** — Plumbing, HVAC, landscaping, electrical, mobile mechanics, real estate agents, food trucks. Mobile billboards for hyper-local marketing.",
    basePriceCents: 3900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['12" x 18"', '24" x 18"', '24" x 36"'],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 3900 },
      { minQty: 10, unitCents: 1900 },
      { minQty: 25, unitCents: 1500 },
      { minQty: 50, unitCents: 1200 },
    ],
    heroPromptKey: "product:car-door-magnets",
  },
  {
    slug: "address-labels",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards-mailing",
    title: "Custom Address Labels",
    shortDescription: "Self-adhesive address labels on premium paper or waterproof vinyl — sheet or roll format.",
    description:
      "**Premium label stock** — Choose paper for indoor mailing or waterproof vinyl for outdoor and shipping use. Both have strong-tack adhesive that won't peel during transit.\n\n" +
      "**Standard Avery #5160 size** — Compatible with all standard label software templates and laser printer feeds. 30 labels per sheet.\n\n" +
      "**Mail-merge supported** — Upload your address list and we'll merge each unique address onto its own label. Or order generic return-address labels at flat repeat.\n\n" +
      "**Built for mailings** — Holiday card runs, package labels, business return-address labels, event invitation envelopes, fundraising mailings, monthly statement runs.",
    basePriceCents: 350,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["Standard Avery #5160 (1\" x 2.625\")"],
      "Label Stock": ["Premium Paper", "Waterproof Vinyl"],
      "Mail Merge": ["No (repeat label)", "Yes (unique addresses)"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 350 },
      { minQty: 5, unitCents: 250 },
      { minQty: 10, unitCents: 200 },
      { minQty: 25, unitCents: 150 },
      { minQty: 50, unitCents: 120 },
    ],
    heroPromptKey: "product:address-labels",
  },
  {
    slug: "foil-certificates",
    categorySlug: "custom-printing",
    subcategorySlug: "forms-certificates",
    title: "Foil Certificates",
    shortDescription: "Premium 70lb certificates with metallic foil accents — recognition awards and credentials.",
    description:
      "**Premium 70lb bright-white text stock** — Heavy text-weight paper with a smooth surface that holds full-color print and foil accents cleanly.\n\n" +
      "**Metallic foil accents** — Gold, silver, copper, holographic, pink metallic, bright blue, or red foil applied to titles, borders, and seals for an unmistakable award-grade finish.\n\n" +
      "**Standard 8.5×11 letter size** — Fits all standard certificate frames. Sized for laser printer overprinting if you want to add personalized recipient names yourself.\n\n" +
      "**Built for recognition** — Years-of-service awards, training completion certificates, academic recognition, sales achievement, sports achievement, board appointments, corporate honors.",
    basePriceCents: 500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["digital-print", "foil"],
    options: {
      Size: ['8.5" x 11"'],
      "Paper Type": ["70lb Bright White Text"],
      "Foil Color": ["Gold", "Silver", "Copper", "Holographic", "Pink Metallic", "Bright Blue", "Red"],
      "Printing Sides": ["One Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 500 },
      { minQty: 25, unitCents: 500 },
      { minQty: 100, unitCents: 350 },
      { minQty: 250, unitCents: 250 },
      { minQty: 500, unitCents: 180 },
    ],
    heroPromptKey: "product:foil-certificates",
  },
  {
    slug: "economy-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Economy Business Cards",
    shortDescription: "Lightweight 110lb cards — bulk-friendly pricing for high-volume handouts.",
    description:
      "**Light weight, big runs** — Printed on 110 lb cover stock — light enough to keep per-card cost down on big orders, sturdy enough to feel like a real business card.\n\n" +
      "**Slim 3 × 2.5 trim** — Slightly trimmer than the 3.5 × 2 standard so they slot neatly into wallets, badge pouches, and lanyard sleeves without overflow.\n\n" +
      "**Single or double-sided, square or rounded** — Print one side for cost-efficiency or both for a fuller message; pick square for the classic look or round corners for a softer, modern profile.\n\n" +
      "**Built for the giveaway pile** — Trade shows, networking events, drop-the-card promotions, freelancer starter packs, retail counters — wherever volume matters more than premium feel.",
    basePriceCents: 1499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["3 x 2.5"],
      "Paper Type": ["110 lb"],
      "Printing Sides": ["Single Sided", "Double Sided"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1499 },
      { minQty: 100, unitCents: 15 },
      { minQty: 250, unitCents: 9 },
      { minQty: 500, unitCents: 6 },
      { minQty: 1000, unitCents: 4 },
      { minQty: 2500, unitCents: 3 },
    ],
    heroPromptKey: "product:economy-business-cards",
  },
  {
    slug: "ultra-gloss-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Ultra Gloss Business Cards",
    shortDescription: "Heavy 12pt with high-shine ultra-gloss lamination — premium presentation cards.",
    description:
      "**Mirror-shine ultra gloss** — A heavy ultra-gloss lamination over 12pt cover stock makes printed colors pop and photography look richer. Reflects light at every angle to draw the eye.\n\n" +
      "**Smudge-resistant finish** — The lamination layer protects ink from oils, fingerprints, and event-bag friction. Cards stay pristine through a long networking night and a rough commute home.\n\n" +
      "**Built for first impressions** — Designed for creative professionals, photographers, salons, agencies, and brand-driven shops where the card itself is part of the pitch.\n\n" +
      "**Ordered by the box, not the dozen** — Minimum 500 with bulk tiers at 1000 and 2500. Single- or double-sided printing, square or round corners — the lamination wraps everything cleanly.",
    basePriceCents: 4699,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print", "uv-gloss"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["Medium 12pt"],
      "Printing Sides": ["One Side", "Two Side"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 4699 },
      { minQty: 500, unitCents: 9 },
      { minQty: 1000, unitCents: 6 },
      { minQty: 2500, unitCents: 4 },
    ],
    badges: ["Premium"],
    heroPromptKey: "product:ultra-gloss-business-cards",
  },
  {
    slug: "standard-gloss-business-cards",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Standard Gloss Business Cards",
    shortDescription: "14pt gloss cover stock — polished finish, full-color, smudge-resistant.",
    description:
      "**Polished 14pt gloss cover** — Sturdy 14pt cover stock with a glossy aqueous coating that brings color to life and resists smudging through repeated handling.\n\n" +
      "**Sharper color than matte** — The gloss surface holds ink without bleed, so logos stay crisp, photos hold detail, and brand colors print closer to the swatch than uncoated stock.\n\n" +
      "**Single or double-sided, your call** — One side for a clean signature card, both sides to fit your full pitch — contact info on the front, services or social on the back.\n\n" +
      "**Square or round corners** — Square corners for a classic editorial card; round corners for a modern, pocket-friendly profile that travels without dog-earing.",
    basePriceCents: 1499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["3.5 x 2"],
      "Paper Type": ["14 pt. Gloss Cover"],
      "Printing Sides": ["Single Sided", "Double Sided"],
      Corners: ["Square Corners", "Round Corners"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1499 },
      { minQty: 100, unitCents: 16 },
      { minQty: 250, unitCents: 11 },
      { minQty: 500, unitCents: 7 },
      { minQty: 1000, unitCents: 5 },
      { minQty: 2500, unitCents: 4 },
    ],
    heroPromptKey: "product:standard-gloss-business-cards",
  },
  {
    slug: "black-white-flyers",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Black & White Flyers",
    shortDescription: "20lb copy stock with sharp black-on-white print — bulk handouts at minimum cost.",
    description:
      "**Cost-engineered for volume** — Printed on 20 lb standard copy paper in single-color black ink, this is the lowest-cost way to put a flyer in a thousand hands. Best when message clarity matters more than glossy presentation.\n\n" +
      "**Crisp blacks, sharp contrast** — Even on lightweight stock, our digital press lays down deep blacks and clean halftones for legible body text and recognizable photography.\n\n" +
      "**Three sheet sizes** — Half-sheet 5.5 × 8.5 for handbills, full-letter 8.5 × 11 for community boards and clipboard handouts, oversized 11 × 17 for storefront posters and event boards.\n\n" +
      "**One or two sides, with bleed if you need it** — Single side for low-cost runs; double-sided to add a back-side schedule, map, or coupon. Full-bleed ready when your design pushes to the edge.",
    basePriceCents: 300,
    priceStatus: "confirmed",
    minQty: 50,
    leadTimeDays: 2,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["5.5 x 8.5", "8.5 x 11", "11 x 17"],
      "Printing Sides": ["One Side", "Two Side"],
      "Paper Type": ["20 lb Standard Copy Paper"],
      "Bleed Options": ["No Bleed", "Full Bleed"],
    },
    tierBreaks: [
      { minQty: 50, unitCents: 6 },
      { minQty: 100, unitCents: 5 },
      { minQty: 250, unitCents: 4 },
      { minQty: 500, unitCents: 3 },
      { minQty: 1000, unitCents: 2 },
      { minQty: 2500, unitCents: 2 },
    ],
    heroPromptKey: "product:black-white-flyers",
  },
  {
    slug: "gloss-color-flyers",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Gloss Color Flyers",
    shortDescription: "80lb gloss text — vibrant full-color flyers with a polished, smudge-resistant finish.",
    description:
      "**Premium gloss text** — Printed on 80 lb gloss paper with a protective coating that resists smudges, fingerprints, and fading through stack-and-distribute use.\n\n" +
      "**Photo-grade color** — The gloss surface produces richer reds, deeper blacks, and tighter color saturation than matte stocks. Food photography, lifestyle imagery, and brand-color logos all hold cleanly.\n\n" +
      "**Three working sizes** — 5.5 × 8.5 handbills, 8.5 × 11 letter, 11 × 17 oversized — pick the size that matches the distribution channel and the volume of content per piece.\n\n" +
      "**One or two sides, full or no bleed** — Single side for a clean front-only promo, double-sided when you need to fit a schedule, map, or pricing back panel. Full-bleed ready for edge-to-edge designs.",
    basePriceCents: 1410,
    priceStatus: "confirmed",
    minQty: 50,
    leadTimeDays: 2,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["5.5 x 8.5", "8.5 x 11", "11 x 17"],
      "Printing Sides": ["One Side", "Two Side"],
      "Paper Type": ["80 lb Gloss Paper"],
      "Bleed Options": ["No Bleed", "Full Bleed"],
    },
    tierBreaks: [
      { minQty: 50, unitCents: 28 },
      { minQty: 100, unitCents: 19 },
      { minQty: 250, unitCents: 13 },
      { minQty: 500, unitCents: 9 },
      { minQty: 1000, unitCents: 6 },
      { minQty: 2500, unitCents: 4 },
    ],
    heroPromptKey: "product:gloss-color-flyers",
  },
  {
    slug: "black-white-booklets",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Black & White Booklets",
    shortDescription: "Saddle-stitched B&W booklets — manuals, programs, training packets at low cost.",
    description:
      "**Volume-priced documentation** — Single-color black-on-white printing keeps per-page cost low for manuals, training packets, event programs, catalogs, and report binders that need to ship in quantity.\n\n" +
      "**Saddle-stitch binding** — Folded and saddle-stitched at the spine for a clean, lay-flat read. Available in 4 to 24 pages — sized to fit a quick reference guide, a full instruction manual, or a multi-section program.\n\n" +
      "**Pick your text stock** — 20 lb paper for an everyday in-house feel, or 80 lb gloss text when the imagery and tables need to read sharper and the booklet needs to hold up to repeat handling.\n\n" +
      "**Cover finish to match** — Normal, matte, or gloss cover lamination — gives you the option to dress up an otherwise utilitarian booklet for client-facing use.",
    basePriceCents: 1700,
    priceStatus: "confirmed",
    minQty: 25,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ['11" X 17"', '8.5" X 11"'],
      "Folded To": ['8.5" x 11"'],
      Pages: [
        "4 Page Half Fold",
        "8 Page Saddle Stitch",
        "12 Page Saddle Stitch",
        "16 Page Saddle Stitch",
        "20 Page Saddle Stitch",
        "24 Page Saddle Stitch",
      ],
      "Paper Type": ["20 lb. Paper", "80 lb. Gloss Text Paper"],
      Bleed: ["No Bleed", "Full Bleed"],
      "Card Stock Cover": ["Normal", "Matte", "Gloss"],
    },
    tierBreaks: [
      { minQty: 25, unitCents: 700 },
      { minQty: 50, unitCents: 500 },
      { minQty: 100, unitCents: 350 },
      { minQty: 250, unitCents: 250 },
      { minQty: 500, unitCents: 180 },
      { minQty: 1000, unitCents: 130 },
    ],
    heroPromptKey: "product:black-white-booklets",
  },
  {
    slug: "flat-table-special-menus",
    categorySlug: "custom-printing",
    subcategorySlug: "restaurant-print",
    title: "Flat Table Special Menus",
    shortDescription: "Insert-size daily-special menus — laminate-friendly and built for table-top use.",
    description:
      "**Sized for the table-top** — Five compact sizes from 4.25 × 11 long-strip inserts up to 6 × 5 card-style — fits cocktail tables, bar tops, holder slots, and table-tent displays.\n\n" +
      "**Glossy, matte, or synthetic** — Glossy for the photo-friendly food shot, matte for clean editorial layouts, or synthetic stock when you need a wipe-clean, water-resistant menu that survives spills.\n\n" +
      "**Print specials, not just menus** — Built specifically for daily-feature menus, drink specials, seasonal offerings, prix-fixe inserts, and tasting-menu cards — anything that updates more often than the main menu.\n\n" +
      "**Front-and-back when you need it** — Configure single- or double-sided to fit a wine list on the back, or pair photo on the front with description copy on the reverse.",
    basePriceCents: 3400,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["6x5", "5.5x8.5", "4.25x11", "4.25x14", "5x7"],
      "Paper Type": ["Glossy", "Matte", "Synthetic"],
      "Printing Sides": ["One Side", "Two Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 3400 },
      { minQty: 50, unitCents: 80 },
      { minQty: 100, unitCents: 50 },
      { minQty: 250, unitCents: 30 },
      { minQty: 500, unitCents: 22 },
      { minQty: 1000, unitCents: 16 },
    ],
    heroPromptKey: "product:flat-table-special-menus",
  },
  {
    slug: "carbonless-2part-legal",
    categorySlug: "custom-printing",
    subcategorySlug: "forms-certificates",
    title: '2-Part 8.5" x 14" Carbonless Forms',
    shortDescription: "Legal-size 2-part NCR forms — duplicate records for invoices, work orders, contracts.",
    description:
      "**Legal-size 2-part NCR** — White over canary 2-part carbonless paper sized at 8.5 × 14 — extra length for line-item invoices, service work orders, contracts, and any form that runs past letter size.\n\n" +
      "**Pen-pressure copies, no carbon mess** — Write on the top sheet and the impression transfers cleanly to the second part. No carbon paper to align, no mess on hands or originals.\n\n" +
      "**Black & white or full color** — Print line-rules and form fields in plain black for a working invoice or upgrade to full color for branded contracts and customer-facing service tickets.\n\n" +
      "**Padded, perforated, sequence-numbered on request** — Standard option to glue-pad the top of the stack and add tear-off perforation. Sequential numbering available for audit-friendly invoice runs.",
    basePriceCents: 9000,
    priceStatus: "confirmed",
    minQty: 250,
    leadTimeDays: 6,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["8.5x14"],
      "Printing Type": ["Black & White", "Color"],
      "Printing Sides": ["One Side Printed", "Two Side Printed"],
    },
    tierBreaks: [
      { minQty: 250, unitCents: 36 },
      { minQty: 500, unitCents: 22 },
      { minQty: 1000, unitCents: 14 },
    ],
    heroPromptKey: "product:carbonless-2part-legal",
  },
  {
    slug: "black-white-notepads",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Black & White Note Pads",
    shortDescription: "20lb pads with chipboard backing — single-color print for office and giveaway pads.",
    description:
      "**Classic 20lb pads** — Premium 20 lb writing paper, 50 sheets per pad, glued at the top with a chipboard backing for desk-stable writing.\n\n" +
      "**Three pad sizes** — 4.25 × 5.5 mini-pad for desk and to-go, 5.5 × 8.5 half-letter for everyday note-taking, full 8.5 × 11 letter when you need real margin space.\n\n" +
      "**Single-color black** — Cost-efficient single-color printing for logos, line rules, headers, and footers — keeps per-pad cost down for office stocking and bulk giveaway runs.\n\n" +
      "**Built for repeat use** — Tear-off sheets glide off cleanly without fraying. Ideal for office stock, conference giveaways, real estate closings, healthcare reception, and corporate gift bags.",
    basePriceCents: 774,
    priceStatus: "confirmed",
    minQty: 4,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["4.25 x 5.5", "5.5 x 8.5", "8.5 x 11"],
    },
    tierBreaks: [
      { minQty: 4, unitCents: 194 },
      { minQty: 8, unitCents: 150 },
      { minQty: 16, unitCents: 110 },
      { minQty: 32, unitCents: 80 },
    ],
    heroPromptKey: "product:black-white-notepads",
  },
  {
    slug: "circle-stickers",
    categorySlug: "custom-printing",
    subcategorySlug: "stickers-decals",
    title: "Circle Stickers",
    shortDescription: "Round die-cut stickers — gloss/matte/waterproof, 2-5 inch diameters.",
    description:
      "**Round die-cut stickers** — Cleanly die-cut circles in 2, 3, 4, and 5-inch diameters — sized for everything from product seals to laptop decals to shipping-box labels.\n\n" +
      "**Indoor or outdoor finish** — Standard gloss for branded packaging and merch, matte for an editorial look, or waterproof outdoor-rated vinyl for water bottles, vehicle windows, and exterior signage.\n\n" +
      "**Premium adhesive** — Strong tack on smooth surfaces — glass, plastic, painted metal, polished wood — without leaving residue when peeled.\n\n" +
      "**Fade- and water-resistant ink** — Outdoor-rated UV inks that hold color through sun, rain, and dishwasher cycles on the waterproof material.",
    basePriceCents: 3600,
    priceStatus: "confirmed",
    minQty: 25,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['2" Dia', '3" Dia', '4" Dia', '5" Dia'],
      Material: ["Gloss", "Matte", "Waterproof"],
    },
    tierBreaks: [
      { minQty: 25, unitCents: 144 },
      { minQty: 50, unitCents: 90 },
      { minQty: 100, unitCents: 60 },
      { minQty: 250, unitCents: 38 },
      { minQty: 500, unitCents: 25 },
      { minQty: 1000, unitCents: 17 },
      { minQty: 2000, unitCents: 12 },
      { minQty: 5000, unitCents: 8 },
      { minQty: 10000, unitCents: 6 },
    ],
    heroPromptKey: "product:circle-stickers",
  },
  {
    slug: "directional-yard-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Directional Yard Signs",
    shortDescription: "24×18 coroplast arrows — For Sale, For Rent, Open House in six colors.",
    description:
      "**Pre-built for the open-house route** — 24 × 18 corrugated plastic yard signs with built-in directional arrows for guiding traffic to listings, model homes, garage sales, and event locations.\n\n" +
      "**Three message types** — 'For Rent', 'For Sale', or 'Open House' headlines printed bold so they read from a passing car.\n\n" +
      "**Pick the arrow direction** — Order left-pointing or right-pointing variants depending on which corner you need to mark.\n\n" +
      "**Six bold colors** — Navy, sky blue, violet, orange, red, or yellow — pick the color that matches your branding or stands out against the local landscape.",
    basePriceCents: 2400,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Type: ["For Rent", "For Sale", "Open House"],
      Direction: ["Left", "Right"],
      Color: ["Navy Blue", "Sky Blue", "Violet", "Orange", "Red", "Yellow"],
      Sides: ["Single Side", "Double Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 2400 },
      { minQty: 5, unitCents: 2200 },
      { minQty: 10, unitCents: 2000 },
      { minQty: 25, unitCents: 1800 },
      { minQty: 50, unitCents: 1600 },
    ],
    heroPromptKey: "product:directional-yard-signs",
  },
  {
    slug: "real-estate-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Real Estate Yard Signs with Frame",
    shortDescription: "Coroplast or aluminum signs with steel H-frame — agent branding ready.",
    description:
      "**Sign + frame as a kit** — Bundles the printed sign panel with a powder-coated steel H-frame so you arrive at the listing ready to install. Choose from Banjo Frame, H-Frame Slide-In, H-Frames Vertical, or H-Frame Double Rider configurations.\n\n" +
      "**Two trim sizes** — 18 × 42 vertical for traditional agent signs, or 24 × 30 horizontal for branded property panels.\n\n" +
      "**Coroplast or aluminum** — Coroplast for cost-efficient short-term listings, brushed aluminum for premium portfolios and long-term marketing properties.\n\n" +
      "**Double-sided UV print** — Full-color print on both faces with UV-resistant inks rated for outdoor exposure. Agent photo, brokerage logo, and contact info hold color through season changes.",
    basePriceCents: 9000,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 6,
    decorationMethods: ["digital-print", "uv-print"],
    options: {
      Size: ['18" x 42"', '24" x 30"'],
      Material: ["Coroplast", "Aluminum"],
      Frame: [
        "Banjo Frame Sign Holders",
        "H-Frame Double Rider Sign Holders (Slide-In)",
        "H-Frames Vertical",
        "H-Frame Sign Holders (Slide-In)",
      ],
      Sides: ["Single Side", "Double Side"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 9000 },
      { minQty: 5, unitCents: 8000 },
      { minQty: 10, unitCents: 7000 },
      { minQty: 25, unitCents: 6000 },
    ],
    heroPromptKey: "product:real-estate-signs",
  },
  {
    slug: "vinyl-single-arm-sign",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Vinyl Single-Arm Sign Panel",
    shortDescription: "24×18 vinyl panel for single-arm post — six color options.",
    description:
      "**Sign panel only — pairs with the post** — A 24 × 18 vinyl sign panel cut and grommeted to hang from a single-arm sign post. Order the post separately if you don't already have one.\n\n" +
      "**Pre-set message types** — 'For Rent', 'For Sale', or 'Open House' headlines printed bold and large for street legibility.\n\n" +
      "**Six color choices** — Navy, sky blue, violet, orange, red, or yellow. Pick to match your brokerage colors or for high-contrast curb appeal.\n\n" +
      "**Outdoor-rated vinyl** — UV-resistant ink and weatherproof vinyl substrate hold through sun and rain through a typical 90-day listing window.",
    basePriceCents: 2400,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Type: ["For Rent", "For Sale", "Open House"],
      Color: ["Navy Blue", "Sky Blue", "Violet", "Orange", "Red", "Yellow"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 2400 },
      { minQty: 5, unitCents: 2200 },
      { minQty: 10, unitCents: 2000 },
      { minQty: 25, unitCents: 1800 },
    ],
    heroPromptKey: "product:vinyl-single-arm-sign",
  },
  {
    slug: "vinyl-single-arm-sign-post",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "Vinyl Single-Arm Sign Post",
    shortDescription: "Powder-coated steel single-arm sign post — pairs with 24×18 panels.",
    description:
      "**Steel post hardware** — Powder-coated steel single-arm sign post designed to hang a 24 × 18 vinyl sign panel out at street view. Reusable across listings.\n\n" +
      "**Double-sided panel ready** — Hangs the sign so both sides face traffic. Order with the matching vinyl single-arm sign panel for a complete kit.\n\n" +
      "**Built for the lawn** — Sharp ground stake at the base for quick install in soil. Hardware accommodates the 24 × 36 panel size when you need a larger sign.\n\n" +
      "**Reusable through multiple listings** — Designed to outlast individual signs — swap the panel between properties as listings turn over.",
    basePriceCents: 22500,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: [],
    options: {
      Size: ["24x36"],
      Sides: ["Double Sided"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 22500 },
      { minQty: 3, unitCents: 21000 },
      { minQty: 5, unitCents: 19500 },
    ],
    heroPromptKey: "product:vinyl-single-arm-sign-post",
  },
  {
    slug: "high-school-graduation-yard-signs",
    categorySlug: "custom-printing",
    subcategorySlug: "yard-signs",
    title: "High School Graduation Yard Signs",
    shortDescription: "24×18 coroplast grad signs with H-stakes — student name, school, year.",
    description:
      "**Senior-year tradition** — Personalized 24 × 18 yard signs to mark the graduating senior's home. Standard layout includes student name, school, mascot, and graduation year on a school-color background.\n\n" +
      "**Sturdy corrugated plastic** — Weather-resistant fluted plastic that holds up through the senior-year photo season — fade-resistant inks survive sun, sprinklers, and the occasional thunderstorm.\n\n" +
      "**H-stakes included** — Ships with the wire H-stake so the sign goes up minutes after it arrives. No additional hardware needed.\n\n" +
      "**Custom or template** — Upload your school's mascot and colors, or pick from our template gallery for a turnkey design with placeholders for the student's name and year.",
    basePriceCents: 1999,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['24" X 18"'],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1999 },
      { minQty: 5, unitCents: 1800 },
      { minQty: 10, unitCents: 1600 },
      { minQty: 25, unitCents: 1400 },
      { minQty: 50, unitCents: 1200 },
    ],
    heroPromptKey: "product:high-school-graduation-yard-signs",
  },
  {
    slug: "standard-posters",
    categorySlug: "custom-printing",
    subcategorySlug: "posters-large-format",
    title: "Standard Posters",
    shortDescription: "Pre-set 18×24, 24×36, 36×48 posters — matte or gloss finish.",
    description:
      "**Three working sizes** — 18 × 24 for desk walls and small storefronts, 24 × 36 standard movie-poster size, 36 × 48 for retail windows and trade-show backdrops.\n\n" +
      "**Matte or gloss finish** — Matte for editorial layouts, archival-feeling prints, and reduced glare under retail lighting; gloss for vibrant photography, retail signage, and event promotion.\n\n" +
      "**Premium poster paper** — Heavy-weight poster stock with a smooth surface that holds full-color print sharply, no banding or color drift in large flat-color areas.\n\n" +
      "**Indoor or short-term outdoor** — Built primarily for indoor display; UV inks hold up to short outdoor windows when laminated or framed behind glass.",
    basePriceCents: 1800,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ['18" X 24"', '24" X 36"', '36" X 48"'],
      Finishing: ["Matte Finish", "Gloss Finish"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1800 },
      { minQty: 5, unitCents: 1500 },
      { minQty: 10, unitCents: 1200 },
      { minQty: 25, unitCents: 1000 },
      { minQty: 50, unitCents: 800 },
    ],
    heroPromptKey: "product:standard-posters",
  },
  {
    slug: "printed-envelopes",
    categorySlug: "custom-printing",
    subcategorySlug: "postcards-mailing",
    title: "Printed Envelopes",
    shortDescription: "#10 envelopes printed with your return address and logo — regular or window.",
    description:
      "**Standard #10 business envelopes** — Standard 4⅛ × 9½ business envelope sized to fit a standard letter-size sheet folded in thirds. Pick regular for everyday correspondence or window-front for invoices and statements where the recipient address shows through.\n\n" +
      "**Branded return address** — Print your company name, return address, and logo on the upper-left front corner — a professional touch for everything outbound.\n\n" +
      "**One- or two-color print** — Single-color black for budget runs, two-color print to add a brand accent in crimson, navy, or your house color.\n\n" +
      "**Heavy 24lb stock** — Premium 24 lb white wove paper that feels substantive in the recipient's hand and holds ink without bleed-through.",
    basePriceCents: 8299,
    priceStatus: "confirmed",
    minQty: 250,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ["#10 Regular", "#10 Window"],
    },
    tierBreaks: [
      { minQty: 250, unitCents: 33 },
      { minQty: 500, unitCents: 22 },
      { minQty: 1000, unitCents: 16 },
      { minQty: 2000, unitCents: 12 },
    ],
    heroPromptKey: "product:printed-envelopes",
  },
  {
    slug: "dtf-gangup-sheets",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "DTF Gangup Sheets",
    shortDescription: "Multi-design 22-inch DTF transfer sheets — gang up logos, names, graphics on one sheet.",
    description:
      "**Squeeze every inch of the sheet** — Gang up multiple designs on one 22-inch-wide DTF transfer sheet. Mix logos, player numbers, names, and small graphics on the same sheet for maximum yield per dollar.\n\n" +
      "**Length to fit the run** — Order in 2-foot increments from 24-inch up to a 20-foot full roll. Pack a small order onto a 2-foot sheet, or run a season's worth of team uniforms on a 10-footer.\n\n" +
      "**Premium DTF film + white underbase** — Heat-press onto cotton, polyester, blends, and dark fabrics with a vibrant, opaque white underbase that keeps colors true.\n\n" +
      "**Wash-tested for the long haul** — Holds detail and color through repeated industrial washes — built for screen-print shops, embroidery houses, and anyone running team or merch programs.",
    basePriceCents: 2499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["dtf"],
    options: {
      "Sheet Size": [
        '22" x 24" (2ft)',
        '22" x 36" (3ft)',
        '22" x 48" (4ft)',
        '22" x 60" (5ft)',
        '22" x 72" (6ft)',
        '22" x 120" (10ft)',
        '22" x 240" (20ft)',
      ],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 2499 },
      { minQty: 5, unitCents: 2200 },
      { minQty: 10, unitCents: 1900 },
      { minQty: 25, unitCents: 1600 },
    ],
    heroPromptKey: "product:dtf-gangup-sheets",
  },
  {
    slug: "dtf-prints",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "DTF Prints",
    shortDescription: "Single-design DTF transfers — heat-press to cotton, polyester, blends.",
    description:
      "**Single-design transfers** — One design per sheet, sized exactly to your artwork. Best for one-off prints, sample runs, and when you don't need to gang multiple designs onto a single sheet.\n\n" +
      "**Print to your dimensions** — Specify width and height inch-by-inch. Print at the exact size you'll heat-press onto the garment, no trimming or cropping needed.\n\n" +
      "**Works on dark and light alike** — A solid white underbase under the color print lets bright graphics pop on dark cotton, polyester, blends, and tri-blends without losing saturation.\n\n" +
      "**Soft hand, stretch-tested** — DTF transfers maintain a soft hand-feel after heat-press and stretch with the garment without cracking — great for athletic apparel and tagless tees.",
    basePriceCents: 3600,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 4,
    decorationMethods: ["dtf"],
    options: {
      Width: ["Custom (inches)"],
      Height: ["Custom (inches)"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 3600 },
      { minQty: 10, unitCents: 2800 },
      { minQty: 25, unitCents: 2200 },
      { minQty: 50, unitCents: 1700 },
      { minQty: 100, unitCents: 1300 },
    ],
    heroPromptKey: "product:dtf-prints",
  },
  {
    slug: "monogram-acacia-cutting-board",
    categorySlug: "personalized-gifts",
    subcategorySlug: "cutting-boards",
    title: "Monogram Acacia Round Board",
    shortDescription: "Round acacia wood serving board with custom monogram engraving.",
    description:
      "**Premium acacia hardwood** — Hand-finished round acacia serving board with a smooth food-safe finish. Acacia's natural grain pattern means every board is a one-of-one.\n\n" +
      "**Personalized monogram** — Laser-engraved single-letter or three-letter monogram in the center. Pick from classic serif, elegant script, or clean modern sans-serif lettering.\n\n" +
      "**Charcuterie- or wedding-ready** — Built for serving — cheese boards, bread plates, charcuterie spreads, hostess gifts, wedding gifts, anniversary keepsakes.\n\n" +
      "**Care for years** — Hand wash and oil periodically with a food-safe board oil to keep the wood from drying. Engraved monogram is permanent — won't wash out or fade.",
    basePriceCents: 4900,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["laser-engraving"],
    options: {
      Size: ["12 inch round"],
      "Monogram Style": ["Classic Serif", "Elegant Script", "Modern Sans"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 4900 },
      { minQty: 5, unitCents: 4400 },
      { minQty: 10, unitCents: 4000 },
    ],
    heroPromptKey: "product:monogram-acacia-cutting-board",
  },
  {
    slug: "custom-uv-dtf-transfers",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "Custom UV DTF Transfers",
    shortDescription: "Clear-film UV transfers for hard surfaces — mugs, glass, metal, acrylic.",
    description:
      "**For hard surfaces, not fabric** — UV DTF transfers are clear adhesive films designed for glass, acrylic, ceramic, metal, sealed wood, and other hard surfaces. NOT for clothing — use standard DTF for fabric.\n\n" +
      "**Apply like a sticker, looks like print** — Peel the carrier, smooth the film onto your surface, peel the top liner. The print stays — no clear film border, just clean printed graphic on the surface.\n\n" +
      "**Print up to 12 × 12 per sheet** — Maximum 12 × 12 inch artwork per transfer sheet. Upload your design or work with our design team for setup.\n\n" +
      "**Perfect for branded drinkware, custom gifts, and retail packaging** — Wrap mugs, water bottles, candles, jars, glass containers, acrylic awards, and metal tins with full-color custom graphics.",
    basePriceCents: 499,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["uv-print"],
    options: {
      Size: ['Up to 12" x 12"'],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 499 },
      { minQty: 25, unitCents: 380 },
      { minQty: 50, unitCents: 300 },
      { minQty: 100, unitCents: 240 },
      { minQty: 250, unitCents: 180 },
    ],
    heroPromptKey: "product:custom-uv-dtf-transfers",
  },
  {
    slug: "uv-dtf-fall-collection",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "UV DTF Fall Collection",
    shortDescription: "25 pre-designed fall sticker designs — pumpkins, leaves, harvest themes.",
    description:
      "**Twenty-five fall designs, pick your favorites** — Pre-designed UV DTF transfer pack with 25 fall-themed graphics: maple leaves, pumpkins, acorns, sunflowers, harvest bundles, scarecrows, and seasonal sayings.\n\n" +
      "**Apply to any hard surface** — Mugs, glasses, candles, mason jars, picture frames, ceramic plates, metal flasks. The clear film disappears against the surface for a printed-on look.\n\n" +
      "**Ready to ship — no design step** — Skip the design phase entirely. Pick the designs you want by number, and they ship ready to apply.\n\n" +
      "**Great for craft fair stock and seasonal merch** — Build a fall product line for craft markets, holiday pop-ups, and Etsy storefronts without setting up custom artwork.",
    basePriceCents: 349,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["uv-print"],
    options: {
      Design: Array.from({ length: 25 }, (_, i) => `Design ${String(i + 1).padStart(2, "0")}`),
    },
    tierBreaks: [
      { minQty: 1, unitCents: 349 },
      { minQty: 10, unitCents: 280 },
      { minQty: 25, unitCents: 220 },
      { minQty: 50, unitCents: 170 },
      { minQty: 100, unitCents: 130 },
    ],
    badges: ["Seasonal"],
    heroPromptKey: "product:uv-dtf-fall-collection",
  },
  {
    slug: "uv-dtf-halloween-collection",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "UV DTF Halloween Collection",
    shortDescription: "25 pre-designed Halloween sticker designs — bats, ghosts, jack-o-lanterns.",
    description:
      "**Twenty-five Halloween designs** — Pre-designed UV DTF transfer pack with 25 Halloween graphics: bats, ghosts, jack-o-lanterns, spooky cats, witch hats, candy corn, spider webs, and seasonal sayings.\n\n" +
      "**Apply to glass, ceramic, metal, acrylic** — Clear-film UV transfers vanish into hard surfaces — perfect for Halloween mugs, candy bowls, candle jars, and metal flasks.\n\n" +
      "**Pick by design number** — Each of the 25 designs is identified by a number — order any combination of designs and quantities you need.\n\n" +
      "**Ships fast, applies in seconds** — Pre-printed and stocked — no setup time, no proof cycle. Peel, apply, peel — the design transfers in under 30 seconds per piece.",
    basePriceCents: 349,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["uv-print"],
    options: {
      Design: Array.from({ length: 25 }, (_, i) => `Design ${String(i + 1).padStart(2, "0")}`),
    },
    tierBreaks: [
      { minQty: 1, unitCents: 349 },
      { minQty: 10, unitCents: 280 },
      { minQty: 25, unitCents: 220 },
      { minQty: 50, unitCents: 170 },
      { minQty: 100, unitCents: 130 },
    ],
    badges: ["Seasonal"],
    heroPromptKey: "product:uv-dtf-halloween-collection",
  },
  {
    slug: "uv-dtf-holiday-collection",
    categorySlug: "custom-printing",
    subcategorySlug: "dtf-transfers",
    title: "UV DTF Holiday Collection",
    shortDescription: "25 pre-designed winter holiday sticker designs — trees, snowflakes, wreaths.",
    description:
      "**Twenty-five winter holiday designs** — Pre-designed UV DTF transfer pack with 25 winter graphics: Christmas trees, snowflakes, ornaments, holly wreaths, gingerbread, snowmen, mistletoe, and seasonal sayings.\n\n" +
      "**For mugs, ornaments, and gift packaging** — Clear UV transfers stick to ceramic mugs, metal ornaments, glass jars, acrylic gift tags, and candle holders. The film disappears into the surface.\n\n" +
      "**Order by design number** — Each design has a unique number — pick the ones you want and the quantities by design.\n\n" +
      "**Pre-printed and ready to ship** — No setup, no proof cycle, no design fee — pre-printed designs ship within 3 business days.",
    basePriceCents: 349,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 3,
    decorationMethods: ["uv-print"],
    options: {
      Design: Array.from({ length: 25 }, (_, i) => `Design ${String(i + 1).padStart(2, "0")}`),
    },
    tierBreaks: [
      { minQty: 1, unitCents: 349 },
      { minQty: 10, unitCents: 280 },
      { minQty: 25, unitCents: 220 },
      { minQty: 50, unitCents: 170 },
      { minQty: 100, unitCents: 130 },
    ],
    badges: ["Seasonal"],
    heroPromptKey: "product:uv-dtf-holiday-collection",
  },
  {
    slug: "graduation-fat-heads",
    categorySlug: "custom-printing",
    subcategorySlug: "posters-large-format",
    title: "Graduation Fat Heads",
    shortDescription: "Large 24×18 die-cut grad portraits — foam board or corrugated plastic.",
    description:
      "**Larger-than-life grad portrait** — 24 × 18 die-cut vinyl wall portrait of the graduate's face — printed at high resolution from your photo. Built for ceremonies, after-parties, and group photo backdrops.\n\n" +
      "**Foam board or corrugated plastic** — Foam board for indoor display (ceremony stages, party decor), corrugated plastic for outdoor use (yard signs, photo-op props at the school entrance).\n\n" +
      "**Personalize with name and year** — Add the graduate's name and class year underneath the cutout. School colors and mascot can be incorporated for spirit-week themes.\n\n" +
      "**Lightweight and easy to transport** — At 24 × 18 it's large enough to read from across the room but light enough to bring to the ceremony, the restaurant, and the group photo.",
    basePriceCents: 2199,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 5,
    decorationMethods: ["digital-print"],
    options: {
      Size: ['24" x 18"'],
      Material: ["Foam Board", "Corrugated Plastic"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 2199 },
      { minQty: 5, unitCents: 1900 },
      { minQty: 10, unitCents: 1700 },
      { minQty: 25, unitCents: 1500 },
    ],
    heroPromptKey: "product:graduation-fat-heads",
  },
  {
    slug: "square-magnets",
    categorySlug: "custom-printing",
    subcategorySlug: "magnets",
    title: "Square Magnets",
    shortDescription: "3×2 laminated card magnets — pin-board, fridge, or filing-cabinet branding.",
    description:
      "**Laminated card on magnetic sheet** — 3 × 2 inch laminated full-color print bonded to a flexible magnetic backing. Strong enough to hold through bumps and door slams.\n\n" +
      "**310 or 410 gsm card** — Pick the heavier 410 gsm for a more substantial, glove-box-tough magnet, or the 310 gsm for a sleeker fridge-friendly profile.\n\n" +
      "**Print like a business card, stick like a magnet** — Same trim shape and printable area as a standard business card, but stays where you put it on metal surfaces.\n\n" +
      "**Brand reminder for the desk** — Real estate agents, contractors, plumbers, dentists — anyone whose customers need to find their phone number twelve months later.",
    basePriceCents: 1018,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["3 x 2"],
      "Paper Type": ["310 gsm", "410 gsm"],
      "Production Time": ["Same Day", "Next Day", "3 Business Days"],
    },
    tierBreaks: [
      { minQty: 100, unitCents: 10 },
      { minQty: 250, unitCents: 8 },
      { minQty: 500, unitCents: 6 },
      { minQty: 1000, unitCents: 5 },
    ],
    heroPromptKey: "product:square-magnets",
  },
  {
    slug: "custom-shape-magnets",
    categorySlug: "custom-printing",
    subcategorySlug: "magnets",
    title: "Custom Shape Magnets",
    shortDescription: "Die-cut laminated card magnets — any shape, 2×2 base size.",
    description:
      "**Die-cut to your shape** — Print your logo, mascot, or graphic on laminated card and cut around the artwork outline. Round, oval, hexagonal, mascot silhouette — whatever shape your design needs.\n\n" +
      "**310 or 410 gsm options** — Choose the lighter 310 gsm for a flexible refrigerator magnet or the heavier 410 gsm for a more substantial give-away.\n\n" +
      "**2 × 2 base size** — Die-cut from a 2 × 2 base panel — perfect for logo magnets, mascot magnets, restaurant/menu fridge magnets.\n\n" +
      "**Same-day, next-day, or 3-day production** — Pick your turnaround based on the event or campaign deadline.",
    basePriceCents: 1011,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["2 x 2"],
      "Paper Type": ["310 gsm", "410 gsm"],
      "Production Time": ["Same Day", "Next Day", "3 Business Days"],
    },
    tierBreaks: [
      { minQty: 100, unitCents: 10 },
      { minQty: 250, unitCents: 8 },
      { minQty: 500, unitCents: 6 },
      { minQty: 1000, unitCents: 5 },
    ],
    heroPromptKey: "product:custom-shape-magnets",
  },
  {
    slug: "synthetic-paper-flyers",
    categorySlug: "custom-printing",
    subcategorySlug: "flyers-brochures-booklets",
    title: "Synthetic Paper Flyers",
    shortDescription: "Waterproof, tear-resistant flyers — for outdoor and high-handling use.",
    description:
      "**Stronger than paper, smoother than plastic** — Synthetic paper is a polypropylene-based stock that prints like premium card but takes water, mud, and tear without wrinkling, fading, or falling apart.\n\n" +
      "**Three thicknesses** — 4 pt for lightweight handout flyers, 8 pt for menu inserts and reusable signage, 10 pt for the heaviest applications like outdoor maps and ID-card stock.\n\n" +
      "**Print one or both sides** — Single-sided for cost-efficient bulk distribution, double-sided when you need a back-side schedule, map, or coupon panel.\n\n" +
      "**For where regular paper fails** — Outdoor festivals, marina menus, pool-side signage, race-course maps, kayak rental waivers, vet office handouts.",
    basePriceCents: 185,
    priceStatus: "confirmed",
    minQty: 25,
    leadTimeDays: 5,
    decorationMethods: ["digital-print", "offset-print"],
    options: {
      Size: ['8.5" X 11"', '11" X 17"', '12" X 18"'],
      "Paper Thickness": ["4 pt.", "8 pt.", "10 pt."],
      Sides: ["One Side Printed", "Two Side Printed"],
    },
    tierBreaks: [
      { minQty: 25, unitCents: 185 },
      { minQty: 50, unitCents: 140 },
      { minQty: 100, unitCents: 100 },
      { minQty: 250, unitCents: 70 },
      { minQty: 500, unitCents: 50 },
      { minQty: 1000, unitCents: 35 },
    ],
    heroPromptKey: "product:synthetic-paper-flyers",
  },
  {
    slug: "card-holders",
    categorySlug: "custom-printing",
    subcategorySlug: "business-cards",
    title: "Branded Card Holders",
    shortDescription: "Black, blue, or red branded card holders — desk or pocket.",
    description:
      "**Compact branded card holder** — A pocket- or desk-friendly holder for your business cards, logo printed cleanly on the front face. Hands cards out professionally without the wallet rummage.\n\n" +
      "**Three colors** — Black for a classic editorial finish, blue for fresh corporate identity, or red for high-visibility brand recognition.\n\n" +
      "**Logo or text customization** — Add your logo, brand name, or single-line tagline to the front face. Optional engraving or printed treatment depending on color.\n\n" +
      "**Quantity-friendly pricing** — Order one to test the look or order 100 for a sales-team rollout. Bulk pricing kicks in at 50 units.",
    basePriceCents: 399,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["uv-print", "laser-engraving"],
    options: {
      Color: ["Black", "Blue", "Red"],
      Customization: ["No", "Yes"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 399 },
      { minQty: 10, unitCents: 360 },
      { minQty: 20, unitCents: 320 },
      { minQty: 50, unitCents: 280 },
      { minQty: 100, unitCents: 240 },
    ],
    heroPromptKey: "product:card-holders",
  },
  {
    slug: "cd-labels",
    categorySlug: "custom-printing",
    subcategorySlug: "promo-office",
    title: "Custom CD Labels",
    shortDescription: "4.625-inch round CD labels — promo discs, software, music releases.",
    description:
      "**Round 4.625-inch adhesive labels** — Pre-cut to fit standard CD/DVD discs perfectly. Adhesive backing peels off and applies flat with no air bubbles.\n\n" +
      "**Full-color photo-grade print** — High-resolution print with sharp text and vivid imagery — great for album covers, software releases, training disc series, and corporate promo CDs.\n\n" +
      "**Three quantity tiers** — 100, 200, or 500 labels per order. Pick the run size that matches your edition.\n\n" +
      "**Smudge-resistant once applied** — The print finish resists CD-player friction and disc cleaning, so labels stay legible through repeated use.",
    basePriceCents: 499,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 4,
    decorationMethods: ["digital-print"],
    options: {
      Size: ["4.625 x 4.625"],
    },
    tierBreaks: [
      { minQty: 100, unitCents: 5 },
      { minQty: 200, unitCents: 4 },
      { minQty: 500, unitCents: 3 },
    ],
    heroPromptKey: "product:cd-labels",
  },
  {
    slug: "desk-pal-clock",
    categorySlug: "custom-printing",
    subcategorySlug: "promo-office",
    title: "Desk Pal & Clock Set",
    shortDescription: "Branded desk organizer with built-in analog clock and pen holder.",
    description:
      "**Desk-top branded gift set** — Combination card holder + pen well + analog desk clock in a single branded unit. Lands as a thoughtful gift on a customer's desk that doesn't get tossed.\n\n" +
      "**Logo placement on the face** — Your brand mark printed cleanly on the front face beside or beneath the clock dial. Personalized for the recipient or the company.\n\n" +
      "**Card-holder slot built in** — Holds a stack of business cards behind the clock face — for the recipient's own cards or an integrated way to keep your company's card on their desk.\n\n" +
      "**Standard analog quartz movement** — Reliable battery-powered quartz clock that runs for years without service. Replacement battery widely available.",
    basePriceCents: 1899,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 10,
    decorationMethods: ["uv-print", "laser-engraving"],
    options: {
      Customization: ["Logo Print", "Engraving", "None"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1899 },
      { minQty: 10, unitCents: 1700 },
      { minQty: 25, unitCents: 1500 },
      { minQty: 50, unitCents: 1300 },
    ],
    heroPromptKey: "product:desk-pal-clock",
  },
  {
    slug: "mouse-pads-rectangle",
    categorySlug: "custom-printing",
    subcategorySlug: "promo-office",
    title: "Rectangle Mouse Pads",
    shortDescription: "8.75 × 7.75 photo-printed mouse pads — branded employee gifts or giveaways.",
    description:
      "**Standard 8.75 × 7.75 footprint** — Sized to fit any standard desk setup with comfortable mouse range. Slip-resistant rubber back stays put.\n\n" +
      "**Full-color photo printing** — Print logos, photography, illustrations, or full-color brand graphics edge-to-edge on the surface. Great for branded employee gifts and customer giveaways.\n\n" +
      "**Smooth tracking surface** — Polyester top surface tracks both optical and laser mice consistently. Edge-stitched borders keep the surface from fraying through years of use.\n\n" +
      "**Bulk-friendly pricing** — Per-unit cost drops sharply at the 500 mark — built for trade-show giveaways, conference swag, and onboarding-kit gifts.",
    basePriceCents: 1000,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 7,
    decorationMethods: ["sublimation", "uv-print"],
    options: {
      Size: ["8.75 x 7.75"],
    },
    tierBreaks: [
      { minQty: 100, unitCents: 1000 },
      { minQty: 250, unitCents: 800 },
      { minQty: 500, unitCents: 600 },
      { minQty: 1000, unitCents: 450 },
    ],
    heroPromptKey: "product:mouse-pads-rectangle",
  },
  {
    slug: "mouse-pads-round",
    categorySlug: "custom-printing",
    subcategorySlug: "promo-office",
    title: "Round Mouse Pads",
    shortDescription: "8 × 8 round mouse pads — branded photo print, slip-resistant base.",
    description:
      "**Compact 8 × 8 round footprint** — A modern round mouse pad that takes less desk space than a rectangle but still gives plenty of mouse travel.\n\n" +
      "**Full-color photo print** — Edge-to-edge print of logos, photos, or brand graphics. The round format gives a different visual impact than standard rectangles — great for circular logos and centered designs.\n\n" +
      "**Slip-resistant rubber backing** — Stays in place through fast scrolling and gaming sessions. Polyester top tracks all standard mice cleanly.\n\n" +
      "**Trade-show and gift-pack friendly** — Light and flat — ships easily as part of a swag pack, employee onboarding kit, or branded gift bundle.",
    basePriceCents: 1000,
    priceStatus: "confirmed",
    minQty: 100,
    leadTimeDays: 7,
    decorationMethods: ["sublimation", "uv-print"],
    options: {
      Size: ["8 x 8"],
    },
    tierBreaks: [
      { minQty: 100, unitCents: 1000 },
      { minQty: 250, unitCents: 800 },
      { minQty: 500, unitCents: 600 },
      { minQty: 1000, unitCents: 450 },
    ],
    heroPromptKey: "product:mouse-pads-round",
  },
  {
    slug: "sports-bag",
    categorySlug: "custom-printing",
    subcategorySlug: "promo-office",
    title: "Branded Sports Bag",
    shortDescription: "Standard duffel or backpack with custom logo print — team and event swag.",
    description:
      "**Two formats** — Standard duffel for sports teams, weekend trips, and event giveaways; Backpack for school programs, conference swag, and corporate gift bags.\n\n" +
      "**Branded with your logo** — Full-color logo print or single-color screen print on the main panel. Lasts through machine wash without cracking or fading.\n\n" +
      "**Built for the field** — Reinforced bottom seam, padded shoulder strap, water-resistant outer fabric. Carries gear, branded merch, kit, or laptop.\n\n" +
      "**Bulk-priced for teams** — Single-unit pricing for samples; tier discounts kick in at 25, 50, and 100 units for team rollouts and event giveaways.",
    basePriceCents: 1200,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 10,
    decorationMethods: ["screen-print", "embroidery", "heat-transfer"],
    options: {
      Size: ["Standard", "Backpack"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1200 },
      { minQty: 25, unitCents: 1100 },
      { minQty: 50, unitCents: 1000 },
      { minQty: 100, unitCents: 900 },
    ],
    heroPromptKey: "product:sports-bag",
  },
  {
    slug: "photo-mug",
    categorySlug: "drinkware",
    subcategorySlug: "mugs",
    title: "Photo Mug",
    shortDescription: "11oz ceramic mug with full-color wraparound photo print.",
    description:
      "**Standard 11oz ceramic mug** — Classic 11-ounce ceramic mug shape — fits in a standard cupholder, mid-size for the everyday morning coffee habit.\n\n" +
      "**Full-color wraparound print** — Sublimation-printed full-color photo wraps from handle to handle. Great for family portraits, pet photos, vacation shots, anniversary keepsakes, and team photos.\n\n" +
      "**Dishwasher- and microwave-safe** — The sublimation print bonds into the ceramic glaze itself — won't peel, scratch, or fade through years of dishwasher cycles.\n\n" +
      "**Quantity-flexible** — Order one as a personal gift or 100 for a team rollout, customer thank-you batch, or wedding-favor program.",
    basePriceCents: 1099,
    priceStatus: "confirmed",
    minQty: 1,
    leadTimeDays: 7,
    decorationMethods: ["sublimation"],
    options: {
      Size: ["11oz"],
    },
    tierBreaks: [
      { minQty: 1, unitCents: 1099 },
      { minQty: 25, unitCents: 950 },
      { minQty: 50, unitCents: 850 },
      { minQty: 100, unitCents: 750 },
      { minQty: 250, unitCents: 650 },
    ],
    heroPromptKey: "product:photo-mug",
  },
];

import { importedBlanks } from "./imported-blanks";

/**
 * Re-export seedProducts so client components that only need the original
 * curated catalog (e.g. FeaturedCarousel, which filters by badges) can import
 * just this small array without pulling 13MB of imported blanks into the
 * client bundle.
 */
export { seedProducts };

/**
 * Full catalog: 80 curated seed products + thousands of imported supplier
 * blanks. Server-only — do NOT import this from client components.
 * Client components should use `seedProducts` or accept catalog data via props
 * computed in a server wrapper.
 */
export const sampleProducts: SampleProduct[] = [...seedProducts, ...importedBlanks];

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
