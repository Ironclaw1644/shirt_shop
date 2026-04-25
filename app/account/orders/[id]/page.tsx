import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents } from "@/lib/utils/money";

const statusOrder = [
  "received",
  "in_proof",
  "approved",
  "in_production",
  "shipped",
  "delivered",
];

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: order } = await supa
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) return notFound();

  const stepIdx = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="heading-display text-2xl sm:text-3xl break-words">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-ink-mute">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <Badge variant="paper">{order.status.replace(/_/g, " ")}</Badge>
      </div>

      {order.status === "received" && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5">
          <p className="font-display text-lg font-bold text-ink">
            Order received. We&rsquo;ll email an invoice and a proof shortly.
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Our team is reviewing your order. You&rsquo;ll get an itemized invoice in your inbox
            and a digital proof to approve before any press runs.
          </p>
        </div>
      )}

      <ol className="flex flex-wrap items-center gap-2 text-xs font-medium">
        {statusOrder.map((step, i) => (
          <li
            key={step}
            className={`rounded-full px-3 py-1 border ${
              i <= stepIdx
                ? "border-primary bg-primary/10 text-primary"
                : "border-ink/15 text-ink-mute"
            }`}
          >
            {step.replace(/_/g, " ")}
          </li>
        ))}
      </ol>

      <section>
        <h2 className="font-display text-xl font-bold mb-3">Items</h2>
        <div className="rounded-lg border border-ink/10 bg-card divide-y divide-ink/10">
          {((order.order_items ?? []) as Array<{ id: string; title_snapshot: string; decoration: unknown; quantity: number; unit_price_cents: number }>).map((i) => (
            <div key={i.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="min-w-0">
                <p className="font-display font-semibold text-ink break-words">{i.title_snapshot}</p>
                {i.decoration ? (
                  <p className="text-sm text-ink-mute break-words">
                    Decoration: {JSON.stringify(i.decoration)}
                  </p>
                ) : null}
              </div>
              <div className="sm:text-right shrink-0">
                <p className="font-mono">{i.quantity} × {formatMoneyCents(i.unit_price_cents)}</p>
                <p className="font-display font-bold">
                  {formatMoneyCents(i.unit_price_cents * i.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-lg border border-ink/10 bg-paper-warm p-5">
          <p className="font-display font-semibold text-ink flex items-center gap-2">
            <Icon icon="truck-fast" className="text-primary" /> Shipping
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {order.shipping_address
              ? JSON.stringify(order.shipping_address)
              : "To be provided at proof approval."}
          </p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-paper-warm p-5">
          <p className="font-display font-semibold text-ink flex items-center gap-2">
            <Icon icon="credit-card" className="text-primary" /> Totals
          </p>
          <dl className="mt-2 text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-ink-mute">Subtotal</dt>
              <dd className="font-mono">{formatMoneyCents(order.subtotal_cents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-mute">Shipping</dt>
              <dd className="font-mono">{formatMoneyCents(order.shipping_cents)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-mute">Tax</dt>
              <dd className="font-mono">{formatMoneyCents(order.tax_cents)}</dd>
            </div>
            <div className="flex justify-between font-display font-bold text-ink text-base pt-1 border-t border-ink/10">
              <dt>Total</dt>
              <dd className="font-mono">{formatMoneyCents(order.total_cents)}</dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
