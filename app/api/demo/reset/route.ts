import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SCHEMA } from "@/lib/supabase/schema";
import { resetDemoData } from "@/lib/demo/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Nightly demo reset (vercel.json cron, 08:00 UTC) — wipes and re-seeds the
 * demo schema. Exists ONLY on demo deploys:
 *   - 404 unless DEMO_MODE=1
 *   - auth: `Authorization: Bearer <CRON_SECRET>` (what Vercel cron sends)
 *     or `?key=<CRON_SECRET>` for manual pokes.
 */
async function handle(req: NextRequest) {
  if (process.env.DEMO_MODE !== "1") {
    return new NextResponse(null, { status: 404 });
  }

  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get("authorization");
  const key = req.nextUrl.searchParams.get("key");
  const authorized =
    !!secret && (bearer === `Bearer ${secret}` || key === secret);
  if (!authorized) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json(
      { error: "supabase service credentials not configured" },
      { status: 500 },
    );
  }

  // Deliberately untyped client: the demo schema stores profile/user ids as
  // TEXT (no auth.users FK), so the generated gaph types don't fully apply.
  const db = createClient(url, serviceKey, {
    auth: { persistSession: false },
    db: { schema: SUPABASE_SCHEMA },
  });

  try {
    const seeded = await resetDemoData(db);
    return NextResponse.json({ ok: true, schema: SUPABASE_SCHEMA, seeded });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
