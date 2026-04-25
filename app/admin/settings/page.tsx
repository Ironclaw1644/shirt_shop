import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { updateSettings } from "./actions";

type Json = Record<string, unknown> | null;

function s(o: Json, k: string): string {
  if (!o) return "";
  const v = (o as Record<string, unknown>)[k];
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function n(o: Json, k: string): string {
  if (!o) return "";
  const v = (o as Record<string, unknown>)[k];
  return typeof v === "number" && Number.isFinite(v) ? String(v) : "";
}

function b(o: Json, k: string, fallback = false): boolean {
  if (!o) return fallback;
  const v = (o as Record<string, unknown>)[k];
  return typeof v === "boolean" ? v : fallback;
}

function arr(o: Json, k: string): string {
  if (!o) return "";
  const v = (o as Record<string, unknown>)[k];
  return Array.isArray(v) ? v.join("\n") : "";
}

export default async function AdminSettings() {
  const supa = await getSupabaseServerClient();
  const { data } = await supa.from("settings").select("*").eq("id", true).maybeSingle();

  const biz = (data?.business as Json) ?? null;
  const ship = (data?.shipping as Json) ?? null;
  const tax = (data?.tax as Json) ?? null;
  const flags = (data?.flags as Json) ?? null;

  const freeUsd = (() => {
    const cents = ship && (ship as Record<string, unknown>).free_threshold_cents;
    return typeof cents === "number" ? (cents / 100).toFixed(2) : "";
  })();
  const flatUsd = (() => {
    const cents = ship && (ship as Record<string, unknown>).flat_rate_cents;
    return typeof cents === "number" ? (cents / 100).toFixed(2) : "";
  })();

  return (
    <div>
      <AdminPageHeader title="Settings" subtitle="Business info, shipping, tax, and feature flags." />
      <form action={updateSettings} className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-3xl">
        <Section title="Business">
          <Two>
            <Field name="business_name" label="Business name" defaultValue={s(biz, "name")} />
            <Field name="business_contact_email" type="email" label="Contact email" defaultValue={s(biz, "contact_email")} />
          </Two>
          <Two>
            <Field name="business_contact_phone" label="Contact phone" defaultValue={s(biz, "contact_phone")} />
            <Field name="business_postal_code" label="Postal code" defaultValue={s(biz, "postal_code")} />
          </Two>
          <Field name="business_address_line1" label="Address line 1" defaultValue={s(biz, "address_line1")} />
          <Field name="business_address_line2" label="Address line 2" defaultValue={s(biz, "address_line2")} />
          <Two>
            <Field name="business_city" label="City" defaultValue={s(biz, "city")} />
            <Field name="business_region" label="State / region" defaultValue={s(biz, "region")} />
          </Two>
          <div>
            <Label className="block mb-1">Hours</Label>
            <Textarea name="business_hours" rows={4} placeholder="Mon–Fri 9–6, Sat 10–4, Sun closed" defaultValue={s(biz, "hours")} />
          </div>
        </Section>

        <Section title="Shipping">
          <Two>
            <Field name="shipping_free_threshold_usd" type="number" step="0.01" min="0" label="Free shipping threshold (USD)" defaultValue={freeUsd} />
            <Field name="shipping_flat_rate_usd" type="number" step="0.01" min="0" label="Flat rate (USD)" defaultValue={flatUsd} />
          </Two>
          <Two>
            <Field name="shipping_default_carrier" label="Default carrier" defaultValue={s(ship, "default_carrier")} />
            <Field name="shipping_default_lead_days" type="number" min="0" label="Default lead time (days)" defaultValue={n(ship, "default_lead_days")} />
          </Two>
        </Section>

        <Section title="Tax">
          <Two>
            <Field name="tax_state_rate_pct" type="number" step="0.001" min="0" label="State rate (%)" defaultValue={n(tax, "state_rate_pct")} />
            <Field name="tax_local_rate_pct" type="number" step="0.001" min="0" label="Local rate (%)" defaultValue={n(tax, "local_rate_pct")} />
          </Two>
          <div>
            <Label className="block mb-1">Tax-exempt SKUs (one per line)</Label>
            <Textarea name="tax_exempt_skus" rows={4} defaultValue={arr(tax, "tax_exempt_skus")} />
          </div>
        </Section>

        <Section title="Feature flags">
          <Toggle name="flag_enable_designer" label="Enable in-browser designer" defaultChecked={b(flags, "enable_designer", true)} />
          <Toggle name="flag_enable_quote_form" label="Enable quote request form" defaultChecked={b(flags, "enable_quote_form", true)} />
          <Toggle name="flag_show_price_tiers" label="Show volume price tiers on product pages" defaultChecked={b(flags, "show_price_tiers", true)} />
          <Toggle name="flag_accept_orders" label="Accept new orders" defaultChecked={b(flags, "accept_orders", true)} />
          <Toggle name="flag_show_newsletter_signup" label="Show newsletter signup in footer" defaultChecked={b(flags, "show_newsletter_signup", true)} />
        </Section>

        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-6 space-y-4">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <Label className="block mb-1">{label}</Label>
      <Input {...props} />
    </div>
  );
}

function Toggle({ name, label, defaultChecked }: { name: string; label: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm">{label}</span>
      <Switch name={name} defaultChecked={defaultChecked} />
    </label>
  );
}
