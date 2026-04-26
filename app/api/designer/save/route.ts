import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const proofSchema = z.object({
  viewKey: z.string(),
  viewLabel: z.string().optional(),
  dataUrl: z.string().startsWith("data:image/"),
});

const schema = z.object({
  productSlug: z.string().optional(),
  designJson: z.unknown(),
  /** Single-view legacy field — kept for the Fabric fallback designer. */
  previewDataUrl: z.string().startsWith("data:image/").nullable().optional(),
  /** Flat composite of all decals at print resolution — for production. */
  artworkPngDataUrl: z.string().startsWith("data:image/").nullable().optional(),
  /**
   * Multi-view proofs — one per side that has a design (front, back, sleeve).
   * The first entry is treated as the primary preview if `previewDataUrl` is
   * not provided.
   */
  proofs: z.array(proofSchema).optional(),
  name: z.string().optional(),
});

async function uploadDataUrl(
  svc: ReturnType<typeof getSupabaseServiceRoleClient>,
  dataUrl: string,
  path: string,
): Promise<string | null> {
  const m = dataUrl.match(/^data:(.+?);base64,(.+)$/);
  if (!m) return null;
  const buf = Buffer.from(m[2], "base64");
  const { error: upErr } = await svc.storage
    .from("gaph-artwork")
    .upload(path, buf, { contentType: m[1], upsert: true });
  if (upErr) return null;
  const { data } = await svc.storage
    .from("gaph-artwork")
    .createSignedUrl(path, 60 * 60 * 24 * 7);
  return data?.signedUrl ?? null;
}

export async function POST(req: Request) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const svc = getSupabaseServiceRoleClient();
  const ts = Date.now();

  // Upload per-view proofs first; whichever uploads the active or first view
  // becomes the row's primary preview_url.
  const proofUrls: Array<{ viewKey: string; viewLabel?: string; previewUrl: string | null }> = [];
  if (parsed.data.proofs?.length) {
    for (const p of parsed.data.proofs) {
      const url = await uploadDataUrl(
        svc,
        p.dataUrl,
        `designs/${user.id}/${ts}-${p.viewKey}.png`,
      );
      proofUrls.push({ viewKey: p.viewKey, viewLabel: p.viewLabel, previewUrl: url });
    }
  }

  let previewUrl: string | null = proofUrls[0]?.previewUrl ?? null;
  if (!previewUrl && parsed.data.previewDataUrl) {
    previewUrl = await uploadDataUrl(svc, parsed.data.previewDataUrl, `designs/${user.id}/${ts}.png`);
  }

  let artworkUrl: string | null = null;
  if (parsed.data.artworkPngDataUrl) {
    artworkUrl = await uploadDataUrl(
      svc,
      parsed.data.artworkPngDataUrl,
      `artwork/${user.id}/${ts}.png`,
    );
  }

  let productId: string | null = null;
  if (parsed.data.productSlug) {
    const { data: p } = await supa
      .from("products")
      .select("id")
      .eq("slug", parsed.data.productSlug)
      .maybeSingle();
    productId = p?.id ?? null;
  }

  // Stash the per-view proof URLs alongside the design JSON so the saved
  // designs page and cart line can render each side later.
  const designJsonWithProofs =
    parsed.data.designJson && typeof parsed.data.designJson === "object"
      ? { ...(parsed.data.designJson as object), proofsByView: proofUrls }
      : parsed.data.designJson;

  const { data, error } = await svc
    .from("customer_designs")
    .insert({
      user_id: user.id,
      product_id: productId,
      design_json: designJsonWithProofs as never,
      preview_url: previewUrl,
      name: parsed.data.name ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    id: data.id,
    previewUrl,
    artworkUrl,
    proofs: proofUrls,
  });
}
