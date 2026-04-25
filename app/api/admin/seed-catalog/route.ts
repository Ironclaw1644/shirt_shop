import { NextResponse, type NextRequest } from "next/server";
import { seedSupabase } from "@/lib/catalog/seed-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * One-shot catalog seed endpoint. See lib/catalog/seed-supabase.ts.
 * Auth: Bearer SEED_TOKEN. Remove the env var and this route after seeding.
 */
export async function POST(req: NextRequest) {
  const token = process.env.SEED_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "SEED_TOKEN not configured" }, { status: 503 });
  }
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.replace(/^Bearer\s+/i, "");
  if (!provided || provided !== token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const start = Date.now();
    const result = await seedSupabase();
    return NextResponse.json({
      ok: true,
      durationMs: Date.now() - start,
      ...result,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
