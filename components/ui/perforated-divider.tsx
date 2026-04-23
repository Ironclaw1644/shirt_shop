import { cn } from "@/lib/utils/cn";

type Props = {
  tone?: "ink" | "crimson" | "gold" | "mute";
  className?: string;
};

/**
 * A horizontal "tear-off" line rendered with a repeating radial-gradient.
 * Evokes perforated print stock — use between hero sections and content strips.
 */
export function PerforatedDivider({ tone = "ink", className }: Props) {
  const colors: Record<NonNullable<Props["tone"]>, string> = {
    ink: "text-ink/40",
    crimson: "text-primary/40",
    gold: "text-accent-600/40",
    mute: "text-ink-mute/40",
  };
  return (
    <div
      aria-hidden
      className={cn(
        "h-[6px] w-full perforated-bottom",
        colors[tone],
        className,
      )}
    />
  );
}
