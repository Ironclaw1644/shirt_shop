import "server-only";
import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  if (!stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY missing — checkout will remain disabled until keys are supplied.",
      );
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
      typescript: true,
      appInfo: {
        name: "Georgia Print Hub",
        url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://gaprinthub.com",
      },
    });
  }
  return stripe;
}

export const STRIPE_ENABLED = !!process.env.STRIPE_SECRET_KEY;
