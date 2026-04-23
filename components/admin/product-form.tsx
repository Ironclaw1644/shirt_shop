"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { saveProduct } from "@/app/admin/products/actions";
import type { Database } from "@/types/supabase";

type Product = Database["public"]["Tables"]["products"]["Row"];

export function ProductForm({
  mode,
  product,
}: {
  mode: "create" | "edit";
  product?: Product;
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await saveProduct(mode, product?.id ?? null, fd);
      toast.success("Saved", { description: res.slug });
      router.push(`/admin/products/${res.id}`);
    } catch (err) {
      toast.error("Save failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink/10 bg-white p-6 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Title" name="title" defaultValue={product?.title ?? ""} required />
        <Field label="Slug" name="slug" defaultValue={product?.slug ?? ""} required />
      </div>
      <Field label="Short description" name="short_description" defaultValue={product?.short_description ?? ""} />
      <div>
        <Label className="block mb-1">Description</Label>
        <Textarea rows={5} name="description" defaultValue={product?.description ?? ""} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Base price (USD)" name="base_price" type="number" step="0.01" defaultValue={product ? (product.base_price_cents ?? 0) / 100 : ""} />
        <Field label="Min qty" name="min_qty" type="number" min="1" defaultValue={product?.min_qty ?? 1} />
        <Field label="Lead time (days)" name="lead_time_days" type="number" min="0" defaultValue={product?.lead_time_days ?? 5} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <Label className="block mb-1">Status</Label>
          <select name="status" defaultValue={product?.status ?? "draft"} className="h-11 w-full rounded border border-ink/15 bg-white px-3 text-sm">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
        <div>
          <Label className="block mb-1">Price status</Label>
          <select name="price_status" defaultValue={product?.price_status ?? "confirmed"} className="h-11 w-full rounded border border-ink/15 bg-white px-3 text-sm">
            <option value="confirmed">Confirmed</option>
            <option value="placeholder">Placeholder</option>
            <option value="quote">Quote only</option>
          </select>
        </div>
        <Field label="Brand" name="brand" defaultValue={product?.brand ?? ""} />
      </div>
      <Field label="Decoration methods (comma-separated)" name="decoration_methods" defaultValue={(product?.decoration_methods ?? []).join(", ")} />
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
      </Button>
    </form>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <Label className="block mb-1">{label}</Label>
      <Input {...props} />
    </div>
  );
}
