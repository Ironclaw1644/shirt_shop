import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";

export default async function AddressesPage() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: addrs } = await supa
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false });

  return (
    <div>
      <Eyebrow tone="ink">Addresses</Eyebrow>
      <h1 className="heading-display mt-2 text-3xl sm:text-4xl">Shipping addresses</h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(addrs ?? []).map((a) => (
          <div key={a.id} className="rounded-lg border border-ink/10 bg-card p-5 shadow-press">
            <p className="font-display font-semibold break-words">{a.label ?? a.full_name ?? "Address"}</p>
            <p className="mt-1 text-sm text-ink-soft break-words">
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}
            </p>
            <p className="text-sm text-ink-soft break-words">
              {a.city}, {a.region} {a.postal_code} · {a.country}
            </p>
          </div>
        ))}
        {(!addrs || addrs.length === 0) && (
          <div className="sm:col-span-2 rounded-lg border border-dashed border-ink/20 bg-paper-warm p-6 sm:p-10 text-center">
            <Icon icon="map-pin" className="text-3xl text-ink-mute" />
            <p className="mt-3 text-ink-mute">No addresses on file. Add one at checkout.</p>
          </div>
        )}
      </div>
    </div>
  );
}
