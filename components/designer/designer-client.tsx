"use client";

import * as React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Eyebrow } from "@/components/ui/eyebrow";
import { productBySlug } from "@/lib/catalog/sample-products";
import type { SampleProduct } from "@/lib/catalog/sample-products";
import { useCart } from "@/lib/store/cart";
import { DesignerToolbar } from "./designer-toolbar";
import type { CanvasApi } from "./fabric-canvas";
import { useDesignerStore } from "@/lib/designer/store";
import { exportFlatArtwork } from "@/lib/designer/export-flat";
import type { Viewer3DApi } from "./viewer-3d";
import { useMockup2DStore } from "@/lib/mockup/store";
import { exportFlatArtwork2D } from "@/lib/mockup/export-flat";
import type { Viewer2DApi } from "./viewer-2d";

const FabricCanvas = dynamic(() => import("./fabric-canvas").then((m) => m.FabricCanvas), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full rounded-lg bg-paper-warm animate-pulse" />
  ),
});

const Viewer3D = dynamic(() => import("./viewer-3d").then((m) => m.Viewer3D), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full rounded-lg bg-paper-warm animate-pulse flex items-center justify-center text-ink-mute text-sm">
      Loading 3D viewer…
    </div>
  ),
});

const Toolbar3D = dynamic(() => import("./toolbar-3d").then((m) => m.Toolbar3D), {
  ssr: false,
});

const Inspector3D = dynamic(() => import("./inspector-3d").then((m) => m.Inspector3D), {
  ssr: false,
});

const Viewer2D = dynamic(() => import("./viewer-2d").then((m) => m.Viewer2D), {
  ssr: false,
  loading: () => (
    <div className="aspect-square w-full rounded-lg bg-paper-warm animate-pulse flex items-center justify-center text-ink-mute text-sm">
      Loading mockup…
    </div>
  ),
});

const Toolbar2D = dynamic(() => import("./toolbar-2d").then((m) => m.Toolbar2D), { ssr: false });
const Inspector2D = dynamic(() => import("./inspector-2d").then((m) => m.Inspector2D), { ssr: false });

export type DesignerSettings = {
  unit: "in" | "cm";
  showSafeArea: boolean;
};

function unitPriceFor(product: SampleProduct, qty: number): number {
  if (!product.basePriceCents) return 0;
  const tiers = product.tierBreaks ?? [
    { minQty: product.minQty, unitCents: product.basePriceCents },
  ];
  let match = tiers[0];
  for (const t of tiers) if (qty >= t.minQty) match = t;
  return match.unitCents;
}

export function DesignerClient({
  initial,
}: {
  initial: { product?: string; method?: string; qty?: string };
}) {
  const product = initial.product ? productBySlug(initial.product) : undefined;

  if (product?.mockup2D) {
    return <DesignerClient2DMockup product={product} initial={initial} />;
  }
  if (product?.model3D) {
    return <DesignerClient3D product={product} initial={initial} />;
  }
  return <DesignerClient2D initial={initial} />;
}

// ─── 2D photoreal mockup variant ───────────────────────────────────────────

function DesignerClient2DMockup({
  product,
  initial,
}: {
  product: SampleProduct;
  initial: { product?: string; method?: string; qty?: string };
}) {
  const router = useRouter();
  const addCartItem = useCart((s) => s.add);
  const init = useMockup2DStore((s) => s.init);
  const elements = useMockup2DStore((s) => s.elements);
  const zones = useMockup2DStore((s) => s.zones);
  const activeZoneKey = useMockup2DStore((s) => s.activeZoneKey);
  const viewerApiRef = React.useRef<Viewer2DApi | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    init({
      productSlug: product.slug,
      zones: product.placementZones ?? [],
      views: product.mockup2D?.views ?? [],
      defaultGarmentColor: product.mockup2D?.defaultGarmentColor,
    });
  }, [init, product.slug, product.placementZones, product.mockup2D]);

  async function saveDesign(): Promise<{
    id?: string;
    previewUrl?: string;
    artworkUrl?: string;
  } | null> {
    setSaving(true);
    try {
      const previewDataUrl = viewerApiRef.current?.exportPNG() ?? null;
      const artworkPngDataUrl = await exportFlatArtwork2D(elements, zones);
      const res = await fetch("/api/designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          designJson: { kind: "mockup2d", elements, activeZoneKey },
          previewDataUrl,
          artworkPngDataUrl,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          id: string;
          previewUrl?: string | null;
          artworkUrl?: string | null;
        };
        return {
          id: data.id,
          previewUrl: data.previewUrl ?? previewDataUrl ?? undefined,
          artworkUrl: data.artworkUrl ?? artworkPngDataUrl ?? undefined,
        };
      }
      if (res.status === 401) {
        try {
          localStorage.setItem(
            `gaph-design-2dmockup-${product.slug}`,
            JSON.stringify({ elements, previewDataUrl, artworkPngDataUrl }),
          );
        } catch {
          /* noop */
        }
        return {
          previewUrl: previewDataUrl ?? undefined,
          artworkUrl: artworkPngDataUrl ?? undefined,
        };
      }
      throw new Error(`Save failed: ${res.status}`);
    } catch (err) {
      console.error("saveDesign error", err);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function onSaveClick() {
    const result = await saveDesign();
    if (!result) {
      toast.error("Couldn't save design", { description: "Please try again." });
      return;
    }
    if (result.id) {
      toast.success("Design saved", {
        description: "Find it under Account → Designs.",
        action: { label: "View", onClick: () => router.push("/account/designs") },
      });
    } else {
      toast.info("Saved on this device", {
        description: "Sign in to save designs to your account permanently.",
        action: { label: "Sign in", onClick: () => router.push("/auth/sign-in") },
      });
    }
  }

  async function onAddToCart() {
    const result = await saveDesign();
    if (!result) {
      toast.error("Couldn't save design", { description: "Please try again." });
      return;
    }
    const qty = Number(initial.qty) || product.minQty;
    const method = initial.method ?? product.decorationMethods[0] ?? "custom";
    const placement = activeZoneKey ?? product.placementZones?.[0]?.key ?? "";
    const id = `${product.slug}-${placement}-${method}-${Date.now()}`;
    addCartItem({
      id,
      productSlug: product.slug,
      title: product.title,
      variant: `Custom · ${placement}`,
      unitPriceCents: unitPriceFor(product, qty),
      quantity: qty,
      image:
        result.previewUrl ??
        `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`,
      decoration: {
        method,
        placement,
        designId: result.id,
        proofUrl: result.previewUrl,
        artworkFileUrl: result.artworkUrl,
      },
      leadTimeDays: product.leadTimeDays,
    });
    toast.success("Added to cart", {
      description: `${qty} × ${product.title}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
    router.push("/cart");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <Eyebrow tone="crimson">Designer · Photoreal Preview</Eyebrow>
          <h1 className="heading-display text-3xl sm:text-4xl">
            {product.title}
            {initial.method && (
              <span className="text-ink-mute font-normal text-xl"> · {initial.method}</span>
            )}
          </h1>
          <p className="text-ink-mute text-sm mt-1">
            Add elements, drag them on the garment, change the color — what you see is how
            it&apos;ll look. Production prints from the flat artwork file we save alongside.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="md" onClick={onSaveClick} disabled={saving}>
            <Icon icon="cloud-arrow-up" /> {saving ? "Saving…" : "Save design"}
          </Button>
          <Button size="md" onClick={onAddToCart} disabled={saving}>
            <Icon icon="bag-shopping" /> Add to cart
          </Button>
          <Button asChild size="md" variant="ghost">
            <Link href={`/product/${product.slug}`}>
              <Icon icon="arrow-left" /> Back to product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px,1fr,300px] gap-6">
        <Toolbar2D product={product} />
        <div className="space-y-4">
          <Viewer2D product={product} apiRef={viewerApiRef} />
        </div>
        <Inspector2D />
      </div>
    </div>
  );
}

// ─── 3D variant ────────────────────────────────────────────────────────────

function DesignerClient3D({
  product,
  initial,
}: {
  product: SampleProduct;
  initial: { product?: string; method?: string; qty?: string };
}) {
  const router = useRouter();
  const addCartItem = useCart((s) => s.add);
  const init = useDesignerStore((s) => s.init);
  const elements = useDesignerStore((s) => s.elements);
  const zones = useDesignerStore((s) => s.zones);
  const activeZoneKey = useDesignerStore((s) => s.activeZoneKey);
  const viewerApiRef = React.useRef<Viewer3DApi | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    init({ productSlug: product.slug, zones: product.placementZones ?? [] });
  }, [init, product.slug, product.placementZones]);

  async function saveDesign(): Promise<{
    id?: string;
    previewUrl?: string;
    artworkUrl?: string;
  } | null> {
    setSaving(true);
    try {
      const previewDataUrl = viewerApiRef.current?.exportPNG() ?? null;
      const artworkPngDataUrl = await exportFlatArtwork(elements, zones);
      const designElements = elements;
      const res = await fetch("/api/designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          designJson: { kind: "3d", elements: designElements, activeZoneKey },
          previewDataUrl,
          artworkPngDataUrl,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          id: string;
          previewUrl?: string | null;
          artworkUrl?: string | null;
        };
        return {
          id: data.id,
          previewUrl: data.previewUrl ?? previewDataUrl ?? undefined,
          artworkUrl: data.artworkUrl ?? artworkPngDataUrl ?? undefined,
        };
      }
      if (res.status === 401) {
        try {
          localStorage.setItem(
            `gaph-design-3d-${product.slug}`,
            JSON.stringify({ designElements, previewDataUrl, artworkPngDataUrl }),
          );
        } catch {
          /* noop */
        }
        return {
          previewUrl: previewDataUrl ?? undefined,
          artworkUrl: artworkPngDataUrl ?? undefined,
        };
      }
      throw new Error(`Save failed: ${res.status}`);
    } catch (err) {
      console.error("saveDesign error", err);
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function onSaveClick() {
    const result = await saveDesign();
    if (!result) {
      toast.error("Couldn't save design", { description: "Please try again." });
      return;
    }
    if (result.id) {
      toast.success("Design saved", {
        description: "Find it under Account → Designs.",
        action: { label: "View", onClick: () => router.push("/account/designs") },
      });
    } else {
      toast.info("Saved on this device", {
        description: "Sign in to save designs to your account permanently.",
        action: { label: "Sign in", onClick: () => router.push("/auth/sign-in") },
      });
    }
  }

  async function onAddToCart() {
    const result = await saveDesign();
    if (!result) {
      toast.error("Couldn't save design", { description: "Please try again." });
      return;
    }
    const qty = Number(initial.qty) || product.minQty;
    const method = initial.method ?? product.decorationMethods[0] ?? "custom";
    const placement = activeZoneKey ?? product.placementZones?.[0]?.key ?? "";
    const id = `${product.slug}-${placement}-${method}-${Date.now()}`;
    addCartItem({
      id,
      productSlug: product.slug,
      title: product.title,
      variant: `Custom · ${placement}`,
      unitPriceCents: unitPriceFor(product, qty),
      quantity: qty,
      image:
        result.previewUrl ??
        `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`,
      decoration: {
        method,
        placement,
        designId: result.id,
        proofUrl: result.previewUrl,
        artworkFileUrl: result.artworkUrl,
      },
      leadTimeDays: product.leadTimeDays,
    });
    toast.success("Added to cart", {
      description: `${qty} × ${product.title}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
    router.push("/cart");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <Eyebrow tone="crimson">Designer · 3D Preview</Eyebrow>
          <h1 className="heading-display text-3xl sm:text-4xl">
            {product.title}
            {initial.method && (
              <span className="text-ink-mute font-normal text-xl"> · {initial.method}</span>
            )}
          </h1>
          <p className="text-ink-mute text-sm mt-1">
            Add elements, drag them on the model, and rotate to preview from every angle.
            Production receives the flat artwork file.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="md" onClick={onSaveClick} disabled={saving}>
            <Icon icon="cloud-arrow-up" /> {saving ? "Saving…" : "Save design"}
          </Button>
          <Button size="md" onClick={onAddToCart} disabled={saving}>
            <Icon icon="bag-shopping" /> Add to cart
          </Button>
          <Button asChild size="md" variant="ghost">
            <Link href={`/product/${product.slug}`}>
              <Icon icon="arrow-left" /> Back to product
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px,1fr,300px] gap-6">
        <Toolbar3D />
        <div className="space-y-4">
          <Viewer3D product={product} apiRef={viewerApiRef} />
        </div>
        <Inspector3D />
      </div>
    </div>
  );
}

// ─── 2D fallback (existing Fabric path, unchanged behavior) ────────────────

function DesignerClient2D({
  initial,
}: {
  initial: { product?: string; method?: string; qty?: string };
}) {
  const router = useRouter();
  const product = initial.product ? productBySlug(initial.product) : undefined;
  const addCartItem = useCart((s) => s.add);

  const [settings, setSettings] = React.useState<DesignerSettings>({
    unit: "in",
    showSafeArea: true,
  });
  const [placement, setPlacement] = React.useState<string>(
    product?.placementZones?.[0]?.key ?? "full-front",
  );
  const [font, setFont] = React.useState("Inter Tight");
  const [fillColor, setFillColor] = React.useState("#1A1A1A");
  const [fontSize, setFontSize] = React.useState(48);
  const [canvasApi, setCanvasApi] = React.useState<CanvasApi | null>(null);
  const [saving, setSaving] = React.useState(false);

  const productTitle = product?.title ?? "Custom product";

  const onFontChange = React.useCallback(
    (family: string) => {
      setFont(family);
      void canvasApi?.applyFontToActive(family);
    },
    [canvasApi],
  );

  const onFillChange = React.useCallback(
    (hex: string) => {
      setFillColor(hex);
      canvasApi?.applyFillToActive(hex);
    },
    [canvasApi],
  );

  const onFontSizeChange = React.useCallback(
    (px: number) => {
      setFontSize(px);
      canvasApi?.applyFontSizeToActive(px);
    },
    [canvasApi],
  );

  async function onAddText(t: string) {
    if (!canvasApi) return;
    try {
      await canvasApi.addText(t || "Text");
    } catch (err) {
      console.error("addText failed", err);
      toast.error("Couldn't add text", { description: "Try a different font or refresh." });
    }
  }

  async function onUploadFile(file: File) {
    if (!canvasApi) return;
    const url = URL.createObjectURL(file);
    try {
      await canvasApi.addImage(url);
      toast.success("Artwork added", { description: file.name });
    } catch {
      toast.error("Couldn't add image", {
        description: "The file may be corrupted or too large. Try a PNG/JPG under 10MB.",
      });
    }
  }

  async function saveDesign(): Promise<{ id?: string; previewUrl?: string } | null> {
    if (!canvasApi) return null;
    setSaving(true);
    const preview = canvasApi.exportPNG();
    const design = canvasApi.exportJSON();
    try {
      const res = await fetch("/api/designer/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product?.slug,
          designJson: design,
          previewDataUrl: preview,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string; previewUrl?: string | null };
        return { id: data.id, previewUrl: data.previewUrl ?? undefined };
      }
      if (res.status === 401) {
        localStorage.setItem(
          `gaph-design-${product?.slug ?? "generic"}`,
          JSON.stringify({ design, preview }),
        );
        return { previewUrl: preview };
      }
      throw new Error(`Save failed: ${res.status}`);
    } catch (err) {
      console.error("saveDesign error", err);
      try {
        localStorage.setItem(
          `gaph-design-${product?.slug ?? "generic"}`,
          JSON.stringify({ design, preview }),
        );
      } catch {
        /* noop */
      }
      return { previewUrl: preview };
    } finally {
      setSaving(false);
    }
  }

  async function onSaveClick() {
    const result = await saveDesign();
    if (!result) return;
    if (result.id) {
      toast.success("Design saved", {
        description: "Find it under Account → Designs.",
        action: { label: "View", onClick: () => router.push("/account/designs") },
      });
    } else {
      toast.info("Saved on this device", {
        description: "Sign in to save designs to your account permanently.",
        action: { label: "Sign in", onClick: () => router.push("/auth/sign-in") },
      });
    }
  }

  async function onAddToCart() {
    if (!product) {
      toast.error("Pick a product first", {
        description: "Open the designer from a product page to add to cart.",
      });
      return;
    }
    const result = await saveDesign();
    if (!result) return;
    const qty = Number(initial.qty) || product.minQty;
    const method = initial.method ?? product.decorationMethods[0] ?? "custom";
    const id = `${product.slug}-${placement}-${method}-${Date.now()}`;
    addCartItem({
      id,
      productSlug: product.slug,
      title: product.title,
      variant: `Custom · ${placement}`,
      unitPriceCents: unitPriceFor(product, qty),
      quantity: qty,
      image:
        result.previewUrl ??
        `/images/generated/${product.heroPromptKey.replace(":", "-")}.webp`,
      decoration: {
        method,
        placement,
        designId: result.id,
        proofUrl: result.previewUrl,
      },
      leadTimeDays: product.leadTimeDays,
    });
    toast.success("Added to cart", {
      description: `${qty} × ${product.title}`,
      action: { label: "View cart", onClick: () => router.push("/cart") },
    });
    router.push("/cart");
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
        <div>
          <Eyebrow tone="crimson">Designer</Eyebrow>
          <h1 className="heading-display text-3xl sm:text-4xl">
            {productTitle}
            {initial.method && (
              <span className="text-ink-mute font-normal text-xl"> · {initial.method}</span>
            )}
          </h1>
          <p className="text-ink-mute text-sm mt-1">
            Add text, upload artwork, and see your proof in real time. All orders are
            proofed before we press.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="md" onClick={onSaveClick} disabled={saving || !canvasApi}>
            <Icon icon="cloud-arrow-up" /> {saving ? "Saving…" : "Save design"}
          </Button>
          {product && (
            <Button size="md" onClick={onAddToCart} disabled={saving || !canvasApi}>
              <Icon icon="bag-shopping" /> Add to cart
            </Button>
          )}
          <Button asChild size="md" variant="ghost">
            <Link href={product ? `/product/${product.slug}` : "/"}>
              <Icon icon="arrow-left" /> Back to product
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
          font={font}
          onFontChange={onFontChange}
          fillColor={fillColor}
          onFillChange={onFillChange}
          fontSize={fontSize}
          onFontSizeChange={onFontSizeChange}
          onAddText={onAddText}
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
            font={font}
            fillColor={fillColor}
            fontSize={fontSize}
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
