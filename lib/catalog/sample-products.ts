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
    subcategorySlug: "banners",
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
    subcategorySlug: "banners",
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
    subcategorySlug: "banner-stands",
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
    subcategorySlug: "foam-board-posters",
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
    subcategorySlug: "note-pads",
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
    subcategorySlug: "magnet-calendars",
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
    subcategorySlug: "table-tents",
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
    subcategorySlug: "postcards",
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
    subcategorySlug: "postcards",
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
    subcategorySlug: "postcards",
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
    subcategorySlug: "menus",
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
    subcategorySlug: "menus",
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
    subcategorySlug: "menus",
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
    subcategorySlug: "door-hangers",
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
    categorySlug: "drinkware",
    subcategorySlug: "coasters",
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
    subcategorySlug: "holiday-cards",
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
    subcategorySlug: "banners",
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
    subcategorySlug: "banner-stands",
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
    subcategorySlug: "banner-stands",
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
    subcategorySlug: "a-frames",
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
    subcategorySlug: "window-decals",
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
    subcategorySlug: "window-decals",
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
    subcategorySlug: "vinyl-lettering",
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
    subcategorySlug: "feather-flags",
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
    subcategorySlug: "exhibit-booths",
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
    subcategorySlug: "carbonless-forms",
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
    subcategorySlug: "carbonless-forms",
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
    subcategorySlug: "booklets",
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
    subcategorySlug: "posters-large-prints",
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
    subcategorySlug: "posters-large-prints",
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
    subcategorySlug: "car-door-magnets",
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
    subcategorySlug: "address-labels",
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
    subcategorySlug: "certificates",
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
    subcategorySlug: "flyers",
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
    subcategorySlug: "flyers",
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
    subcategorySlug: "booklets",
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
    subcategorySlug: "menus",
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
    subcategorySlug: "carbonless-forms",
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
    subcategorySlug: "note-pads",
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
    subcategorySlug: "stickers",
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
    subcategorySlug: "graduation-yard-signs",
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
    subcategorySlug: "posters-large-prints",
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
    subcategorySlug: "envelopes",
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
