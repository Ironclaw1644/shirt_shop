import Link from "next/link";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { formatMoneyCents } from "@/lib/utils/money";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

export default async function AdminProductsList() {
  const supa = await getSupabaseServerClient();
  const { data: products } = await supa
    .from("products")
    .select("id, slug, title, base_price_cents, price_status, status, min_qty, created_at, brand")
    .order("created_at", { ascending: false })
    .limit(200);
  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle="Create and manage SKUs. Generate hero images with Nano Banana 2."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              <Icon icon="bolt" /> New product
            </Link>
          </Button>
        }
      />
      <div className="p-6 sm:p-8">
        <div className="rounded-lg border border-ink/10 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
              <tr>
                <th className="text-left px-4 py-3">Title</th>
                <th className="text-left px-4 py-3">Brand</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Base price</th>
                <th className="text-right px-4 py-3">Min qty</th>
              </tr>
            </thead>
            <tbody>
              {(products ?? []).map((p) => (
                <tr key={p.id} className="border-t border-ink/10 hover:bg-paper-warm transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-display font-semibold text-primary hover:underline">
                      {p.title}
                    </Link>
                    <div className="text-xs text-ink-mute font-mono">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">{p.brand ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "active" ? "success" : "paper"}>{p.status}</Badge>
                    {p.price_status === "placeholder" && (
                      <Badge variant="warning" className="ml-1">placeholder</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMoneyCents(p.base_price_cents ?? null)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{p.min_qty}</td>
                </tr>
              ))}
              {(!products || products.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-ink-mute">No products yet — run `npm run db:seed`.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
