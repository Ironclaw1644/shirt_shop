import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "node:crypto";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendNewsletterWelcomeEmail } from "@/lib/resend/send";
import { siteConfig } from "@/lib/site-config";

const schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  let body: unknown;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    body = await req.json();
  } else {
    const fd = await req.formData();
    body = Object.fromEntries(fd.entries());
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const svc = getSupabaseServiceRoleClient();
  const confirmToken = crypto.randomBytes(20).toString("hex");

  const { error } = await svc
    .from("newsletter_subscribers")
    .upsert(
      {
        email: parsed.data.email,
        full_name: parsed.data.name ?? null,
        confirm_token: confirmToken,
      },
      { onConflict: "email" },
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const confirmUrl = `${siteConfig.url}/api/newsletter/confirm?token=${confirmToken}&email=${encodeURIComponent(parsed.data.email)}`;
  await sendNewsletterWelcomeEmail({
    email: parsed.data.email,
    confirmUrl,
  }).catch(() => null);

  try {
    await svc.from("site_activity").insert({
      event_type: "newsletter_signup",
      path: "/api/newsletter",
      user_id: null,
      session_id: null,
      metadata: { email: parsed.data.email } as never,
    });
  } catch {
    // best-effort
  }

  return NextResponse.json({ ok: true });
}
