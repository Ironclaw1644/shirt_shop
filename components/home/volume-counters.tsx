"use client";

import * as React from "react";
import { useReducedMotion } from "framer-motion";
import { Eyebrow } from "@/components/ui/eyebrow";

const tiers = [
  { label: "Business cards per run", target: 10000, suffix: "+", caption: "routine" },
  { label: "Tees decorated per order", target: 5000, suffix: "+", caption: "typical" },
  { label: "Trophies shipped on-time", target: 50000, suffix: "+", caption: "annually" },
  { label: "Years operating in Georgia", target: 20, suffix: "+", caption: "since 2005" },
];

export function VolumeCounters() {
  const ref = React.useRef<HTMLElement | null>(null);
  const [animated, setAnimated] = React.useState(false);
  const reduced = useReducedMotion();

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !animated) {
            setAnimated(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animated]);

  return (
    <section
      ref={ref}
      className="relative py-20 lg:py-28 bg-ink text-paper overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "14px 14px",
        }}
      />
      <div
        className="absolute -top-40 -right-40 h-[520px] w-[520px] rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div className="container relative z-10">
        <div className="max-w-3xl">
          <Eyebrow tone="gold">Built for bulk</Eyebrow>
          <h2 className="heading-display mt-3 text-4xl sm:text-5xl lg:text-6xl">
            Your run is not too big.
            <br />
            <span className="italic font-editorial font-normal text-accent-300">
              We&rsquo;re built for it.
            </span>
          </h2>
          <p className="mt-6 max-w-xl text-paper/70 text-lg leading-relaxed">
            Large single orders are routine here. Multiple presses, multiple decoration lines,
            and production schedulers that ship to date every time.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t, idx) => (
            <div
              key={t.label}
              className="rounded-lg border border-paper/10 bg-ink-soft p-6"
            >
              <TickerNumber
                target={t.target}
                suffix={t.suffix}
                animate={animated && !reduced}
                delayMs={idx * 180}
              />
              <p className="mt-3 text-sm text-paper/65">{t.label}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-accent">
                {t.caption}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TickerNumber({
  target,
  suffix,
  animate,
  delayMs,
}: {
  target: number;
  suffix: string;
  animate: boolean;
  delayMs: number;
}) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    if (!animate) {
      setVal(target);
      return;
    }
    const start = performance.now() + delayMs;
    const duration = 1600;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      // easeOutExpo
      const eased = t === 0 ? 0 : 1 - Math.pow(2, -10 * t);
      setVal(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [animate, target, delayMs]);
  return (
    <div className="font-display text-5xl sm:text-6xl font-black tracking-tight leading-none text-paper">
      <span className="tabular-nums">{new Intl.NumberFormat("en-US").format(val)}</span>
      <span className="text-accent">{suffix}</span>
    </div>
  );
}
