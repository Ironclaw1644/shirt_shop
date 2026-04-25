import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";
import { AdminKeyboardShortcuts } from "@/components/admin/keyboard-shortcuts";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { Logomark } from "@/components/brand/logomark";

const nav: { href: string; label: string; icon: string }[] = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/orders", label: "Orders", icon: "bag-shopping" },
  { href: "/admin/quotes", label: "Quotes", icon: "paper-plane" },
  { href: "/admin/products", label: "Products", icon: "tag" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "envelope-open-text" },
  { href: "/admin/activity", label: "Site activity", icon: "bolt" },
  { href: "/admin/content", label: "Content", icon: "brush" },
  { href: "/admin/settings", label: "Settings", icon: "shield-halved" },
  { href: "/admin/users", label: "Users & roles", icon: "user" },
  { href: "/admin/audit", label: "Audit log", icon: "circle-info" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/admin");
  const { data: profile } = await supa
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", user.id)
    .maybeSingle();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/?error=forbidden");
  }

  return (
    <div className="min-h-screen bg-paper-warm">
      <AdminKeyboardShortcuts />

      {/* Mobile top bar — visible below lg */}
      <header className="lg:hidden sticky top-0 z-40 border-b border-paper/10 bg-ink text-paper">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2 min-w-0">
            <Logomark tone="dark" size={28} />
            <span className="font-display text-sm font-bold truncate">GAPH Admin</span>
          </Link>
          <AdminMobileNav nav={nav} userLabel={profile.full_name ?? profile.email ?? ""} role={profile.role ?? ""} />
        </div>
      </header>

      <div className="grid lg:grid-cols-[260px,1fr] min-h-screen">
        {/* Desktop sidebar — hidden below lg */}
        <aside className="hidden lg:flex lg:flex-col border-r border-ink/10 bg-ink text-paper">
          <div className="px-5 py-6 border-b border-paper/10">
            <Link href="/" className="flex items-center gap-3">
              <Logomark tone="dark" size={36} />
              <span>
                <span className="block font-display text-base font-bold leading-tight">
                  Georgia Print Hub
                </span>
                <span className="block text-[10px] font-mono uppercase tracking-[0.18em] text-accent">
                  Admin
                </span>
              </span>
            </Link>
          </div>
          <nav className="p-3 space-y-0.5 text-sm flex-1" aria-label="Admin">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-3 rounded px-3 py-2 text-paper/75 hover:bg-paper/10 hover:text-paper transition-colors"
              >
                <Icon icon={n.icon as IconName} className="w-4 text-accent" />
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="px-5 py-5 border-t border-paper/10 text-xs text-paper/60">
            <div className="truncate">{profile.full_name ?? profile.email}</div>
            <div className="uppercase tracking-widest text-accent">{profile.role}</div>
          </div>
        </aside>
        <main id="main" className="min-w-0 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
