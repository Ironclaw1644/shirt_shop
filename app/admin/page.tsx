import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { formatMoneyCents } from "@/lib/utils/money";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { AdminRevenueChart } from "@/components/admin/revenue-chart";

export default async function AdminDashboard() {
  const supa = await getSupabaseServerClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: recentOrders }, { data: openQuotes }, { data: newSubs }, { data: products }] =
    await Promise.all([
      supa
        .from("orders")
        .select("id, email, total_cents, status, created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })
        .limit(10),
      supa
        .from("quote_requests")
        .select("id, email, full_name, est_quantity, created_at, status")
        .in("status", ["new", "in_progress"])
        .order("created_at", { ascending: false })
        .limit(8),
      supa
        .from("newsletter_subscribers")
        .select("id, email, subscribed_at")
        .gte("subscribed_at", thirtyDaysAgo)
        .order("subscribed_at", { ascending: false })
        .limit(5),
      supa.from("products").select("id").limit(1),
    ]);

  const thirtyDayRevenue =
    recentOrders?.reduce((sum, o) => sum + (o.total_cents ?? 0), 0) ?? 0;

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="Last 30 days of revenue, orders, and open work."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="30-day revenue"
            value={formatMoneyCents(thirtyDayRevenue)}
            icon="dollar-sign"
            href="/admin/orders?range=30d"
          />
          <StatCard
            label="New orders"
            value={String(recentOrders?.length ?? 0)}
            icon="bag-shopping"
            href="/admin/orders?range=30d"
          />
          <StatCard
            label="Open quotes"
            value={String(openQuotes?.length ?? 0)}
            icon="paper-plane"
            href="/admin/quotes?status=new,in_progress"
          />
          <StatCard
            label="New subscribers"
            value={String(newSubs?.length ?? 0)}
            icon="envelope-open-text"
            href="/admin/newsletter"
          />
        </div>

        <AdminRevenueChart orders={recentOrders ?? []} />

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
              <h2 className="font-display text-lg font-bold">Recent orders</h2>
              <Link href="/admin/orders" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-ink/10">
              {(recentOrders ?? []).slice(0, 6).map((o) => (
                <li key={o.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-display font-semibold text-ink hover:text-primary"
                    >
                      #{o.id.slice(0, 8).toUpperCase()}
                    </Link>
                    <p className="text-xs text-ink-mute">{o.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono">{formatMoneyCents(o.total_cents)}</p>
                    <p className="text-xs text-ink-mute">{o.status.replace(/_/g, " ")}</p>
                  </div>
                </li>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <li className="px-5 py-8 text-center text-ink-mute text-sm">No orders yet.</li>
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
              <h2 className="font-display text-lg font-bold">Open quote requests</h2>
              <Link href="/admin/quotes" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <ul className="divide-y divide-ink/10">
              {(openQuotes ?? []).slice(0, 6).map((q) => (
                <li key={q.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-display font-semibold text-ink">
                      {q.full_name ?? q.email}
                    </p>
                    <p className="text-xs text-ink-mute">
                      {q.est_quantity?.toLocaleString() ?? "—"} units
                    </p>
                  </div>
                  <Link
                    href={`/admin/quotes/${q.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    Reply
                  </Link>
                </li>
              ))}
              {(!openQuotes || openQuotes.length === 0) && (
                <li className="px-5 py-8 text-center text-ink-mute text-sm">
                  No open quote requests.
                </li>
              )}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  href,
}: {
  label: string;
  value: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative rounded-lg border border-ink/10 bg-white p-5 shadow-press hover:border-primary hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono uppercase tracking-widest text-ink-mute">{label}</p>
        <Icon icon={icon as never} className="text-primary" />
      </div>
      <p className="mt-3 font-display text-3xl font-black text-ink">{value}</p>
      <Icon
        icon="arrow-right"
        className="absolute right-4 bottom-4 text-ink-mute opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  );
}
