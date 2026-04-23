import { cn } from "@/lib/utils/cn";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "border-b border-ink/10 bg-paper px-6 py-5 sm:px-8 sm:py-6 flex flex-wrap items-end justify-between gap-4",
        className,
      )}
    >
      <div>
        <h1 className="heading-display text-3xl text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
