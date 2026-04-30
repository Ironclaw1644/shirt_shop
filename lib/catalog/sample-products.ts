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
