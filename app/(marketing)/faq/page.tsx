import type { Metadata } from "next";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about turnaround, file requirements, proofs, and bulk orders.",
};

const faqs = [
  {
    q: "How fast can you turn my order?",
    a: "Standard lead time is 1-7 business days after proof approval. Rush jobs are possible — call or email and we&apos;ll work it into the schedule.",
  },
  {
    q: "What artwork do you need?",
    a: "Vectors (AI, SVG, PDF) are preferred for screen print, embroidery, engraving, and DTF. High-resolution raster (300dpi at final size) works for sublimation and UV print. We&apos;ll always proof before running the press.",
  },
  {
    q: "Can you handle large-volume orders?",
    a: "Yes. We run large volume every week — EDDM campaigns, national-chain branded apparel, and multi-material corporate recognition programs. Request a quote to get tier pricing.",
  },
  {
    q: "Do you ship nationwide?",
    a: "Absolutely. Local pickup is available in metro Atlanta, flat-rate shipping to the rest of the US, and we can coordinate freight for oversized orders.",
  },
  {
    q: "Will I see a proof before the press runs?",
    a: "Yes — every decorated order receives a digital proof. We wait for your approval before production begins.",
  },
  {
    q: "What&apos;s the smallest order you&apos;ll take?",
    a: "Some of our products are single-unit (personalized gifts, engraved plaques). Others have minimums — always listed on the product page.",
  },
];

export default function FaqPage() {
  return (
    <div className="container py-14 max-w-3xl">
      <Eyebrow tone="crimson">FAQ</Eyebrow>
      <h1 className="heading-display mt-3 text-5xl">Questions, answered.</h1>
      <p className="mt-3 text-ink-soft">
        Still stuck? Hit the contact page — a human will reply.
      </p>
      <Accordion type="multiple" className="mt-8 rounded-lg border border-ink/10 bg-card px-4 shadow-press">
        {faqs.map((f) => (
          <AccordionItem key={f.q} value={f.q} className="border-b-0">
            <AccordionTrigger className="text-lg">{f.q}</AccordionTrigger>
            <AccordionContent>
              <span dangerouslySetInnerHTML={{ __html: f.a }} />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
