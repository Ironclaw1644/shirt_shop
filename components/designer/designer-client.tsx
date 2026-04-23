"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { productBySlug } from "@/lib/catalog/sample-products";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import { DesignerToolbar } from "./designer-toolbar";

const FabricCanvas = dynamic(() => import("./fabric-canvas").then((m) => m.FabricCanvas), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full rounded-lg bg-paper-warm animate-pulse" />
  ),
});

export type DesignerSettings = {
  unit: "in" | "cm";
  showSafeArea: boolean;
};

export function DesignerClient({ initial }: { initial: { product?: string; method?: string; qty?: string } }) {
  const product = initial.product ? productBySlug(initial.product) : undefined;
  const [settings, setSettings] = React.useState<DesignerSettings>({
    unit: "in",
    showSafeArea: true,
  });
  const [placement, setPlacement] = React.useState<string>(
    product?.placementZones?.[0]?.key ?? "full-front",
  );
  const [canvasApi, setCanvasApi] = React.useState<{
    addText: (text: string) => void;
    addImage: (url: string) => void;
    deleteSelected: () => void;
    bringForward: () => void;
    sendBackward: () => void;
    exportPNG: () => string;
    exportJSON: () => object;
    clear: () => void;
  } | null>(null);

  const productTitle = product?.title ?? "Custom product";

  async function onUploadFile(file: File) {
    // For preview: use an object URL. Production upload happens server-side on save.
    const url = URL.createObjectURL(file);
    canvasApi?.addImage(url);
    toast.success("Artwork added", { description: file.name });
  }

  async function saveDesign() {
    if (!canvasApi) return;
    const preview = canvasApi.exportPNG();
    const design = canvasApi.exportJSON();
    // Try to save server-side; fall back to client-only stash
    try {
      const res = await fetch("/api/designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product?.slug, designJson: design, previewDataUrl: preview }),
      });
      if (res.ok) {
        const { id } = await res.json();
        toast.success("Design saved", { description: `ID ${id.slice(0, 8)}` });
      } else {
        throw new Error("Save failed");
      }
    } catch {
      localStorage.setItem(
        `gaph-design-${product?.slug ?? "generic"}`,
        JSON.stringify({ design, preview }),
      );
      toast.info("Saved locally", {
        description: "Sign in to save designs to your account permanently.",
      });
    }
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <Eyebrow tone="crimson">Designer</Eyebrow>
          <h1 className="heading-display text-3xl sm:text-4xl">
            {productTitle}
            {initial.method && <span className="text-ink-mute font-normal text-xl"> · {initial.method}</span>}
          </h1>
          <p className="text-ink-mute text-sm mt-1">
            Add text, upload artwork, and see your proof in real time. All orders are
            proofed before we press.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="md" onClick={saveDesign}>
            <Icon icon="cloud-arrow-up" /> Save design
          </Button>
          <Button asChild size="md">
            <Link href={product ? `/product/${product.slug}` : "/"}>
              <Icon icon="bag-shopping" /> Back to product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[320px,1fr] gap-6">
        <DesignerToolbar
          product={product}
          settings={settings}
          onSettingsChange={setSettings}
          placement={placement}
          onPlacement={setPlacement}
          onAddText={(t) => canvasApi?.addText(t)}
          onUpload={onUploadFile}
          onDelete={() => canvasApi?.deleteSelected()}
          onForward={() => canvasApi?.bringForward()}
          onBackward={() => canvasApi?.sendBackward()}
          onClear={() => canvasApi?.clear()}
        />

        <div className="rounded-lg border border-ink/10 bg-paper-warm p-4 sm:p-6">
          <FabricCanvas
            product={product}
            placement={placement}
            settings={settings}
            onReady={setCanvasApi}
          />
          <div className="mt-4 text-xs text-ink-mute flex items-center justify-between">
            <span>
              {settings.unit === "in" ? "Inches" : "Centimeters"} · Safe area shown in gold
            </span>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, unit: s.unit === "in" ? "cm" : "in" }))}
              className="underline-offset-2 hover:underline"
            >
              Switch to {settings.unit === "in" ? "cm" : "in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { SampleProduct };
