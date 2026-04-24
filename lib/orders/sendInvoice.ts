import "server-only";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";
import { sendInvoiceEmail } from "@/lib/resend/send";

type OrderItemRow = {
  title_snapshot: string;
  quantity: number;
  unit_price_cents: number;
};

export async function sendInvoiceForOrder(orderId: string, notes?: string) {
  const service = getSupabaseServiceRoleClient();
  const { data: order, error } = await service
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    throw new Error(`Order ${orderId} not found`);
  }

  const items = ((order.order_items ?? []) as OrderItemRow[]).map((i) => ({
    title_snapshot: i.title_snapshot,
    quantity: i.quantity,
    unit_price_cents: i.unit_price_cents,
  }));

  return sendInvoiceEmail({
    email: order.email,
    orderId: order.id,
    totalCents: order.total_cents,
    subtotalCents: order.subtotal_cents,
    shippingCents: order.shipping_cents,
    taxCents: order.tax_cents,
    items,
    notes,
  });
}
