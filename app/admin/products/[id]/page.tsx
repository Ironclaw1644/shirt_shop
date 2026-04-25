import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";
import { Badge } from "@/components/ui/badge";

export default async function AdminProductEdit({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = await getSupabaseServerClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supa
      .from("products")
      .select("*, price_tiers(id, min_qty, max_qty, unit_price_cents)")
      .eq("id", id)
      .maybeSingle(),
    supa
      .from("categories")
      .select("id, slug, name, parent_id")
      .order("sort_order", { ascending: true }),
  ]);
  if (!product) return notFound();

  return (
    <div>
      <AdminPageHeader
        title={product.title}
        actions={
          <Badge variant={product.status === "active" ? "success" : "paper"}>
            {product.status}
          </Badge>
        }
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl">
        <ProductForm mode="edit" product={product as never} categories={categories ?? []} />
      </div>
    </div>
  );
}
