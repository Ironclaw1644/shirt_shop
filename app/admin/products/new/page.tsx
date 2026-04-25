import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const supa = await getSupabaseServerClient();
  const { data: categories } = await supa
    .from("categories")
    .select("id, slug, name, parent_id")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <AdminPageHeader
        title="New product"
        subtitle="Set core details now. Tiers, variants, and imagery are editable below."
      />
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
        <ProductForm mode="create" categories={categories ?? []} />
      </div>
    </div>
  );
}
