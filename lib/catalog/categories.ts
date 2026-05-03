/**
 * Single source of truth for the eight top-level categories, their subcategories,
 * and copy used across storefront, navigation, and SEO.
 */

export type Subsubcategory = {
  slug: string;
  name: string;
  blurb?: string;
};

export type Subcategory = {
  slug: string;
  name: string;
  /** Short copy for menus + grid tiles (~90 chars) */
  blurb?: string;
  /** Optional third-level grouping (e.g. resin trophies split by sport).
   *  When present, the subcategory page renders a tile grid of these instead
   *  of the flat product list. */
  subcategories?: Subsubcategory[];
};

export type Category = {
  slug: string;
  name: string;
  /** Optional shorter label used by the desktop nav so long display names
   *  don't overflow the horizontal nav at narrow desktop widths. Falls back
   *  to `name` if omitted. */
  navLabel?: string;
  eyebrow: string;
  tagline: string;
  intro: string;
  heroPromptKey: string;
  subcategories: Subcategory[];
  decorationMethods: string[];
  accentColor: "crimson" | "gold" | "charcoal";
};

export const categories: Category[] = [
  {
    slug: "custom-printing",
    name: "Custom Printing",
    eyebrow: "Press-ready, paper-first",
    tagline: "Cards, signs, banners, booklets — locally printed in Georgia.",
    intro:
      "From 500 business cards to bulk flyer runs, the Georgia Print Hub press turns out tight color, crisp stock, and quick turnaround. Pick your paper, upload a proof, approve, and we ship.",
    heroPromptKey: "category:custom-printing",
    accentColor: "crimson",
    decorationMethods: ["offset-print", "digital-print", "foil", "uv-gloss"],
    subcategories: [
      { slug: "business-cards", name: "Business Cards", blurb: "Standard, heavy, foil, linen, silk, plus card holders." },
      { slug: "postcards-mailing", name: "Postcards, Holiday Cards & Mailing", blurb: "Postcards, EDDM, foil, holiday cards, envelopes, address labels." },
      { slug: "flyers-brochures-booklets", name: "Flyers, Brochures & Booklets", blurb: "Full-color and B&W flyers, brochures, booklets, notepads." },
      { slug: "restaurant-print", name: "Restaurant Print", blurb: "Bi-fold, tri-fold, take-out and table menus, table tents, paper coasters." },
      { slug: "forms-certificates", name: "Multi-Part Forms & Certificates", blurb: "2-part and 3-part carbonless invoices, foil certificates." },
      { slug: "stickers-decals", name: "Stickers, Decals & Vinyl Lettering", blurb: "Circle and kiss-cut stickers, window decals, cut vinyl letters." },
      { slug: "magnets", name: "Magnets", blurb: "Square, custom-shape, car door, magnet calendars." },
      { slug: "dtf-transfers", name: "DTF & UV-DTF Transfers", blurb: "Single transfers, gangup sheets, seasonal UV-DTF collections." },
      { slug: "banners-stands-flags", name: "Banners, Stands & Flags", blurb: "Vinyl/fabric/mesh banners, retractable + tabletop + X-frame stands, pop-ups, feather flags." },
      { slug: "yard-signs", name: "Yard & Sidewalk Signs", blurb: "Yard signs, real-estate panels, graduation, A-frames." },
      { slug: "posters-large-format", name: "Posters & Large Format", blurb: "Standard, custom-size, foam-board, acrylic photo prints, fat heads." },
      { slug: "promo-office", name: "Door Hangers, Promo & Office", blurb: "Door hangers, mouse pads, desk pieces, CD labels, sports bag, custom orders." },
    ],
  },
  {
    slug: "apparel-headwear",
    name: "Apparel & Headwear",
    navLabel: "Apparel",
    eyebrow: "Blank or decorated, any quantity",
    tagline: "T-shirts, polos, fleece, caps, outerwear, workwear — blank bulk or fully decorated.",
    intro:
      "Every apparel piece ships two ways: blank bulk or decorated with embroidery, screen print, DTF, heat transfer, or sublimation. Filter by brand, decoration, and size run.",
    heroPromptKey: "category:apparel-headwear",
    accentColor: "charcoal",
    decorationMethods: [
      "embroidery",
      "screen-print",
      "dtf",
      "heat-transfer",
      "sublimation",
    ],
    subcategories: [
      { slug: "t-shirts", name: "T-Shirts" },
      { slug: "polos-knits", name: "Polos & Knits" },
      { slug: "sweatshirts-fleece", name: "Sweatshirts & Fleece" },
      { slug: "caps", name: "Caps & Headwear" },
      { slug: "activewear", name: "Activewear" },
      { slug: "outerwear", name: "Outerwear" },
      { slug: "woven-dress-shirts", name: "Woven & Dress Shirts" },
      { slug: "bottoms", name: "Bottoms" },
      { slug: "workwear", name: "Workwear & Safety" },
      { slug: "bags", name: "Bags & Totes" },
      { slug: "accessories", name: "Accessories" },
      { slug: "personal-protection", name: "Personal Protection" },
      { slug: "womens", name: "Women's" },
      { slug: "youth", name: "Youth" },
    ],
  },
  {
    slug: "corporate-awards",
    name: "Corporate Awards",
    eyebrow: "Recognition that lasts",
    tagline: "Plaques, crystal, glass, acrylic, clocks — laser-engraved in-house.",
    intro:
      "Build a years-of-service, sales, or safety recognition program. Mix materials, personalize at quantity, and arrive fully packed with proof sheets.",
    heroPromptKey: "category:corporate-awards",
    accentColor: "gold",
    decorationMethods: ["laser-engraving", "uv-print", "sublimation"],
    subcategories: [
      { slug: "plaques", name: "Plaques" },
      { slug: "crystal-awards", name: "Crystal Awards" },
      { slug: "glass-awards", name: "Glass Awards" },
      { slug: "acrylic-awards", name: "Acrylic Awards" },
      { slug: "clocks", name: "Clocks" },
      { slug: "perpetual-plaques", name: "Perpetual Plaques" },
      { slug: "gavels", name: "Gavels" },
    ],
  },
  {
    slug: "drinkware",
    name: "Drinkware",
    eyebrow: "Tumblers, mugs, more",
    tagline: "Polar Camel tumblers, mugs, flasks, bottles — engraved, UV printed, or sublimated.",
    intro:
      "Bulk drinkware for teams, weddings, classrooms, and giveaways. Choose the decoration method per product and we'll match it to the finish.",
    heroPromptKey: "category:drinkware",
    accentColor: "crimson",
    decorationMethods: ["laser-engraving", "uv-print", "sublimation"],
    subcategories: [
      { slug: "tumblers", name: "Tumblers" },
      { slug: "mugs", name: "Mugs" },
      { slug: "water-bottles", name: "Water Bottles" },
      { slug: "flasks", name: "Flasks" },
      { slug: "wine-sets", name: "Wine Sets" },
      { slug: "coasters", name: "Coasters" },
      { slug: "bottle-openers", name: "Bottle Openers" },
      { slug: "growlers", name: "Growlers" },
    ],
  },
  {
    slug: "photo-gifts",
    name: "Custom Color Photo Gifts",
    navLabel: "Photo Gifts",
    eyebrow: "Full-color personalization",
    tagline: "Coolers, keychains, phone cases, patches, pet items, novelty.",
    intro:
      "Full-color photo personalization with a fast online designer. Upload, crop, preview, and ship. Great for gifts, events, and small-run promos.",
    heroPromptKey: "category:photo-gifts",
    accentColor: "gold",
    decorationMethods: ["uv-print", "sublimation", "dtf"],
    subcategories: [
      { slug: "coolers", name: "Coolers" },
      { slug: "keychains", name: "Keychains" },
      { slug: "phone-accessories", name: "Phone Accessories" },
      { slug: "patches", name: "Patches" },
      { slug: "photo-apparel", name: "Photo Apparel" },
      { slug: "pet-items", name: "Pet Items" },
      { slug: "novelty", name: "Novelty" },
    ],
  },
  {
    slug: "personalized-gifts",
    name: "Personalized Gifts",
    eyebrow: "Laser-engraved, one-of-one",
    tagline: "Leatherette journals, cutting boards, frames, ornaments, glass pieces.",
    intro:
      "Thoughtful gifts personalized with names, dates, and monograms. We engrave in-house so single-unit gifts look factory-clean.",
    heroPromptKey: "category:personalized-gifts",
    accentColor: "gold",
    decorationMethods: ["laser-engraving", "uv-print"],
    subcategories: [
      { slug: "leatherette", name: "Leatherette" },
      { slug: "cutting-boards", name: "Cutting Boards" },
      { slug: "frames", name: "Frames" },
      { slug: "ornaments", name: "Ornaments" },
      { slug: "glass-pieces", name: "Glass Pieces" },
      { slug: "money-clips", name: "Money Clips" },
    ],
  },
  {
    slug: "sports-academic-awards",
    name: "Sports & Academic Awards",
    navLabel: "Sports Awards",
    eyebrow: "Every team, every subject",
    tagline: "Resin trophies, medals, ribbons, chenille, rings — for every sport and subject.",
    intro:
      "Season-end trophies, medals by the hundred, and academic recognition that ships on time. We keep stock resin figures for every sport and can mix custom inserts.",
    heroPromptKey: "category:sports-academic-awards",
    accentColor: "crimson",
    decorationMethods: ["laser-engraving", "uv-print", "sublimation"],
    subcategories: [
      {
        slug: "resin-trophies",
        name: "Resin Trophies",
        subcategories: [
          { slug: "football", name: "Football" },
          { slug: "soccer", name: "Soccer" },
          { slug: "basketball", name: "Basketball" },
          { slug: "baseball", name: "Baseball" },
          { slug: "softball", name: "Softball" },
          { slug: "golf", name: "Golf" },
          { slug: "track", name: "Track & Field" },
          { slug: "volleyball", name: "Volleyball" },
          { slug: "cheer", name: "Cheer & Dance" },
          { slug: "hockey", name: "Hockey" },
          { slug: "other", name: "Other Sports" },
        ],
      },
      { slug: "cup-trophies", name: "Cup Trophies" },
      { slug: "ribbons", name: "Award Ribbons" },
      { slug: "championship-rings", name: "Championship Rings" },
      { slug: "chenille-pins", name: "Chenille Pins" },
      { slug: "dog-tags", name: "Dog Tags" },
      {
        slug: "academic-awards",
        name: "Academic Awards",
        subcategories: [
          { slug: "wrestling", name: "Wrestling" },
          { slug: "martial-arts", name: "Martial Arts" },
          { slug: "music", name: "Music" },
          { slug: "math", name: "Math" },
          { slug: "science", name: "Science" },
          { slug: "reading", name: "Reading & Spelling" },
          { slug: "drama", name: "Drama & Speech" },
          { slug: "art", name: "Art & Chess" },
          { slug: "honors", name: "Honors & Attendance" },
          { slug: "general", name: "General Achievement" },
        ],
      },
      { slug: "custom-insert-medals", name: "Custom-Insert Medals" },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategory(catSlug: string, subSlug: string) {
  return getCategory(catSlug)?.subcategories.find((s) => s.slug === subSlug);
}

export function getSubsubcategory(
  catSlug: string,
  subSlug: string,
  subsubSlug: string,
) {
  return getSubcategory(catSlug, subSlug)?.subcategories?.find(
    (s) => s.slug === subsubSlug,
  );
}
