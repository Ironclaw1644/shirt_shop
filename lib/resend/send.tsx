import "server-only";
import { render } from "@react-email/render";
import OrderReceivedEmail from "@/emails/order-received";
import InvoiceEmail from "@/emails/invoice";
import ProofReadyEmail from "@/emails/proof-ready";
import OrderShippedEmail from "@/emails/order-shipped";
import QuoteReceivedEmail from "@/emails/quote-received";
import QuoteReplyEmail from "@/emails/quote-reply";
import NewsletterWelcomeEmail from "@/emails/newsletter-welcome";
import { getResend, FROM_EMAIL, ADMIN_EMAIL, RESEND_ENABLED } from "./client";

async function send(
  to: string | string[],
  subject: string,
  node: React.ReactElement,
  { replyTo }: { replyTo?: string } = {},
) {
  if (!RESEND_ENABLED) {
    console.warn(`[resend] skipped (no key): ${subject}`);
    return { skipped: true };
  }
  const html = await render(node);
  const resend = getResend();
  return resend.emails.send({
    from: `Georgia Print Hub <${FROM_EMAIL}>`,
    to,
    subject,
    html,
    replyTo: replyTo ?? ADMIN_EMAIL,
  });
}

export async function sendOrderReceivedEmail(args: {
  email: string;
  orderId: string;
  totalCents: number;
  items: { title_snapshot: string; quantity: number; unit_price_cents: number }[];
}) {
  return send(
    args.email,
    `Order received — #${args.orderId.slice(0, 8)} · invoice coming soon`,
    <OrderReceivedEmail
      orderId={args.orderId}
      totalCents={args.totalCents}
      items={args.items}
    />,
  );
}

export async function sendInvoiceEmail(args: {
  email: string;
  orderId: string;
  totalCents: number;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  items: { title_snapshot: string; quantity: number; unit_price_cents: number }[];
  notes?: string;
}) {
  return send(
    args.email,
    `Invoice — order #${args.orderId.slice(0, 8)}`,
    <InvoiceEmail
      orderId={args.orderId}
      totalCents={args.totalCents}
      subtotalCents={args.subtotalCents}
      shippingCents={args.shippingCents}
      taxCents={args.taxCents}
      items={args.items}
      notes={args.notes}
    />,
  );
}

export async function sendProofReadyEmail(args: {
  email: string;
  orderId: string;
  proofUrl: string;
  reviewUrl: string;
}) {
  return send(
    args.email,
    "Your proof is ready — review & approve",
    <ProofReadyEmail orderId={args.orderId} proofUrl={args.proofUrl} reviewUrl={args.reviewUrl} />,
  );
}

export async function sendOrderShippedEmail(args: {
  email: string;
  orderId: string;
  trackingUrl?: string;
  carrier?: string;
  tracking?: string;
}) {
  return send(
    args.email,
    "Your order has shipped",
    <OrderShippedEmail
      orderId={args.orderId}
      trackingUrl={args.trackingUrl}
      carrier={args.carrier}
      tracking={args.tracking}
    />,
  );
}

export async function sendQuoteReceivedEmail(args: {
  email: string;
  fullName?: string | null;
  product: string;
  quantity?: number | null;
}) {
  return send(
    args.email,
    "We got your quote request",
    <QuoteReceivedEmail fullName={args.fullName} product={args.product} quantity={args.quantity} />,
  );
}

export async function sendQuoteReplyEmail(args: {
  email: string;
  adminReply: string;
  totalCents?: number;
  paymentLinkUrl?: string;
}) {
  return send(
    args.email,
    "Your Georgia Print Hub quote",
    <QuoteReplyEmail
      adminReply={args.adminReply}
      paymentLinkUrl={args.paymentLinkUrl}
      totalCents={args.totalCents}
    />,
  );
}

export async function sendNewsletterWelcomeEmail(args: { email: string; confirmUrl: string }) {
  return send(
    args.email,
    "Confirm your Georgia Print Hub subscription",
    <NewsletterWelcomeEmail confirmUrl={args.confirmUrl} />,
  );
}

export async function sendAdminQuoteNotification(args: {
  subject: string;
  summary: string;
}) {
  return send(
    ADMIN_EMAIL,
    `[GAPH Quote] ${args.subject}`,
    // simple inline HTML wrapping
    (
      <NewsletterWelcomeEmail confirmUrl="" />
    ),
  );
}
