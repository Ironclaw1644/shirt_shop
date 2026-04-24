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
              <svg viewBox="0 0 40 40" aria-hidden className="h-9 w-9 transform -rotate-6 transition-transform duration-300 group-hover:-rotate-12">
                <rect x="2" y="2" width="36" height="36" rx="8" fill="#FAFAF7" />
                <rect x="6" y="6" width="28" height="28" rx="5" fill="#1A1A1A" />
                <g transform="translate(0 1.5)">
                  <path
                    d="M20.58 7.0 L19.68 8.1 L19.61 8.64 L21.02 9.74 L21.46 9.66 L22.11 10.79 L22.25 11.39 L22.93 12.46 L23.9 13.11 L24.46 14.08 L25.59 14.95 L25.55 15.55 L26.29 16.51 L27.43 17.3 L27.7 18.15 L27.75 19.25 L28.33 19.62 L29.0 21.01 L29.03 21.89 L30.0 22.34 L28.96 24.1 L28.77 25.0 L28.33 25.79 L28.28 26.61 L27.82 26.98 L27.64 29.19 L26.48 28.99 L25.5 28.57 L25.11 28.96 L25.27 29.93 L25.08 30.97 L24.57 31.0 L24.36 29.9 L18.93 29.5 L13.13 29.16 L12.55 27.66 L12.09 26.25 L12.39 24.89 L11.97 23.33 L12.34 22.45 L12.32 21.8 L13.04 21.15 L12.55 20.84 L12.74 20.33 L12.28 19.51 L11.79 18.07 L10.74 11.53 L10.0 7.08 L15.45 7.06 L18.42 7.08 L20.58 7.0 Z"
                    fill="none"
                    stroke="#D4A017"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <polygon
                    points="15.16,11.97 15.51,12.985 16.58,13.01 15.73,13.655 16.04,14.68 15.16,14.07 14.28,14.68 14.59,13.655 13.74,13.01 14.81,12.985"
                    fill="#B8142B"
                  />
                </g>
              </svg>
              <span className="font-display text-xl font-bold">Georgia Print Hub</span>
            </div>
            <p className="mt-4 max-w-sm text-paper/80 leading-relaxed">
              A true one-stop shop, locally printed in Georgia for over 20 years. In-house laser,
              UV, DTF, sublimation, embroidery, and screen print — from one-off gifts to large
              production runs. We sell the blanks too: buy in bulk or have us print on them.
            </p>
            <address className="mt-6 not-italic text-paper/80 space-y-1.5 text-sm">
              <div className="flex items-center gap-2">
                <Icon icon="location-dot" className="text-accent" />
                <span>Locally printed in Georgia · serving metro Atlanta &amp; beyond</span>
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
            © {new Date().getFullYear()} Georgia Print Hub · Locally printed in Georgia · All rights reserved
          </p>
          <p className="font-mono">
            <span className="text-accent">GAPH</span> · Operating since {siteConfig.founded}
          </p>
        </div>
      </div>
    </footer>
  );
}
