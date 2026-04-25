import { NextResponse, type NextRequest } from "next/server";
import { seedSupabase } from "@/lib/catalog/seed-supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * One-shot catalog seed endpoint. Runs lib/catalog/seed-supabase.ts against
 * the live Supabase using the runtime SERVICE_ROLE_KEY. Use this when the
 * service role key is sensitive in Vercel and can't be pulled to local.
 *
 * Auth: Authorization: Bearer <SEED_TOKEN>. SEED_TOKEN is a one-time random
 * value set as an env var; remove the env var and this route after seeding.
 *
 *   curl -X POST https://<host>/api/admin/seed-catalog \
 *     -H "Authorization: Bearer $SEED_TOKEN"
 */
export async function POST(req: NextRequest) {
  const token = process.env.SEED_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "SEED_TOKEN not configured" },
      { status: 503 },
    );
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
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
