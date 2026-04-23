"use client";

import { cn } from "@/lib/utils/cn";
import { Icon } from "@/components/ui/icon";
import type { IconName } from "@/components/ui/icon";

const meta: Record<
  string,
  { label: string; blurb: string; icon: string }
> = {
  "screen-print": {
    label: "Screen Print",
    blurb: "Best for bold solid-color designs at volume.",
    icon: "print",
  },
  embroidery: {
    label: "Embroidery",
    blurb: "Premium stitched finish, built for polos and caps.",
    icon: "scissors",
  },
  dtf: {
    label: "DTF Transfer",
    blurb: "Full-color detail, works on most fabric compositions.",
    icon: "layer-group",
  },
  "heat-transfer": {
    label: "Heat Transfer",
    blurb: "Fast-turn single-name personalization.",
    icon: "fire",
  },
  sublimation: {
    label: "Sublimation",
    blurb: "Dye-infused color — great on white poly and ceramic.",
    icon: "palette",
  },
  "laser-engraving": {
    label: "Laser Engraving",
    blurb: "Deep, permanent mark on wood, metal, acrylic, stone.",
    icon: "fire",
  },
  "uv-print": {
    label: "UV Printing",
    blurb: "Photorealistic full-color print on rigid substrates.",
    icon: "lightbulb",
  },
  "offset-print": { label: "Offset Print", blurb: "Highest fidelity at volume.", icon: "print" },
  "digital-print": { label: "Digital Print", blurb: "Quick-turn, flexible runs.", icon: "print" },
  foil: { label: "Foil", blurb: "Metallic gold, silver, rose, copper finishes.", icon: "gem" },
  "uv-gloss": { label: "UV Gloss", blurb: "High-gloss spot or flood coating.", icon: "lightbulb" },
  "leather-patch": { label: "Leather Patch", blurb: "Heritage patch look on caps and totes.", icon: "tag" },
  "3d-embroidery": { label: "3D Puff", blurb: "Raised front embroidery, cap-classic.", icon: "scissors" },
  "digital-insert": { label: "Digital Insert", blurb: "Full color 1-inch insert printed onsite.", icon: "image" },
  "sand-etch": { label: "Sand Etch", blurb: "Frosted finish, premium crystal and glass.", icon: "gem" },
  pvc: { label: "PVC", blurb: "Weather-proof rubber patch, highly detailed.", icon: "shield-halved" },
};

export function DecorationPicker({
  methods,
  value,
  onChange,
}: {
  methods: string[];
  value: string | null;
  onChange: (next: string) => void;
}) {
  if (!methods.length) return null;
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-ink">Decoration method</span>
        <span className="text-xs text-ink-mute">Optional · skip for blank orders</span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {methods.map((m) => {
          const info = meta[m] ?? { label: m, blurb: "", icon: "square" };
          const selected = value === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={cn(
                "flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all",
                selected
                  ? "border-primary bg-primary/5 shadow-press"
                  : "border-ink/10 bg-white hover:border-ink/25",
              )}
            >
              <span
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded",
                  selected ? "bg-primary text-white" : "bg-paper-warm text-ink-soft",
                )}
              >
                <Icon icon={info.icon as IconName} />
              </span>
              <span className="flex-1">
                <span className="block font-display font-semibold text-ink">{info.label}</span>
                {info.blurb && (
                  <span className="mt-0.5 block text-xs text-ink-mute leading-snug">
                    {info.blurb}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
