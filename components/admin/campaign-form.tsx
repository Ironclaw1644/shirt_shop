"use client";

import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CampaignForm() {
  const [loading, setLoading] = React.useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/newsletter/campaigns", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      toast.success("Draft saved");
    } catch (err) {
      toast.error("Failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }
  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-ink/10 bg-white p-6 space-y-4">
      <div>
        <Label className="block mb-1">Subject</Label>
        <Input name="subject" required />
      </div>
      <div>
        <Label className="block mb-1">Preview text</Label>
        <Input name="preview_text" />
      </div>
      <div>
        <Label className="block mb-1">Body HTML</Label>
        <Textarea rows={12} name="body_html" placeholder="<h1>New drops</h1>..." required />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save draft"}
      </Button>
    </form>
  );
}
