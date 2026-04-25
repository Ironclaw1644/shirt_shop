"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { sendInvoiceForOrder } from "@/lib/orders/sendInvoice";
import type { OrderStatus } from "@/types/supabase";

const statuses = [
  "received","in_proof","approved","in_production","shipped","delivered","cancelled",
] as const;

async function logActivity(eventType: string, metadata: Record<string, unknown>) {
  try {
    const supa = await getSupabaseServerClient();
    const { data: { user } } = await supa.auth.getUser();
    await supa
      .from("site_activity")
      .insert({
        event_type: eventType,
        path: null,
        user_id: user?.id ?? null,
        session_id: null,
        metadata: metadata as never,
      });
  } catch {
    // best-effort
  }
}

const bulkStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(200),
  status: z.enum(statuses),
});

export async function bulkUpdateStatus(input: { ids: string[]; status: string }) {
  const parsed = bulkStatusSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid payload");
  const supa = await getSupabaseServerClient();
  const { error } = await supa
    .from("orders")
    .update({ status: parsed.data.status as OrderStatus, updated_at: new Date().toISOString() })
    .in("id", parsed.data.ids);
  if (error) throw error;
  await Promise.all(
    parsed.data.ids.map((id) =>
      logActivity("admin_status_changed", { orderId: id, newStatus: parsed.data.status, bulk: true }),
    ),
  );
  revalidatePath("/admin/orders");
  return { count: parsed.data.ids.length };
}

const bulkInvoiceSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(100),
});

export async function bulkEmailInvoice(input: { ids: string[] }) {
  const parsed = bulkInvoiceSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid payload");
  const results = await Promise.allSettled(
    parsed.data.ids.map((id) => sendInvoiceForOrder(id)),
  );
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.length - ok;
  await Promise.all(
    parsed.data.ids.map((id) => logActivity("admin_invoice_emailed", { orderId: id, bulk: true })),
  );
  revalidatePath("/admin/orders");
  return { ok, failed };
}
