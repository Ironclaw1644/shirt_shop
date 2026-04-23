import { Heading, Text } from "@react-email/components";
import { Shell, CTA } from "./components";

export default function QuoteReplyEmail({
  adminReply,
  paymentLinkUrl,
  totalCents,
}: {
  adminReply: string;
  paymentLinkUrl?: string;
  totalCents?: number;
}) {
  return (
    <Shell preview="Your quote is ready">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>Your quote is ready.</Heading>
      <Text style={{ whiteSpace: "pre-wrap" }}>{adminReply}</Text>
      {totalCents != null && (
        <Text style={{ fontSize: 18, fontWeight: 700 }}>
          Total ${(totalCents / 100).toFixed(2)}
        </Text>
      )}
      {paymentLinkUrl && <CTA href={paymentLinkUrl}>Accept &amp; pay</CTA>}
    </Shell>
  );
}
