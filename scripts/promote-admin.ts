import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const role = (process.argv[3] ?? "admin") as "admin" | "staff" | "customer";

if (!email) {
  console.error("usage: tsx scripts/promote-admin.ts <email> [admin|staff|customer]");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  process.exit(1);
}

const supa = createClient(url, key, {
  auth: { persistSession: false },
  db: { schema: "gaph" },
});

const { data, error } = await supa
  .from("profiles")
  .update({ role, updated_at: new Date().toISOString() })
  .eq("email", email)
  .select("id, email, role")
  .maybeSingle();

if (error) {
  console.error("update failed:", error.message);
  process.exit(1);
}
if (!data) {
  console.error(`no profile for ${email} — they need to sign up first at /auth/sign-up`);
  process.exit(1);
}

console.log(`promoted ${data.email} → ${data.role}`);
