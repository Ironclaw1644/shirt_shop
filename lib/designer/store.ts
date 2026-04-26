"use client";

import { create } from "zustand";
import { temporal } from "zundo";
import type { CameraView, DesignElement, ImageElement, TextElement } from "./types";
import type { PlacementZone } from "@/lib/catalog/sample-products";

type DesignerState = {
  productSlug: string | null;
  zones: PlacementZone[];
  activeZoneKey: string | null;
  elements: DesignElement[];
  selectedId: string | null;
  cameraView: CameraView;
};

type DesignerActions = {
  init: (args: { productSlug: string; zones: PlacementZone[] }) => void;
  setActiveZone: (key: string) => void;
  setCameraView: (view: CameraView) => void;
  addText: (input: { content: string; fontFamily: string; fontSize: number; fillColor: string }) => string;
  addImage: (input: { src: string; naturalWidth: number; naturalHeight: number }) => string;
  updateElement: (id: string, patch: Partial<TextElement> | Partial<ImageElement>) => void;
  updateAnchor: (id: string, patch: Partial<DesignElement["anchor"]>) => void;
  select: (id: string | null) => void;
  remove: (id: string) => void;
  clear: () => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
};

export type DesignerStore = DesignerState & DesignerActions;

function nextId() {
  return `el_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function defaultAnchorForZone(zone: PlacementZone | undefined) {
  if (!zone?.anchor3D) {
    return {
      position: [0, 0, 0.4] as [number, number, number],
      normal: [0, 0, 1] as [number, number, number],
      up: [0, 1, 0] as [number, number, number],
      rotation: 0,
      sizeIn: 6,
    };
  }
  return {
    position: [...zone.anchor3D.position] as [number, number, number],
    normal: [...zone.anchor3D.normal] as [number, number, number],
    up: [...zone.anchor3D.up] as [number, number, number],
    rotation: 0,
    sizeIn: Math.min(zone.widthIn, zone.heightIn),
  };
}

export const useDesignerStore = create<DesignerStore>()(
  temporal(
    (set, get) => ({
      productSlug: null,
      zones: [],
      activeZoneKey: null,
      elements: [],
      selectedId: null,
      cameraView: "front",

      init: ({ productSlug, zones }) =>
        set({
          productSlug,
          zones,
          activeZoneKey: zones[0]?.key ?? null,
          elements: [],
          selectedId: null,
          cameraView: "front",
        }),

      setActiveZone: (key) => set({ activeZoneKey: key }),
      setCameraView: (view) => set({ cameraView: view }),

      addText: ({ content, fontFamily, fontSize, fillColor }) => {
        const { activeZoneKey, zones } = get();
        const zone = zones.find((z) => z.key === activeZoneKey);
        const id = nextId();
        const el: TextElement = {
          id,
          type: "text",
          zoneKey: activeZoneKey ?? "",
          content,
          fontFamily,
          fontSize,
          fillColor,
          anchor: defaultAnchorForZone(zone),
        };
        set((s) => ({ elements: [...s.elements, el], selectedId: id }));
        return id;
      },

      addImage: ({ src, naturalWidth, naturalHeight }) => {
        const { activeZoneKey, zones } = get();
        const zone = zones.find((z) => z.key === activeZoneKey);
        const id = nextId();
        const el: ImageElement = {
          id,
          type: "image",
          zoneKey: activeZoneKey ?? "",
          src,
          naturalWidth,
          naturalHeight,
          anchor: defaultAnchorForZone(zone),
        };
        set((s) => ({ elements: [...s.elements, el], selectedId: id }));
        return id;
      },

      updateElement: (id, patch) =>
        set((s) => ({
          elements: s.elements.map((e) => (e.id === id ? ({ ...e, ...patch } as DesignElement) : e)),
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

      bringForward: (id) =>
        set((s) => {
          const i = s.elements.findIndex((e) => e.id === id);
          if (i < 0 || i >= s.elements.length - 1) return s;
          const next = s.elements.slice();
          [next[i], next[i + 1]] = [next[i + 1], next[i]];
          return { elements: next };
        }),

      sendBackward: (id) =>
        set((s) => {
          const i = s.elements.findIndex((e) => e.id === id);
          if (i <= 0) return s;
          const next = s.elements.slice();
          [next[i], next[i - 1]] = [next[i - 1], next[i]];
          return { elements: next };
        }),
    }),
    {
      partialize: (state) => ({ elements: state.elements, selectedId: state.selectedId }),
      limit: 50,
    },
  ),
);

export const useDesignerHistory = () => useDesignerStore.temporal;
