import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";

export default async function AdminAudit() {
  const supa = await getSupabaseServerClient();
  const { data: entries } = await supa
    .from("audit_log")
    .select("id, action, entity_type, entity_id, admin_user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  return (
    <div>
      <AdminPageHeader title="Audit log" subtitle="Every admin-level write is recorded here." />
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="text-left px-4 py-3">When</th>
                <th className="text-left px-4 py-3">Action</th>
                <th className="text-left px-4 py-3">Entity</th>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">By</th>
              </tr>
            </thead>
            <tbody>
              {(entries ?? []).map((e) => (
                <tr key={e.id} className="border-t border-ink/10">
                  <td className="px-4 py-2 font-mono text-xs text-ink-mute">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{e.action}</td>
                  <td className="px-4 py-2">{e.entity_type ?? "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs">{e.entity_id ?? "—"}</td>
                  <td className="px-4 py-2 text-ink-mute text-xs">{e.admin_user_id?.slice(0, 8) ?? "—"}</td>
                </tr>
              ))}
              {(!entries || entries.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink-mute">
                    No audit activity yet.
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
