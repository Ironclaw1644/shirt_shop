"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function safeParse(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function updateSettings(formData: FormData) {
  const supa = await getSupabaseServerClient();
  const business = safeParse(formData.get("business") as string);
  const shipping = safeParse(formData.get("shipping") as string);
  const tax = safeParse(formData.get("tax") as string);
  const flags = safeParse(formData.get("flags") as string);

  await supa.from("settings").upsert({
    id: true,
    business: business as never,
    shipping: shipping as never,
    tax: tax as never,
    flags: flags as never,
    updated_at: new Date().toISOString(),
  });
  revalidatePath("/admin/settings");
}
