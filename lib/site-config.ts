export const siteConfig = {
  name: "Georgia Print Hub",
  shortName: "GAPH",
  locationLabel: "Georgia",
  tagline: "Printing, promo, and apparel for Georgia.",
  description:
    "Custom printing, promotional products, apparel, corporate awards, personalized gifts, and bulk blanks — locally printed in Georgia for over 20 years.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gaprinthub.com",
  domain: "gaprinthub.com",
  // CLIENT_FILL: final NAP (name-address-phone) details below
  address: {
    street: "", // CLIENT_FILL
    locality: "Alpharetta",
    region: "GA",
    postalCode: "", // CLIENT_FILL
    country: "US",
  },
  phone: "", // CLIENT_FILL
  email: "hello@gaprinthub.com",
  ordersEmail: "orders@gaprinthub.com",
  hours: {
    weekdays: "8:00 AM – 6:00 PM",
    saturday: "10:00 AM – 2:00 PM",
    sunday: "Closed",
  },
  founded: 2005, // ~20+ years in business
  areasServed: [
    "Alpharetta",
    "Roswell",
    "Johns Creek",
    "Milton",
    "Cumming",
    "Atlanta",
    "Marietta",
    "Sandy Springs",
    "Duluth",
    "Suwanee",
  ],
  social: {
    instagram: "https://instagram.com/gaprinthub", // CLIENT_FILL
    facebook: "https://facebook.com/gaprinthub", // CLIENT_FILL
    linkedin: "https://linkedin.com/company/gaprinthub", // CLIENT_FILL
  },
  capabilities: [
    { key: "laser", label: "Laser Engraving", icon: "fire" },
    { key: "uv", label: "UV Printing", icon: "lightbulb" },
    { key: "dtf", label: "DTF Transfers", icon: "layer-group" },
    { key: "sublimation", label: "Sublimation", icon: "palette" },
    { key: "embroidery", label: "Embroidery", icon: "scissors" },
    { key: "screenprint", label: "Screen Printing", icon: "print" },
    // CLIENT_FILL: additional capability
  ],
} as const;

export type SiteConfig = typeof siteConfig;
