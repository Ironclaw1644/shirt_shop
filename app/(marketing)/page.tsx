import type { Metadata } from "next";
import { InkPressHero } from "@/components/home/ink-press-hero";
import { CapabilitiesMarquee } from "@/components/home/capabilities-marquee";
import { TrustStrip } from "@/components/home/trust-strip";
import { CategoryGrid } from "@/components/home/category-grid";
import { VolumeCounters } from "@/components/home/volume-counters";
import { HowItWorks } from "@/components/home/how-it-works";
import { FeaturedCarousel } from "@/components/home/featured-carousel";
import { LocalStrip } from "@/components/home/local-strip";
import { NewsletterInline } from "@/components/home/newsletter-inline";

export const metadata: Metadata = {
  title: "Custom printing, promo, and apparel in Alpharetta, GA",
  description:
    "Twenty years printing, promoting, and outfitting Georgia. In-house laser, UV, DTF, sublimation, embroidery, and screen print — from gifts to 50,000-unit runs.",
};

export default function HomePage() {
  return (
    <>
      <InkPressHero />
      <CapabilitiesMarquee />
      <TrustStrip />
      <CategoryGrid />
      <VolumeCounters />
      <HowItWorks />
      <FeaturedCarousel />
      <LocalStrip />
      <NewsletterInline />
    </>
  );
}
