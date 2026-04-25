import { Heading, Section, Text } from "@react-email/components";
import { Shell, CTA } from "./components";
import { siteConfig } from "@/lib/site-config";

type Item = {
  title_snapshot: string;
  quantity: number;
  unit_price_cents: number;
};

export default function AdminNewOrderEmail({
  orderId,
  customerEmail,
  totalCents,
  items,
}: {
  orderId: string;
  customerEmail: string;
  totalCents: number;
  items: Item[];
}) {
  return (
    <Shell preview={`New order #${orderId.slice(0, 8)} from ${customerEmail}`}>
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>New order received.</Heading>
      <Text>
        A customer just placed an order on the storefront. They&rsquo;re expecting an
        invoice + proof from your team.
      </Text>

      <Section style={{ background: "#FAFAF7", padding: 16, borderRadius: 6, margin: "20px 0" }}>
        <Text style={{ margin: 0, fontWeight: 600 }}>
          Order #{orderId.slice(0, 8).toUpperCase()}
        </Text>
        <Text style={{ margin: "4px 0", fontSize: 14 }}>
          Customer: <a href={`mailto:${customerEmail}`}>{customerEmail}</a>
        </Text>
        {items.map((i, idx) => (
          <Text key={idx} style={{ margin: "4px 0", fontSize: 14 }}>
            {i.quantity} × {i.title_snapshot} —{" "}
            <span style={{ fontVariantNumeric: "tabular-nums" }}>
              ${((i.unit_price_cents * i.quantity) / 100).toFixed(2)}
            </span>
          </Text>
        ))}
        <Text style={{ margin: "12px 0 0", fontWeight: 700, fontSize: 16 }}>
          Estimated total ${(totalCents / 100).toFixed(2)}
        </Text>
      </Section>

      <CTA href={`${siteConfig.url}/admin/orders/${orderId}`}>Open in admin</CTA>

      <Text style={{ marginTop: 18, fontSize: 12, color: "#6B6A65" }}>
        From the admin order page you can update status, add a proof, or click
        &ldquo;Email invoice&rdquo; to send the customer their itemized invoice.
      </Text>
    </Shell>
  );
}
