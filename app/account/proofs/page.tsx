import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Icon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

export default async function ProofsPage() {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: proofs } = await supa
    .from("proofs")
    .select("id, url, status, version, created_at, order_items(order_id, title_snapshot)")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <Eyebrow tone="crimson">Digital proofs</Eyebrow>
      <h1 className="heading-display mt-2 text-4xl">Your proofs</h1>

      {!proofs || proofs.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-ink/20 bg-paper-warm p-10 text-center">
          <Icon icon="image" className="text-3xl text-ink-mute" />
          <p className="mt-3 text-ink-mute">
            No proofs yet. When your order reaches the proof stage, they&rsquo;ll appear here.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {proofs.map((p) => {
            const item = Array.isArray(p.order_items) ? p.order_items[0] : p.order_items;
            return (
              <div key={p.id} className="rounded-lg border border-ink/10 bg-card overflow-hidden shadow-press">
                <div className="aspect-square bg-paper-warm">
                  {p.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.url} alt="" className="h-full w-full object-contain" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-display font-semibold line-clamp-1">
                    {item?.title_snapshot ?? "Proof"}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge
                      variant={
                        p.status === "approved"
                          ? "success"
                          : p.status === "changes_requested"
                            ? "warning"
                            : "paper"
                      }
                    >
                      {p.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs text-ink-mute">v{p.version}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
