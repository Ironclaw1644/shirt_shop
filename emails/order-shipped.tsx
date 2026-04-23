import { Heading, Text } from "@react-email/components";
import { Shell, CTA } from "./components";

export default function OrderShippedEmail({
  orderId,
  trackingUrl,
  carrier,
  tracking,
}: {
  orderId: string;
  trackingUrl?: string;
  carrier?: string;
  tracking?: string;
}) {
  return (
    <Shell preview="Your order is on the way">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>On the truck.</Heading>
      <Text>
        Order #{orderId.slice(0, 8)} has shipped. {carrier && tracking ? `${carrier} · ${tracking}` : null}
      </Text>
      {trackingUrl && <CTA href={trackingUrl}>Track your package</CTA>}
    </Shell>
  );
}
