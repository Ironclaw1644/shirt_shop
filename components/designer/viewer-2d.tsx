"use client";

import * as React from "react";
import { useMockup2DStore } from "@/lib/mockup/store";
import { composeDesignCanvas, pixelsPerInch } from "@/lib/mockup/compose-design";
import { createMockupRenderer, type MockupRenderer } from "@/lib/mockup/render";
import { loadZoneSampler, pointerToUV, type ZoneSampler } from "@/lib/mockup/coords";
import type { SampleProduct } from "@/lib/catalog/sample-products";

const DESIGN_CANVAS_RESOLUTION = 1024;

export type Viewer2DApi = {
  /** Snapshot the current photoreal mockup as a PNG data URL. */
  exportPNG: () => string | null;
  /** Get the underlying canvas element. */
  getCanvas: () => HTMLCanvasElement | null;
};

type Handle = {
  key: "tl" | "tr" | "bl" | "br";
  cursor: string;
  signX: number;
  signY: number;
};

const HANDLES: Handle[] = [
  { key: "tl", cursor: "nwse-resize", signX: -1, signY: -1 },
  { key: "tr", cursor: "nesw-resize", signX: 1, signY: -1 },
  { key: "bl", cursor: "nesw-resize", signX: -1, signY: 1 },
  { key: "br", cursor: "nwse-resize", signX: 1, signY: 1 },
];

export function Viewer2D({
  product,
  apiRef,
}: {
  product: SampleProduct;
  apiRef?: React.MutableRefObject<Viewer2DApi | null>;
}) {
  const elements = useMockup2DStore((s) => s.elements);
  const selectedId = useMockup2DStore((s) => s.selectedId);
  const select = useMockup2DStore((s) => s.select);
  const updateAnchor = useMockup2DStore((s) => s.updateAnchor);
  const garmentColor = useMockup2DStore((s) => s.garmentColor);
  const activeZoneKey = useMockup2DStore((s) => s.activeZoneKey);
  const activeViewKey = useMockup2DStore((s) => s.activeViewKey);
  const zones = useMockup2DStore((s) => s.zones);

  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const rendererRef = React.useRef<MockupRenderer | null>(null);
  const zoneSamplersRef = React.useRef<Record<string, ZoneSampler>>({});

  const view = product.mockup2D?.views.find((v) => v.key === activeViewKey)
    ?? product.mockup2D?.views[0];

  // Mount renderer when view changes.
  React.useEffect(() => {
    if (!canvasRef.current || !view) return;
    let disposed = false;
    let raf = 0;
    (async () => {
      const r = await createMockupRenderer(canvasRef.current!, {
        photoUrl: view.photoUrl,
        dispUrl: view.dispUrl,
        lightUrl: view.lightUrl,
        colorUrl: view.colorUrl,
        zoneMaskUrls: view.zoneMasks,
      });
      if (disposed) {
        r.dispose();
        return;
      }
      rendererRef.current = r;
      r.setDispStrength(view.dispStrength ?? 0.012);
      const tick = () => {
        r.render();
        raf = requestAnimationFrame(tick);
      };
      tick();
    })().catch((e) => console.error("renderer init failed", e));

    // Pre-load zone samplers for hit-testing.
    Promise.all(
      Object.entries(view.zoneMasks).map(async ([k, url]) => {
        zoneSamplersRef.current[k] = await loadZoneSampler(url);
      }),
    ).catch((e) => console.warn("zone sampler load failed", e));

    const onResize = () => rendererRef.current?.resize();
    const ro = new ResizeObserver(onResize);
    if (wrapperRef.current) ro.observe(wrapperRef.current);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      rendererRef.current?.dispose();
      rendererRef.current = null;
      zoneSamplersRef.current = {};
    };
  }, [view?.photoUrl, view?.dispUrl, view?.lightUrl, view?.colorUrl, view]);

  // Push state to renderer on changes.
  React.useEffect(() => {
    rendererRef.current?.setActiveZone(activeZoneKey);
  }, [activeZoneKey]);
  React.useEffect(() => {
    rendererRef.current?.setGarmentColor(garmentColor);
  }, [garmentColor]);

  // Recompose design canvas whenever elements change.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await composeDesignCanvas(
        elements,
        DESIGN_CANVAS_RESOLUTION,
        DESIGN_CANVAS_RESOLUTION,
      );
      if (cancelled) return;
      rendererRef.current?.setDesignCanvas(c);
    })();
    return () => {
      cancelled = true;
    };
  }, [elements]);

  // Expose imperative API for save flow.
  React.useEffect(() => {
    if (!apiRef) return;
    apiRef.current = {
      getCanvas: () => canvasRef.current,
      exportPNG: () => {
        if (!canvasRef.current || !rendererRef.current) return null;
        rendererRef.current.render();
        try {
          return canvasRef.current.toDataURL("image/png");
        } catch {
          return null;
        }
      },
    };
    return () => {
      if (apiRef) apiRef.current = null;
    };
  }, [apiRef]);

  // ─── Pointer interaction ─────────────────────────────────────────────────

  type DragState =
    | { kind: "move"; id: string; startUV: { u: number; v: number }; startAnchor: { x: number; y: number } }
    | {
        kind: "resize";
        id: string;
        handle: Handle;
        startUV: { u: number; v: number };
        startSize: { widthIn: number; heightIn: number };
        aspect: number;
        uniform: boolean;
      };
  const dragRef = React.useRef<DragState | null>(null);

  const onCanvasPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return;
      const uv = pointerToUV(canvasRef.current, e.clientX, e.clientY);
      // Hit-test top-most element.
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        const halfW = el.anchor.widthIn / 28 / 2;
        const halfH = el.anchor.heightIn / 28 / 2;
        if (
          uv.u >= el.anchor.x - halfW &&
          uv.u <= el.anchor.x + halfW &&
          uv.v >= el.anchor.y - halfH &&
          uv.v <= el.anchor.y + halfH
        ) {
          select(el.id);
          (e.currentTarget as HTMLCanvasElement).setPointerCapture(e.pointerId);
          dragRef.current = {
            kind: "move",
            id: el.id,
            startUV: uv,
            startAnchor: { x: el.anchor.x, y: el.anchor.y },
          };
          return;
        }
      }
      // Empty click → deselect (but only if click was outside any zone too)
      select(null);
    },
    [elements, select],
  );

  const onCanvasPointerMove = React.useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      const drag = dragRef.current;
      if (!drag || !canvasRef.current) return;
      const uv = pointerToUV(canvasRef.current, e.clientX, e.clientY);
      if (drag.kind === "move") {
        const dx = uv.u - drag.startUV.u;
        const dy = uv.v - drag.startUV.v;
        let newX = drag.startAnchor.x + dx;
        let newY = drag.startAnchor.y + dy;
        // Optional: clamp to zone (soft — let the user push outside if they want)
        newX = Math.max(0, Math.min(1, newX));
        newY = Math.max(0, Math.min(1, newY));
        updateAnchor(drag.id, { x: newX, y: newY });
      } else {
        const du = (uv.u - drag.startUV.u) * drag.handle.signX;
        const dv = (uv.v - drag.startUV.v) * drag.handle.signY;
        // Resize anchored at the opposite corner; uniform for text.
        const photoIn = 28; // see compose-design
        const dWidthIn = du * photoIn * 2;
        const dHeightIn = dv * photoIn * 2;
        let widthIn = drag.startSize.widthIn + dWidthIn;
        let heightIn = drag.uniform
          ? widthIn / drag.aspect
          : drag.startSize.heightIn + dHeightIn;
        widthIn = Math.max(0.5, Math.min(40, widthIn));
        heightIn = Math.max(0.5, Math.min(40, heightIn));
        updateAnchor(drag.id, { widthIn, heightIn });
      }
    },
    [updateAnchor],
  );

  const onCanvasPointerUp = React.useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    dragRef.current = null;
    (e.currentTarget as HTMLCanvasElement).releasePointerCapture?.(e.pointerId);
  }, []);

  // ─── Handle overlays for the selected element ────────────────────────────

  const selected = elements.find((el) => el.id === selectedId) ?? null;
  const onHandlePointerDown = React.useCallback(
    (handle: Handle, e: React.PointerEvent<HTMLDivElement>) => {
      if (!selected || !canvasRef.current) return;
      e.stopPropagation();
      const uv = pointerToUV(canvasRef.current, e.clientX, e.clientY);
      const aspect = selected.anchor.widthIn / selected.anchor.heightIn;
      dragRef.current = {
        kind: "resize",
        id: selected.id,
        handle,
        startUV: uv,
        startSize: { widthIn: selected.anchor.widthIn, heightIn: selected.anchor.heightIn },
        aspect,
        uniform: selected.type === "text",
      };
      (canvasRef.current as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
    },
    [selected],
  );

  // Compute handle positions in CSS pixels relative to the wrapper.
  const handleStyle = (signX: number, signY: number) => {
    if (!selected || !wrapperRef.current) return null;
    const rect = wrapperRef.current.getBoundingClientRect();
    const halfW = (selected.anchor.widthIn / 28 / 2) * rect.width;
    const halfH = (selected.anchor.heightIn / 28 / 2) * rect.height;
    const cx = selected.anchor.x * rect.width;
    const cy = selected.anchor.y * rect.height;
    return {
      left: `${cx + signX * halfW - 6}px`,
      top: `${cy + signY * halfH - 6}px`,
    } as React.CSSProperties;
  };

  // Selection box (CSS overlay)
  const selectionBoxStyle = (() => {
    if (!selected || !wrapperRef.current) return null;
    const rect = wrapperRef.current.getBoundingClientRect();
    const w = (selected.anchor.widthIn / 28) * rect.width;
    const h = (selected.anchor.heightIn / 28) * rect.height;
    const x = selected.anchor.x * rect.width - w / 2;
    const y = selected.anchor.y * rect.height - h / 2;
    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      transform: `rotate(${selected.anchor.rotation}rad)`,
    } as React.CSSProperties;
  })();

  // Warn when oversized vs zone recommendation.
  const oversize = (() => {
    if (!selected) return null;
    const zone = zones.find((z) => z.key === selected.zoneKey);
    if (!zone) return null;
    if (
      selected.anchor.widthIn > zone.widthIn ||
      selected.anchor.heightIn > zone.heightIn
    ) {
      return `Exceeds ${zone.label} (${zone.widthIn}″ × ${zone.heightIn}″)`;
    }
    return null;
  })();

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-square rounded-lg border border-ink/10 bg-paper-warm overflow-hidden touch-none select-none"
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        onPointerDown={onCanvasPointerDown}
        onPointerMove={onCanvasPointerMove}
        onPointerUp={onCanvasPointerUp}
        onPointerCancel={onCanvasPointerUp}
      />
      {selected && selectionBoxStyle && (
        <div
          className="absolute pointer-events-none border-2 border-primary/70 rounded-sm"
          style={selectionBoxStyle}
        />
      )}
      {selected &&
        HANDLES.map((h) => {
          const style = handleStyle(h.signX, h.signY);
          if (!style) return null;
          return (
            <div
              key={h.key}
              role="button"
              aria-label={`Resize ${h.key}`}
              className="absolute h-3 w-3 rounded-sm border border-primary bg-paper shadow-sm"
              style={{ ...style, cursor: h.cursor }}
              onPointerDown={(e) => onHandlePointerDown(h, e)}
            />
          );
        })}
      {oversize && (
        <div className="absolute bottom-2 left-2 right-2 mx-auto max-w-xs rounded-md bg-yellow-100 border border-yellow-300 px-3 py-1.5 text-xs text-yellow-900 text-center shadow">
          ⚠ {oversize} — production will scale to fit
        </div>
      )}
    </div>
  );
}

// silence the unused-var lint for now; hover indicator may drive future styling
export const __PIXELS_PER_INCH = pixelsPerInch;
