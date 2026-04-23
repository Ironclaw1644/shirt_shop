import { Heading, Img, Text } from "@react-email/components";
import { Shell, CTA } from "./components";

export default function ProofReadyEmail({
  orderId,
  proofUrl,
  reviewUrl,
}: {
  orderId: string;
  proofUrl: string;
  reviewUrl: string;
}) {
  return (
    <Shell preview="Your proof is ready for review">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>Your proof is ready.</Heading>
      <Text>
        Take a look at the proof for order #{orderId.slice(0, 8)}. Approve it to send it to the
        press, or request changes in the review panel.
      </Text>
      <Img src={proofUrl} alt="Proof preview" width="520" style={{ borderRadius: 6, margin: "16px 0" }} />
      <CTA href={reviewUrl}>Review &amp; approve</CTA>
    </Shell>
  );
}
