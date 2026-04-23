import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";

export default async function AdminMedia() {
  const supa = await getSupabaseServerClient();
  const { data: media } = await supa
    .from("media_assets")
    .select("id, url, alt, source, prompt, created_at, tags")
    .order("created_at", { ascending: false })
    .limit(120);

  return (
    <div>
      <AdminPageHeader title="Media library" subtitle="Uploaded and Nano-Banana-generated assets." />
      <div className="p-6 sm:p-8">
        {(!media || media.length === 0) ? (
          <div className="rounded-lg border border-dashed border-ink/20 bg-paper-warm p-12 text-center">
            <p className="font-display font-semibold">No media yet.</p>
            <p className="mt-1 text-sm text-ink-mute">
              Generate from a product page or upload during order intake.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {media.map((m) => (
              <div key={m.id} className="rounded-lg border border-ink/10 bg-white overflow-hidden">
                <div className="aspect-square bg-paper-warm overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.alt ?? ""} className="h-full w-full object-cover" />
                </div>
                <div className="p-2 text-xs">
                  <Badge variant={m.source === "generated" ? "gold" : "paper"}>{m.source}</Badge>
                  {m.prompt && (
                    <p className="mt-1 text-ink-mute line-clamp-2">{m.prompt}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
