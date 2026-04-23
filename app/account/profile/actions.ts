"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const full_name = (formData.get("full_name") as string) ?? null;
  const company = (formData.get("company") as string) ?? null;
  const phone = (formData.get("phone") as string) ?? null;

  await supa.from("profiles").update({ full_name, company, phone }).eq("id", user.id);
  revalidatePath("/account/profile");
}
