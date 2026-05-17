/**
 * Reset an admin user's password and copy the new password to the system
 * clipboard via pbcopy. The password is NEVER printed to stdout or written
 * to disk — it lives only in script memory and the clipboard.
 *
 * Run from the repo root (where .env.local is):
 *   npx tsx scripts/reset-admin-password.ts <email>
 *
 * After login, change the password from the account settings.
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";
import { execSync } from "node:child_process";

const email = process.argv[2];
if (!email) {
  console.error("usage: tsx scripts/reset-admin-password.ts <email>");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in env");
  process.exit(1);
}

async function main() {
  const supa = createClient(url!, key!, { auth: { persistSession: false } });

  // Look up user by email. listUsers paginates; default page is fine for small projects.
  const { data: list, error: listErr } = await supa.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listErr) {
    console.error("listUsers failed:", listErr.message);
    process.exit(1);
  }
  const target = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );
  if (!target) {
    console.error(`No auth user found for ${email}`);
    console.error("(if this is a new account, sign up at /auth/sign-up first)");
    process.exit(1);
  }

  // Generate a 24-char URL-safe random password (≈144 bits of entropy).
  const newPassword = randomBytes(18).toString("base64url");

  const { error: updErr } = await supa.auth.admin.updateUserById(target.id, {
    password: newPassword,
  });
  if (updErr) {
    console.error("updateUser failed:", updErr.message);
    process.exit(1);
  }

  // Copy to clipboard. NEVER print the password.
  try {
    execSync("pbcopy", { input: newPassword });
  } catch {
    console.error("✗ pbcopy failed — password was NOT copied to clipboard.");
    console.error("  The user's password HAS been changed in Supabase. Re-run after fixing clipboard,");
    console.error("  or use the Supabase dashboard to reset again.");
    process.exit(1);
  }

  console.log(`✓ Password reset for ${email} and copied to clipboard.`);
  console.log(`  Paste at https://gaprinthub.vercel.app/admin-login`);
  console.log(`  Change it immediately from account settings after login.`);
}

main().catch((err) => {
  console.error("Reset failed:", err);
  process.exit(1);
});
