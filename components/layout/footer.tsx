import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { categories } from "@/lib/catalog/categories";
import { siteConfig } from "@/lib/site-config";

const cityLinks = [
  { slug: "alpharetta-printing", label: "Alpharetta" },
  { slug: "roswell-printing", label: "Roswell" },
  { slug: "johns-creek-printing", label: "Johns Creek" },
  { slug: "milton-printing", label: "Milton" },
  { slug: "cumming-printing", label: "Cumming" },
  { slug: "atlanta-custom-printing", label: "Atlanta" },
];

const supportLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/quote", label: "Request a Quote" },
  { href: "/policies/shipping", label: "Shipping" },
  { href: "/policies/returns", label: "Returns" },
  { href: "/policies/privacy", label: "Privacy" },
  { href: "/policies/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-ink text-paper">
      <PerforatedDivider tone="gold" className="-mt-[3px] text-accent-600" />
      <div className="container py-14">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <div className="group flex items-center gap-2">
              <svg viewBox="0 0 40 40" aria-hidden className="h-9 w-9 transform transition-transform duration-300 group-hover:-rotate-6">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="#FAFAF7" />
                <rect x="6" y="6" width="28" height="28" rx="5" fill="#1A1A1A" />
                <path
                  d="M11.5 9.5 L20 9.5 L21.5 7.8 L23.5 7.8 L24.5 9.5 L24.9 9.5 L29.5 17.5 Q30 22 28 25.8 L24 30.8 L11.5 30.8 Z"
                  fill="#D4A017"
                  strokeLinejoin="round"
                />
                <circle cx="15.5" cy="15.2" r="1.5" fill="#B8142B" />
              </svg>
              <span className="font-display text-xl font-bold">Georgia Print Hub</span>
            </div>
            <p className="mt-4 max-w-sm text-paper/80 leading-relaxed">
              Printing, promoting, and outfitting Alpharetta and the greater Atlanta metro
              for over 20 years. In-house laser, UV, DTF, sublimation, embroidery, and
              screen print — from one-off gifts to large production runs.
            </p>
            <address className="mt-6 not-italic text-paper/80 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Icon icon="location-dot" className="text-accent" />
                <span>Alpharetta, GA · serving North Georgia</span>
              </div>
              {siteConfig.phone && (
                <div className="flex items-center gap-2">
                  <Icon icon="phone" className="text-accent" />
                  <a href={`tel:${siteConfig.phone}`}>{siteConfig.phone}</a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon icon="envelope-open-text" className="text-accent" />
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </div>
            </address>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold mb-3 text-accent-300">Shop</h4>
            <ul className="space-y-1.5 text-sm text-paper/80">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="hover:text-accent transition-colors">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold mb-3 text-accent-300">Cities</h4>
            <ul className="space-y-1.5 text-sm text-paper/80">
              {cityLinks.map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}`} className="hover:text-accent transition-colors">
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold mb-3 text-accent-300">Support</h4>
            <ul className="space-y-1.5 text-sm text-paper/80">
              {supportLinks.map((s) => (
                <li key={s.href}>
                  <Link href={s.href} className="hover:text-accent transition-colors">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-display font-semibold mb-3 text-accent-300">Stay in the loop</h4>
            <p className="text-sm text-paper/70 mb-3">
              Seasonal drops, merchant specials, and new decoration methods.
            </p>
            <form action="/api/newsletter" method="post" className="flex gap-2">
              <input
                type="email"
                name="email"
                required
                placeholder="you@company.com"
                className="flex-1 rounded border border-paper/20 bg-ink-soft px-3 py-2 text-sm placeholder:text-paper/40 focus:outline-none focus:ring-2 focus:ring-accent"
                aria-label="Email"
              />
              <button
                type="submit"
                aria-label="Subscribe"
                className="inline-flex h-10 w-10 items-center justify-center rounded bg-accent text-ink hover:bg-accent-400"
              >
                <Icon icon="paper-plane" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-paper/10 flex flex-col md:flex-row justify-between gap-4 text-xs text-paper/50">
          <p>
            © {new Date().getFullYear()} Georgia Print Hub · Alpharetta, GA · All rights reserved
          </p>
          <p className="font-mono">
            <span className="text-accent">GAPH</span> · Operating since {siteConfig.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
