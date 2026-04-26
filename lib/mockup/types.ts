/**
 * Anchor for a 2D-mockup design element. All coords normalized to the
 * mockup photo (0..1, top-left origin), so the same anchor renders
 * consistently across viewport sizes.
 */
export type Anchor2D = {
  /** Center X within the mockup photo (0..1). */
  x: number;
  /** Center Y within the mockup photo (0..1). */
  y: number;
  /** In-plane rotation in radians. */
  rotation: number;
  /** Element width in inches; height derived from aspect. */
  widthIn: number;
  /** Element height in inches. */
  heightIn: number;
};

export type TextElement2D = {
  id: string;
  type: "text";
  zoneKey: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fillColor: string;
  anchor: Anchor2D;
};

export type ImageElement2D = {
  id: string;
  type: "image";
  zoneKey: string;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  anchor: Anchor2D;
};

export type DesignElement2D = TextElement2D | ImageElement2D;
