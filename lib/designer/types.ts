import type { Vec3 } from "@/lib/catalog/sample-products";

export type DecalAnchor = {
  /** World-space center of the decal projection. */
  position: Vec3;
  /** Outward surface normal at the position. */
  normal: Vec3;
  /** Up direction for orientation. */
  up: Vec3;
  /** In-plane rotation in radians applied around the normal axis. */
  rotation: number;
  /** Decal size in inches (largest edge); width derived from element aspect. */
  sizeIn: number;
};

export type TextElement = {
  id: string;
  type: "text";
  /** Placement zone key the element was anchored to (snap target on reset). */
  zoneKey: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  anchor: DecalAnchor;
};

export type ImageElement = {
  id: string;
  type: "image";
  zoneKey: string;
  /** Data URL or blob URL for the image source. */
  src: string;
  /** Image natural width in pixels (used for aspect). */
  naturalWidth: number;
  /** Image natural height in pixels. */
  naturalHeight: number;
  anchor: DecalAnchor;
};

export type DesignElement = TextElement | ImageElement;

export type CameraView = "front" | "back" | "left" | "right" | "free";
