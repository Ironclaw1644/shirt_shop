import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function AdminActivity() {
  const supa = await getSupabaseServerClient();
  const { data: events } = await supa
    .from("site_activity")
    .select("id, event_type, path, session_id, created_at")
    .order("created_at", { ascending: false })
    .limit(300);
  const bucket = new Map<string, number>();
  for (const e of events ?? []) bucket.set(e.event_type, (bucket.get(e.event_type) ?? 0) + 1);

  return (
    <div>
      <AdminPageHeader
        title="Site activity"
        subtitle="Anonymous pageviews, contact submissions, and conversion events. Updates on refresh."
      />
      <div className="p-4 sm:p-6 lg:p-8 grid gap-6 lg:grid-cols-[1fr,360px]">
        <section className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <h2 className="font-display text-lg font-bold px-5 py-4 border-b border-ink/10">
            Recent events
          </h2>
          <ul className="divide-y divide-ink/10 max-h-[600px] overflow-y-auto text-sm">
            {(events ?? []).map((e) => (
              <li key={e.id} className="px-5 py-2 flex items-center justify-between font-mono text-xs">
                <span>
                  <span className="text-accent-700 uppercase">{e.event_type}</span>{" "}
                  <span className="text-ink-mute">{e.path ?? ""}</span>
                </span>
                <span className="text-ink-mute">
                  {new Date(e.created_at).toLocaleTimeString()}
                </span>
              </li>
            ))}
            {(!events || events.length === 0) && (
              <li className="px-5 py-10 text-center text-ink-mute">
                No events yet. Beacon writes land here as visitors arrive.
              </li>
            )}
          </ul>
        </section>
        <aside className="rounded-lg border border-ink/10 bg-white p-5">
          <h2 className="font-display text-lg font-bold mb-3">Top event types</h2>
          <ul className="space-y-1 text-sm">
            {Array.from(bucket.entries())
              .sort((a, b) => b[1] - a[1])
              .slice(0, 10)
              .map(([type, count]) => (
                <li key={type} className="flex justify-between">
                  <span>{type}</span>
                  <span className="font-mono">{count}</span>
                </li>
              ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
