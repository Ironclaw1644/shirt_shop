import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";
import { AdminKeyboardShortcuts } from "@/components/admin/keyboard-shortcuts";

const nav: { href: string; label: string; icon: string }[] = [
  { href: "/admin", label: "Dashboard", icon: "home" },
  { href: "/admin/orders", label: "Orders", icon: "bag-shopping" },
  { href: "/admin/quotes", label: "Quotes", icon: "paper-plane" },
  { href: "/admin/products", label: "Products", icon: "tag" },
  { href: "/admin/customers", label: "Customers", icon: "users" },
  { href: "/admin/newsletter", label: "Newsletter", icon: "envelope-open-text" },
  { href: "/admin/activity", label: "Site activity", icon: "bolt" },
  { href: "/admin/content", label: "Content", icon: "brush" },
  { href: "/admin/media", label: "Media library", icon: "image" },
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
      <div className="grid lg:grid-cols-[260px,1fr] min-h-screen">
        <aside className="border-r border-ink/10 bg-ink text-paper">
          <div className="px-5 py-6 border-b border-paper/10">
            <Link href="/" className="flex items-center gap-2">
              <svg viewBox="0 0 40 40" aria-hidden className="h-8 w-8">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="#FAFAF7" />
                <rect x="6" y="6" width="28" height="28" rx="5" fill="#1A1A1A" />
                <path d="M13 13h14v3H16v2h9v3h-9v2h11v3H13V13z" fill="#D4A017" />
              </svg>
              <span className="font-display text-lg font-bold">GAPH Admin</span>
            </Link>
          </div>
          <nav className="p-3 space-y-0.5 text-sm" aria-label="Admin">
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
          <div className="mt-auto px-5 py-5 border-t border-paper/10 text-xs text-paper/60">
            <div className="truncate">{profile.full_name ?? profile.email}</div>
            <div className="uppercase tracking-widest text-accent">{profile.role}</div>
          </div>
        </aside>
        <main id="main">{children}</main>
      </div>
    </div>
  );
}
