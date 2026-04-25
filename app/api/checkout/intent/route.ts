import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendOrderReceivedEmail, sendAdminNewOrderEmail } from "@/lib/resend/send";

const itemSchema = z.object({
  productSlug: z.string(),
  title: z.string(),
  variant: z.string().optional(),
  unitPriceCents: z.number().int().min(0),
  quantity: z.number().int().min(1),
  decoration: z
    .object({
      method: z.string(),
      placement: z.string().optional(),
      designId: z.string().optional(),
    })
    .optional(),
});

const schema = z.object({
  email: z.string().email(),
  items: z.array(itemSchema).min(1),
  shippingCents: z.number().int().min(0).default(0),
  taxCents: z.number().int().min(0).default(0),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { email, items, shippingCents, taxCents } = parsed.data;

  const subtotal = items.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
  const total = subtotal + shippingCents + taxCents;

  const service = getSupabaseServiceRoleClient();
  const { data: order, error } = await service
    .from("orders")
    .insert({
      email,
      status: "received",
      subtotal_cents: subtotal,
      tax_cents: taxCents,
      shipping_cents: shippingCents,
      total_cents: total,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const itemsInsert = items.map((i) => ({
    order_id: order.id,
    title_snapshot: i.title,
    quantity: i.quantity,
    unit_price_cents: i.unitPriceCents,
    decoration: (i.decoration ?? null) as never,
  }));
  await service.from("order_items").insert(itemsInsert);

  const itemsForEmail = items.map((i) => ({
    title_snapshot: i.title,
    quantity: i.quantity,
    unit_price_cents: i.unitPriceCents,
  }));

  await Promise.allSettled([
    sendOrderReceivedEmail({
      email,
      orderId: order.id,
      totalCents: total,
      items: itemsForEmail,
    }),
    sendAdminNewOrderEmail({
      orderId: order.id,
      customerEmail: email,
      totalCents: total,
      items: itemsForEmail,
    }),
  ]);

  return NextResponse.json({ orderId: order.id });
}
