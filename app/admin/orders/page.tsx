import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { OrdersTable } from "./_orders-table";

function rangeStartIso(range: string | undefined): string | null {
  if (!range || range === "all") return null;
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (range === "today") return new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  if (range === "7d") return new Date(now - 7 * day).toISOString();
  if (range === "30d") return new Date(now - 30 * day).toISOString();
  return null;
}

const SORT_FIELDS = new Set(["created_at", "total_cents"]);

type SP = {
  status?: string;
  q?: string;
  range?: string;
  min_total?: string;
  max_total?: string;
  sort?: string;
  dir?: string;
};

export default async function AdminOrdersList({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const supa = await getSupabaseServerClient();

  const sortField = SORT_FIELDS.has(sp.sort ?? "") ? sp.sort! : "created_at";
  const dir: "asc" | "desc" = sp.dir === "asc" ? "asc" : "desc";

  let query = supa
    .from("orders")
    .select("id, email, total_cents, status, created_at")
    .order(sortField, { ascending: dir === "asc" })
    .limit(200);
  if (sp.status) query = query.eq("status", sp.status as never);
  if (sp.q) query = query.ilike("email", `%${sp.q}%`);
  const since = rangeStartIso(sp.range);
  if (since) query = query.gte("created_at", since);
  const minCents = sp.min_total ? Math.round(parseFloat(sp.min_total) * 100) : null;
  const maxCents = sp.max_total ? Math.round(parseFloat(sp.max_total) * 100) : null;
  if (minCents != null && Number.isFinite(minCents)) query = query.gte("total_cents", minCents);
  if (maxCents != null && Number.isFinite(maxCents)) query = query.lte("total_cents", maxCents);

  const { data: orders } = await query;

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        subtitle="Search, filter, multi-select to bulk-update status or email invoices."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <form method="get" className="flex flex-wrap gap-2 sm:gap-3">
          <input
            id="admin-search"
            name="q"
            defaultValue={sp.q ?? ""}
            placeholder="Search email…"
            className="h-10 w-full sm:w-64 min-w-0 flex-1 sm:flex-none rounded border border-ink/15 bg-white px-3 text-sm focus:border-primary focus:outline-none"
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
          <select
            name="range"
            defaultValue={sp.range ?? "all"}
            className="h-10 rounded border border-ink/15 bg-white px-2 text-sm"
          >
            <option value="all">All time</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
          <input
            name="min_total"
            type="number"
            min="0"
            step="1"
            placeholder="Min $"
            defaultValue={sp.min_total ?? ""}
            className="h-10 w-24 rounded border border-ink/15 bg-white px-2 text-sm"
          />
          <input
            name="max_total"
            type="number"
            min="0"
            step="1"
            placeholder="Max $"
            defaultValue={sp.max_total ?? ""}
            className="h-10 w-24 rounded border border-ink/15 bg-white px-2 text-sm"
          />
          {/* preserve sort across filter submits */}
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          {sp.dir && <input type="hidden" name="dir" value={sp.dir} />}
          <button className="h-10 rounded bg-ink text-paper px-4 text-sm">Filter</button>
        </form>

        <OrdersTable rows={orders ?? []} sort={sortField} dir={dir} />
      </div>
    </div>
  );
}
