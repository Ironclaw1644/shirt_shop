import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { PerforatedDivider } from "@/components/ui/perforated-divider";

const cities = [
  { label: "Alpharetta", href: "/alpharetta-printing" },
  { label: "Roswell", href: "/roswell-printing" },
  { label: "Johns Creek", href: "/johns-creek-printing" },
  { label: "Milton", href: "/milton-printing" },
  { label: "Cumming", href: "/cumming-printing" },
  { label: "Atlanta", href: "/atlanta-custom-printing" },
];

export function LocalStrip() {
  return (
    <section className="relative py-16 bg-paper-warm">
      <PerforatedDivider className="-mt-[3px] text-primary/40" />
      <div className="container text-center">
        <p className="font-editorial italic text-primary text-lg">Proudly serving</p>
        <h2 className="heading-display mt-2 text-3xl sm:text-4xl text-ink">
          Metro Atlanta & North Georgia
        </h2>
        <p className="mt-3 text-ink-soft max-w-2xl mx-auto">
          Local pickup in Alpharetta. Next-day delivery across the metro. Nationwide flat-rate
          shipping on stocked items.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {cities.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-card px-4 py-2 text-sm font-medium text-ink hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
            >
              <Icon icon="map-pin" className="text-accent-700" />
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
