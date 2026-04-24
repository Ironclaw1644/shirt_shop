import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateSettings } from "./actions";
import { Icon } from "@/components/ui/icon";

export default async function AdminSettings() {
  const supa = await getSupabaseServerClient();
  const { data } = await supa.from("settings").select("*").eq("id", true).maybeSingle();

  const integrations = [
    { label: "Supabase", ok: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { label: "Resend", ok: !!process.env.RESEND_API_KEY },
    { label: "Google Gemini", ok: !!process.env.GOOGLE_API_KEY },
  ];

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Business info, shipping, tax, and feature flags." />
      <div className="p-6 sm:p-8 grid gap-6 lg:grid-cols-[1fr,360px]">
        <form action={updateSettings} className="rounded-lg border border-ink/10 bg-white p-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Business</label>
            <Textarea rows={5} name="business" defaultValue={JSON.stringify(data?.business ?? {}, null, 2)} className="font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Shipping</label>
            <Textarea rows={5} name="shipping" defaultValue={JSON.stringify(data?.shipping ?? {}, null, 2)} className="font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Tax</label>
            <Textarea rows={5} name="tax" defaultValue={JSON.stringify(data?.tax ?? {}, null, 2)} className="font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink-mute mb-1">Feature flags</label>
            <Textarea rows={5} name="flags" defaultValue={JSON.stringify(data?.flags ?? {}, null, 2)} className="font-mono text-xs" />
          </div>
          <Button type="submit">Save settings</Button>
        </form>

        <aside className="rounded-lg border border-ink/10 bg-white p-6">
          <h2 className="font-display text-lg font-bold">Integrations</h2>
          <ul className="mt-3 space-y-2">
            {integrations.map((i) => (
              <li key={i.label} className="flex items-center justify-between text-sm">
                <span>{i.label}</span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-mono ${i.ok ? "text-success" : "text-warning"}`}
                >
                  <Icon icon={i.ok ? "circle-check" : "circle-info"} />
                  {i.ok ? "connected" : "not configured"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-ink-mute">
            Set keys in <code className="rounded bg-paper-warm px-1">.env.local</code> and restart the server.
          </p>
        </aside>
      </div>
    </div>
  );
}
