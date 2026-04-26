"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDesignerStore } from "@/lib/designer/store";
import type { ImageElement, TextElement } from "@/lib/designer/types";
import { DESIGNER_FONTS } from "./designer-toolbar";
import { cn } from "@/lib/utils/cn";

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

export function Inspector3D() {
  const selectedId = useDesignerStore((s) => s.selectedId);
  const elements = useDesignerStore((s) => s.elements);
  const updateElement = useDesignerStore((s) => s.updateElement);
  const updateAnchor = useDesignerStore((s) => s.updateAnchor);
  const remove = useDesignerStore((s) => s.remove);
  const select = useDesignerStore((s) => s.select);
  const zones = useDesignerStore((s) => s.zones);

  const element = elements.find((e) => e.id === selectedId) ?? null;
  if (!element) return null;

  const zone = zones.find((z) => z.key === element.zoneKey);
  const maxSize = zone?.anchor3D?.maxSizeIn ?? 14;

  return (
    <aside className="rounded-lg border border-ink/10 bg-card p-4 space-y-4">
      <header className="flex items-center justify-between">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute">
          {element.type === "text" ? "Text element" : "Image element"}
        </h3>
        <button
          type="button"
          onClick={() => select(null)}
          className="text-xs text-ink-mute hover:text-ink"
          aria-label="Close inspector"
        >
          <Icon icon="xmark" />
        </button>
      </header>

      {element.type === "text" && (
        <TextControls element={element as TextElement} onChange={(p) => updateElement(element.id, p)} />
      )}
      {element.type === "image" && (
        <ImageControls element={element as ImageElement} />
      )}

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-soft">
          Size
          <span className="ml-2 font-mono text-ink-mute">
            {element.anchor.sizeIn.toFixed(1)}″
          </span>
        </label>
        <input
          type="range"
          min={1}
          max={maxSize}
          step={0.25}
          value={element.anchor.sizeIn}
          onChange={(e) => updateAnchor(element.id, { sizeIn: Number(e.target.value) })}
          className="w-full"
          aria-label="Decal size"
        />
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-soft">
          Rotation
          <span className="ml-2 font-mono text-ink-mute">
            {Math.round((element.anchor.rotation * 180) / Math.PI)}°
          </span>
        </label>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={Math.round((element.anchor.rotation * 180) / Math.PI)}
          onChange={(e) =>
            updateAnchor(element.id, {
              rotation: (Number(e.target.value) * Math.PI) / 180,
            })
          }
          className="w-full"
          aria-label="Rotation"
        />
      </section>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => remove(element.id)}
      >
        <Icon icon="trash-can" /> Delete element
      </Button>
    </aside>
  );
}

function TextControls({
  element,
  onChange,
}: {
  element: TextElement;
  onChange: (patch: Partial<TextElement>) => void;
}) {
  return (
    <>
      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-soft">Content</label>
        <Input
          value={element.content}
          onChange={(e) => onChange({ content: e.target.value })}
          placeholder="Your text"
        />
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-soft">Font</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
          {DESIGNER_FONTS.map((f) => (
            <button
              key={f.family}
              type="button"
              onClick={() => onChange({ fontFamily: f.family })}
              style={{ fontFamily: f.family }}
              className={cn(
                "rounded border px-2 py-1.5 text-sm text-left truncate transition-colors",
                element.fontFamily === f.family
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-ink/15 text-ink-soft hover:border-ink/30",
              )}
              title={f.family}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-soft">Color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Pick color"
            value={element.fillColor}
            onChange={(e) => onChange({ fillColor: e.target.value })}
            className="h-8 w-10 rounded border border-ink/15 cursor-pointer"
          />
          <span className="font-mono text-xs text-ink-mute">
            {element.fillColor.toUpperCase()}
          </span>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange({ fillColor: c })}
              className={cn(
                "h-6 w-full rounded border",
                element.fillColor.toLowerCase() === c.toLowerCase()
                  ? "border-ink ring-1 ring-ink"
                  : "border-ink/15",
              )}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </section>

      <section className="space-y-2">
        <label className="block text-xs font-medium text-ink-soft">
          Font size
          <span className="ml-2 font-mono text-ink-mute">{element.fontSize}px</span>
        </label>
        <input
          type="range"
          min={12}
          max={240}
          step={2}
          value={element.fontSize}
          onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
          className="w-full"
          aria-label="Font size"
        />
      </section>
    </>
  );
}

function ImageControls({ element }: { element: ImageElement }) {
  return (
    <section className="space-y-2">
      <label className="block text-xs font-medium text-ink-soft">Source</label>
      <div className="flex items-center gap-2">
        <div className="h-12 w-12 rounded border border-ink/10 bg-paper-warm overflow-hidden flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={element.src} alt="" className="max-w-full max-h-full object-contain" />
        </div>
        <span className="font-mono text-xs text-ink-mute truncate">
          {element.naturalWidth} × {element.naturalHeight}
        </span>
      </div>
    </section>
  );
}
