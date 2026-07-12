"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { requireStaff } from "@/lib/auth/getSessionProfile";

const schema = z.object({
  id: z.string().uuid(),
  role: z.enum(["customer", "staff", "admin"]),
});

export async function updateUserRole(formData: FormData) {
  if (!(await requireStaff())) throw new Error("Forbidden");
  const parsed = schema.parse(Object.fromEntries(formData));
  const supa = await getSupabaseServerClient();
  const { error } = await supa
    .from("profiles")
    .update({ role: parsed.role, updated_at: new Date().toISOString() })
    .eq("id", parsed.id);
  if (error) throw error;
  revalidatePath("/admin/users");
}
