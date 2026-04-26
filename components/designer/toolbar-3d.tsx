"use client";

import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { useDesignerStore, useDesignerHistory } from "@/lib/designer/store";
import { loadImage } from "@/lib/designer/rasterize";
import type { CameraView } from "@/lib/designer/types";

const CAMERA_VIEWS: { key: CameraView; label: string }[] = [
  { key: "front", label: "Front" },
  { key: "back", label: "Back" },
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
];

export function Toolbar3D({ defaultFontFamily = "Inter Tight" }: { defaultFontFamily?: string }) {
  const zones = useDesignerStore((s) => s.zones);
  const activeZoneKey = useDesignerStore((s) => s.activeZoneKey);
  const setActiveZone = useDesignerStore((s) => s.setActiveZone);
  const cameraView = useDesignerStore((s) => s.cameraView);
  const setCameraView = useDesignerStore((s) => s.setCameraView);
  const addText = useDesignerStore((s) => s.addText);
  const addImage = useDesignerStore((s) => s.addImage);
  const clear = useDesignerStore((s) => s.clear);
  const elements = useDesignerStore((s) => s.elements);

  const history = useDesignerHistory();
  const [historyState, setHistoryState] = React.useState({
    pastStates: 0,
    futureStates: 0,
  });
  React.useEffect(() => {
    const unsub = history.subscribe((s) => {
      setHistoryState({
        pastStates: s.pastStates.length,
        futureStates: s.futureStates.length,
      });
    });
    setHistoryState({
      pastStates: history.getState().pastStates.length,
      futureStates: history.getState().futureStates.length,
    });
    return unsub;
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

  return (
    <aside className="rounded-lg border border-ink/10 bg-card p-4 space-y-5 h-fit lg:sticky lg:top-24">
      <section>
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-ink-mute mb-2">
          Placement
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {zones.map((z) => (
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
          Selecting a zone places new elements there. Drag elements on the model to move them.
        </p>
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
          View
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {CAMERA_VIEWS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setCameraView(v.key)}
              className={cn(
                "rounded border text-xs py-1.5 px-2 font-medium transition-colors",
                cameraView === v.key
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-ink/15 text-ink-soft hover:border-ink/30",
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-mute">
          Click and drag the model to orbit. Scroll to zoom.
        </p>
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
            disabled={historyState.pastStates === 0}
          >
            <Icon icon="arrow-rotate-left" /> Undo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => history.getState().redo()}
            disabled={historyState.futureStates === 0}
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
        <Icon icon="circle-info" className="text-primary" /> 3D is a preview — printed result
        matches the artwork file we send to production.
      </Label>
    </aside>
  );
}
