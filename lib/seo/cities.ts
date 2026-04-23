export type CityLanding = {
  slug: string;
  city: string;
  region: string;
  h1: string;
  eyebrow: string;
  intro: string;
  angle: string;
  audienceCopy: string;
  image: string;
};

export const cityLandings: CityLanding[] = [
  {
    slug: "alpharetta-printing",
    city: "Alpharetta",
    region: "GA",
    h1: "Custom Printing in Alpharetta, GA",
    eyebrow: "Our home ZIP",
    intro:
      "We&rsquo;re based in Alpharetta — it&rsquo;s where our press runs and where we pick up every order you don&rsquo;t want to ship. Business cards, banners, embroidered polos, engraved awards, and bulk tee decorations all happen in-house.",
    angle: "Local pickup · same-day rush when we can · known faces at the counter.",
    audienceCopy:
      "Alpharetta startups, Avalon retailers, Windward Parkway brokers, youth sports leagues at Wills Park, and the Fulton County school crowd — we know the rhythm of this town.",
    image: "/images/generated/city-alpharetta-printing.webp",
  },
  {
    slug: "roswell-printing",
    city: "Roswell",
    region: "GA",
    h1: "Printing & Promo in Roswell, GA",
    eyebrow: "Canton Street neighbors",
    intro:
      "Historic storefronts, local festivals, pre-K through high-school fundraisers — Roswell stays busy. We&rsquo;re right up the road with printing, engraving, and decorated apparel.",
    angle: "Event rush? We run fast-turn signs and tees.",
    audienceCopy:
      "Roswell Historical Society, Canton Street retailers, Roswell Inc members, Mimosa & Hembree athletic clubs.",
    image: "/images/generated/city-roswell-printing.webp",
  },
  {
    slug: "johns-creek-printing",
    city: "Johns Creek",
    region: "GA",
    h1: "Custom Printing in Johns Creek, GA",
    eyebrow: "Weekend warriors welcome",
    intro:
      "Youth soccer and lacrosse seasons keep Johns Creek in trophy mode. We stock resin figures for every sport, decorate team apparel at volume, and proof every order before the press runs.",
    angle: "Season-end trophies in 10 days — 500 units, no problem.",
    audienceCopy:
      "Johns Creek Soccer Club, Johns Creek Convention center events, Northview High booster clubs, local youth sports leagues.",
    image: "/images/generated/city-johns-creek-printing.webp",
  },
  {
    slug: "milton-printing",
    city: "Milton",
    region: "GA",
    h1: "Custom Printing in Milton, GA",
    eyebrow: "Upscale personalization",
    intro:
      "Equestrian events, gala invites, corporate retreats at Crabapple — Milton orders run upscale. Foil cards, engraved leatherette, laser-etched walnut — our premium list ships to you.",
    angle: "Hand-finished, quiet, never spammy.",
    audienceCopy:
      "Milton equestrian community, Crabapple businesses, Birmingham Falls & King's Ridge families, country-club event planners.",
    image: "/images/generated/city-milton-printing.webp",
  },
  {
    slug: "cumming-printing",
    city: "Cumming",
    region: "GA",
    h1: "Custom Printing in Cumming, GA",
    eyebrow: "Forsyth County-friendly",
    intro:
      "Forsyth County businesses, schools, and clubs — Cumming is growing and the orders keep coming. Yard signs, bulk tees for 5K fun runs, engraved gifts for booster clubs.",
    angle: "Honest lead times for real deadlines.",
    audienceCopy:
      "Forsyth County Schools, Cumming chambers of commerce, The Collection retailers, Forsyth HS and West Forsyth HS booster clubs.",
    image: "/images/generated/city-cumming-printing.webp",
  },
  {
    slug: "atlanta-custom-printing",
    city: "Atlanta",
    region: "GA",
    h1: "Custom Printing in Atlanta, GA",
    eyebrow: "From the perimeter in",
    intro:
      "Corporate headquarters, event pros, agencies, and national brands choose Georgia Print Hub for large-run decoration and premium recognition. We deliver into every neighborhood inside the perimeter and beyond.",
    angle: "Volume at speed — 50K EDDM postcards, 10K branded tees, 2K crystal awards.",
    audienceCopy:
      "Midtown agencies, Buckhead corporate HQs, Westside event pros, and Atlanta-metro municipal teams.",
    image: "/images/generated/city-atlanta-custom-printing.webp",
  },
];

export function getCityLanding(slug: string) {
  return cityLandings.find((c) => c.slug === slug);
}
