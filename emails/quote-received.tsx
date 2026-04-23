import { Heading, Text } from "@react-email/components";
import { Shell } from "./components";

export default function QuoteReceivedEmail({
  fullName,
  product,
  quantity,
}: {
  fullName?: string | null;
  product: string;
  quantity?: number | null;
}) {
  return (
    <Shell preview="We got your quote request">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>
        Thanks{fullName ? `, ${fullName}` : ""}.
      </Heading>
      <Text>
        We received your request for {product}
        {quantity ? ` (${quantity.toLocaleString()} units)` : ""}. Our production team will reply
        within one business day with tier pricing, lead time, and shipping options.
      </Text>
      <Text>— The Georgia Print Hub team</Text>
    </Shell>
  );
}
