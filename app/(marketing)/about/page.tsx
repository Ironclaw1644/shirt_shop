import type { Metadata } from "next";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "About",
  description:
    "Georgia Print Hub — Alpharetta-based printing, promo, and apparel for metro Atlanta and North Georgia, in business for over 20 years.",
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
            Georgia Print Hub is a custom printing, promotional products, apparel, awards, and
            personalized gifts shop based in Alpharetta, GA. We&rsquo;ve been running presses and
            lasers for North Georgia businesses, schools, leagues, and brands since {siteConfig.founded}.
          </p>
          <p className="mt-3 text-lg text-ink-soft leading-relaxed">
            Our shop handles in-house laser engraving, UV printing, DTF transfers, sublimation,
            embroidery, and screen printing. Single-unit gifts and 50,000-unit production runs
            both fit on our schedule.
          </p>
          <p className="mt-3 text-lg text-ink-soft leading-relaxed">
            What sets us apart isn&rsquo;t one technique — it&rsquo;s the people at the counter. We
            proof every job, answer the phone, and ship when we said we would.
            {/* CLIENT_FILL: additional capability */}
          </p>
        </div>
      </section>

      <PerforatedDivider className="text-primary/40" />

      <section className="container py-16 max-w-3xl">
        <h2 className="heading-display text-3xl text-ink">Visit us</h2>
        <p className="mt-3 text-ink-soft">
          Our production floor is in Alpharetta. We ship nationwide and offer local pickup across
          the metro.
          {/* CLIENT_FILL: street address once confirmed */}
        </p>
      </section>
    </>
  );
}
