import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/supabase";

/**
 * Centralized session + role lookup. EVERY auth/role gate in the app goes
 * through here — never call supa.auth.getUser() + profiles lookup directly.
 *
 * DEMO_MODE=1: returns a fixed synthetic admin identity without touching
 * Supabase Auth (auth.users is never read or written). Combined with the
 * demo_gaph schema swap (lib/supabase/schema.ts) this lets anonymous
 * visitors drive the whole admin against throwaway data.
 */

export type SessionUser = { id: string; email: string | null };
export type SessionProfile = {
  role: UserRole | null;
  full_name: string | null;
  email: string | null;
};
export type Session = {
  user: SessionUser | null;
  profile: SessionProfile | null;
};

export const DEMO_MODE = process.env.DEMO_MODE === "1";

const DEMO_SESSION: Session = {
  user: {
    id: "00000000-0000-0000-0000-00000000demo",
    email: "demo@walkperro.com",
  },
  profile: {
    role: "admin",
    full_name: "demo admin",
    email: "demo@walkperro.com",
  },
};

export async function getSessionProfile(): Promise<Session> {
  if (process.env.DEMO_MODE === "1") {
    return DEMO_SESSION;
  }

  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supa
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user: { id: user.id, email: user.email ?? null },
    profile: (profile as SessionProfile | null) ?? null,
  };
}

/**
 * Gate for admin surfaces (layouts, server actions, API routes).
 * Returns the session when the caller is admin/staff, null otherwise.
 */
export async function requireStaff(): Promise<Session | null> {
  const session = await getSessionProfile();
  const role = session.profile?.role;
  if (!session.user || (role !== "admin" && role !== "staff")) return null;
  return session;
}
