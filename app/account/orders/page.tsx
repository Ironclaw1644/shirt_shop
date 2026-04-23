import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatMoneyCents } from "@/lib/utils/money";
import { Eyebrow } from "@/components/ui/eyebrow";

export default async function OrdersListPage() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supa
    .from("orders")
    .select("id, status, subtotal_cents, total_cents, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Eyebrow tone="ink">Orders</Eyebrow>
      <h1 className="heading-display mt-2 text-4xl">Your orders</h1>

      <div className="mt-8 rounded-lg border border-ink/10 bg-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Order</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Placed</th>
              <th className="text-right px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-t border-ink/10 hover:bg-paper-warm transition-colors">
                <td className="px-4 py-4">
                  <Link href={`/account/orders/${o.id}`} className="font-display font-semibold hover:text-primary">
                    #{o.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-4">
                  <Badge variant="paper">{o.status.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-4 text-sm text-ink-mute">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 text-right font-mono">
                  {formatMoneyCents(o.total_cents)}
                </td>
              </tr>
            ))}
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-ink-mute">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
