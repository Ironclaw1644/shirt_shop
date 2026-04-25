import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents } from "@/lib/utils/money";

export default async function AccountHome() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: orders } = await supa
    .from("orders")
    .select("id, status, total_cents, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <Eyebrow tone="crimson">Your account</Eyebrow>
        <h1 className="heading-display mt-2 text-3xl sm:text-4xl">Welcome back.</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon icon="bag-shopping" className="text-primary" /> Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-mute">Track production, proofs, and shipping.</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/account/orders">View orders</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon icon="feather" className="text-accent-700" /> Saved designs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-mute">Reuse your designs across products.</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/account/designs">View designs</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Icon icon="paper-plane" className="text-ink" /> Quick reorder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-ink-mute">One-click reorder your favorites.</p>
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/">Browse catalog</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-2xl">Recent orders</h2>
          <Link href="/account/orders" className="text-sm font-medium text-primary hover:underline">
            View all →
          </Link>
        </div>

        {!orders || orders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-6 sm:p-10 text-center">
            <p className="text-ink-mute">You have no orders yet.</p>
            <Button asChild className="mt-3">
              <Link href="/">Browse the catalog</Link>
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-ink/10 rounded-lg border border-ink/10 bg-card overflow-hidden">
            {orders.map((o) => (
              <Link
                href={`/account/orders/${o.id}`}
                key={o.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-4 hover:bg-surface transition-colors"
              >
                <div className="min-w-0">
                  <p className="font-display font-semibold text-ink">
                    Order #{o.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-ink-mute">
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                  <Badge variant="paper">{o.status.replace(/_/g, " ")}</Badge>
                  <span className="font-mono font-semibold whitespace-nowrap">
                    {formatMoneyCents(o.total_cents)}
                  </span>
                  <Icon icon="arrow-right" className="text-ink-mute hidden sm:inline" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
