import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatMoneyCents } from "@/lib/utils/money";

export default async function AdminOrdersList({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const supa = await getSupabaseServerClient();
  let query = supa
    .from("orders")
    .select("id, email, total_cents, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  if (sp.status) query = query.eq("status", sp.status as never);
  if (sp.q) query = query.ilike("email", `%${sp.q}%`);

  const { data: orders } = await query;

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="Every order flows through this queue — review proofs, update status, process refunds."
      />

      <div className="p-4 sm:p-6 lg:p-8">
        <form method="get" className="flex flex-wrap gap-2 sm:gap-3 mb-5">
          <input
            id="admin-search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search email…"
            className="h-10 w-full sm:w-80 min-w-0 flex-1 sm:flex-none rounded border border-ink/15 bg-white px-3 text-sm focus:border-primary focus:outline-none"
          />
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="h-10 rounded border border-ink/15 bg-white px-2 text-sm"
          >
            <option value="">All statuses</option>
            {["received","in_proof","approved","in_production","shipped","delivered","cancelled"].map(s => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button className="h-10 rounded bg-ink text-paper px-4 text-sm">Filter</button>
        </form>

        <div className="rounded-lg border border-ink/10 bg-white overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="text-left px-4 py-3">Order</th>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Placed</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Total</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((o) => (
                <tr key={o.id} className="border-t border-ink/10 hover:bg-paper-warm transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-display font-semibold text-primary hover:underline">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{o.email}</td>
                  <td className="px-4 py-3 text-ink-mute">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3"><Badge variant="paper">{o.status.replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-3 text-right font-mono">{formatMoneyCents(o.total_cents)}</td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-mute">
                    No orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
