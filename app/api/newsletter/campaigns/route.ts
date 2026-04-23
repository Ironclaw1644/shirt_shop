import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  subject: z.string().min(3),
  preview_text: z.string().optional(),
  body_html: z.string().min(10),
});

export async function POST(req: Request) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: profile } = await supa.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const fd = await req.formData();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { error, data } = await supa
    .from("newsletter_campaigns")
    .insert({
      subject: parsed.data.subject,
      preview_text: parsed.data.preview_text ?? null,
      body_html: parsed.data.body_html,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}
