"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type { Anchor2D, DesignElement2D, ImageElement2D, TextElement2D } from "./types";
import type { Mockup2DView, PlacementZone } from "@/lib/catalog/sample-products";

type Mockup2DState = {
  productSlug: string | null;
  zones: PlacementZone[];
  views: Mockup2DView[];
  activeViewKey: string | null;
  activeZoneKey: string | null;
  /** Per-view design elements — switching views shows a fresh canvas. */
  elementsByView: Record<string, DesignElement2D[]>;
  selectedId: string | null;
  garmentColor: string;
};

type Mockup2DActions = {
  init: (args: {
    productSlug: string;
    zones: PlacementZone[];
    views: Mockup2DView[];
    defaultGarmentColor?: string;
  }) => void;
  setActiveView: (key: string) => void;
  setActiveZone: (key: string) => void;
  setGarmentColor: (hex: string) => void;
  addText: (input: {
    content: string;
    fontFamily: string;
    fontSize: number;
    fillColor: string;
    anchor?: Partial<Anchor2D>;
  }) => string;
  addImage: (input: {
    src: string;
    naturalWidth: number;
    naturalHeight: number;
    anchor?: Partial<Anchor2D>;
  }) => string;
  /** Replace the active view's contents with one image sized to fill its zone. */
  applyFinishedDesign: (input: {
    src: string;
    naturalWidth: number;
    naturalHeight: number;
  }) => string;
  updateElement: (
    id: string,
    patch: Partial<TextElement2D> | Partial<ImageElement2D>,
  ) => void;
  updateAnchor: (id: string, patch: Partial<Anchor2D>) => void;
  setElementFillColor: (id: string, hex: string) => void;
  select: (id: string | null) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export type Mockup2DStore = Mockup2DState & Mockup2DActions;

function nextId() {
  return `el2d_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function defaultAnchorForZone(zone: PlacementZone | undefined): Anchor2D {
  if (!zone?.anchor2D) {
    return { x: 0.5, y: 0.5, rotation: 0, widthIn: 6, heightIn: 6 };
  }
  return {
    x: zone.anchor2D.centerXY[0],
    y: zone.anchor2D.centerXY[1],
    rotation: 0,
    widthIn: Math.min(zone.widthIn, 8),
    heightIn: Math.min(zone.heightIn, 8),
  };
}

/** Aspect-fit a (naturalWidth × naturalHeight) into a zone's printable area. */
function fitImageToZone(
  zone: PlacementZone | undefined,
  naturalWidth: number,
  naturalHeight: number,
): Anchor2D {
  const base = defaultAnchorForZone(zone);
  if (!zone) return base;
  const aspect = naturalWidth / naturalHeight;
  const zoneAspect = zone.widthIn / zone.heightIn;
  let widthIn: number;
  let heightIn: number;
  if (aspect >= zoneAspect) {
    widthIn = zone.widthIn;
    heightIn = zone.widthIn / aspect;
  } else {
    heightIn = zone.heightIn;
    widthIn = zone.heightIn * aspect;
  }
  return { ...base, widthIn, heightIn };
}

/**
 * Stable empty-array reference for views with no elements yet.
 * Critical: returning `[]` literal each call would make `useSyncExternalStore`
 * see a fresh snapshot every render and infinite-loop the component.
 */
const EMPTY_ELEMENTS: readonly DesignElement2D[] = Object.freeze([]);

/** Selector helper: the elements visible on the active view. */
export const selectActiveElements = (s: Mockup2DState): DesignElement2D[] => {
  if (!s.activeViewKey) return EMPTY_ELEMENTS as DesignElement2D[];
  return (s.elementsByView[s.activeViewKey] ?? EMPTY_ELEMENTS) as DesignElement2D[];
};

export const useMockup2DStore = create<Mockup2DStore>()(
  temporal(
    (set, get) => ({
      productSlug: null,
      zones: [],
      views: [],
      activeViewKey: null,
      activeZoneKey: null,
      elementsByView: {},
      selectedId: null,
      garmentColor: "#ffffff",

      init: ({ productSlug, zones, views, defaultGarmentColor }) =>
        set({
          productSlug,
          zones,
          views,
          activeViewKey: views[0]?.key ?? null,
          activeZoneKey: zones[0]?.key ?? null,
          elementsByView: {},
          selectedId: null,
          garmentColor: defaultGarmentColor ?? "#ffffff",
        }),

      setActiveView: (key) => set({ activeViewKey: key, selectedId: null }),
      setActiveZone: (key) => set({ activeZoneKey: key }),
      setGarmentColor: (hex) => set({ garmentColor: hex }),

      addText: ({ content, fontFamily, fontSize, fillColor, anchor }) => {
        const { activeZoneKey, activeViewKey, zones, elementsByView } = get();
        if (!activeViewKey) return "";
        const zone = zones.find((z) => z.key === activeZoneKey);
        const id = nextId();
        const baseAnchor = defaultAnchorForZone(zone);
        const el: TextElement2D = {
          id,
          type: "text",
          zoneKey: activeZoneKey ?? "",
          content,
          fontFamily,
          fontSize,
          fillColor,
          anchor: { ...baseAnchor, ...anchor },
        };
        const prev = elementsByView[activeViewKey] ?? [];
        set({
          elementsByView: { ...elementsByView, [activeViewKey]: [...prev, el] },
          selectedId: id,
        });
        return id;
      },

      addImage: ({ src, naturalWidth, naturalHeight, anchor }) => {
        const { activeZoneKey, activeViewKey, zones, elementsByView } = get();
        if (!activeViewKey) return "";
        const zone = zones.find((z) => z.key === activeZoneKey);
        const id = nextId();
        const baseAnchor = defaultAnchorForZone(zone);
        const aspect = naturalWidth / naturalHeight;
        const widthIn = baseAnchor.widthIn;
        const heightIn = widthIn / aspect;
        const el: ImageElement2D = {
          id,
          type: "image",
          zoneKey: activeZoneKey ?? "",
          src,
          naturalWidth,
          naturalHeight,
          anchor: { ...baseAnchor, widthIn, heightIn, ...anchor },
        };
        const prev = elementsByView[activeViewKey] ?? [];
        set({
          elementsByView: { ...elementsByView, [activeViewKey]: [...prev, el] },
          selectedId: id,
        });
        return id;
      },

      applyFinishedDesign: ({ src, naturalWidth, naturalHeight }) => {
        const { activeZoneKey, activeViewKey, zones, elementsByView } = get();
        if (!activeViewKey) return "";
        const zone = zones.find((z) => z.key === activeZoneKey);
        const id = nextId();
        const el: ImageElement2D = {
          id,
          type: "image",
          zoneKey: activeZoneKey ?? "",
          src,
          naturalWidth,
          naturalHeight,
          anchor: fitImageToZone(zone, naturalWidth, naturalHeight),
        };
        // Replace the active view's content; other views are untouched so a
        // user with a Front design uploading a Back finished file keeps both.
        set({
          elementsByView: { ...elementsByView, [activeViewKey]: [el] },
          selectedId: id,
        });
        return id;
      },

      updateElement: (id, patch) => {
        const { activeViewKey, elementsByView } = get();
        if (!activeViewKey) return;
        const list = elementsByView[activeViewKey] ?? [];
        set({
          elementsByView: {
            ...elementsByView,
            [activeViewKey]: list.map((e) =>
              e.id === id ? ({ ...e, ...patch } as DesignElement2D) : e,
            ),
          },
        });
      },

      updateAnchor: (id, patch) => {
        const { activeViewKey, elementsByView } = get();
        if (!activeViewKey) return;
        const list = elementsByView[activeViewKey] ?? [];
        set({
          elementsByView: {
            ...elementsByView,
            [activeViewKey]: list.map((e) =>
              e.id === id ? { ...e, anchor: { ...e.anchor, ...patch } } : e,
            ),
          },
        });
      },

      setElementFillColor: (id, hex) => {
        const { activeViewKey, elementsByView } = get();
        if (!activeViewKey) return;
        const list = elementsByView[activeViewKey] ?? [];
        set({
          elementsByView: {
            ...elementsByView,
            [activeViewKey]: list.map((e) =>
              e.id === id && e.type === "text" ? { ...e, fillColor: hex } : e,
            ),
          },
        });
      },

      select: (id) => set({ selectedId: id }),

      remove: (id) => {
        const { activeViewKey, elementsByView, selectedId } = get();
        if (!activeViewKey) return;
        const list = elementsByView[activeViewKey] ?? [];
        set({
          elementsByView: {
            ...elementsByView,
            [activeViewKey]: list.filter((e) => e.id !== id),
          },
          selectedId: selectedId === id ? null : selectedId,
        });
      },

      clear: () => {
        const { activeViewKey, elementsByView } = get();
        if (!activeViewKey) return;
        set({
          elementsByView: { ...elementsByView, [activeViewKey]: [] },
          selectedId: null,
        });
      },
    }),
    {
      partialize: (state) => ({
        elementsByView: state.elementsByView,
        garmentColor: state.garmentColor,
      }),
      limit: 50,
    },
  ),
);

export const useMockup2DHistory = () => useMockup2DStore.temporal;
