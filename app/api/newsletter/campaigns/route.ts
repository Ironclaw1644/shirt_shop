import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/getSessionProfile";

const schema = z.object({
  subject: z.string().min(3),
  preview_text: z.string().optional(),
  body_html: z.string().min(10),
});

export async function POST(req: Request) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const supa = await getSupabaseServerClient();
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
