"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import type { DesignerSettings } from "./designer-client";

export type DesignerFont = {
  /** Font-family string passed to Fabric.js / CSS. */
  family: string;
  /** Display label in the picker. */
  label: string;
};

export const DESIGNER_FONTS: DesignerFont[] = [
  { family: "Inter Tight", label: "Inter Tight" },
  { family: "Inter", label: "Inter" },
  { family: "Montserrat", label: "Montserrat" },
  { family: "Oswald", label: "Oswald" },
  { family: "Bebas Neue", label: "Bebas Neue" },
  { family: "Anton", label: "Anton" },
  { family: "Fraunces", label: "Fraunces" },
  { family: "Playfair Display", label: "Playfair" },
  { family: "Lora", label: "Lora" },
  { family: "Pacifico", label: "Pacifico" },
  { family: "Caveat", label: "Caveat" },
  { family: "Permanent Marker", label: "Marker" },
  { family: "JetBrains Mono", label: "JetBrains Mono" },
];

const PRESET_COLORS = [
  "#1A1A1A",
  "#FFFFFF",
  "#B8142B",
  "#D4A017",
  "#1F4E79",
  "#2E7D32",
  "#7E57C2",
  "#FF6F00",
];

export function DesignerToolbar(props: {
  product?: SampleProduct;
  settings: DesignerSettings;
  onSettingsChange: (s: DesignerSettings) => void;
  placement: string;
  onPlacement: (key: string) => void;
  font: string;
  onFontChange: (family: string) => void;
  fillColor: string;
  onFillChange: (hex: string) => void;
  fontSize: number;
  onFontSizeChange: (px: number) => void;
  onAddText: (text: string) => void;
  onUpload: (file: File) => void;
  onDelete: () => void;
  onForward: () => void;
  onBackward: () => void;
  onClear: () => void;
}) {
  const [text, setText] = React.useState("Your text");

  return (
    <aside className="rounded-lg border border-ink/10 bg-card p-4 space-y-5 h-fit lg:sticky lg:top-24">
      {props.product?.placementZones && props.product.placementZones.length > 0 && (
        <section>
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
            Placement
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {props.product.placementZones.map((z) => (
              <button
                key={z.key}
                type="button"
                onClick={() => props.onPlacement(z.key)}
                className={cn(
                  "rounded border text-xs py-2 px-2 font-medium transition-colors",
                  props.placement === z.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/15 text-ink-soft hover:border-ink/30",
                )}
              >
                {z.label}
                <span className="block font-mono text-[10px] text-ink-mute mt-0.5">
                  {z.widthIn}″ × {z.heightIn}″
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Add text
        </h3>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Your text"
        />
        <Button
          onClick={() => props.onAddText(text)}
          size="sm"
          className="mt-2 w-full"
          variant="secondary"
        >
          <Icon icon="feather" /> Add to canvas
        </Button>
        <p className="mt-2 text-[11px] text-ink-mute">
          Double-click text on the canvas to edit inline.
        </p>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Font
        </h3>
        <div className="grid grid-cols-2 gap-1.5 max-h-[260px] overflow-y-auto pr-1">
          {DESIGNER_FONTS.map((f) => (
            <button
              key={f.family}
              type="button"
              onClick={() => props.onFontChange(f.family)}
              style={{ fontFamily: f.family }}
              className={cn(
                "rounded border px-2 py-1.5 text-sm text-left truncate transition-colors",
                props.font === f.family
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-ink/15 text-ink-soft hover:border-ink/30",
              )}
              title={f.family}
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-mute">
          Pick a font, then add text or click a text layer to apply.
        </p>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Color
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Pick color"
            value={props.fillColor}
            onChange={(e) => props.onFillChange(e.target.value)}
            className="h-8 w-10 rounded border border-ink/15 cursor-pointer"
          />
          <span className="font-mono text-xs text-ink-mute">{props.fillColor.toUpperCase()}</span>
        </div>
        <div className="mt-2 grid grid-cols-8 gap-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => props.onFillChange(c)}
              className={cn(
                "h-6 w-full rounded border",
                props.fillColor.toLowerCase() === c.toLowerCase()
                  ? "border-ink ring-1 ring-ink"
                  : "border-ink/15",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Text size
        </h3>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={12}
            max={240}
            step={2}
            value={props.fontSize}
            onChange={(e) => props.onFontSizeChange(Number(e.target.value))}
            className="flex-1"
            aria-label="Font size"
          />
          <span className="font-mono text-xs text-ink-mute w-12 text-right">
            {props.fontSize}px
          </span>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Upload artwork
        </h3>
        <label className="block">
          <span className="flex items-center gap-2 justify-center w-full rounded border-2 border-dashed border-ink/15 bg-paper-warm px-3 py-4 text-sm text-ink-mute hover:border-primary hover:text-primary cursor-pointer transition-colors">
            <Icon icon="cloud-arrow-up" />
            PNG · JPG · SVG
          </span>
          <input
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) props.onUpload(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-[11px] text-ink-mute">
          Vectors preferred. Raster should be 300dpi at placement size.
        </p>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Layers
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={props.onForward}>
            Forward
          </Button>
          <Button variant="outline" size="sm" onClick={props.onBackward}>
            Back
          </Button>
          <Button variant="outline" size="sm" onClick={props.onDelete}>
            <Icon icon="xmark" /> Delete
          </Button>
          <Button variant="outline" size="sm" onClick={props.onClear}>
            Clear all
          </Button>
        </div>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          View
        </h3>
        <label className="flex items-center gap-2 text-sm text-ink-soft">
          <input
            type="checkbox"
            className="rounded border-ink/30"
            checked={props.settings.showSafeArea}
            onChange={(e) =>
              props.onSettingsChange({ ...props.settings, showSafeArea: e.target.checked })
            }
          />
          Show safe area
        </label>
      </section>

      <Label className="block pt-2 border-t border-ink/10">
        <Icon icon="circle-info" className="text-primary" /> Proof-before-print on every job.
      </Label>
    </aside>
  );
}
