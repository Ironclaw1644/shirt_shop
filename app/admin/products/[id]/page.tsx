import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { GenerateImagePanel } from "@/components/admin/generate-image-panel";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = await getSupabaseServerClient();
  const { data: product } = await supa.from("products").select("*").eq("id", id).maybeSingle();
  if (!product) return notFound();

  return (
    <div>
      <AdminPageHeader
        title={product.title}
        subtitle={`/${product.slug}`}
        actions={<Badge variant={product.status === "active" ? "success" : "paper"}>{product.status}</Badge>}
      />
      <div className="p-6 sm:p-8 grid gap-6 lg:grid-cols-[1fr,360px]">
        <ProductForm mode="edit" product={product} />
        <aside className="space-y-4">
          <GenerateImagePanel slug={product.slug} />
          <div className="rounded-lg border border-ink/10 bg-white p-5">
            <p className="font-display font-bold">Primary image</p>
            {product.images?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt="" className="mt-2 w-full rounded border border-ink/10" />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
