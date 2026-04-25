"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icon";
import { saveProduct, type ProductPayload } from "@/app/admin/products/actions";

type CategoryOpt = { id: string; slug: string; name: string; parent_id: string | null };

type PlacementZone = { key: string; label: string; widthIn: number; heightIn: number };

type Tier = { id?: string; min_qty: number; max_qty: number | null; unit_price_cents: number };

type Variant = {
  id?: string;
  sku: string;
  options: Record<string, string>;
  price_cents: number | null;
  inventory_tracked: boolean;
  stock_qty: number;
};

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
  placement_zones: PlacementZone[];
  options: Record<string, string[]>;
  seo_meta: Record<string, unknown>;
  price_tiers?: { id: string; min_qty: number; max_qty: number | null; unit_price_cents: number }[];
  product_variants?: {
    id: string;
    sku: string;
    options: Record<string, string>;
    price_cents: number | null;
    inventory_tracked: boolean;
    stock_qty: number;
  }[];
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
  const [placementZones, setPlacementZones] = React.useState<PlacementZone[]>(
    product?.placement_zones ?? [],
  );
  const [optionsState, setOptionsState] = React.useState<Record<string, string[]>>(
    product?.options ?? {},
  );
  const seo = (product?.seo_meta ?? {}) as Record<string, string>;
  const [seoTitle, setSeoTitle] = React.useState<string>(String(seo.title ?? ""));
  const [seoDescription, setSeoDescription] = React.useState<string>(String(seo.description ?? ""));
  const [seoOgImage, setSeoOgImage] = React.useState<string>(String(seo.og_image ?? ""));
  const [tiers, setTiers] = React.useState<Tier[]>(
    (product?.price_tiers ?? []).map((t) => ({ ...t })),
  );
  const [variants, setVariants] = React.useState<Variant[]>(
    (product?.product_variants ?? []).map((v) => ({ ...v })),
  );

  React.useEffect(() => {
    // If parent category changes and current sub doesn't belong to it, clear it.
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

    const heroSeo = (product?.seo_meta?.heroPromptKey as string | undefined) ?? undefined;
    const seoMeta: Record<string, unknown> = {
      ...(heroSeo ? { heroPromptKey: heroSeo } : {}),
      ...(seoTitle ? { title: seoTitle } : {}),
      ...(seoDescription ? { description: seoDescription } : {}),
      ...(seoOgImage ? { og_image: seoOgImage } : {}),
    };

    const basePriceUsd = fd.get("base_price") as string;
    const payload: ProductPayload = {
      title: String(fd.get("title") ?? ""),
      slug: String(fd.get("slug") ?? ""),
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
      placement_zones: placementZones,
      options: optionsState,
      seo_meta: seoMeta,
      tiers: tiers.map(({ id, ...rest }) => (id ? { id, ...rest } : rest)),
      variants: variants.map(({ id, ...rest }) => (id ? { id, ...rest } : rest)),
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
        <Two>
          <Field label="Title" name="title" defaultValue={product?.title ?? ""} required />
          <Field label="Slug" name="slug" defaultValue={product?.slug ?? ""} required />
        </Two>
        <Field label="Short description" name="short_description" defaultValue={product?.short_description ?? ""} />
        <div>
          <Label className="block mb-1">Description</Label>
          <Textarea rows={5} name="description" defaultValue={product?.description ?? ""} />
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

      <Section title="Decoration & placement">
        <ChipList
          label="Decoration methods"
          values={decorationMethods}
          onChange={setDecorationMethods}
          placeholder="e.g. screen-print"
        />
        <div className="space-y-2">
          <Label>Placement zones</Label>
          {placementZones.map((z, i) => (
            <div key={i} className="grid grid-cols-[1fr,1fr,90px,90px,40px] gap-2 items-center">
              <Input value={z.key} placeholder="key" onChange={(e) => updateAt(setPlacementZones, i, { ...z, key: e.target.value })} />
              <Input value={z.label} placeholder="Label" onChange={(e) => updateAt(setPlacementZones, i, { ...z, label: e.target.value })} />
              <Input type="number" step="0.01" min="0" value={z.widthIn} onChange={(e) => updateAt(setPlacementZones, i, { ...z, widthIn: Number(e.target.value) })} />
              <Input type="number" step="0.01" min="0" value={z.heightIn} onChange={(e) => updateAt(setPlacementZones, i, { ...z, heightIn: Number(e.target.value) })} />
              <RemoveBtn onClick={() => removeAt(setPlacementZones, i)} />
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setPlacementZones([...placementZones, { key: "", label: "", widthIn: 0, heightIn: 0 }])}>
            <Icon icon="circle-plus" /> Add zone
          </Button>
        </div>
      </Section>

      <Section title="Options (size, color, etc.)">
        {Object.entries(optionsState).map(([key, vals]) => (
          <div key={key} className="grid grid-cols-[180px,1fr,40px] gap-2 items-center">
            <Input
              defaultValue={key}
              placeholder="Option key"
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
              placeholder="Comma-separated values"
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
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOptionsState((s) => ({ ...s, [`option_${Object.keys(s).length + 1}`]: [] }))}
        >
          <Icon icon="circle-plus" /> Add option
        </Button>
      </Section>

      <Section title="Images">
        {images.map((url, i) => (
          <div key={i} className="grid grid-cols-[1fr,40px,40px,40px] gap-2 items-center">
            <Input value={url} onChange={(e) => updateAt(setImages, i, e.target.value)} />
            <Button type="button" variant="ghost" size="sm" disabled={i === 0} onClick={() => moveAt(setImages, i, -1)}>
              <Icon icon="arrow-up" />
            </Button>
            <Button type="button" variant="ghost" size="sm" disabled={i === images.length - 1} onClick={() => moveAt(setImages, i, 1)}>
              <Icon icon="arrow-down" />
            </Button>
            <RemoveBtn onClick={() => removeAt(setImages, i)} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setImages([...images, ""])}>
          <Icon icon="circle-plus" /> Add image URL
        </Button>
      </Section>

      <Section title="Price tiers">
        <p className="text-xs text-ink-mute mb-1">Volume breaks. min_qty inclusive; max_qty inclusive (or blank for ∞).</p>
        {tiers.map((t, i) => (
          <div key={i} className="grid grid-cols-[1fr,1fr,1fr,40px] gap-2 items-center">
            <Input type="number" min="1" value={t.min_qty} placeholder="min qty" onChange={(e) => updateAt(setTiers, i, { ...t, min_qty: Number(e.target.value) })} />
            <Input type="number" min="1" value={t.max_qty ?? ""} placeholder="max qty (blank = ∞)" onChange={(e) => updateAt(setTiers, i, { ...t, max_qty: e.target.value ? Number(e.target.value) : null })} />
            <Input type="number" step="1" min="0" value={t.unit_price_cents} placeholder="unit price (cents)" onChange={(e) => updateAt(setTiers, i, { ...t, unit_price_cents: Number(e.target.value) })} />
            <RemoveBtn onClick={() => removeAt(setTiers, i)} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setTiers([...tiers, { min_qty: 1, max_qty: null, unit_price_cents: 0 }])}>
          <Icon icon="circle-plus" /> Add tier
        </Button>
      </Section>

      <Section title="Variants">
        <p className="text-xs text-ink-mute mb-1">SKU + options snapshot (e.g. {`{"size":"M","color":"Black"}`}). Stock + price optional.</p>
        {variants.map((v, i) => (
          <div key={i} className="grid grid-cols-[1fr,1.5fr,100px,90px,90px,40px] gap-2 items-center">
            <Input value={v.sku} placeholder="SKU" onChange={(e) => updateAt(setVariants, i, { ...v, sku: e.target.value })} />
            <Input
              value={JSON.stringify(v.options)}
              placeholder='{"size":"M"}'
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value || "{}");
                  updateAt(setVariants, i, { ...v, options: parsed });
                } catch {
                  // leave invalid input alone; user keeps editing
                }
              }}
            />
            <Input type="number" min="0" value={v.price_cents ?? ""} placeholder="price ¢" onChange={(e) => updateAt(setVariants, i, { ...v, price_cents: e.target.value ? Number(e.target.value) : null })} />
            <Input type="number" min="0" value={v.stock_qty} onChange={(e) => updateAt(setVariants, i, { ...v, stock_qty: Number(e.target.value) })} />
            <Switch checked={v.inventory_tracked} onCheckedChange={(checked) => updateAt(setVariants, i, { ...v, inventory_tracked: !!checked })} />
            <RemoveBtn onClick={() => removeAt(setVariants, i)} />
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { sku: "", options: {}, price_cents: null, inventory_tracked: false, stock_qty: 0 }])}>
          <Icon icon="circle-plus" /> Add variant
        </Button>
      </Section>

      <Section title="SEO">
        <Field label="Title" name="seo_title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        <div>
          <Label className="block mb-1">Description</Label>
          <Textarea rows={3} value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
        </div>
        <Field label="OG image URL" name="seo_og_image" value={seoOgImage} onChange={(e) => setSeoOgImage(e.target.value)} />
      </Section>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving…" : mode === "create" ? "Create product" : "Save changes"}
      </Button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-6 space-y-3">
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
      <Icon icon="trash" />
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
