import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatMoneyCents } from "@/lib/utils/money";
import { Badge } from "@/components/ui/badge";

export default async function AdminCustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = await getSupabaseServerClient();
  const { data: profile } = await supa.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) return notFound();
  const { data: orders } = await supa
    .from("orders")
    .select("id, total_cents, status, created_at")
    .eq("user_id", id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader
        title={profile.full_name ?? profile.email}
        subtitle={`${profile.email}${profile.company ? ` · ${profile.company}` : ""}`}
      />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="rounded-lg border border-ink/10 bg-white p-5 text-sm flex flex-wrap gap-x-6 gap-y-2">
          <span><span className="text-ink-mute">Phone:</span> {profile.phone ?? "—"}</span>
          <span><span className="text-ink-mute">Role:</span> {profile.role}</span>
          <span><span className="text-ink-mute">Tags:</span> {(profile.tags ?? []).join(", ") || "—"}</span>
          <span><span className="text-ink-mute">Joined:</span> {new Date(profile.created_at).toLocaleDateString()}</span>
        </div>

        <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <h2 className="font-display text-lg font-bold px-5 py-4 border-b border-ink/10">Orders</h2>
          <ul className="divide-y divide-ink/10">
            {(orders ?? []).map((o) => (
              <li key={o.id} className="px-5 py-3 flex items-center justify-between">
                <Link href={`/admin/orders/${o.id}`} className="font-display font-semibold text-primary">
                  #{o.id.slice(0, 8).toUpperCase()}
                </Link>
                <div className="flex items-center gap-3">
                  <Badge variant="paper">{o.status}</Badge>
                  <span className="font-mono">{formatMoneyCents(o.total_cents)}</span>
                </div>
              </li>
            ))}
            {(!orders || orders.length === 0) && (
              <li className="px-5 py-10 text-center text-ink-mute text-sm">No orders.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
