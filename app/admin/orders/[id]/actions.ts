"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getSessionProfile, requireStaff } from "@/lib/auth/getSessionProfile";
import { sendInvoiceForOrder } from "@/lib/orders/sendInvoice";
import type { OrderStatus } from "@/types/supabase";

const statuses = [
  "received","in_proof","approved","in_production","shipped","delivered","cancelled",
] as const;

async function logActivity(eventType: string, metadata: Record<string, unknown>) {
  try {
    const supa = await getSupabaseServerClient();
    const { user } = await getSessionProfile();
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
    // best-effort — never block the parent action
  }
}

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(statuses),
});

export async function updateOrderStatus(formData: FormData) {
  if (!(await requireStaff())) throw new Error("Forbidden");
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid payload");
  const supa = await getSupabaseServerClient();
  const { error } = await supa
    .from("orders")
    .update({ status: parsed.data.status as OrderStatus, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  if (error) throw error;
  await logActivity("admin_status_changed", {
    orderId: parsed.data.id,
    newStatus: parsed.data.status,
  });
  revalidatePath(`/admin/orders/${parsed.data.id}`);
}

const invoiceSchema = z.object({
  id: z.string().uuid(),
  notes: z.string().optional(),
});

export async function emailInvoice(formData: FormData) {
  if (!(await requireStaff())) throw new Error("Forbidden");
  const parsed = invoiceSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid payload");
  await sendInvoiceForOrder(parsed.data.id, parsed.data.notes || undefined);
  await logActivity("admin_invoice_emailed", { orderId: parsed.data.id });
  revalidatePath(`/admin/orders/${parsed.data.id}`);
}

const messageSchema = z.object({
  id: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

export async function postOrderMessage(formData: FormData) {
  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid payload");
  const session = await requireStaff();
  if (!session) throw new Error("Forbidden");
  const user = session.user!;
  const supa = await getSupabaseServerClient();
  const { error } = await supa.from("order_messages").insert({
    order_id: parsed.data.id,
    author_role: "admin" as never,
    author_id: user.id,
    body: parsed.data.body,
    attachments: [] as never,
  });
  if (error) throw error;
  await logActivity("admin_replied", { orderId: parsed.data.id });
  revalidatePath(`/admin/orders/${parsed.data.id}`);
}
