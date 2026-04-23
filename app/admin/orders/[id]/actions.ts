"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/types/supabase";

const statuses = [
  "received","in_proof","approved","in_production","shipped","delivered","cancelled",
] as const;

const schema = z.object({
  id: z.string().uuid(),
  status: z.enum(statuses),
});

export async function updateOrderStatus(formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error("Invalid payload");
  const supa = await getSupabaseServerClient();
  const { error } = await supa
    .from("orders")
    .update({ status: parsed.data.status as OrderStatus, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  if (error) throw error;
  revalidatePath(`/admin/orders/${parsed.data.id}`);
}
