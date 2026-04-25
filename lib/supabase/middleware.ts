import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function updateSession(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key",
    {
      db: { schema: "gaph" },
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(all: { name: string; value: string; options?: CookieOptions }[]) {
          all.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({ request: req });
          all.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith("/admin") && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/account") && !user) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Pageview beacon — fire-and-forget; one row per request, no client polling.
  // Skip API/admin/auth and any non-GET, plus next-internal noise.
  if (
    req.method === "GET" &&
    !pathname.startsWith("/api/") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/auth/") &&
    !pathname.startsWith("/_next")
  ) {
    const sessionCookie =
      req.cookies.get("sb-session-id")?.value ??
      req.cookies.get("sb-access-token")?.value?.slice(-12) ??
      null;
    Promise.resolve(
      supabase
        .from("site_activity")
        .insert({
          event_type: "pageview",
          path: pathname,
          user_id: user?.id ?? null,
          session_id: sessionCookie,
          metadata: {
            referer: req.headers.get("referer") ?? null,
            ua: req.headers.get("user-agent")?.slice(0, 200) ?? null,
          },
        }),
    ).catch(() => undefined);
  }

  return response;
}
