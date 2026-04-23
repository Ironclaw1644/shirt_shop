import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default async function DesignsPage() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: designs } = await supa
    .from("customer_designs")
    .select("id, name, preview_url, created_at, product_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <Eyebrow tone="crimson">Saved designs</Eyebrow>
      <h1 className="heading-display mt-2 text-4xl">Designs</h1>

      <div className="mt-8">
        {!designs || designs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
            <Icon icon="feather" className="text-3xl text-ink-mute" />
            <p className="mt-3 font-display font-semibold">No saved designs yet.</p>
            <p className="mt-1 text-sm text-ink-mute">
              Designs you save in the Designer appear here.
            </p>
            <Button asChild className="mt-4">
              <Link href="/">Browse products to customize</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {designs.map((d) => (
              <div key={d.id} className="rounded-lg border border-ink/10 bg-card overflow-hidden shadow-press">
                <div className="aspect-square bg-paper-warm">
                  {d.preview_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={d.preview_url} alt="" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-display font-semibold">
                    {d.name ?? "Untitled design"}
                  </p>
                  <p className="text-xs text-ink-mute">
                    {new Date(d.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
