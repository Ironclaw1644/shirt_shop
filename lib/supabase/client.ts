"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_SCHEMA } from "./schema";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key",
      { db: { schema: SUPABASE_SCHEMA } },
    );
  }
  return client;
}
