import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded font-display font-semibold tracking-tight transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background [&_svg]:shrink-0 [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "btn-wet-ink text-white shadow-press hover:shadow-press-lg hover:-translate-y-[1px] active:translate-y-0 overflow-hidden",
        secondary:
          "bg-ink text-paper hover:bg-ink-soft shadow-press hover:-translate-y-[1px]",
        outline:
          "border-2 border-ink text-ink bg-transparent hover:bg-ink hover:text-paper",
        ghost:
          "bg-transparent text-ink hover:bg-surface",
        link:
          "bg-transparent text-primary underline-offset-4 hover:underline decoration-2",
        accent:
          "bg-accent text-ink hover:bg-accent-600 hover:text-white shadow-press",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-primary-700",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-base",
        lg: "h-14 px-7 text-lg",
        xl: "h-16 px-9 text-xl",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
