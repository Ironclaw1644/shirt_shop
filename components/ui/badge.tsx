import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper border-ink",
        crimson: "bg-primary/10 text-primary border-primary/30",
        gold: "bg-accent/15 text-accent-900 border-accent/40",
        paper: "bg-paper-warm text-ink-soft border-ink/10",
        outline: "bg-transparent text-ink-soft border-ink-mute/40",
        success: "bg-success/10 text-success border-success/30",
        warning: "bg-warning/10 text-warning border-warning/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
