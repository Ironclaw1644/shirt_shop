import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";

function rangeStartIso(range: string | undefined): string | null {
  if (!range || range === "all") return null;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (range === "today") return new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  if (range === "7d") return new Date(now - 7 * day).toISOString();
  if (range === "30d") return new Date(now - 30 * day).toISOString();
  return null;
}

const EVENT_TONES: Record<string, string> = {
  pageview: "bg-paper-warm text-ink-mute border-ink/10",
  contact_submission: "bg-accent/15 text-accent-700 border-accent/30",
  order_created: "bg-primary/10 text-primary border-primary/30",
  quote_submitted: "bg-blue-100 text-blue-800 border-blue-200",
  newsletter_signup: "bg-emerald-100 text-emerald-800 border-emerald-200",
  admin_status_changed: "bg-amber-100 text-amber-800 border-amber-200",
  admin_invoice_emailed: "bg-amber-100 text-amber-800 border-amber-200",
  admin_replied: "bg-amber-100 text-amber-800 border-amber-200",
};

function eventTone(t: string): string {
  return EVENT_TONES[t] ?? "bg-ink/5 text-ink-soft border-ink/10";
}

function dayKey(iso: string): string {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
}

function dayLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getTime() - 86400000);
  const isToday = d.toDateString() === today.toDateString();
  const isYesterday = d.toDateString() === yesterday.toDateString();
  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

type SP = { q?: string; type?: string; range?: string };

type EventRow = {
  id: number;
  event_type: string;
  path: string | null;
  session_id: string | null;
  metadata: unknown;
  created_at: string;
};

export default async function AdminActivity({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const supa = await getSupabaseServerClient();

  let query = supa
    .from("site_activity")
    .select("id, event_type, path, session_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(300);

  if (sp.type) query = query.eq("event_type", sp.type);
  if (sp.q) query = query.ilike("path", `%${sp.q}%`);
  const since = rangeStartIso(sp.range);
  if (since) query = query.gte("created_at", since);

  const { data: events } = await query;
  const eventList = (events ?? []) as EventRow[];

  // distinct event types for filter dropdown (from current result set)
  const distinctTypes = Array.from(new Set(eventList.map((e) => e.event_type))).sort();

  // stat strip
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  const weekStart = Date.now() - 7 * 86400000;
  const eventsToday = eventList.filter((e) => new Date(e.created_at).getTime() >= todayStart).length;
  const eventsWeek = eventList.filter((e) => new Date(e.created_at).getTime() >= weekStart).length;
  const counts = new Map<string, number>();
  for (const e of eventList) counts.set(e.event_type, (counts.get(e.event_type) ?? 0) + 1);
  const topType = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];

  // group by day
  const groups: { key: string; label: string; rows: EventRow[] }[] = [];
  let currentKey: string | null = null;
  for (const e of eventList) {
    const k = dayKey(e.created_at);
    if (k !== currentKey) {
      groups.push({ key: k, label: dayLabel(e.created_at), rows: [] });
      currentKey = k;
    }
    groups[groups.length - 1].rows.push(e);
  }

  const range = sp.range ?? "all";
  const chip = (val: string, label: string) => (
    <Link
      href={`?${new URLSearchParams({ ...(sp.q ? { q: sp.q } : {}), ...(sp.type ? { type: sp.type } : {}), range: val }).toString()}`}
      className={`h-8 inline-flex items-center rounded-full px-3 text-xs font-medium transition-colors ${
        range === val
          ? "bg-ink text-paper"
          : "bg-paper-warm border border-ink/10 text-ink-soft hover:border-primary"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div>
      <AdminPageHeader
        title="Site activity"
        subtitle="Page views, conversions, and admin actions. Refreshes on reload."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* stat strip */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Events today" value={String(eventsToday)} />
          <Stat label="Events this week" value={String(eventsWeek)} />
          <Stat label="Top type" value={topType ? `${topType[0]} (${topType[1]})` : "—"} />
        </div>

        {/* filters */}
        <form method="get" className="flex flex-wrap items-center gap-2 sm:gap-3">
          <input
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search path…"
            className="h-10 w-full sm:w-64 min-w-0 flex-1 sm:flex-none rounded border border-ink/15 bg-white px-3 text-sm focus:border-primary focus:outline-none"
          />
          <select
            name="type"
            defaultValue={sp.type ?? ""}
            className="h-10 rounded border border-ink/15 bg-white px-2 text-sm"
          >
            <option value="">All event types</option>
            {distinctTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {sp.range && <input type="hidden" name="range" value={sp.range} />}
          <button className="h-10 rounded bg-ink text-paper px-4 text-sm">Filter</button>
        </form>

        <div className="flex flex-wrap gap-2">
          {chip("today", "Today")}
          {chip("7d", "Last 7 days")}
          {chip("30d", "Last 30 days")}
          {chip("all", "All time")}
        </div>

        {/* day-grouped feed */}
        <div className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          {groups.length === 0 && (
            <div className="px-5 py-12 text-center text-ink-mute text-sm">
              No events match these filters.
            </div>
          )}
          {groups.map((g) => (
            <div key={g.key}>
              <div className="sticky top-0 z-10 bg-paper-warm/95 backdrop-blur border-b border-ink/10 px-5 py-2 text-xs font-mono uppercase tracking-widest text-ink-mute">
                {g.label} · {g.rows.length} event{g.rows.length === 1 ? "" : "s"}
              </div>
              <ul className="divide-y divide-ink/10 text-sm">
                {g.rows.map((e) => (
                  <li key={e.id} className="px-5 py-3">
                    <details className="group">
                      <summary className="flex flex-wrap items-center gap-3 cursor-pointer list-none">
                        <span className="text-ink-mute font-mono text-xs w-16 tabular-nums">
                          {new Date(e.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${eventTone(e.event_type)}`}>
                          {e.event_type}
                        </span>
                        <span className="text-ink-soft truncate flex-1 min-w-0 text-xs">
                          {e.path ?? "—"}
                        </span>
                        <span className="text-ink-mute text-xs hidden group-open:hidden sm:inline">▾</span>
                      </summary>
                      <pre className="mt-2 p-3 rounded bg-paper-warm border border-ink/10 text-[11px] leading-snug overflow-x-auto">
                        {JSON.stringify(e.metadata, null, 2)}
                      </pre>
                    </details>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-ink-mute">
        {label}
      </p>
      <p className="mt-1 font-display text-xl font-bold text-ink truncate">{value}</p>
    </div>
  );
}
