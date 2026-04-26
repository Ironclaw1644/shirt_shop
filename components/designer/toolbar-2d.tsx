"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { useMockup2DStore, useMockup2DHistory } from "@/lib/mockup/store";
import { loadImage } from "@/lib/designer/rasterize";
import type { SampleProduct } from "@/lib/catalog/sample-products";

export function Toolbar2D({
  product,
  defaultFontFamily = "Inter Tight",
}: {
  product: SampleProduct;
  defaultFontFamily?: string;
}) {
  const zones = useMockup2DStore((s) => s.zones);
  const activeZoneKey = useMockup2DStore((s) => s.activeZoneKey);
  const setActiveZone = useMockup2DStore((s) => s.setActiveZone);
  const views = useMockup2DStore((s) => s.views);
  const activeViewKey = useMockup2DStore((s) => s.activeViewKey);
  const setActiveView = useMockup2DStore((s) => s.setActiveView);
  const garmentColor = useMockup2DStore((s) => s.garmentColor);
  const setGarmentColor = useMockup2DStore((s) => s.setGarmentColor);
  const addText = useMockup2DStore((s) => s.addText);
  const addImage = useMockup2DStore((s) => s.addImage);
  const clear = useMockup2DStore((s) => s.clear);
  const elements = useMockup2DStore((s) => s.elements);

  const history = useMockup2DHistory();
  const [historyState, setHistoryState] = React.useState({ past: 0, future: 0 });
  React.useEffect(() => {
    const sync = (s: { pastStates: unknown[]; futureStates: unknown[] }) =>
      setHistoryState({ past: s.pastStates.length, future: s.futureStates.length });
    sync(history.getState());
    return history.subscribe(sync);
  }, [history]);

  const [textDraft, setTextDraft] = React.useState("Your text");

  const onAddText = React.useCallback(() => {
    addText({
      content: textDraft || "Your text",
      fontFamily: defaultFontFamily,
      fontSize: 64,
      fillColor: "#1A1A1A",
    });
  }, [addText, textDraft, defaultFontFamily]);

  const onUploadFile = React.useCallback(
    async (file: File) => {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      const img = await loadImage(dataUrl);
      addImage({ src: dataUrl, naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight });
    },
    [addImage],
  );

  const colorPresets = product.mockup2D?.colorPresets ?? [];

  return (
    <aside className="rounded-lg border border-ink/10 bg-card p-4 space-y-5 h-fit lg:sticky lg:top-24">
      {views.length > 1 && (
        <section>
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
            View
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {views.map((v) => (
              <button
                key={v.key}
                type="button"
                onClick={() => setActiveView(v.key)}
                className={cn(
                  "rounded border text-xs py-1.5 px-2 font-medium transition-colors",
                  activeViewKey === v.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-ink/15 text-ink-soft hover:border-ink/30",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Placement
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {zones
            .filter((z) => z.anchor2D)
            .map((z) => (
              <button
                key={z.key}
                type="button"
                onClick={() => setActiveZone(z.key)}
                className={cn(
                  "rounded border text-xs py-2 px-2 font-medium transition-colors",
                  activeZoneKey === z.key
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
        <p className="mt-2 text-[11px] text-ink-mute">
          New elements drop in the active zone. Click an element to select; drag to move; corner handles to resize.
        </p>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Garment color
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Pick garment color"
            value={garmentColor}
            onChange={(e) => setGarmentColor(e.target.value)}
            className="h-8 w-10 rounded border border-ink/15 cursor-pointer"
          />
          <span className="font-mono text-xs text-ink-mute">{garmentColor.toUpperCase()}</span>
        </div>
        {colorPresets.length > 0 && (
          <div className="mt-2 grid grid-cols-7 gap-1">
            {colorPresets.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => setGarmentColor(c.hex)}
                title={c.label}
                className={cn(
                  "h-6 w-full rounded border",
                  garmentColor.toLowerCase() === c.hex.toLowerCase()
                    ? "border-ink ring-1 ring-ink"
                    : "border-ink/15",
                )}
                style={{ backgroundColor: c.hex }}
                aria-label={c.label}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Add text
        </h3>
        <Input
          value={textDraft}
          onChange={(e) => setTextDraft(e.target.value)}
          placeholder="Your text"
        />
        <Button onClick={onAddText} size="sm" className="mt-2 w-full" variant="secondary">
          <Icon icon="feather" /> Add text
        </Button>
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
              if (f) void onUploadFile(f);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </section>

      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          History
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => history.getState().undo()}
            disabled={historyState.past === 0}
          >
            <Icon icon="arrow-rotate-left" /> Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => history.getState().redo()}
            disabled={historyState.future === 0}
          >
            <Icon icon="arrow-rotate-right" /> Redo
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={clear}
          disabled={elements.length === 0}
        >
          Clear all
        </Button>
      </section>

      <Label className="block pt-2 border-t border-ink/10">
        <Icon icon="circle-info" className="text-primary" /> Preview only — production prints from
        the flat artwork file at full resolution.
      </Label>
    </aside>
  );
}
