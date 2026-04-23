import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function updateSession(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://localhost",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "anon-key",
    {
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

  return response;
}
