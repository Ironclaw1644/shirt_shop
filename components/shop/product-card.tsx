import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents } from "@/lib/utils/money";
import type { SampleProduct } from "@/lib/catalog/sample-products";

export function ProductCard({ product }: { product: SampleProduct }) {
  const img = `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`;
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-lg overflow-hidden border border-ink/10 bg-card shadow-press hover:shadow-press-lg transition-all hover:-translate-y-0.5"
    >
      <div className="relative aspect-square bg-paper-warm overflow-hidden">
        <Image
          src={img}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        />
        {product.badges?.[0] && (
          <Badge variant="crimson" className="absolute top-3 left-3 shadow-press">
            {product.badges[0]}
          </Badge>
        )}
        {product.brand && (
          <span className="absolute bottom-3 right-3 rounded-sm bg-paper/95 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-ink shadow-press">
            {product.brand}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-display font-semibold text-ink leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="mt-1 text-xs text-ink-mute line-clamp-1">{product.shortDescription}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <span className="font-display font-bold text-lg text-ink">
              {product.priceStatus === "quote" || product.basePriceCents === null
                ? "Quote"
                : `from ${formatMoneyCents(product.basePriceCents)}`}
            </span>
            <span className="ml-1.5 text-[11px] text-ink-mute font-mono">
              MIN {product.minQty}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View <Icon icon="arrow-right" className="text-xs" />
          </span>
        </div>
      </div>
    </Link>
  );
}
