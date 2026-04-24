import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Eyebrow } from "@/components/ui/eyebrow";

type Slug = "privacy" | "terms" | "returns" | "shipping";

const policies: Record<Slug, { title: string; body: string; description: string }> = {
  privacy: {
    title: "Privacy",
    description: "How Georgia Print Hub collects and uses your information.",
    body: `
<p>Georgia Print Hub respects your privacy. We collect information you give us directly (order details, designs, contact forms) and minimal anonymous analytics to improve the site. We never sell your data. Artwork you upload is stored securely and used only for your order. <!-- CLIENT_FILL: final privacy policy language --></p>
`,
  },
  terms: {
    title: "Terms",
    description: "Terms of service for Georgia Print Hub orders.",
    body: `
<p>By placing an order, you agree to the production timelines, pricing, and approval requirements listed on your order confirmation. Custom work is non-refundable once a proof is approved. <!-- CLIENT_FILL: final terms language --></p>
`,
  },
  returns: {
    title: "Returns",
    description: "Our return and reprint policy.",
    body: `
<p>If your order doesn&rsquo;t match the approved proof, we&rsquo;ll reprint it at no cost. Non-customized items may be returned within 14 days in new condition. <!-- CLIENT_FILL: final returns language --></p>
`,
  },
  shipping: {
    title: "Shipping",
    description: "Shipping zones, rates, and local pickup across metro Atlanta.",
    body: `
<p>Local pickup is free across metro Atlanta. Nationwide flat-rate shipping starts at $8.50 for standard items; oversized and freight orders are quoted individually. Rush options available — many jobs ship same-day or in a few hours. <!-- CLIENT_FILL: exact shipping zones and flat-rate numbers --></p>
`,
  },
};

export async function generateStaticParams() {
  return Object.keys(policies).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = policies[slug as Slug];
  if (!p) return {};
  return { title: p.title, description: p.description };
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = policies[slug as Slug];
  if (!p) return notFound();
  return (
    <div className="container py-14 max-w-3xl">
      <Eyebrow tone="ink">Policies</Eyebrow>
      <h1 className="heading-display mt-3 text-5xl">{p.title}</h1>
      <article
        className="prose prose-ink mt-6 text-ink-soft leading-relaxed"
        dangerouslySetInnerHTML={{ __html: p.body }}
      />
    </div>
  );
}
