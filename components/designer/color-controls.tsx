"use client";

import * as React from "react";
import { COLOR_DRAG_TYPE, parseHex } from "@/lib/utils/hex-color";
import { cn } from "@/lib/utils/cn";

/**
 * Tiny clickable + draggable color swatch. Used both as a preset button
 * and as the "active color" chip; dragging it transfers the hex via the
 * COLOR_DRAG_TYPE MIME so designer canvases can drop it onto a target.
 */
export function ColorChip({
  hex,
  selected,
  ariaLabel,
  onClick,
  className,
}: {
  hex: string;
  selected?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
  className?: string;
}) {
  const onDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData(COLOR_DRAG_TYPE, hex);
    e.dataTransfer.setData("text/plain", hex);
    e.dataTransfer.effectAllowed = "copy";
  };
  return (
    <button
      type="button"
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      className={cn(
        "h-6 w-full rounded border cursor-grab active:cursor-grabbing",
        selected ? "border-ink ring-1 ring-ink" : "border-ink/15",
        className,
      )}
      style={{ backgroundColor: hex }}
      aria-label={ariaLabel ?? `Color ${hex}`}
      title={`${hex} — drag onto an element to recolor`}
    />
  );
}

/**
 * Native `<input type="color">` plus a 7-char hex text input. Updates the
 * swatch live as the user types valid hex; reverts on blur if invalid.
 * The swatch itself is draggable — picks up the current value as the drag
 * payload so users can pick a custom color and drop it onto a target.
 */
export function HexInput({
  value,
  onChange,
  ariaLabel,
}: {
  value: string;
  onChange: (hex: string) => void;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = React.useState(value);
  const [invalid, setInvalid] = React.useState(false);

  // Sync external value updates (e.g. drag-drop or preset click).
  React.useEffect(() => {
    setDraft(value);
    setInvalid(false);
  }, [value]);

  const onSwatchDragStart = (e: React.DragEvent<HTMLInputElement>) => {
    const canonical = parseHex(value) ?? value;
    e.dataTransfer.setData(COLOR_DRAG_TYPE, canonical);
    e.dataTransfer.setData("text/plain", canonical);
    e.dataTransfer.effectAllowed = "copy";
  };

  const commit = (raw: string) => {
    const parsed = parseHex(raw);
    if (parsed) {
      setInvalid(false);
      setDraft(parsed);
      onChange(parsed);
    } else {
      setInvalid(true);
      // Revert to the last valid value on blur.
      setDraft(value);
      window.setTimeout(() => setInvalid(false), 800);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        aria-label={ariaLabel ?? "Pick color"}
        value={parseHex(value) ?? "#000000"}
        onChange={(e) => onChange(e.target.value)}
        draggable
        onDragStart={onSwatchDragStart}
        className="h-8 w-10 rounded border border-ink/15 cursor-grab active:cursor-grabbing"
        title={`${value} — drag onto an element to recolor`}
      />
      <input
        type="text"
        value={draft}
        spellCheck={false}
        onChange={(e) => {
          const v = e.target.value;
          setDraft(v);
          const parsed = parseHex(v);
          if (parsed) {
            setInvalid(false);
            onChange(parsed);
          }
        }}
        onBlur={() => commit(draft)}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(value);
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={cn(
          "h-8 w-24 rounded border bg-paper px-2 font-mono text-xs uppercase tracking-wide outline-none focus:ring-1",
          invalid
            ? "border-red-500 ring-red-300"
            : "border-ink/15 focus:border-primary focus:ring-primary",
        )}
        placeholder="#000000"
        maxLength={7}
        aria-label={`${ariaLabel ?? "Color"} hex value`}
      />
    </div>
  );
}

/**
 * Read a color hex from a drop event. Tries the typed payload first,
 * falls back to text/plain for compatibility with apps that don't set
 * the structured type. Returns null if the dropped data isn't valid hex.
 */
export function hexFromDrop(e: { dataTransfer: DataTransfer }): string | null {
  const typed = e.dataTransfer.getData(COLOR_DRAG_TYPE);
  if (typed) {
    const p = parseHex(typed);
    if (p) return p;
  }
  const fallback = e.dataTransfer.getData("text/plain");
  return parseHex(fallback);
}
