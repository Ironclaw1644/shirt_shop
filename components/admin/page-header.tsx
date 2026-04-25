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
        "border-b border-ink/10 bg-paper px-4 py-4 sm:px-6 sm:py-5 lg:px-8 lg:py-6 flex flex-wrap items-end justify-between gap-3 sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="heading-display text-2xl sm:text-3xl text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-mute max-w-2xl">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
