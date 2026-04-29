import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const secret = process.env.ORDER_TOKEN_SECRET;
  if (!secret) {
    throw new Error(
      "ORDER_TOKEN_SECRET is not set. Required to sign guest order-confirmation links.",
    );
  }
  return secret;
}

function toBase64Url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(token: string): Buffer | null {
  const padded = token.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((token.length + 3) % 4);
  try {
    return Buffer.from(padded, "base64");
  } catch {
    return null;
  }
}

export function signOrderToken(orderId: string): string {
  const mac = createHmac("sha256", getSecret()).update(orderId).digest();
  return toBase64Url(mac);
}

export function verifyOrderToken(
  orderId: string,
  token: string | null | undefined,
): boolean {
  if (!token) return false;
  const provided = fromBase64Url(token);
  if (!provided) return false;
  const expected = createHmac("sha256", getSecret()).update(orderId).digest();
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(provided, expected);
  } catch {
    return false;
  }
}
