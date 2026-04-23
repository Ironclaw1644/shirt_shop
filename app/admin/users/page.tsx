import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { updateUserRole } from "./actions";
import { Badge } from "@/components/ui/badge";

export default async function AdminUsers() {
  const supa = await getSupabaseServerClient();
  const { data: users } = await supa
    .from("profiles")
    .select("id, email, full_name, role, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminPageHeader title="Users & roles" subtitle="Assign admin, staff, or customer roles." />
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Joined</th>
                <th className="text-right px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody>
              {(users ?? []).map((u) => (
                <tr key={u.id} className="border-t border-ink/10">
                  <td className="px-4 py-3 font-display font-semibold">{u.full_name ?? "—"}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3"><Badge variant={u.role === "admin" ? "crimson" : "paper"}>{u.role}</Badge></td>
                  <td className="px-4 py-3 text-ink-mute">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={updateUserRole} className="inline-flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className="h-8 rounded border border-ink/15 bg-white px-2 text-xs">
                        <option value="customer">customer</option>
                        <option value="staff">staff</option>
                        <option value="admin">admin</option>
                      </select>
                      <button className="rounded bg-ink text-paper text-xs px-2 py-1">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
