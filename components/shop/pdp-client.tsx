"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ProductOptions } from "@/components/shop/product-options";
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
  const [designFileName, setDesignFileName] = React.useState<string | null>(null);
  const designInputRef = React.useRef<HTMLInputElement | null>(null);

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
    const baseVariant = Object.entries(options)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");
    const variant = designFileName ? `${baseVariant} · Design: ${designFileName}` : baseVariant;
    const id = `${product.slug}-${Object.values(options).join("-")}-${designFileName ?? "blank"}-${Date.now()}`;
    addItem({
      id,
      productSlug: product.slug,
      title: product.title,
      variant,
      unitPriceCents,
      quantity,
      image: `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`,
      leadTimeDays: product.leadTimeDays,
    });
    toast.success("Added to cart", {
      description: `${formatQuantity(quantity)} × ${product.title}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
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

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-black text-ink">
              {product.priceStatus === "quote" || product.basePriceCents === null
                ? "Request Quote"
                : formatMoneyCents(unitPriceCents)}
            </span>
            <span className="text-sm text-ink-mute">per unit</span>
          </div>

          <div className="mt-8 space-y-6">
            <ProductOptions options={product.options} value={options} onChange={setOptions} />

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
                {Array.from(new Set([product.minQty, 50, 100, 250, 500, 1000]))
                  .filter((n) => n >= product.minQty)
                  .sort((a, b) => a - b)
                  .map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setQuantity(n)}
                      className="rounded-full bg-paper-warm px-3 py-1 text-xs font-mono hover:bg-primary hover:text-white transition-colors"
                    >
                      {formatQuantity(n)}
                    </button>
                  ))}
              </div>
            </div>

            {isQuotePriced ? (
              <Button asChild size="lg" className="w-full">
                <Link href="/quote">
                  <Icon icon="bolt" /> Request a quote
                </Link>
              </Button>
            ) : (
              <div className="space-y-3">
                <input
                  ref={designInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.ai,.eps,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    setDesignFileName(f ? f.name : null);
                  }}
                />
                {designFileName ? (
                  <div className="flex items-center justify-between rounded-lg border border-ink/15 bg-paper-warm px-4 py-3">
                    <span className="flex items-center gap-2 text-sm text-ink truncate min-w-0">
                      <Icon icon="file-circle-check" className="text-primary shrink-0" />
                      <span className="truncate">{designFileName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDesignFileName(null);
                        if (designInputRef.current) designInputRef.current.value = "";
                      }}
                      className="ml-3 shrink-0 text-xs font-mono uppercase tracking-wide text-ink-mute hover:text-primary"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => designInputRef.current?.click()}
                  >
                    <Icon icon="cloud-arrow-up" /> Upload Design
                  </Button>
                )}
                <Button size="lg" className="w-full" onClick={addToCart}>
                  <Icon icon="bag-shopping" /> Add to cart
                  <span className="ml-1 font-mono text-sm opacity-80">
                    {formatMoneyCents(unitPriceCents * quantity)}
                  </span>
                </Button>
              </div>
            )}

            <PricingTable tiers={product.tierBreaks} minQty={product.minQty} />

            <Accordion
              type="multiple"
              defaultValue={["overview"]}
              className="rounded-lg border border-ink/10 bg-white"
            >
              <AccordionItem value="overview" className="px-4 border-b-0">
                <AccordionTrigger>Overview</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 text-ink-soft">
                    {product.description.split(/\n+/).map((para, i) => {
                      const m = para.match(/^\*\*(.+?)\*\*\s*[—:-]?\s*(.*)$/s);
                      if (m) {
                        return (
                          <div key={i}>
                            <p className="font-display font-semibold text-ink">{m[1]}</p>
                            <p className="mt-1">{m[2]}</p>
                          </div>
                        );
                      }
                      return <p key={i}>{para}</p>;
                    })}
                  </div>
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
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
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
