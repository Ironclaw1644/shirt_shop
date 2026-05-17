import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/admin") ? sp.next : "/admin";

  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();

  let alreadySignedInNotice: { email: string } | null = null;

  if (user) {
    const { data: profile } = await supa
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .maybeSingle();
    if (profile && (profile.role === "admin" || profile.role === "staff")) {
      redirect(next);
    }
    alreadySignedInNotice = { email: profile?.email ?? user.email ?? "this account" };
  }

  return (
    <div className="container min-h-[80vh] flex items-center justify-center py-14">
      <div className="w-full max-w-md rounded-lg border border-ink/10 bg-card p-8 shadow-press">
        <Eyebrow tone="crimson">Restricted area</Eyebrow>
        <h1 className="heading-display mt-3 text-3xl">Login to Admin</h1>
        <p className="mt-2 text-sm text-ink-mute">
          Staff and admin access only.
        </p>

        {alreadySignedInNotice ? (
          <div className="mt-6 rounded border border-ink/15 bg-paper-warm p-4 text-sm">
            <p className="font-medium text-ink">
              You&apos;re signed in as{" "}
              <span className="font-mono">{alreadySignedInNotice.email}</span>,
              but this account doesn&apos;t have admin access.
            </p>
            <p className="mt-2 text-ink-mute">
              Sign out and log in with a staff or admin account.
            </p>
            <form action="/auth/sign-out" method="post" className="mt-4">
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        ) : (
          <div className="mt-6">
            <SignInForm next={next} />
          </div>
        )}
      </div>
    </div>
  );
}
