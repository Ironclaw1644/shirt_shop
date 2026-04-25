"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { saveProduct, type ProductPayload } from "@/app/admin/products/actions";

type CategoryOpt = { id: string; slug: string; name: string; parent_id: string | null };

type Tier = { id?: string; min_qty: number; max_qty: number | null; unit_price_cents: number };

type ProductInput = {
  id?: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  base_price_cents: number | null;
  min_qty: number;
  lead_time_days: number;
  status: "draft" | "active" | "archived";
  price_status: "confirmed" | "placeholder" | "quote";
  brand: string | null;
  decoration_methods: string[];
  badges: string[];
  category_id: string | null;
  subcategory_id: string | null;
  images: string[];
  options: Record<string, string[]>;
  seo_meta: Record<string, unknown>;
  price_tiers?: { id: string; min_qty: number; max_qty: number | null; unit_price_cents: number }[];
};

export function ProductForm({
  mode,
  product,
  categories,
}: {
  mode: "create" | "edit";
  product?: ProductInput;
  categories: CategoryOpt[];
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const topCats = categories.filter((c) => !c.parent_id);
  const [categoryId, setCategoryId] = React.useState<string>(product?.category_id ?? "");
  const subOptions = categories.filter((c) => c.parent_id === categoryId);
  const [subcategoryId, setSubcategoryId] = React.useState<string>(product?.subcategory_id ?? "");

  const [badges, setBadges] = React.useState<string[]>(product?.badges ?? []);
  const [decorationMethods, setDecorationMethods] = React.useState<string[]>(
    product?.decoration_methods ?? [],
  );
  const [images, setImages] = React.useState<string[]>(product?.images ?? []);
  const [optionsState, setOptionsState] = React.useState<Record<string, string[]>>(
    product?.options ?? {},
  );
  const [tiers, setTiers] = React.useState<Tier[]>(
    (product?.price_tiers ?? []).map((t) => ({ ...t })),
  );

  React.useEffect(() => {
    if (subcategoryId) {
      const sub = categories.find((c) => c.id === subcategoryId);
      if (!sub || sub.parent_id !== categoryId) setSubcategoryId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);

    const basePriceUsd = fd.get("base_price") as string;
    const payload: ProductPayload = {
      title: String(fd.get("title") ?? ""),
      short_description: (fd.get("short_description") as string) || null,
      description: (fd.get("description") as string) || null,
      base_price_cents: basePriceUsd ? Math.round(parseFloat(basePriceUsd) * 100) : null,
      min_qty: Number(fd.get("min_qty") ?? 1),
      lead_time_days: Number(fd.get("lead_time_days") ?? 5),
      status: fd.get("status") as ProductPayload["status"],
      price_status: fd.get("price_status") as ProductPayload["price_status"],
      brand: (fd.get("brand") as string) || null,
      decoration_methods: decorationMethods,
      badges,
      category_id: categoryId || null,
      subcategory_id: subcategoryId || null,
      images: images.filter(Boolean),
      options: optionsState,
      tiers: tiers.map(({ id, ...rest }) => (id ? { id, ...rest } : rest)),
      existing_seo_meta: product?.seo_meta,
    };

    try {
      const res = await saveProduct(mode, product?.id ?? null, payload);
      toast.success("Saved", { description: res.slug });
      router.push(`/admin/products/${res.id}`);
      router.refresh();
    } catch (err) {
      toast.error("Save failed", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Section title="Basics">
        <Field label="Title" name="title" defaultValue={product?.title ?? ""} required />
        <Field label="Short description" name="short_description" defaultValue={product?.short_description ?? ""} />
        <div>
          <Label className="block mb-1">Description</Label>
          <Textarea
            rows={8}
            name="description"
            placeholder="Materials, decoration notes, sizing details, anything customers should know."
            defaultValue={product?.description ?? ""}
          />
        </div>
      </Section>

      <Section title="Categorization">
        <Two>
          <div>
            <Label className="block mb-1">Category</Label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 w-full rounded border border-ink/15 bg-white px-3 text-sm"
            >
              <option value="">— None —</option>
              {topCats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="block mb-1">Subcategory</Label>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}
              className="h-11 w-full rounded border border-ink/15 bg-white px-3 text-sm disabled:opacity-50"
            >
              <option value="">— None —</option>
              {subOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </Two>
        <ChipList label="Badges" values={badges} onChange={setBadges} placeholder="e.g. Bestseller" />
        <Field label="Brand" name="brand" defaultValue={product?.brand ?? ""} />
      </Section>

      <Section title="Pricing & timing">
        <Two>
          <Field
            label="Base price (USD)"
            name="base_price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product?.base_price_cents != null ? (product.base_price_cents / 100).toFixed(2) : ""}
          />
          <Field
            label="Min qty"
            name="min_qty"
            type="number"
            min="1"
            defaultValue={product?.min_qty ?? 1}
          />
        </Two>
        <Two>
          <Field
            label="Lead time (days)"
            name="lead_time_days"
            type="number"
            min="0"
            defaultValue={product?.lead_time_days ?? 5}
          />
          <div>
            <Label className="block mb-1">Price status</Label>
            <select
              name="price_status"
              defaultValue={product?.price_status ?? "confirmed"}
              className="h-11 w-full rounded border border-ink/15 bg-white px-3 text-sm"
            >
              <option value="confirmed">Confirmed</option>
              <option value="placeholder">Placeholder</option>
              <option value="quote">Quote only</option>
            </select>
          </div>
        </Two>
        <div>
          <Label className="block mb-1">Status</Label>
          <select
            name="status"
            defaultValue={product?.status ?? "draft"}
            className="h-11 w-full rounded border border-ink/15 bg-white px-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </Section>

      <Section title="Decoration methods">
        <ChipList
          label="Methods (e.g. screen-print, embroidery)"
          values={decorationMethods}
          onChange={setDecorationMethods}
          placeholder="Type and press Enter"
        />
      </Section>

      <Section title="Options (size, color, etc.)">
        <p className="text-xs text-ink-mute">
          Each option appears as a dropdown on the product page (e.g. <code>Size</code> → <code>S, M, L, XL</code>).
        </p>
        <div className="space-y-2">
          {Object.entries(optionsState).map(([key, vals]) => (
            <div key={key} className="grid grid-cols-1 sm:grid-cols-[180px,1fr,40px] gap-2 items-stretch sm:items-center">
              <Input
                defaultValue={key}
                placeholder="Option name (e.g. Size)"
                onBlur={(e) => {
                  const newKey = e.target.value.trim();
                  if (!newKey || newKey === key) return;
                  setOptionsState((s) => {
                    const { [key]: oldVals, ...rest } = s;
                    return { ...rest, [newKey]: oldVals };
                  });
                }}
              />
              <Input
                value={vals.join(", ")}
                placeholder="Comma-separated values (e.g. S, M, L, XL)"
                onChange={(e) =>
                  setOptionsState((s) => ({
                    ...s,
                    [key]: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                  }))
                }
              />
              <RemoveBtn
                onClick={() =>
                  setOptionsState((s) => {
                    const { [key]: _, ...rest } = s;
                    return rest;
                  })
                }
              />
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setOptionsState((s) => ({ ...s, [`Option ${Object.keys(s).length + 1}`]: [] }))
          }
        >
          <Icon icon="circle-plus" /> Add option
        </Button>
      </Section>

      <ImagesSection
        images={images}
        setImages={setImages}
        slug={product?.slug ?? null}
      />

      <Section title="Price tiers">
        <p className="text-xs text-ink-mute">Volume breaks. min_qty inclusive; max_qty inclusive (or blank for ∞).</p>
        <div className="space-y-2">
          {tiers.map((t, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,1fr,40px] gap-2 items-stretch sm:items-center">
              <Input type="number" min="1" value={t.min_qty} placeholder="min qty" onChange={(e) => updateAt(setTiers, i, { ...t, min_qty: Number(e.target.value) })} />
              <Input type="number" min="1" value={t.max_qty ?? ""} placeholder="max qty (blank = ∞)" onChange={(e) => updateAt(setTiers, i, { ...t, max_qty: e.target.value ? Number(e.target.value) : null })} />
              <Input type="number" step="1" min="0" value={t.unit_price_cents} placeholder="unit price (cents)" onChange={(e) => updateAt(setTiers, i, { ...t, unit_price_cents: Number(e.target.value) })} />
              <RemoveBtn onClick={() => removeAt(setTiers, i)} />
            </div>
          ))}
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => setTiers([...tiers, { min_qty: 1, max_qty: null, unit_price_cents: 0 }])}>
          <Icon icon="circle-plus" /> Add tier
        </Button>
      </Section>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
      </Button>
    </form>
  );
}

function ImagesSection({
  images,
  setImages,
  slug,
}: {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  slug: string | null;
}) {
  const [uploading, setUploading] = React.useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (slug) fd.append("slug", slug);
      const res = await fetch("/api/admin/products/upload-image", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setImages((arr) => [...arr, data.url]);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error("Upload failed", { description: (err as Error).message });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Section title="Images">
      <p className="text-xs text-ink-mute">
        First image is used as the hero + Open Graph preview. Drag uploads not supported yet — use the picker.
      </p>

      <label className="block">
        <span className="flex items-center gap-2 justify-center w-full rounded border-2 border-dashed border-ink/15 bg-paper-warm px-3 py-5 text-sm text-ink-mute hover:border-primary hover:text-primary cursor-pointer transition-colors">
          <Icon icon="cloud-arrow-up" />
          {uploading ? "Uploading…" : "Upload image (PNG · JPG · WEBP, ≤8MB)"}
        </span>
        <input
          type="file"
          className="sr-only"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.currentTarget.value = "";
          }}
        />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="relative rounded-lg border border-ink/15 bg-white overflow-hidden"
            >
              <div className="relative aspect-square bg-paper-warm">
                {/* Public URL — use plain img to avoid Next.js domain config */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 inline-flex items-center rounded bg-primary text-white px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-widest shadow-stamp">
                    Hero
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-1.5 border-t border-ink/10 bg-white">
                <Button type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => moveAt(setImages, i, -1)} aria-label="Move up">
                  <Icon icon="arrow-left" />
                </Button>
                <Button type="button" variant="ghost" size="sm" disabled={i === images.length - 1} onClick={() => moveAt(setImages, i, 1)} aria-label="Move down">
                  <Icon icon="arrow-right" />
                </Button>
                <RemoveBtn onClick={() => removeAt(setImages, i)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-4 sm:p-6 space-y-3">
      <h3 className="font-display text-base font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Two({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <Label className="block mb-1">{label}</Label>
      <Input {...props} />
    </div>
  );
}

function RemoveBtn({ onClick }: { onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onClick} aria-label="Remove">
      <Icon icon="xmark" />
    </Button>
  );
}

function ChipList({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = React.useState("");
  return (
    <div>
      <Label className="block mb-1">{label}</Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 rounded bg-paper-warm px-2 py-1 text-xs font-mono">
            {v}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              className="hover:text-primary"
              aria-label="Remove"
            >
              <Icon icon="xmark" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={draft}
          placeholder={placeholder}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = draft.trim();
              if (v && !values.includes(v)) onChange([...values, v]);
              setDraft("");
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            const v = draft.trim();
            if (v && !values.includes(v)) onChange([...values, v]);
            setDraft("");
          }}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

function updateAt<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, value: T) {
  setter((arr) => arr.map((x, idx) => (idx === i ? value : x)));
}

function removeAt<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number) {
  setter((arr) => arr.filter((_, idx) => idx !== i));
}

function moveAt<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, i: number, delta: number) {
  setter((arr) => {
    const next = arr.slice();
    const j = i + delta;
    if (j < 0 || j >= next.length) return arr;
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  });
}
