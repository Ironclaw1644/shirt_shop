import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

const benefits: { icon: "boxes-stacked" | "palette" | "bolt" | "truck-fast"; label: string }[] = [
  { icon: "boxes-stacked", label: "Track every order from proof to ship" },
  { icon: "palette", label: "Save designs and reuse past artwork" },
  { icon: "bolt", label: "One-click reorders for repeat jobs" },
  { icon: "truck-fast", label: "Saved shipping addresses at checkout" },
];

export function CheckoutAuthBanner() {
  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-6 sm:p-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-display text-lg sm:text-xl font-bold text-ink">
            Have an account? Sign in for faster checkout.
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            Place this order with one click and unlock everything below.
          </p>
          <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 text-sm text-ink-soft">
            {benefits.map((b) => (
              <li key={b.label} className="flex items-start gap-2">
                <Icon icon="circle-check" className="text-primary mt-0.5 shrink-0" />
                <span>{b.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="shrink-0 sm:self-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/auth/sign-in?next=/checkout">
              Sign in <Icon icon="arrow-right" />
            </Link>
          </Button>
          <p className="mt-2 text-center text-xs text-ink-mute sm:text-right">
            New here?{" "}
            <Link
              href="/auth/sign-up?next=/checkout"
              className="underline hover:text-primary"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
