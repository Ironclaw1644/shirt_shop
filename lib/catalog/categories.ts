/**
 * Single source of truth for the eight top-level categories, their subcategories,
 * and copy used across storefront, navigation, and SEO.
 */

export type Subcategory = {
  slug: string;
  name: string;
  /** Short copy for menus + grid tiles (~90 chars) */
  blurb?: string;
};

export type Category = {
  slug: string;
  name: string;
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
      { slug: "business-cards", name: "Business Cards", blurb: "Standard, heavy, foil, linen, silk." },
      { slug: "brochures", name: "Brochures" },
      { slug: "flyers", name: "Flyers", blurb: "Full color, gloss, black and white." },
      { slug: "booklets", name: "Booklets" },
      { slug: "postcards", name: "Postcards & EDDM", blurb: "Standard + 5×7 foil." },
      { slug: "menus", name: "Restaurant Menus" },
      { slug: "note-pads", name: "Note Pads" },
      { slug: "carbonless-forms", name: "Multi-Part Forms" },
      { slug: "stickers", name: "Stickers", blurb: "Circle and kiss-cut." },
      { slug: "banners", name: "Banners", blurb: "Vinyl, fabric, mesh." },
      { slug: "banner-stands", name: "Banner Stands" },
      { slug: "feather-flags", name: "Feather Flags" },
      { slug: "yard-signs", name: "Yard Signs" },
      { slug: "window-decals", name: "Window Decals" },
      { slug: "exhibit-booths", name: "Exhibit Booths" },
      { slug: "posters-large-prints", name: "Posters & Large Prints" },
      { slug: "dtf-transfers", name: "DTF Transfers" },
      { slug: "uv-dtf-transfers", name: "UV DTF Transfers" },
      { slug: "car-door-magnets", name: "Car Door Magnets" },
      { slug: "magnet-calendars", name: "Magnet Calendars" },
      { slug: "door-hangers", name: "Door Hangers" },
      { slug: "table-tents", name: "Table Tents" },
      { slug: "holiday-cards", name: "Holiday Cards" },
      { slug: "address-labels", name: "Address Labels" },
      { slug: "vinyl-lettering", name: "Vinyl Decals & Lettering" },
      { slug: "fat-heads", name: "Fat Heads" },
      { slug: "graduation-yard-signs", name: "Graduation Yard Signs" },
      { slug: "foam-board-posters", name: "Foam-Mounted Posters" },
      { slug: "step-and-repeat-banners", name: "Step & Repeat Banners" },
      { slug: "x-stands", name: "X-Stand Banners" },
      { slug: "a-frames", name: "A-Frame Sidewalk Signs" },
      { slug: "table-covers", name: "Table Covers & Throws" },
      { slug: "tablecloths", name: "Tablecloths" },
      { slug: "trade-show-backdrops", name: "Trade-Show Backdrops" },
      { slug: "roll-up-signs", name: "Roll-Up Signs" },
    ],
  },
  {
    slug: "apparel-headwear",
    name: "Apparel & Headwear",
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
      { slug: "aprons", name: "Aprons" },
      { slug: "scrubs-lab-coats", name: "Scrubs & Lab Coats" },
      { slug: "beanies-visors", name: "Beanies & Visors" },
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
      { slug: "display-cases", name: "Display Cases" },
      { slug: "desk-pieces", name: "Desk Pieces" },
      { slug: "name-plates", name: "Name Plates" },
      { slug: "office-signage", name: "Office Signage" },
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
      { slug: "polar-camel", name: "Polar Camel Drinkware" },
      { slug: "water-bottles", name: "Water Bottles" },
      { slug: "flasks", name: "Flasks" },
      { slug: "wine-sets", name: "Wine Sets" },
      { slug: "coasters", name: "Coasters" },
      { slug: "bottle-openers", name: "Bottle Openers" },
      { slug: "growlers", name: "Growlers" },
      { slug: "shaker-bottles", name: "Shaker Bottles" },
      { slug: "40oz-tumblers", name: "40oz Tumblers" },
    ],
  },
  {
    slug: "photo-gifts",
    name: "Custom Color Photo Gifts",
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
      { slug: "acrylic-pieces", name: "Acrylic Pieces" },
      { slug: "glass-pieces", name: "Glass Pieces" },
      { slug: "journals-portfolios", name: "Journals & Portfolios" },
      { slug: "money-clips", name: "Money Clips" },
      { slug: "pet-tags", name: "Pet ID Tags" },
      { slug: "jewelry-stamping", name: "Jewelry Box Engraving & Stamping" },
    ],
  },
  {
    slug: "sports-academic-awards",
    name: "Sports & Academic Awards",
    eyebrow: "Every team, every subject",
    tagline: "Resin trophies, medals, ribbons, chenille, rings — for every sport and subject.",
    intro:
      "Season-end trophies, medals by the hundred, and academic recognition that ships on time. We keep stock resin figures for every sport and can mix custom inserts.",
    heroPromptKey: "category:sports-academic-awards",
    accentColor: "crimson",
    decorationMethods: ["laser-engraving", "uv-print", "sublimation"],
    subcategories: [
      { slug: "resin-trophies", name: "Resin Trophies" },
      { slug: "medals", name: "Medals" },
      { slug: "cup-trophies", name: "Cup Trophies" },
      { slug: "crystal-sport-awards", name: "Crystal Sport Awards" },
      { slug: "ribbons", name: "Award Ribbons" },
      { slug: "championship-rings", name: "Championship Rings" },
      { slug: "chenille-pins", name: "Chenille Pins" },
      { slug: "dog-tags", name: "Dog Tags" },
      { slug: "academic-awards", name: "Academic Awards" },
      { slug: "custom-insert-medals", name: "Custom-Insert Medals" },
    ],
  },
  {
    slug: "bulk-blanks",
    name: "Bulk Blanks",
    eyebrow: "Buy what we print on",
    tagline: "Wholesale tees, tumblers, totes, vinyl, and paper stock — case-priced.",
    intro:
      "Skip the markup and buy the blanks themselves — case-priced cotton tees, drinkware by the dozen, blank vinyl rolls, paper stock, and award blanks. We&rsquo;ll print them too if you change your mind.",
    heroPromptKey: "category:bulk-blanks",
    accentColor: "gold",
    decorationMethods: [],
    subcategories: [
      { slug: "blank-apparel", name: "Blank Apparel", blurb: "Tees, hoodies, polos, headwear by the case." },
      { slug: "blank-drinkware", name: "Blank Drinkware", blurb: "Tumblers, mugs, bottles by the dozen." },
      { slug: "blank-bags-totes", name: "Blank Bags & Totes" },
      { slug: "blank-vinyl-transfers", name: "Blank Vinyl & Transfer Materials", blurb: "HTV, DTF film, sublimation rolls." },
      { slug: "blank-paper-stock", name: "Blank Paper Stock", blurb: "Card, text, cover, label." },
      { slug: "blank-awards-plaques", name: "Blank Awards & Plaques", blurb: "Engraving-ready bases." },
    ],
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getSubcategory(catSlug: string, subSlug: string) {
  return getCategory(catSlug)?.subcategories.find((s) => s.slug === subSlug);
}
