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
  elements: DesignElement2D[];
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
  updateElement: (
    id: string,
    patch: Partial<TextElement2D> | Partial<ImageElement2D>,
  ) => void;
  updateAnchor: (id: string, patch: Partial<Anchor2D>) => void;
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

export const useMockup2DStore = create<Mockup2DStore>()(
  temporal(
    (set, get) => ({
      productSlug: null,
      zones: [],
      views: [],
      activeViewKey: null,
      activeZoneKey: null,
      elements: [],
      selectedId: null,
      garmentColor: "#ffffff",

      init: ({ productSlug, zones, views, defaultGarmentColor }) =>
        set({
          productSlug,
          zones,
          views,
          activeViewKey: views[0]?.key ?? null,
          activeZoneKey: zones[0]?.key ?? null,
          elements: [],
          selectedId: null,
          garmentColor: defaultGarmentColor ?? "#ffffff",
        }),

      setActiveView: (key) => set({ activeViewKey: key }),
      setActiveZone: (key) => set({ activeZoneKey: key }),
      setGarmentColor: (hex) => set({ garmentColor: hex }),

      addText: ({ content, fontFamily, fontSize, fillColor, anchor }) => {
        const { activeZoneKey, zones } = get();
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
        set((s) => ({ elements: [...s.elements, el], selectedId: id }));
        return id;
      },

      addImage: ({ src, naturalWidth, naturalHeight, anchor }) => {
        const { activeZoneKey, zones } = get();
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
        set((s) => ({ elements: [...s.elements, el], selectedId: id }));
        return id;
      },

      updateElement: (id, patch) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id ? ({ ...e, ...patch } as DesignElement2D) : e,
          ),
        })),

      updateAnchor: (id, patch) =>
        set((s) => ({
          elements: s.elements.map((e) =>
            e.id === id ? { ...e, anchor: { ...e.anchor, ...patch } } : e,
          ),
        })),

      select: (id) => set({ selectedId: id }),

      remove: (id) =>
        set((s) => ({
          elements: s.elements.filter((e) => e.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        })),

      clear: () => set({ elements: [], selectedId: null }),
    }),
    {
      partialize: (state) => ({
        elements: state.elements,
        garmentColor: state.garmentColor,
      }),
      limit: 50,
    },
  ),
);

export const useMockup2DHistory = () => useMockup2DStore.temporal;
