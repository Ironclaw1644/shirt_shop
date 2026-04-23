import "server-only";
import { Resend } from "resend";

let resend: Resend | null = null;

export const RESEND_ENABLED = !!process.env.RESEND_API_KEY;

export function getResend() {
  if (!RESEND_ENABLED) {
    throw new Error("RESEND_API_KEY missing — email delivery is disabled.");
  }
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "hello@gaprinthub.com";
export const ADMIN_EMAIL = process.env.RESEND_ADMIN_EMAIL ?? "orders@gaprinthub.com";
