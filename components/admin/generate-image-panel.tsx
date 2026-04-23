"use client";

import * as React from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";

export function GenerateImagePanel({ slug }: { slug: string }) {
  const [prompt, setPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspect: "4:3", slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.formErrors?.[0] ?? data.error ?? "Failed");
      setResult(data.url);
      toast.success("Image generated");
    } catch (err) {
      toast.error("Generation failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-5 space-y-3">
      <p className="font-display font-bold flex items-center gap-2">
        <Icon icon="wand-sparkles" className="text-primary" /> Generate imagery
      </p>
      <p className="text-xs text-ink-mute">
        Describe the shot: subject, lens, lighting, composition, mood.
      </p>
      <Label className="block">
        <span className="sr-only">Prompt</span>
        <Textarea
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Overhead flat-lay of the finished product on warm paper, 85mm lens, natural diffused window light, shallow depth of field, palette of paper and ink crimson, photorealistic commercial product photography"
        />
      </Label>
      <Button onClick={generate} disabled={loading || prompt.length < 20} className="w-full">
        {loading ? "Generating…" : (
          <>
            Generate <Icon icon="bolt" />
          </>
        )}
      </Button>
      {result && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={result} alt="Generated" className="rounded border border-ink/10" />
      )}
    </div>
  );
}
