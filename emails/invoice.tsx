import { Heading, Section, Text } from "@react-email/components";
import { Shell, CTA } from "./components";
import { siteConfig } from "@/lib/site-config";

type Item = {
  title_snapshot: string;
  quantity: number;
  unit_price_cents: number;
};

export default function InvoiceEmail({
  orderId,
  totalCents,
  subtotalCents,
  shippingCents,
  taxCents,
  items,
  notes,
}: {
  orderId: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  items: Item[];
  notes?: string;
}) {
  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
  return (
    <Shell preview={`Invoice for order #${orderId.slice(0, 8)}`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>Your invoice is ready.</Heading>
      <Text>
        Below is the invoice for order #{orderId.slice(0, 8).toUpperCase()}. Payment instructions
        will follow separately — reach out if you need a different payment method.
      </Text>

      <Section style={{ background: "#FAFAF7", padding: 16, borderRadius: 6, margin: "20px 0" }}>
        <Text style={{ margin: 0, fontWeight: 600 }}>Order #{orderId.slice(0, 8)}</Text>
        {items.map((i, idx) => (
          <Text key={idx} style={{ margin: "6px 0", fontSize: 14 }}>
            {i.quantity} × {i.title_snapshot} —{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              {fmt(i.unit_price_cents * i.quantity)}
            </span>
          </Text>
        ))}
        <Text style={{ margin: "12px 0 4px", fontSize: 13, color: "#6B6A65" }}>
          Subtotal {fmt(subtotalCents)} · Shipping {fmt(shippingCents)} · Tax {fmt(taxCents)}
        </Text>
        <Text style={{ margin: "8px 0 0", fontWeight: 700, fontSize: 16 }}>
          Total {fmt(totalCents)}
        </Text>
      </Section>

      {notes && (
        <Text style={{ whiteSpace: "pre-wrap", color: "#6B6A65" }}>{notes}</Text>
      )}

      <CTA href={`${siteConfig.url}/account/orders/${orderId}`}>View order</CTA>

      <Text style={{ marginTop: 18 }}>
        Questions? Just reply to this email — it goes straight to our orders desk.
      </Text>
    </Shell>
  );
}
