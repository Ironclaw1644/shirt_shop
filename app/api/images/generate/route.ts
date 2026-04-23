import { NextResponse } from "next/server";
import { z } from "zod";
import { generateImage } from "@/lib/gemini/image";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import sharp from "sharp";

const schema = z.object({
  prompt: z.string().min(20).max(2000),
  aspect: z.string().default("4:3"),
  slug: z.string().min(2).max(80),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: profile } = await supa
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const { base64 } = await generateImage({
      prompt: parsed.data.prompt,
      aspect: parsed.data.aspect,
    });
    const buf = Buffer.from(base64, "base64");
    const webp = await sharp(buf)
      .resize({ width: 1400, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toBuffer();

    const service = getSupabaseServiceRoleClient();
    const filePath = `generated/${parsed.data.slug}-${Date.now()}.webp`;
    const { error: upErr } = await service.storage
      .from("generated")
      .upload(filePath, webp, { contentType: "image/webp", upsert: true });

    if (upErr) throw upErr;

    const { data: publicUrl } = service.storage.from("generated").getPublicUrl(filePath);

    await service.from("media_assets").insert({
      url: publicUrl.publicUrl,
      alt: parsed.data.slug,
      source: "generated",
      prompt: parsed.data.prompt,
      created_by: user.id,
      tags: parsed.data.tags ?? [],
      mime: "image/webp",
    });

    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
