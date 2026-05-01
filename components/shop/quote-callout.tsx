import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { PerforatedDivider } from "@/components/ui/perforated-divider";
import { cn } from "@/lib/utils/cn";

type Variant = "section" | "panel";

/**
 * "Don't see what you're looking for?" callout. Shown at the bottom of every
 * category hub, subcategory list, and search results page.
 */
export function QuoteCallout({
  variant = "section",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  if (variant === "section") {
    return (
      <>
        <PerforatedDivider tone="crimson" />
        <section
          className={cn(
            "bg-paper-warm py-14",
            className,
          )}
        >
          <div className="container">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <Eyebrow tone="crimson">Custom · On demand</Eyebrow>
                <h2 className="heading-display mt-3 text-3xl sm:text-4xl text-ink">
                  Don&rsquo;t see what you&rsquo;re looking for?
                </h2>
                <p className="mt-3 max-w-xl text-ink-soft leading-relaxed">
                  We print, decorate, and engrave thousands of SKUs on demand. Tell us what
                  you need and we&rsquo;ll quote tier pricing, lead time, and shipping —
                  usually within one business day.
                </p>
              </div>
              <div className="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end">
                <Button asChild size="lg">
                  <Link href="/quote">
                    <Icon icon="bolt" /> Request a custom quote
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/contact">Talk to an expert</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-primary/20 bg-paper-warm p-6 sm:p-8",
        className,
      )}
    >
      <h3 className="heading-display text-2xl text-ink">
        Don&rsquo;t see what you&rsquo;re looking for?
      </h3>
      <p className="mt-2 text-ink-soft">
        We print thousands of SKUs on demand — tell us what you need and
        we&rsquo;ll quote it within one business day.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button asChild size="md">
          <Link href="/quote">
            <Icon icon="bolt" /> Request a custom quote
          </Link>
        </Button>
        <Button asChild variant="outline" size="md">
          <Link href="/contact">Talk to an expert</Link>
        </Button>
      </div>
    </div>
  );
}
