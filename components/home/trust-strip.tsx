import { Icon } from "@/components/ui/icon";

const trustMarks = [
  {
    icon: "calendar-days",
    label: "Est. 2005",
    sub: "20+ years, locally printed in Georgia",
  },
  {
    icon: "shop",
    label: "One-stop shop",
    sub: "Print + bulk blanks · we sell what we print on",
  },
  {
    icon: "print",
    label: "In-house production",
    sub: "Laser · UV · DTF · sublimation · embroidery · screen",
  },
  {
    icon: "bolt",
    label: "Same-day turns",
    sub: "Few-hour rush available on many jobs",
  },
];

export function TrustStrip() {
  return (
    <section className="py-14 bg-paper border-y border-ink/10">
      <div className="container grid grid-cols-2 lg:grid-cols-4 gap-6">
        {trustMarks.map((t) => (
          <div key={t.label} className="flex items-start gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon icon={t.icon as never} className="text-xl" />
            </span>
            <div>
              <p className="font-display font-bold text-lg leading-tight">{t.label}</p>
              <p className="text-sm text-ink-mute mt-0.5 leading-snug">{t.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
