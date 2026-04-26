/**
 * Parse and normalize a hex color input.
 *
 * Accepts: "#fff", "fff", "#ffffff", "ffffff", with optional whitespace.
 * Returns the canonical lowercase `#rrggbb` form, or null if the input
 * isn't a valid 3- or 6-digit hex.
 *
 * Used by every color UX in the designer (garment, text, drag-and-drop)
 * so all callers can rely on the same shape.
 */
export function parseHex(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim().replace(/^#/, "").toLowerCase();
  if (!/^[0-9a-f]+$/.test(trimmed)) return null;
  if (trimmed.length === 3) {
    return `#${trimmed
      .split("")
      .map((c) => c + c)
      .join("")}`;
  }
  if (trimmed.length === 6) {
    return `#${trimmed}`;
  }
  return null;
}

/** MIME type used for color hex transfer in HTML5 drag-and-drop. */
export const COLOR_DRAG_TYPE = "application/x-color-hex";
