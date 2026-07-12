/**
 * Single source of truth for which Postgres schema the app talks to.
 *
 * Normal deploys: unset → "gaph" (exactly the previous hard-coded behavior).
 * Demo deploys:   set SUPABASE_SCHEMA=demo_gaph (server) and
 *                 NEXT_PUBLIC_SUPABASE_SCHEMA=demo_gaph (browser bundle —
 *                 non-public env vars are not inlined into client code).
 *
 * The demo schema is a structural clone of gaph (see supabase/demo-schema.sql),
 * so the generated Database types remain valid; call sites cast accordingly.
 */
export const SUPABASE_SCHEMA: string =
  process.env.NEXT_PUBLIC_SUPABASE_SCHEMA ||
  process.env.SUPABASE_SCHEMA ||
  "gaph";
