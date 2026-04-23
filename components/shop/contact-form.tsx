"use client";

import * as React from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("Failed");
      setSent(true);
      toast.success("Message sent");
    } catch (err) {
      toast.error("Try again", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-ink/10 bg-card p-10 shadow-press">
        <h2 className="heading-display text-3xl">Sent.</h2>
        <p className="mt-2 text-ink-soft">We&rsquo;ll be in touch shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink/10 bg-card p-6 shadow-press space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="block mb-1">Full name</Label>
          <Input name="name" required />
        </div>
        <div>
          <Label className="block mb-1">Email</Label>
          <Input type="email" name="email" required />
        </div>
      </div>
      <div>
        <Label className="block mb-1">Subject</Label>
        <Input name="subject" />
      </div>
      <div>
        <Label className="block mb-1">Message</Label>
        <Textarea name="message" rows={6} required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
