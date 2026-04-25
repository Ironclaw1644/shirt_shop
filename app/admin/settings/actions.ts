"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

function num(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function str(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function bool(v: FormDataEntryValue | null): boolean {
  return v === "on" || v === "true" || v === "1";
}

function lines(v: FormDataEntryValue | null): string[] {
  if (!v) return [];
  return String(v)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function updateSettings(formData: FormData) {
  const supa = await getSupabaseServerClient();

  const business = {
    name: str(formData.get("business_name")),
    contact_email: str(formData.get("business_contact_email")),
    contact_phone: str(formData.get("business_contact_phone")),
    address_line1: str(formData.get("business_address_line1")),
    address_line2: str(formData.get("business_address_line2")),
    city: str(formData.get("business_city")),
    region: str(formData.get("business_region")),
    postal_code: str(formData.get("business_postal_code")),
    hours: str(formData.get("business_hours")),
  };

  const free = num(formData.get("shipping_free_threshold_usd"));
  const flat = num(formData.get("shipping_flat_rate_usd"));
  const shipping = {
    free_threshold_cents: free == null ? null : Math.round(free * 100),
    default_carrier: str(formData.get("shipping_default_carrier")),
    flat_rate_cents: flat == null ? null : Math.round(flat * 100),
    default_lead_days: num(formData.get("shipping_default_lead_days")),
  };

  const tax = {
    state_rate_pct: num(formData.get("tax_state_rate_pct")),
    local_rate_pct: num(formData.get("tax_local_rate_pct")),
    tax_exempt_skus: lines(formData.get("tax_exempt_skus")),
  };

  const flags = {
    enable_designer: bool(formData.get("flag_enable_designer")),
    enable_quote_form: bool(formData.get("flag_enable_quote_form")),
    show_price_tiers: bool(formData.get("flag_show_price_tiers")),
    accept_orders: bool(formData.get("flag_accept_orders")),
    show_newsletter_signup: bool(formData.get("flag_show_newsletter_signup")),
  };

  const { error } = await supa.from("settings").upsert({
    id: true,
    business: business as never,
    shipping: shipping as never,
    tax: tax as never,
    flags: flags as never,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  revalidatePath("/admin/settings");
}
