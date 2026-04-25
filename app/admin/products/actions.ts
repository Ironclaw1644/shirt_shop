"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/slug";

const tierSchema = z.object({
  id: z.string().uuid().optional(),
  min_qty: z.coerce.number().int().positive(),
  max_qty: z.coerce.number().int().positive().nullable().optional(),
  unit_price_cents: z.coerce.number().int().nonnegative(),
});

const productPayload = z.object({
  title: z.string().min(3),
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
  options: z.record(z.string(), z.array(z.string())).default({}),
  tiers: z.array(tierSchema).default([]),
  // Optional: caller may pass existing seo_meta to preserve fields like heroPromptKey.
  existing_seo_meta: z.record(z.string(), z.unknown()).optional(),
});

export type ProductPayload = z.infer<typeof productPayload>;

async function findUniqueSlug(supa: Awaited<ReturnType<typeof getSupabaseServerClient>>, base: string): Promise<string> {
  let candidate = base;
  let n = 2;
  // tight loop, but bound it for safety
  for (let i = 0; i < 100; i += 1) {
    const { data } = await supa.from("products").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
  return `${base}-${Date.now()}`;
}

function buildSeoMeta(parsed: ProductPayload): Record<string, unknown> {
  const existing = parsed.existing_seo_meta ?? {};
  const meta: Record<string, unknown> = {};
  if (existing.heroPromptKey) meta.heroPromptKey = existing.heroPromptKey;
  meta.title = parsed.title;
  meta.description = parsed.short_description ?? parsed.description?.slice(0, 160) ?? "";
  if (parsed.images[0]) meta.og_image = parsed.images[0];
  return meta;
}

export async function saveProduct(
  mode: "create" | "edit",
  productId: string | null,
  payload: unknown,
) {
  const parsed = productPayload.parse(payload);
  const supa = await getSupabaseServerClient();

  const baseProductRow = {
    title: parsed.title,
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
    options: parsed.options as never,
    seo_meta: buildSeoMeta(parsed) as never,
  };

  let id = productId;
  let resolvedSlug: string;

  if (mode === "create") {
    const baseSlug = slugify(parsed.title) || `product-${Date.now()}`;
    resolvedSlug = await findUniqueSlug(supa, baseSlug);
    const { data, error } = await supa
      .from("products")
      .insert({ ...baseProductRow, slug: resolvedSlug })
      .select("id, slug")
      .single();
    if (error) throw error;
    id = data.id;
    resolvedSlug = data.slug;
  } else {
    if (!productId) throw new Error("Missing product id for edit");
    // Slug is immutable on update; load it for the return value.
    const { data: existing } = await supa
      .from("products")
      .select("slug")
      .eq("id", productId)
      .maybeSingle();
    resolvedSlug = existing?.slug ?? "";
    const { error } = await supa
      .from("products")
      .update({ ...baseProductRow, updated_at: new Date().toISOString() })
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

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { id, slug: resolvedSlug };
}

export async function deleteProduct(productId: string) {
  const supa = await getSupabaseServerClient();
  const { error } = await supa.from("products").delete().eq("id", productId);
  if (error) throw error;
  revalidatePath("/admin/products");
}
