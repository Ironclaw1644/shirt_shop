import { NextResponse, type NextRequest } from "next/server";
import Stripe from "stripe";
import { STRIPE_ENABLED, getStripe } from "@/lib/stripe/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/resend/send";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!STRIPE_ENABLED) {
    return NextResponse.json({ ok: false, disabled: true });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET not set" }, { status: 500 });
  }
  const stripe = getStripe();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "no signature" }, { status: 400 });
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    return NextResponse.json(
      { error: `Signature verify failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  const service = getSupabaseServiceRoleClient();

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        await service
          .from("orders")
          .update({ status: "approved", stripe_payment_intent: pi.id })
          .eq("id", orderId);
        const { data: order } = await service
          .from("orders")
          .select("*, order_items(*)")
          .eq("id", orderId)
          .single();
        if (order) {
          await sendOrderConfirmationEmail({
            email: order.email,
            orderId: order.id,
            totalCents: order.total_cents,
            items: (order.order_items ?? []) as never,
          }).catch(() => null);
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      const orderId = pi.metadata?.order_id;
      if (orderId) {
        await service.from("orders").update({ status: "cancelled" }).eq("id", orderId);
      }
      break;
    }
    case "charge.refunded": {
      // TODO: reconcile refunds with the order
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
