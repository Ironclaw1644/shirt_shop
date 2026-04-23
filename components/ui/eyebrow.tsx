import { cn } from "@/lib/utils/cn";

export function Eyebrow({
  children,
  className,
  tone = "crimson",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "crimson" | "gold" | "ink";
}) {
  const toneCls = {
    crimson: "text-primary",
    gold: "text-accent-700",
    ink: "text-ink",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-3 font-editorial italic tracking-wide text-sm",
        toneCls,
        className,
      )}
    >
      <span aria-hidden className="inline-block h-px w-8 bg-current opacity-60" />
      <span>{children}</span>
    </span>
  );
}
