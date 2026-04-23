"use client";

import * as React from "react";
import * as fabric from "fabric";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import type { DesignerSettings } from "./designer-client";

type Api = {
  addText: (text: string) => void;
  addImage: (url: string) => void;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  exportPNG: () => string;
  exportJSON: () => object;
  clear: () => void;
};

const BASE = 720; // canvas side length in px

export function FabricCanvas({
  product,
  placement,
  settings,
  onReady,
}: {
  product?: SampleProduct;
  placement: string;
  settings: DesignerSettings;
  onReady: (api: Api) => void;
}) {
  const ref = React.useRef<HTMLCanvasElement | null>(null);
  const canvasRef = React.useRef<fabric.Canvas | null>(null);

  // Init canvas once
  React.useEffect(() => {
    if (!ref.current) return;
    const canvas = new fabric.Canvas(ref.current, {
      width: BASE,
      height: BASE,
      backgroundColor: "#f6f4ef",
      selection: true,
      preserveObjectStacking: true,
    });
    canvasRef.current = canvas;

    const bgUrl = product
      ? `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`
      : null;
    if (bgUrl) {
      fabric.FabricImage.fromURL(bgUrl, { crossOrigin: "anonymous" }).then((img) => {
        if (!img || !canvasRef.current) return;
        const scale = Math.min(BASE / (img.width || BASE), BASE / (img.height || BASE));
        img.scale(scale);
        img.set({ selectable: false, evented: false, opacity: 0.92 });
        canvas.backgroundImage = img;
        canvas.requestRenderAll();
      });
    }

    drawSafeArea(canvas, product, placement, settings.showSafeArea);

    const api: Api = {
      addText: (txt) => {
        const text = new fabric.IText(txt, {
          fontFamily: "Inter Tight",
          fontSize: 48,
          fill: "#1A1A1A",
          left: BASE / 2 - 100,
          top: BASE / 2 - 30,
          textAlign: "center",
        });
        canvas.add(text);
        canvas.setActiveObject(text);
      },
      addImage: (url) => {
        fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" }).then((img) => {
          if (!img) return;
          const maxSide = BASE * 0.55;
          const scale = Math.min(maxSide / (img.width || maxSide), maxSide / (img.height || maxSide));
          img.set({
            left: BASE / 2,
            top: BASE / 2,
            originX: "center",
            originY: "center",
            scaleX: scale,
            scaleY: scale,
          });
          canvas.add(img);
          canvas.setActiveObject(img);
        });
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
      exportPNG: () =>
        canvas.toDataURL({ format: "png", multiplier: 2 }),
      exportJSON: () => canvas.toJSON(),
      clear: () => {
        canvas.getObjects().forEach((o) => {
          const name = (o as { data?: { safeArea?: boolean } }).data;
          if (!name?.safeArea) canvas.remove(o);
        });
      },
    };
    onReady(api);

    return () => {
      canvas.dispose();
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
      <div className="mx-auto max-w-[720px]">
        <canvas ref={ref} className="w-full rounded border border-ink/15 bg-paper shadow-press" />
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
  const pxPerInch = (BASE * 0.75) / 12;
  const w = zone.widthIn * pxPerInch;
  const h = zone.heightIn * pxPerInch;
  const rect = new fabric.Rect({
    width: w,
    height: h,
    left: BASE / 2,
    top: BASE / 2,
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
