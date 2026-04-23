import type { Metadata } from "next";
import { QuoteForm } from "@/components/shop/quote-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { Icon } from "@/components/ui/icon";

export const metadata: Metadata = {
  title: "Request a volume quote",
  description:
    "Get tier pricing, lead time, and shipping on runs from 500 to 50,000+ units. Response within one business day.",
};

export default function QuotePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-paper-warm">
        <div className="absolute inset-0 cmyk-halftone opacity-40" aria-hidden />
        <div className="container relative pt-16 pb-12 lg:pt-20 lg:pb-16">
          <Eyebrow tone="crimson">Volume · response in 1 business day</Eyebrow>
          <h1 className="heading-display mt-3 text-5xl lg:text-6xl text-ink max-w-3xl">
            Request a quote.
            <br />
            <span className="font-editorial italic font-normal text-primary">
              Tell us what you&rsquo;re printing.
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-soft leading-relaxed">
            Whether it&rsquo;s 500 branded polos for a corporate kickoff or 50,000 EDDM postcards for
            a direct-mail campaign, send us the brief and we&rsquo;ll come back with tier pricing,
            production schedule, and shipping.
          </p>
        </div>
      </section>

      <PerforatedDivider tone="gold" />

      <section className="container py-14 grid lg:grid-cols-[1fr,360px] gap-12">
        <QuoteForm />
        <aside className="space-y-6">
          <div className="rounded-lg border border-ink/10 bg-paper-warm p-6 shadow-press">
            <h3 className="font-display text-lg font-bold">What to include</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              <li className="flex gap-2">
                <Icon icon="circle-check" className="mt-0.5 text-primary" /> Product type and quantity
              </li>
              <li className="flex gap-2">
                <Icon icon="circle-check" className="mt-0.5 text-primary" /> Decoration method (if any)
              </li>
              <li className="flex gap-2">
                <Icon icon="circle-check" className="mt-0.5 text-primary" /> In-hands date
              </li>
              <li className="flex gap-2">
                <Icon icon="circle-check" className="mt-0.5 text-primary" /> Artwork or brand brief
              </li>
              <li className="flex gap-2">
                <Icon icon="circle-check" className="mt-0.5 text-primary" /> Shipping ZIP
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-ink/10 bg-ink text-paper p-6">
            <p className="font-editorial italic text-accent-300">Reality check</p>
            <p className="mt-2 font-display text-2xl leading-snug">
              We&rsquo;ve printed single runs of 50,000+ for national brands.
            </p>
            <p className="mt-3 text-sm text-paper/70">
              Tell us your deadline and we&rsquo;ll tell you the truth about whether it&rsquo;s doable.
            </p>
          </div>
        </aside>
      </section>
    </>
  );
}
