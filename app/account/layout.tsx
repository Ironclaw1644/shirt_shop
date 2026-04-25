import Link from "next/link";
import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";

const nav: { href: string; label: string; icon: string }[] = [
  { href: "/account", label: "Overview", icon: "home" },
  { href: "/account/orders", label: "Orders", icon: "bag-shopping" },
  { href: "/account/designs", label: "Designs", icon: "feather" },
  { href: "/account/proofs", label: "Proofs", icon: "image" },
  { href: "/account/addresses", label: "Addresses", icon: "map-pin" },
  { href: "/account/profile", label: "Profile", icon: "user" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/account");

  const { data: profile } = await supa
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <>
      <SiteHeader />
      <main id="main" className="bg-paper">
        <div className="container py-6 lg:py-10">
          <nav
            aria-label="Account"
            className="lg:hidden -mx-4 mb-6 overflow-x-auto px-4"
          >
            <div className="flex gap-2 whitespace-nowrap">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-primary hover:text-ink transition-colors"
                >
                  <Icon icon={n.icon as IconName} className="text-ink-mute text-xs" />
                  {n.label}
                </Link>
              ))}
              <form action="/auth/sign-out" method="post" className="shrink-0">
                <button
                  type="submit"
                  className="inline-flex items-center rounded-full border border-ink/15 bg-card px-3 py-1.5 text-sm font-medium text-ink-mute hover:text-primary"
                >
                  Sign out
                </button>
              </form>
            </div>
          </nav>

          <div className="grid lg:grid-cols-[240px,1fr] gap-10">
            <aside className="hidden lg:block h-fit lg:sticky lg:top-24 rounded-lg border border-ink/10 bg-card p-4">
              <div className="px-3 py-4 border-b border-ink/10 mb-2">
                <p className="font-display font-bold text-ink truncate">
                  {profile?.full_name ?? "Friend"}
                </p>
                <p className="text-xs text-ink-mute truncate">{profile?.email ?? user.email}</p>
              </div>
              <nav className="space-y-0.5" aria-label="Account sidebar">
                {nav.map((n) => (
                  <Link
                    key={n.href}
                    href={n.href}
                    className="flex items-center gap-3 rounded px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink transition-colors"
                  >
                    <Icon icon={n.icon as IconName} className="text-ink-mute" />
                    {n.label}
                  </Link>
                ))}
              </nav>
              <form action="/auth/sign-out" method="post" className="mt-4 px-3">
                <button
                  type="submit"
                  className="text-sm text-ink-mute hover:text-primary"
                >
                  Sign out
                </button>
              </form>
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
