"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const productSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  short_description: z.string().optional(),
  description: z.string().optional(),
  base_price: z.string().optional(),
  min_qty: z.coerce.number().int().positive().default(1),
  lead_time_days: z.coerce.number().int().min(0).default(5),
  status: z.enum(["draft", "active", "archived"]),
  price_status: z.enum(["confirmed", "placeholder", "quote"]),
  brand: z.string().optional(),
  decoration_methods: z.string().optional(),
});

export async function saveProduct(
  mode: "create" | "edit",
  productId: string | null,
  formData: FormData,
) {
  const parsed = productSchema.parse(Object.fromEntries(formData));
  const base_price_cents = parsed.base_price ? Math.round(parseFloat(parsed.base_price) * 100) : null;
  const decoration_methods =
    parsed.decoration_methods
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

  const supa = await getSupabaseServerClient();
  if (mode === "create") {
    const { data, error } = await supa
      .from("products")
      .insert({
        title: parsed.title,
        slug: parsed.slug,
        short_description: parsed.short_description ?? null,
        description: parsed.description ?? null,
        base_price_cents,
        min_qty: parsed.min_qty,
        lead_time_days: parsed.lead_time_days,
        status: parsed.status,
        price_status: parsed.price_status,
        brand: parsed.brand ?? null,
        decoration_methods,
      })
      .select("id, slug")
      .single();
    if (error) throw error;
    revalidatePath("/admin/products");
    return data;
  }

  if (!productId) throw new Error("Missing product id for edit");
  const { data, error } = await supa
    .from("products")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      short_description: parsed.short_description ?? null,
      description: parsed.description ?? null,
      base_price_cents,
      min_qty: parsed.min_qty,
      lead_time_days: parsed.lead_time_days,
      status: parsed.status,
      price_status: parsed.price_status,
      brand: parsed.brand ?? null,
      decoration_methods,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select("id, slug")
    .single();
  if (error) throw error;
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  return data;
}
