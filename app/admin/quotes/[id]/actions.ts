"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendQuoteReplyEmail } from "@/lib/resend/send";

export async function replyToQuote(formData: FormData) {
  const id = formData.get("id") as string;
  const admin_reply = (formData.get("admin_reply") as string) ?? "";
  const quoted = formData.get("quoted_price") as string | null;
  const quoted_price_cents = quoted ? Math.round(parseFloat(quoted) * 100) : null;

  const supa = await getSupabaseServerClient();
  const { data: quote } = await supa
    .from("quote_requests")
    .update({
      admin_reply,
      quoted_price_cents,
      status: "quoted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("email, full_name")
    .single();

  if (quote) {
    await sendQuoteReplyEmail({
      email: quote.email,
      adminReply: admin_reply,
      totalCents: quoted_price_cents ?? undefined,
    }).catch(() => null);
  }

  revalidatePath(`/admin/quotes/${id}`);
}

export async function convertQuoteToOrder(formData: FormData) {
  const id = formData.get("id") as string;
  const quoted = formData.get("quoted_price") as string | null;
  const quoted_price_cents = quoted ? Math.round(parseFloat(quoted) * 100) : null;
  if (!quoted_price_cents) throw new Error("Quoted price is required to convert to order");

  const supa = await getSupabaseServerClient();
  const { data: quote } = await supa
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .single();
  if (!quote) throw new Error("Quote not found");

  const { data: order } = await supa
    .from("orders")
    .insert({
      user_id: quote.user_id,
      email: quote.email,
      status: "received",
      subtotal_cents: quoted_price_cents,
      tax_cents: 0,
      shipping_cents: 0,
      total_cents: quoted_price_cents,
      notes: `Converted from quote ${id}`,
    })
    .select("id")
    .single();

  if (!order) throw new Error("Failed to create order");

  await supa
    .from("quote_requests")
    .update({
      status: "accepted",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath(`/admin/quotes/${id}`);
  revalidatePath(`/admin/orders/${order.id}`);
}
