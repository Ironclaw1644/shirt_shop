"use client";

import * as React from "react";
import * as fabric from "fabric";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import type { DesignerSettings } from "./designer-client";

export type CanvasApi = {
  addText: (text: string) => Promise<void>;
  addImage: (url: string) => Promise<void>;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  applyFontToActive: (family: string) => Promise<void>;
  applyFillToActive: (hex: string) => void;
  applyFontSizeToActive: (px: number) => void;
  exportPNG: () => string;
  exportJSON: () => object;
  clear: () => void;
};

const BASE = 720; // canvas logical (design) side length in px

async function ensureFontLoaded(family: string, sizePx = 48) {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(`${sizePx}px "${family}"`);
  } catch {
    // Font load is best-effort; Fabric will fall back to a system font if missing.
  }
}

export function FabricCanvas({
  product,
  placement,
  settings,
  font,
  fillColor,
  fontSize,
  onReady,
}: {
  product?: SampleProduct;
  placement: string;
  settings: DesignerSettings;
  font: string;
  fillColor: string;
  fontSize: number;
  onReady: (api: CanvasApi) => void;
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<fabric.Canvas | null>(null);
  const fontRef = React.useRef(font);
  const fillRef = React.useRef(fillColor);
  const fontSizeRef = React.useRef(fontSize);

  React.useEffect(() => {
    fontRef.current = font;
  }, [font]);
  React.useEffect(() => {
    fillRef.current = fillColor;
  }, [fillColor]);
  React.useEffect(() => {
    fontSizeRef.current = fontSize;
  }, [fontSize]);

  // Init canvas once per product
  React.useEffect(() => {
    if (!ref.current || !wrapperRef.current) return;
    let disposed = false;
    const initial = Math.min(BASE, wrapperRef.current.clientWidth || BASE);
    const canvas = new fabric.Canvas(ref.current, {
      width: initial,
      height: initial,
      backgroundColor: "#f6f4ef",
      selection: true,
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;

    const bgUrl = product
      ? `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`
      : null;
    if (bgUrl) {
      fabric.FabricImage.fromURL(bgUrl, { crossOrigin: "anonymous" })
        .then((img) => {
          if (disposed || !img || !canvasRef.current) return;
          const side = canvas.getWidth();
          const scale = Math.min(side / (img.width || side), side / (img.height || side));
          img.scale(scale);
          img.set({ selectable: false, evented: false, opacity: 0.92 });
          canvas.backgroundImage = img;
          canvas.requestRenderAll();
        })
        .catch((err) => {
          console.error("background image load failed", err);
        });
    }

    const resize = () => {
      if (disposed || !wrapperRef.current || !canvasRef.current) return;
      const w = Math.max(240, Math.min(BASE, wrapperRef.current.clientWidth));
      const prev = canvas.getWidth();
      if (Math.abs(prev - w) < 1) return;
      const ratio = w / prev;
      canvas.setDimensions({ width: w, height: w });
      canvas.getObjects().forEach((o) => {
        o.scaleX = (o.scaleX || 1) * ratio;
        o.scaleY = (o.scaleY || 1) * ratio;
        o.left = (o.left || 0) * ratio;
        o.top = (o.top || 0) * ratio;
        o.setCoords();
      });
      if (canvas.backgroundImage) {
        const bg = canvas.backgroundImage;
        bg.scaleX = (bg.scaleX || 1) * ratio;
        bg.scaleY = (bg.scaleY || 1) * ratio;
      }
      canvas.requestRenderAll();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrapperRef.current);

    drawSafeArea(canvas, product, placement, settings.showSafeArea);

    // Keyboard: Delete / Backspace removes the active selection
    const onKeyDown = (e: KeyboardEvent) => {
      if (disposed || !canvasRef.current) return;
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      // Don't intercept while a text object is in edit mode
      const active = canvasRef.current.getActiveObject() as fabric.Object | undefined;
      if (active && (active as unknown as { isEditing?: boolean }).isEditing) return;
      if (e.key === "Delete" || e.key === "Backspace") {
        const objs = canvasRef.current.getActiveObjects();
        if (objs.length === 0) return;
        e.preventDefault();
        objs.forEach((o) => canvasRef.current?.remove(o));
        canvasRef.current.discardActiveObject();
        canvasRef.current.requestRenderAll();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    const api: CanvasApi = {
      addText: async (txt) => {
        const family = fontRef.current;
        const fill = fillRef.current;
        const size = fontSizeRef.current;
        const side = canvas.getWidth();
        const scaledSize = Math.round(size * (side / BASE));
        await ensureFontLoaded(family, scaledSize);
        if (disposed) return;
        const text = new fabric.IText(txt || "Text", {
          fontFamily: family,
          fontSize: scaledSize,
          fill,
          left: side / 2,
          top: side / 2,
          originX: "center",
          originY: "center",
          textAlign: "center",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.requestRenderAll();
      },
      addImage: async (url) => {
        try {
          const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
          if (disposed || !img) return;
          const side = canvas.getWidth();
          const maxSide = side * 0.55;
          const scale = Math.min(
            maxSide / (img.width || maxSide),
            maxSide / (img.height || maxSide),
          );
          img.set({
            left: side / 2,
            top: side / 2,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
        } catch (err) {
          console.error("addImage failed", err);
          throw err;
        }
      },
      deleteSelected: () => {
        canvas.getActiveObjects().forEach((o) => canvas.remove(o));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      },
      bringForward: () => {
        const obj = canvas.getActiveObject();
        if (obj) {
          canvas.bringObjectForward(obj);
          canvas.requestRenderAll();
        }
      },
      sendBackward: () => {
        const obj = canvas.getActiveObject();
        if (obj) {
          canvas.sendObjectBackwards(obj);
          canvas.requestRenderAll();
        }
      },
      applyFontToActive: async (family) => {
        const obj = canvas.getActiveObject();
        if (!obj) return;
        const size = (obj as fabric.IText).fontSize ?? fontSizeRef.current;
        await ensureFontLoaded(family, size || 48);
        if (disposed) return;
        if ((obj as fabric.IText).set && (obj.type === "i-text" || obj.type === "text")) {
          (obj as fabric.IText).set({ fontFamily: family });
          canvas.requestRenderAll();
        }
      },
      applyFillToActive: (hex) => {
        const obj = canvas.getActiveObject();
        if (!obj) return;
        obj.set({ fill: hex });
        canvas.requestRenderAll();
      },
      applyFontSizeToActive: (px) => {
        const obj = canvas.getActiveObject();
        if (!obj) return;
        if (obj.type === "i-text" || obj.type === "text") {
          (obj as fabric.IText).set({ fontSize: px });
          canvas.requestRenderAll();
        }
      },
      exportPNG: () => canvas.toDataURL({ format: "png", multiplier: 2 }),
      exportJSON: () => canvas.toJSON(),
      clear: () => {
        canvas.getObjects().forEach((o) => {
          const data = (o as { data?: { safeArea?: boolean } }).data;
          if (!data?.safeArea) canvas.remove(o);
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
      },
    };
    onReady(api);

    return () => {
      disposed = true;
      window.removeEventListener("keydown", onKeyDown);
      ro.disconnect();
      canvas.dispose();
      canvasRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.slug]);

  // Redraw safe area whenever placement or settings change
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawSafeArea(canvas, product, placement, settings.showSafeArea);
  }, [placement, settings.showSafeArea, product]);

  return (
    <div className="relative w-full">
      <div
        ref={wrapperRef}
        className="mx-auto w-full max-w-[720px] rounded border border-ink/15 shadow-press overflow-hidden bg-[#f6f4ef]"
      >
        <canvas ref={ref} className="block touch-none" />
      </div>
    </div>
  );
}

function drawSafeArea(
  canvas: fabric.Canvas,
  product: SampleProduct | undefined,
  placement: string,
  show: boolean,
) {
  // remove prior safe area
  canvas.getObjects().forEach((o) => {
    const data = (o as { data?: { safeArea?: boolean } }).data;
    if (data?.safeArea) canvas.remove(o);
  });
  if (!show) {
    canvas.requestRenderAll();
    return;
  }

  const zone = product?.placementZones?.find((z) => z.key === placement);
  if (!zone) {
    canvas.requestRenderAll();
    return;
  }
  // Map a 12" reference to 75% of the canvas width for visualization.
  const side = canvas.getWidth();
  const pxPerInch = (side * 0.75) / 12;
  const w = zone.widthIn * pxPerInch;
  const h = zone.heightIn * pxPerInch;
  const rect = new fabric.Rect({
    width: w,
    height: h,
    left: side / 2,
    top: side / 2,
    originX: "center",
    originY: "center",
    fill: "rgba(212, 160, 23, 0.08)",
    stroke: "#D4A017",
    strokeDashArray: [6, 6],
    strokeWidth: 1.5,
    selectable: false,
    evented: false,
  });
  (rect as { data?: { safeArea?: boolean } }).data = { safeArea: true };
  canvas.add(rect);
  canvas.sendObjectToBack(rect);
  canvas.requestRenderAll();
}
