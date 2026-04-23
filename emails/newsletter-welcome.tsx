import { Heading, Text } from "@react-email/components";
import { Shell, CTA } from "./components";

export default function NewsletterWelcomeEmail({ confirmUrl }: { confirmUrl: string }) {
  return (
    <Shell preview="Confirm your Georgia Print Hub subscription">
      <Heading style={{ fontSize: 22, margin: "0 0 12px" }}>One click to confirm.</Heading>
      <Text>
        Thanks for signing up. Click the button below to confirm your subscription. You&rsquo;ll
        get roughly two emails a month — new drops, decoration methods, and merchant specials.
      </Text>
      <CTA href={confirmUrl}>Confirm my subscription</CTA>
      <Text style={{ fontSize: 12, color: "#6B6A65" }}>
        If you didn&rsquo;t sign up, you can ignore this email — nothing will be sent.
      </Text>
    </Shell>
  );
}
