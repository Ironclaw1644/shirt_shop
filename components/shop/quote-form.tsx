"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { quoteRequestSchema, type QuoteRequestInput } from "@/lib/validators/quote";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";

export function QuoteForm() {
  const [submitted, setSubmitted] = React.useState(false);
  const form = useForm<QuoteRequestInput>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      productSummary: "",
      estQuantity: 500,
      inHandsDate: "",
      decoration: "",
      message: "",
      files: [],
    },
  });

  async function onSubmit(v: QuoteRequestInput) {
    try {
      const res = await fetch("/api/quotes/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
      toast.success("Quote sent", { description: "We'll reply within one business day." });
    } catch (err) {
      toast.error("Something went wrong", { description: (err as Error).message });
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-ink/10 bg-card p-10 text-center shadow-press">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon icon="paper-plane" className="text-2xl" />
        </span>
        <h2 className="mt-4 heading-display text-3xl">Got it.</h2>
        <p className="mt-2 text-ink-soft">
          We just emailed you a confirmation. Our production team will reply within one business
          day — usually much faster.
        </p>
      </div>
    );
  }

  const err = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="rounded-lg border border-ink/10 bg-card p-6 sm:p-8 shadow-press space-y-5">
      <input type="text" {...form.register("hp")} hidden tabIndex={-1} aria-hidden />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" error={err.fullName?.message}>
          <Input {...form.register("fullName")} required />
        </Field>
        <Field label="Email" error={err.email?.message}>
          <Input type="email" {...form.register("email")} required />
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Company (optional)">
          <Input {...form.register("company")} />
        </Field>
        <Field label="Phone (optional)">
          <Input type="tel" {...form.register("phone")} />
        </Field>
      </div>

      <Field label="What do you need?" error={err.productSummary?.message}>
        <Input
          placeholder="e.g. 5,000 unisex cotton tees, screen-printed front, 2 colors"
          {...form.register("productSummary")}
          required
        />
      </Field>

      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="Estimated quantity" error={err.estQuantity?.message}>
          <Input
            type="number"
            min={1}
            step={1}
            {...form.register("estQuantity", { valueAsNumber: true })}
            required
          />
        </Field>
        <Field label="In-hands date">
          <Input type="date" {...form.register("inHandsDate")} />
        </Field>
        <Field label="Decoration">
          <Input placeholder="Embroidery · DTF · etc." {...form.register("decoration")} />
        </Field>
      </div>

      <Field label="Anything else?">
        <Textarea
          rows={4}
          placeholder="Brand brief, artwork notes, delivery constraints…"
          {...form.register("message")}
        />
      </Field>

      <Button type="submit" size="lg" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Sending…" : (
          <>
            Send quote request <Icon icon="arrow-right" />
          </>
        )}
      </Button>
      <p className="text-xs text-ink-mute">
        By submitting, you agree we may email you about this quote. We never share your info.
      </p>
    </form>
  );
}

function Field({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      <Label className="block mb-1.5">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-primary">{error}</p>}
    </div>
  );
}
