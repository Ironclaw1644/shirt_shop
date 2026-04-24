"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";

export function InkPressHero() {
  const reduced = useReducedMotion();
  const lines = ["Printed.", "Pressed.", "Personalized."];
  return (
    <section className="relative overflow-hidden bg-paper">
      <div className="absolute inset-0 paper-grain opacity-80" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none cmyk-halftone opacity-[0.6]"
        aria-hidden
      />
      <div className="container relative z-10 grid lg:grid-cols-12 gap-10 pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <Eyebrow tone="crimson">Locally printed in Georgia · Est. 2005</Eyebrow>

          <h1 className="heading-display mt-6 text-[14vw] sm:text-[10vw] lg:text-[6rem] xl:text-[7rem] leading-[0.95] text-ink break-words">
            {lines.map((line, i) => (
              <span key={line} className="block">
                {reduced ? line : <StampedHeadline text={line} />}
                {i < lines.length - 1 && " "}
              </span>
            ))}
          </h1>

          <p className="mt-8 max-w-xl text-lg text-ink-soft leading-relaxed">
            <span className="font-editorial italic text-ink">Twenty years</span> printing, promoting,
            and outfitting Georgia — from a single engraved gift to <strong>high-volume</strong>{" "}
            production runs. One shop, every method, and proof-before-print every time.
          </p>
          <p className="mt-3 max-w-xl text-base text-ink-mute leading-relaxed">
            Schools, churches, non-profits, restaurants, IT companies, doctor&rsquo;s offices,
            jewelry shops — no job too big or too small.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="xl">
              <Link href="#categories">
                Start your order <Icon icon="arrow-right" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="xl">
              <Link href="/quote">
                <Icon icon="bolt" /> Volume quote
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink-mute">
            <span className="inline-flex items-center gap-2">
              <Icon icon="shield-halved" className="text-primary" /> In-house production
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon icon="truck-fast" className="text-primary" /> Fast turnaround
            </span>
            <span className="inline-flex items-center gap-2">
              <Icon icon="circle-check" className="text-primary" /> Proof before print
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <HeroArtwork />
        </div>
      </div>
    </section>
  );
}

function StampedHeadline({ text }: { text: string }) {
  return (
    <span className="ink-stack relative inline-block">
      <span aria-hidden className="ink-layer ink-layer-cmy ink-layer-c">{text}</span>
      <span aria-hidden className="ink-layer ink-layer-cmy ink-layer-m">{text}</span>
      <span aria-hidden className="ink-layer ink-layer-cmy ink-layer-y">{text}</span>
      <span className="relative inline-block animate-ink-stamp">{text}</span>
    </span>
  );
}

function HeroArtwork() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.2, 0.7, 0.1, 1], delay: 0.2 }}
      className="relative aspect-[4/5] w-full max-w-md mx-auto"
    >
      <div className="absolute -left-8 top-12 rotate-[-6deg] h-40 w-72 rounded bg-accent/80 shadow-stamp flex items-center justify-center font-display font-black uppercase text-ink tracking-tight text-2xl">
        <span>Proof · Approved</span>
      </div>

      <div className="absolute inset-0 rounded-lg border border-ink/15 bg-white shadow-press-lg overflow-hidden rotate-1">
        <Image
          src="/images/generated/hero-flagship.webp"
          alt="Print shop press run showing layered cards, embroidered tee, engraved tumbler, and custom banner"
          fill
          className="object-cover"
          priority
          sizes="(min-width: 1024px) 40vw, 80vw"
        />
      </div>

      <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-primary text-white flex flex-col items-center justify-center font-display shadow-press-lg rotate-[-8deg]">
        <span className="text-[10px] uppercase tracking-widest">Since</span>
        <span className="text-3xl font-black leading-none">2005</span>
      </div>

      <div className="absolute bottom-10 -left-6 rounded bg-ink text-paper px-4 py-2 font-mono text-[11px] tracking-wider uppercase shadow-stamp-crimson rotate-[-2deg]">
        <span className="text-accent">GAPH</span> · Made in GA
      </div>
    </motion.div>
  );
}
