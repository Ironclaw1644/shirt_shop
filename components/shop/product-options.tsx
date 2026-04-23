"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Label } from "@/components/ui/label";

export function ProductOptions({
  options,
  value,
  onChange,
}: {
  options?: Record<string, string[]>;
  value: Record<string, string>;
  onChange: (next: Record<string, string>) => void;
}) {
  if (!options) return null;
  return (
    <div className="space-y-5">
      {Object.entries(options).map(([group, values]) => (
        <div key={group}>
          <Label className="block mb-2">
            <span className="text-ink-mute">Choose </span>
            <span className="font-display font-semibold text-ink">{group}</span>
          </Label>
          <div className="flex flex-wrap gap-2">
            {values.map((v) => {
              const selected = value[group] === v;
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ ...value, [group]: v })}
                  className={cn(
                    "rounded border-2 px-3 py-1.5 text-sm font-medium transition-all",
                    selected
                      ? "border-primary bg-primary/5 text-primary shadow-press"
                      : "border-ink/15 bg-white text-ink-soft hover:border-ink/30",
                  )}
                >
                  {v}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
