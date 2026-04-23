import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supa = await getSupabaseServerClient();
  await supa.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
