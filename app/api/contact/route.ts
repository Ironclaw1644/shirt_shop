import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { getResend, RESEND_ENABLED, ADMIN_EMAIL, FROM_EMAIL } from "@/lib/resend/client";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().optional(),
  message: z.string().min(3).max(4000),
});

export async function POST(req: Request) {
  const fd = await req.formData();
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const svc = getSupabaseServiceRoleClient();
  await svc.from("site_activity").insert({
    event_type: "contact_submission",
    metadata: parsed.data as never,
  });

  if (RESEND_ENABLED) {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: `Georgia Print Hub <${FROM_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: parsed.data.email,
        subject: `[GAPH Contact] ${parsed.data.subject ?? parsed.data.name}`,
        text: `From ${parsed.data.name} <${parsed.data.email}>\n\n${parsed.data.message}`,
      });
    } catch (err) {
      console.error("Resend contact send failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
