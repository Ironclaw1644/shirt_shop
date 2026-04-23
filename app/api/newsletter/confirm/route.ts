import { NextResponse } from "next/server";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  if (!token || !email) {
    return NextResponse.redirect(new URL("/?newsletter=invalid", req.url));
  }
  const svc = getSupabaseServiceRoleClient();
  const { data } = await svc
    .from("newsletter_subscribers")
    .select("id, confirm_token")
    .eq("email", email)
    .maybeSingle();

  if (!data || data.confirm_token !== token) {
    return NextResponse.redirect(new URL("/?newsletter=invalid", req.url));
  }

  await svc
    .from("newsletter_subscribers")
    .update({
      confirm_token: null,
      confirmed_at: new Date().toISOString(),
      subscribed_at: new Date().toISOString(),
    })
    .eq("id", data.id);

  return NextResponse.redirect(new URL("/?newsletter=confirmed", req.url));
}
