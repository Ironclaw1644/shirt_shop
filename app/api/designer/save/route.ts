import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const schema = z.object({
  productSlug: z.string().optional(),
  designJson: z.unknown(),
  previewDataUrl: z.string().startsWith("data:image/"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const svc = getSupabaseServiceRoleClient();

  // extract base64 image
  const m = parsed.data.previewDataUrl.match(/^data:(.+?);base64,(.+)$/);
  let previewUrl: string | null = null;
  if (m) {
    const buf = Buffer.from(m[2], "base64");
    const path = `designs/${user.id}/${Date.now()}.png`;
    const { error: upErr } = await svc.storage
      .from("gaph-artwork")
      .upload(path, buf, { contentType: m[1], upsert: true });
    if (!upErr) {
      const { data } = await svc.storage.from("gaph-artwork").createSignedUrl(path, 60 * 60 * 24 * 7);
      previewUrl = data?.signedUrl ?? null;
    }
  }

  // resolve product_id if provided
  let productId: string | null = null;
  if (parsed.data.productSlug) {
    const { data: p } = await supa.from("products").select("id").eq("slug", parsed.data.productSlug).maybeSingle();
    productId = p?.id ?? null;
  }

  const { data, error } = await svc
    .from("customer_designs")
    .insert({
      user_id: user.id,
      product_id: productId,
      design_json: parsed.data.designJson as never,
      preview_url: previewUrl,
      name: parsed.data.name ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, previewUrl });
}
