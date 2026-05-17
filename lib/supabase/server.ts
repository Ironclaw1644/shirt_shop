import "server-only";
import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function getSupabaseServerClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "publishable-key",
    {
      db: { schema: "gaph" },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(all: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            all.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // server components can't set cookies
          }
        },
      },
    },
  );
}

/** Service-role client for internal server work (webhooks, cron, seeding). */
export function getSupabaseServiceRoleClient() {
  if (!process.env.SUPABASE_SECRET_KEY) {
    throw new Error("SUPABASE_SECRET_KEY is not set");
  }
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { persistSession: false }, db: { schema: "gaph" } },
  );
}
