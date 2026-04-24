import { Heading, Section, Text } from "@react-email/components";
import { Shell, CTA } from "./components";
import { siteConfig } from "@/lib/site-config";

type Item = {
  title_snapshot: string;
  quantity: number;
  unit_price_cents: number;
};

export default function OrderReceivedEmail({
  orderId,
  totalCents,
  items,
}: {
  orderId: string;
  totalCents: number;
  items: Item[];
}) {
  return (
    <Shell preview={`Order #${orderId.slice(0, 8)} received — invoice coming soon`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>Order received.</Heading>
      <Text>
        Thanks for ordering with {siteConfig.name}. We have your details and will follow up with
        an itemized invoice and a digital proof for every decorated item before production begins.
      </Text>

      <Section style={{ background: "#FAFAF7", padding: 16, borderRadius: 6, margin: "20px 0" }}>
        <Text style={{ margin: 0, fontWeight: 600 }}>Order #{orderId.slice(0, 8)}</Text>
        {items.map((i, idx) => (
          <Text key={idx} style={{ margin: "6px 0", fontSize: 14 }}>
            {i.quantity} × {i.title_snapshot} —{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              ${((i.unit_price_cents * i.quantity) / 100).toFixed(2)}
            </span>
          </Text>
        ))}
        <Text style={{ margin: "12px 0 0", fontSize: 14, color: "#6B6A65" }}>
          Estimated subtotal ${(totalCents / 100).toFixed(2)} · final invoice will include tax,
          shipping, and any decoration adjustments.
        </Text>
      </Section>

      <CTA href={`${siteConfig.url}/account/orders/${orderId}`}>View order status</CTA>

      <Text style={{ marginTop: 18 }}>
        Questions? Just reply to this email — it goes straight to our orders desk.
      </Text>
    </Shell>
  );
}
