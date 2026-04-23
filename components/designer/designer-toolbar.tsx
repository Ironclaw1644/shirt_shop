"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import type { DesignerSettings } from "./designer-client";

const DESIGNER_FONTS = [
  "Inter",
  "Inter Tight",
  "Fraunces",
  "JetBrains Mono",
  "Helvetica",
  "Georgia",
  "Times New Roman",
  "Courier New",
  "Impact",
  "Arial Black",
  "Trebuchet MS",
  "Verdana",
  "Palatino",
  "Garamond",
  "Tahoma",
  "Lucida Console",
  "Brush Script MT",
  "Futura",
  "Gill Sans",
  "Baskerville",
  "Didot",
  "Rockwell",
  "Bodoni",
  "Optima",
  "Franklin Gothic",
];

export function DesignerToolbar(props: {
  product?: SampleProduct;
  settings: DesignerSettings;
  onSettingsChange: (s: DesignerSettings) => void;
  placement: string;
  onPlacement: (key: string) => void;
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
          Upload artwork
        </h3>
        <label className="block">
          <span className="flex items-center gap-2 justify-center w-full rounded border-2 border-dashed border-ink/15 bg-paper-warm px-3 py-4 text-sm text-ink-mute hover:border-primary hover:text-primary cursor-pointer transition-colors">
            <Icon icon="cloud-arrow-up" />
            PNG · JPG · SVG · PDF
          </span>
          <input
            type="file"
            className="sr-only"
            accept="image/png,image/jpeg,image/svg+xml,application/pdf,application/postscript,application/illustrator"
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

      <details>
        <summary className="cursor-pointer text-xs font-medium text-ink-mute">Font library</summary>
        <p className="mt-2 grid grid-cols-2 gap-1 text-xs text-ink-soft">
          {DESIGNER_FONTS.slice(0, 20).map((f) => (
            <span key={f} style={{ fontFamily: f }}>
              {f}
            </span>
          ))}
        </p>
      </details>

      <Label className="block pt-2 border-t border-ink/10">
        <Icon icon="circle-info" className="text-primary" /> Proof-before-print on every job.
      </Label>
    </aside>
  );
}

export { DESIGNER_FONTS };
