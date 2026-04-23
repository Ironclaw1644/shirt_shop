import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { quoteRequestSchema } from "@/lib/validators/quote";
import { sendQuoteReceivedEmail } from "@/lib/resend/send";

export async function POST(req: Request) {
  const parsed = quoteRequestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  // honeypot — reject silently to throw off bots
  if (parsed.data.hp) return NextResponse.json({ ok: true });

  const service = getSupabaseServiceRoleClient();
  const { data, error } = await service
    .from("quote_requests")
    .insert({
      email: parsed.data.email,
      full_name: parsed.data.fullName,
      company: parsed.data.company ?? null,
      phone: parsed.data.phone ?? null,
      est_quantity: parsed.data.estQuantity,
      in_hands_date: parsed.data.inHandsDate || null,
      decoration: parsed.data.decoration ?? null,
      message: parsed.data.message ?? null,
      files: parsed.data.files,
      product_refs: [
        { summary: parsed.data.productSummary },
      ] as never,
      status: "new",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await sendQuoteReceivedEmail({
    email: parsed.data.email,
    fullName: parsed.data.fullName,
    product: parsed.data.productSummary,
    quantity: parsed.data.estQuantity,
  }).catch(() => null);

  return NextResponse.json({ ok: true, id: data.id });
}
