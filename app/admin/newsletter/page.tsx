import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default async function AdminNewsletter() {
  const supa = await getSupabaseServerClient();
  const [{ data: subs }, { data: campaigns }] = await Promise.all([
    supa
      .from("newsletter_subscribers")
      .select("id, email, full_name, subscribed_at, confirmed_at")
      .order("created_at", { ascending: false })
      .limit(200),
    supa
      .from("newsletter_campaigns")
      .select("id, subject, status, sent_at, stats")
      .order("created_at", { ascending: false }),
  ]);

  const confirmed = (subs ?? []).filter((s) => s.confirmed_at).length;
  const pending = (subs ?? []).length - confirmed;

  return (
    <div>
      <AdminPageHeader
        title="Newsletter"
        subtitle={`${confirmed} confirmed · ${pending} pending double-opt-in`}
        actions={
          <Button asChild>
            <Link href="/admin/newsletter/new">
              <Icon icon="paper-plane" /> New campaign
            </Link>
          </Button>
        }
      />
      <div className="p-6 sm:p-8 grid lg:grid-cols-2 gap-6">
        <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <h2 className="font-display text-lg font-bold px-5 py-4 border-b border-ink/10">
            Subscribers
          </h2>
          <ul className="divide-y divide-ink/10 max-h-[600px] overflow-y-auto">
            {(subs ?? []).map((s) => (
              <li key={s.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{s.email}</p>
                  <p className="text-xs text-ink-mute">{s.full_name ?? "—"}</p>
                </div>
                <span
                  className={`text-xs ${s.confirmed_at ? "text-success" : "text-warning"}`}
                >
                  {s.confirmed_at ? "confirmed" : "pending"}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <h2 className="font-display text-lg font-bold px-5 py-4 border-b border-ink/10">
            Campaigns
          </h2>
          <ul className="divide-y divide-ink/10">
            {(campaigns ?? []).map((c) => (
              <li key={c.id} className="px-5 py-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold">{c.subject}</span>
                  <span className="text-xs text-ink-mute">
                    {c.status}
                    {c.sent_at ? ` · ${new Date(c.sent_at).toLocaleDateString()}` : ""}
                  </span>
                </div>
              </li>
            ))}
            {(!campaigns || campaigns.length === 0) && (
              <li className="px-5 py-10 text-center text-ink-mute text-sm">No campaigns yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
