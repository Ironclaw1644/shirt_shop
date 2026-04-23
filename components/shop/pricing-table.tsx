import { formatMoneyCents, formatQuantity } from "@/lib/utils/money";
import { Icon } from "@/components/ui/icon";

export function PricingTable({
  tiers,
  minQty,
}: {
  tiers?: { minQty: number; unitCents: number }[];
  minQty: number;
}) {
  if (!tiers || tiers.length === 0) return null;
  return (
    <div className="rounded-lg border border-ink/10 bg-paper-warm overflow-hidden">
      <div className="flex items-center justify-between bg-ink text-paper px-4 py-3">
        <span className="font-display font-semibold text-sm tracking-wide uppercase">
          Tier pricing
        </span>
        <Icon icon="boxes-stacked" className="text-accent" />
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-ink-mute text-xs uppercase tracking-wider">
            <th className="px-4 py-2 font-medium">Quantity</th>
            <th className="px-4 py-2 font-medium text-right">Unit price</th>
            <th className="px-4 py-2 font-medium text-right">You save</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((tier, idx) => {
            const basePrice = tiers[0].unitCents;
            const savings = basePrice - tier.unitCents;
            const savingsPct = Math.round((savings / basePrice) * 100);
            const next = tiers[idx + 1];
            const rangeLabel = next
              ? `${formatQuantity(tier.minQty)}–${formatQuantity(next.minQty - 1)}`
              : `${formatQuantity(tier.minQty)}+`;
            return (
              <tr
                key={tier.minQty}
                className="border-t border-ink/10 odd:bg-white/40"
              >
                <td className="px-4 py-2.5 font-mono">{rangeLabel}</td>
                <td className="px-4 py-2.5 text-right font-semibold">
                  {formatMoneyCents(tier.unitCents)}
                </td>
                <td className="px-4 py-2.5 text-right text-primary font-medium">
                  {idx === 0 ? "—" : `${savingsPct}%`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-ink-mute bg-white/50 border-t border-ink/10">
        Minimum order {formatQuantity(minQty)}. Volume past 10,000 units? Request a direct quote for
        maxed-out discount.
      </p>
    </div>
  );
}
