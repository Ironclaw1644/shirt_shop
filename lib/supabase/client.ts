"use client";

import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "publishable-key",
      { db: { schema: "gaph" } },
    );
  }
  return client;
}
