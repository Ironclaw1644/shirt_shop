import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatMoneyCents } from "@/lib/utils/money";
import { updateOrderStatus, emailInvoice } from "./actions";

const statusOrder = ["received","in_proof","approved","in_production","shipped","delivered","cancelled"];

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = await getSupabaseServerClient();
  const { data: order } = await supa
    .from("orders")
    .select("*, order_items(*), order_messages(*)")
    .eq("id", id)
    .maybeSingle();
  if (!order) return notFound();

  return (
    <div>
      <AdminPageHeader
        title={`Order #${order.id.slice(0, 8).toUpperCase()}`}
        subtitle={`${order.email} · ${new Date(order.created_at).toLocaleString()}`}
        actions={
          <form action={updateOrderStatus} className="flex items-center gap-2">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status} className="h-9 rounded border border-ink/15 bg-white px-2 text-sm">
              {statusOrder.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
            <button className="h-9 rounded bg-primary text-white px-3 text-sm">Update</button>
          </form>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
            <h2 className="font-display text-lg font-bold px-5 py-4 border-b border-ink/10">
              Items
            </h2>
            <ul className="divide-y divide-ink/10">
              {((order.order_items ?? []) as Array<{ id: string; title_snapshot: string; decoration: unknown; quantity: number; unit_price_cents: number; artwork_file_urls: string[] }>).map((i) => (
                <li key={i.id} className="px-5 py-4 flex justify-between">
                  <div>
                    <p className="font-display font-semibold">{i.title_snapshot}</p>
                    {i.decoration ? (
                      <p className="text-xs text-ink-mute">
                        {JSON.stringify(i.decoration)}
                      </p>
                    ) : null}
                    {(i.artwork_file_urls ?? []).length > 0 && (
                      <p className="text-xs mt-1">
                        <a href={i.artwork_file_urls[0]} className="text-primary hover:underline">
                          Artwork file →
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="text-right font-mono text-sm">
                    {i.quantity} × {formatMoneyCents(i.unit_price_cents)}
                    <div className="font-display font-bold">
                      {formatMoneyCents(i.unit_price_cents * i.quantity)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
            <h2 className="font-display text-lg font-bold px-5 py-4 border-b border-ink/10">
              Conversation
            </h2>
            <ul className="divide-y divide-ink/10 max-h-96 overflow-y-auto">
              {((order.order_messages ?? []) as Array<{ id: string; author_role: string; created_at: string; body: string }>).map((m) => (
                <li key={m.id} className="px-5 py-4">
                  <p className="text-xs uppercase tracking-widest text-ink-mute">
                    {m.author_role} · {new Date(m.created_at).toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft whitespace-pre-wrap">{m.body}</p>
                </li>
              ))}
              {(!order.order_messages || order.order_messages.length === 0) && (
                <li className="px-5 py-10 text-center text-ink-mute text-sm">
                  No messages yet.
                </li>
              )}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-ink/10 bg-white p-5">
            <p className="text-xs uppercase tracking-wider text-ink-mute">Status</p>
            <Badge variant="paper" className="mt-1">{order.status.replace(/_/g, " ")}</Badge>
          </div>
          <div className="rounded-lg border border-ink/10 bg-white p-5 space-y-2 text-sm">
            <p className="font-display font-bold">Totals</p>
            <div className="flex justify-between"><span className="text-ink-mute">Subtotal</span><span className="font-mono">{formatMoneyCents(order.subtotal_cents)}</span></div>
            <div className="flex justify-between"><span className="text-ink-mute">Shipping</span><span className="font-mono">{formatMoneyCents(order.shipping_cents)}</span></div>
            <div className="flex justify-between"><span className="text-ink-mute">Tax</span><span className="font-mono">{formatMoneyCents(order.tax_cents)}</span></div>
            <div className="flex justify-between font-bold pt-2 border-t border-ink/10"><span>Total</span><span className="font-mono">{formatMoneyCents(order.total_cents)}</span></div>
          </div>
          <form action={emailInvoice} className="rounded-lg border border-ink/10 bg-white p-5">
            <p className="font-display font-bold text-sm">Send invoice</p>
            <p className="mt-1 text-xs text-ink-mute">
              Emails {order.email} an itemized invoice for the totals shown above.
            </p>
            <input type="hidden" name="id" value={order.id} />
            <textarea
              name="notes"
              rows={3}
              placeholder="Optional notes (payment method, due date, etc.)"
              className="mt-3 w-full rounded border border-ink/15 bg-white px-2 py-1 text-xs"
            />
            <button className="mt-3 h-9 w-full rounded bg-primary text-white text-sm font-medium">
              Email invoice
            </button>
          </form>
        </aside>
      </div>
    </div>
  );
}
