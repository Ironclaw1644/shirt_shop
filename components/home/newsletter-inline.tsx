"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";

export function NewsletterInline() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Sign-up failed");
      toast.success("Check your inbox", {
        description: "We sent a confirmation link to complete your subscription.",
      });
      setEmail("");
    } catch (err) {
      toast.error("Something went wrong", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="py-20 lg:py-24 bg-primary text-white overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.12]" aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, #FFD84D 0 6%, transparent 7%), radial-gradient(circle at 75% 70%, #FAFAF7 0 3%, transparent 4%)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="container relative grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <Eyebrow tone="gold" className="text-accent-200">Seasonal proofs + specials</Eyebrow>
          <h2 className="heading-display mt-3 text-4xl sm:text-5xl">
            Printing news,
            <br />
            <span className="italic font-editorial font-normal">worth opening.</span>
          </h2>
          <p className="mt-4 max-w-lg text-white/85 text-lg leading-relaxed">
            Roughly twice a month: new decoration methods, corporate gifting drops, holiday
            deadlines, and the occasional merchant-only discount.
          </p>
        </div>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="flex-1 rounded border-2 border-white/20 bg-primary-700/40 px-4 py-3 text-white placeholder:text-white/50 focus:border-accent focus:outline-none focus:ring-0"
          />
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={loading}
            className="shrink-0"
          >
            {loading ? "Subscribing…" : "Subscribe"}
            <Icon icon="paper-plane" />
          </Button>
        </form>
      </div>
    </section>
  );
}
