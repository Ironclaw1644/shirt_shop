import { NextResponse } from "next/server";
import { z } from "zod";
import { STRIPE_ENABLED, getStripe } from "@/lib/stripe/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

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

  // insert items
  const itemsInsert = items.map((i) => ({
    order_id: order.id,
    title_snapshot: i.title,
    quantity: i.quantity,
    unit_price_cents: i.unitPriceCents,
    decoration: (i.decoration ?? null) as never,
  }));
  await service.from("order_items").insert(itemsInsert);

  if (!STRIPE_ENABLED) {
    return NextResponse.json({
      disabled: true,
      orderId: order.id,
      message:
        "Stripe keys not configured. Order recorded; checkout will activate when STRIPE_SECRET_KEY is set.",
    });
  }

  try {
    const stripe = getStripe();
    const intent = await stripe.paymentIntents.create({
      amount: total,
      currency: "usd",
      automatic_payment_methods: { enabled: true },
      receipt_email: email,
      metadata: { order_id: order.id },
    });

    await service
      .from("orders")
      .update({ stripe_payment_intent: intent.id })
      .eq("id", order.id);

    return NextResponse.json({ clientSecret: intent.client_secret, orderId: order.id });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
