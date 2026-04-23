import { AdminPageHeader } from "@/components/admin/page-header";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="New product"
        subtitle="Set core details now, then add variants, tiers, and generated imagery from the product page."
      />
      <div className="p-6 sm:p-8 max-w-3xl">
        <ProductForm mode="create" />
      </div>
    </div>
  );
}
