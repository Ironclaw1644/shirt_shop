"use client";

import { Icon } from "@/components/ui/icon";
import { siteConfig } from "@/lib/site-config";

export function CapabilitiesMarquee() {
  const items = [...siteConfig.capabilities, ...siteConfig.capabilities, ...siteConfig.capabilities];
  return (
    <section
      className="relative border-y border-ink/10 bg-ink text-paper overflow-hidden py-6"
      aria-label="Our decoration methods"
    >
      <div
        className="absolute inset-0 opacity-[0.12]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)",
          backgroundSize: "6px 6px",
        }}
      />
      <div className="relative mask-fade-x overflow-hidden">
        <div className="flex gap-12 whitespace-nowrap animate-marquee will-change-transform">
          {items.map((cap, idx) => (
            <div
              key={`${cap.key}-${idx}`}
              className="inline-flex items-center gap-3 px-1 shrink-0"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-paper/10 text-accent">
                <Icon icon={cap.icon as never} />
              </span>
              <span className="font-display font-semibold text-lg tracking-tight">
                {cap.label}
              </span>
              <span aria-hidden className="text-accent/60">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
