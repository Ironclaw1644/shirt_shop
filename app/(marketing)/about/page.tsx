import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Georgia Print Hub — locally printed in Georgia for over 20 years. A true one-stop shop for printing, promo, apparel, awards, gifts, and bulk blanks.",
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-paper-warm py-14">
        <div className="container max-w-3xl">
          <Eyebrow tone="crimson">About</Eyebrow>
          <h1 className="heading-display mt-3 text-5xl sm:text-6xl text-ink">
            Twenty years. One press.
          </h1>
          <p className="mt-5 text-lg text-ink-soft leading-relaxed">
            Georgia Print Hub is a true one-stop shop for custom printing, promotional products,
            apparel, awards, personalized gifts, and bulk blanks — locally printed in Georgia.
            We&rsquo;ve been running presses and lasers for businesses, schools, leagues, and
            brands since {siteConfig.founded}.
          </p>
          <p className="mt-3 text-lg text-ink-soft leading-relaxed">
            Our shop handles in-house laser engraving, UV printing, DTF transfers, sublimation,
            embroidery, and screen printing. Single-unit gifts and large production runs both
            fit on our schedule, and we keep blank inventory in bulk so you can buy what you
            print on — or just buy the blanks.
          </p>
          <p className="mt-3 text-lg text-ink-soft leading-relaxed">
            Many jobs ship same-day or in a few hours — that&rsquo;s a real edge over the rest
            of the printers. What sets us apart isn&rsquo;t one technique — it&rsquo;s the people at
            the counter. We proof every job, answer the phone, and ship when we said we would.
          </p>
        </div>
      </section>

      <PerforatedDivider className="text-primary/40" />

      <section className="container py-16 max-w-3xl">
        <h2 className="heading-display text-3xl text-ink">Who we serve</h2>
        <p className="mt-3 text-ink-soft leading-relaxed">
          Local schools, churches, non-profits, restaurants, IT companies, doctor&rsquo;s offices,
          and many more. We work with jewelry shops to laser-stamp their precious-metal inventory.
          We outfit youth sports leagues, cut signage for grand openings, and turn around bulk tee
          orders for fundraisers and corporate events. No job is too big or too small.
        </p>

        <h2 className="heading-display mt-12 text-3xl text-ink">Visit us</h2>
        <p className="mt-3 text-ink-soft">
          Our production floor is in Georgia. We ship nationwide and offer local pickup across
          the metro.
          {/* CLIENT_FILL: street address once confirmed */}
        </p>
      </section>
    </>
  );
}
