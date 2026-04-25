"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProductOptions } from "@/components/shop/product-options";
import { DecorationPicker } from "@/components/shop/decoration-picker";
import { PricingTable } from "@/components/shop/pricing-table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/store/cart";
import { formatMoneyCents, formatQuantity } from "@/lib/utils/money";
import type { SampleProduct } from "@/lib/catalog/sample-products";

export function PDPClient({
  product,
  upsells,
}: {
  product: SampleProduct;
  upsells: SampleProduct[];
}) {
  const router = useRouter();
  const [quantity, setQuantity] = React.useState<number>(product.minQty);
  const [options, setOptions] = React.useState<Record<string, string>>(() =>
    pickDefaultOptions(product),
  );
  const [decoration, setDecoration] = React.useState<string | null>(null);
  const [mode, setMode] = React.useState<"blank" | "decorated">("blank");

  const unitPriceCents = React.useMemo(() => {
    if (!product.basePriceCents) return 0;
    const tiers = product.tierBreaks ?? [{ minQty: product.minQty, unitCents: product.basePriceCents }];
    let match = tiers[0];
    for (const t of tiers) if (quantity >= t.minQty) match = t;
    return match.unitCents;
  }, [product, quantity]);

  const addItem = useCart((s) => s.add);
  const isQuotePriced = product.priceStatus === "quote" || !product.basePriceCents;

  function addToCart() {
    const id = `${product.slug}-${Object.values(options).join("-")}-${decoration ?? "blank"}-${Date.now()}`;
    addItem({
      id,
      productSlug: product.slug,
      title: product.title,
      variant: Object.entries(options)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · "),
      unitPriceCents,
      quantity,
      image: `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`,
      leadTimeDays: product.leadTimeDays,
      decoration: decoration
        ? { method: decoration }
        : undefined,
    });
    toast.success("Added to cart", {
      description: `${formatQuantity(quantity)} × ${product.title}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
  }

  function goDesigner() {
    const params = new URLSearchParams({
      product: product.slug,
      method: decoration ?? product.decorationMethods[0] ?? "",
      qty: String(quantity),
    });
    for (const [k, v] of Object.entries(options)) params.set(k.toLowerCase(), v);
    router.push(`/designer?${params.toString()}`);
  }

  return (
    <div className="container py-10 lg:py-14">
      <div className="grid lg:grid-cols-2 gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-lg border border-ink/10 bg-paper-warm shadow-press">
            <Image
              src={`/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
              priority
            />
            {product.badges?.[0] && (
              <Badge variant="crimson" className="absolute top-4 left-4 shadow-press">
                {product.badges[0]}
              </Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <div className="text-xs uppercase tracking-wider text-ink-mute font-mono">
            {product.brand ? `${product.brand} · ` : ""}
            {product.categorySlug.replace(/-/g, " ")}
          </div>
          <h1 className="mt-2 heading-display text-4xl sm:text-5xl text-ink">{product.title}</h1>
          <p className="mt-3 text-lg text-ink-soft">{product.shortDescription}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-black text-ink">
              {product.priceStatus === "quote" || product.basePriceCents === null
                ? "Request Quote"
                : formatMoneyCents(unitPriceCents)}
            </span>
            <span className="text-sm text-ink-mute">per unit</span>
            {unitPriceCents > 0 && product.basePriceCents && unitPriceCents < product.basePriceCents && (
              <Badge variant="gold">Tier discount active</Badge>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-mute">
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="boxes-stacked" className="text-primary" /> Min {formatQuantity(product.minQty)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="clock" className="text-primary" /> {product.leadTimeDays} day lead
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon icon="truck-fast" className="text-primary" /> Ships from Georgia
            </span>
          </div>

          {/* Mode selector */}
          <div className="mt-8 grid grid-cols-2 gap-2 rounded-lg bg-paper-warm p-1">
            <button
              type="button"
              onClick={() => setMode("blank")}
              className={`rounded px-4 py-3 text-sm font-display font-semibold transition-all ${
                mode === "blank"
                  ? "bg-ink text-paper shadow-press"
                  : "text-ink-soft hover:bg-surface"
              }`}
            >
              Order blank / as-is
            </button>
            <button
              type="button"
              onClick={() => setMode("decorated")}
              className={`rounded px-4 py-3 text-sm font-display font-semibold transition-all ${
                mode === "decorated"
                  ? "bg-primary text-white shadow-press"
                  : "text-ink-soft hover:bg-surface"
              }`}
            >
              Customize & decorate
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <ProductOptions options={product.options} value={options} onChange={setOptions} />

            {mode === "decorated" && (
              <DecorationPicker
                methods={product.decorationMethods}
                value={decoration}
                onChange={setDecoration}
              />
            )}

            <div>
              <label className="block font-display font-semibold text-ink mb-2">Quantity</label>
              <div className="flex items-stretch max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(product.minQty, q - 10))}
                  className="h-12 w-12 rounded-l border-2 border-r-0 border-ink/15 font-display font-bold hover:border-primary"
                >
                  −
                </button>
                <input
                  type="number"
                  min={product.minQty}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(product.minQty, parseInt(e.target.value) || product.minQty))
                  }
                  className="h-12 w-full border-2 border-ink/15 text-center font-display font-bold text-lg focus:border-primary focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 10)}
                  className="h-12 w-12 rounded-r border-2 border-l-0 border-ink/15 font-display font-bold hover:border-primary"
                >
                  +
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[product.minQty, 50, 100, 250, 500, 1000].map((n) =>
                  n >= product.minQty ? (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantity(n)}
                      className="rounded-full bg-paper-warm px-3 py-1 text-xs font-mono hover:bg-primary hover:text-white transition-colors"
                    >
                      {formatQuantity(n)}
                    </button>
                  ) : null,
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button size="lg" onClick={addToCart}>
                <Icon icon="bag-shopping" /> Add to cart
                {!isQuotePriced && (
                  <span className="ml-1 font-mono text-sm opacity-80">
                    {formatMoneyCents(unitPriceCents * quantity)}
                  </span>
                )}
              </Button>
              {mode === "decorated" ? (
                <Button size="lg" variant="secondary" onClick={goDesigner}>
                  <Icon icon="magic-wand-sparkles" /> Open Designer
                </Button>
              ) : (
                <Button asChild size="lg" variant="outline">
                  <Link href="/quote">
                    <Icon icon="bolt" /> Request a volume quote
                  </Link>
                </Button>
              )}
            </div>

            <PricingTable tiers={product.tierBreaks} minQty={product.minQty} />

            <Accordion type="multiple" className="rounded-lg border border-ink/10 bg-white">
              <AccordionItem value="specs" className="px-4 border-b-0">
                <AccordionTrigger>Specifications & materials</AccordionTrigger>
                <AccordionContent>
                  <p className="text-ink-soft">{product.description}</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="decorate" className="px-4 border-b-0">
                <AccordionTrigger>Decoration methods</AccordionTrigger>
                <AccordionContent>
                  <p className="text-ink-soft">
                    This item supports{" "}
                    {product.decorationMethods
                      .map((m) => m.replace(/-/g, " "))
                      .join(", ")}
                    . Our team will proof every job before the press runs.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="turnaround" className="px-4 border-b-0">
                <AccordionTrigger>Turnaround & shipping</AccordionTrigger>
                <AccordionContent>
                  <p className="text-ink-soft">
                    Standard lead time {product.leadTimeDays} business days after proof
                    approval. Local pickup across metro Atlanta or flat-rate shipping
                    nationwide. Need rush? Many jobs ship same-day or in a few hours — just call.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>

      {upsells.length > 0 && (
        <section className="mt-20">
          <h2 className="heading-display text-3xl text-ink mb-6">Pairs well with</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {upsells.slice(0, 2).map((u) => (
              <Link
                key={u.slug}
                href={`/product/${u.slug}`}
                className="group block rounded-lg overflow-hidden border border-ink/10 bg-card shadow-press hover:-translate-y-0.5 transition-all"
              >
                <div className="relative aspect-square bg-paper-warm">
                  <Image
                    src={`/images/generated/${u.heroPromptKey.replace(":", "-")}.webp`}
                    alt={u.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="25vw"
                  />
                </div>
                <div className="p-4">
                  <p className="font-display font-semibold text-ink line-clamp-2 min-h-[2.5rem]">
                    {u.title}
                  </p>
                  <p className="mt-1 text-xs text-ink-mute">
                    from {formatMoneyCents(u.basePriceCents ?? null)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function pickDefaultOptions(p: SampleProduct) {
  const out: Record<string, string> = {};
  if (!p.options) return out;
  for (const [k, values] of Object.entries(p.options)) {
    out[k] = values[0];
  }
  return out;
}
