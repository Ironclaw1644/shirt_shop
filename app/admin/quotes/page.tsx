import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatQuantity } from "@/lib/utils/money";

export default async function AdminQuotesList() {
  const supa = await getSupabaseServerClient();
  const { data: quotes } = await supa
    .from("quote_requests")
    .select("id, email, full_name, company, est_quantity, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <div>
      <AdminPageHeader
        title="Quote requests"
        subtitle="Reply with tier pricing, then convert an accepted quote into an order. Email the invoice from the order page."
      />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-ink/10 bg-white overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Qty</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Received</th>
              </tr>
            </thead>
            <tbody>
              {(quotes ?? []).map((q) => (
                <tr key={q.id} className="border-t border-ink/10 hover:bg-paper-warm transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/quotes/${q.id}`} className="font-display font-semibold text-primary hover:underline">
                      {q.full_name ?? q.email}
                    </Link>
                    <div className="text-xs text-ink-mute">{q.email}</div>
                  </td>
                  <td className="px-4 py-3">{q.company ?? "—"}</td>
                  <td className="px-4 py-3 font-mono">{q.est_quantity ? formatQuantity(q.est_quantity) : "—"}</td>
                  <td className="px-4 py-3"><Badge variant="paper">{q.status}</Badge></td>
                  <td className="px-4 py-3 text-ink-mute">{new Date(q.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {(!quotes || quotes.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-mute">No quote requests yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
