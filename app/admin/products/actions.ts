"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const placementZoneSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  widthIn: z.coerce.number().positive(),
  heightIn: z.coerce.number().positive(),
});

const tierSchema = z.object({
  id: z.string().uuid().optional(),
  min_qty: z.coerce.number().int().positive(),
  max_qty: z.coerce.number().int().positive().nullable().optional(),
  unit_price_cents: z.coerce.number().int().nonnegative(),
});

const variantSchema = z.object({
  id: z.string().uuid().optional(),
  sku: z.string().min(1),
  options: z.record(z.string(), z.string()).default({}),
  price_cents: z.coerce.number().int().nonnegative().nullable().optional(),
  inventory_tracked: z.boolean().default(false),
  stock_qty: z.coerce.number().int().nonnegative().default(0),
});

const productPayload = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  short_description: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  base_price_cents: z.coerce.number().int().nullable().optional(),
  min_qty: z.coerce.number().int().positive().default(1),
  lead_time_days: z.coerce.number().int().min(0).default(5),
  status: z.enum(["draft", "active", "archived"]),
  price_status: z.enum(["confirmed", "placeholder", "quote"]),
  brand: z.string().nullable().optional(),
  decoration_methods: z.array(z.string()).default([]),
  badges: z.array(z.string()).default([]),
  category_id: z.string().uuid().nullable().optional(),
  subcategory_id: z.string().uuid().nullable().optional(),
  images: z.array(z.string()).default([]),
  placement_zones: z.array(placementZoneSchema).default([]),
  options: z.record(z.string(), z.array(z.string())).default({}),
  seo_meta: z.record(z.string(), z.unknown()).default({}),
  tiers: z.array(tierSchema).default([]),
  variants: z.array(variantSchema).default([]),
});

export type ProductPayload = z.infer<typeof productPayload>;

export async function saveProduct(
  mode: "create" | "edit",
  productId: string | null,
  payload: unknown,
) {
  const parsed = productPayload.parse(payload);
  const supa = await getSupabaseServerClient();

  const productRow = {
    title: parsed.title,
    slug: parsed.slug,
    short_description: parsed.short_description ?? null,
    description: parsed.description ?? null,
    base_price_cents: parsed.base_price_cents ?? null,
    min_qty: parsed.min_qty,
    lead_time_days: parsed.lead_time_days,
    status: parsed.status,
    price_status: parsed.price_status,
    brand: parsed.brand ?? null,
    decoration_methods: parsed.decoration_methods,
    badges: parsed.badges,
    category_id: parsed.category_id ?? null,
    subcategory_id: parsed.subcategory_id ?? null,
    images: parsed.images,
    placement_zones: parsed.placement_zones as never,
    options: parsed.options as never,
    seo_meta: parsed.seo_meta as never,
  };

  let id = productId;
  if (mode === "create") {
    const { data, error } = await supa
      .from("products")
      .insert(productRow)
      .select("id, slug")
      .single();
    if (error) throw error;
    id = data.id;
  } else {
    if (!productId) throw new Error("Missing product id for edit");
    const { error } = await supa
      .from("products")
      .update({ ...productRow, updated_at: new Date().toISOString() })
      .eq("id", productId);
    if (error) throw error;
  }

  if (!id) throw new Error("Lost product id after upsert");

  // Reset + insert tiers
  await supa.from("price_tiers").delete().eq("product_id", id);
  if (parsed.tiers.length) {
    const { error } = await supa.from("price_tiers").insert(
      parsed.tiers.map((t) => ({
        product_id: id,
        min_qty: t.min_qty,
        max_qty: t.max_qty ?? null,
        unit_price_cents: t.unit_price_cents,
      })),
    );
    if (error) throw error;
  }

  // Reset + insert variants (simpler than diffing for now; small N)
  await supa.from("product_variants").delete().eq("product_id", id);
  if (parsed.variants.length) {
    const { error } = await supa.from("product_variants").insert(
      parsed.variants.map((v) => ({
        product_id: id,
        sku: v.sku,
        options: v.options as never,
        price_cents: v.price_cents ?? null,
        inventory_tracked: v.inventory_tracked,
        stock_qty: v.stock_qty,
      })),
    );
    if (error) throw error;
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { id, slug: parsed.slug };
}

export async function deleteProduct(productId: string) {
  const supa = await getSupabaseServerClient();
  const { error } = await supa.from("products").delete().eq("id", productId);
  if (error) throw error;
  revalidatePath("/admin/products");
}
