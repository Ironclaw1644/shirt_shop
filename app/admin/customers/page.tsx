import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import Link from "next/link";

export default async function AdminCustomersList() {
  const supa = await getSupabaseServerClient();
  const { data } = await supa
    .from("profiles")
    .select("id, email, full_name, company, tags, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <div>
      <AdminPageHeader title="Customers" subtitle="Every signed-in customer with their tags and company." />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-lg border border-ink/10 bg-white overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Company</th>
                <th className="text-left px-4 py-3">Tags</th>
                <th className="text-left px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-ink/10 hover:bg-paper-warm">
                  <td className="px-4 py-3 font-display font-semibold">
                    <Link href={`/admin/customers/${p.id}`} className="text-primary hover:underline">
                      {p.full_name ?? "—"}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{p.email}</td>
                  <td className="px-4 py-3">{p.company ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{(p.tags ?? []).join(", ")}</td>
                  <td className="px-4 py-3 text-ink-mute">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {(!data || data.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-mute">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
