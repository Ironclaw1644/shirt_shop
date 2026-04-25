"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { formatMoneyCents } from "@/lib/utils/money";
import { bulkUpdateStatus, bulkEmailInvoice } from "./actions";

type Row = {
  id: string;
  email: string;
  total_cents: number;
  status: string;
  created_at: string;
};

const STATUSES = [
  "received","in_proof","approved","in_production","shipped","delivered","cancelled",
] as const;

export function OrdersTable({
  rows,
  sort,
  dir,
}: {
  rows: Row[];
  sort: string;
  dir: "asc" | "desc";
}) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = React.useState<string>("in_proof");
  const [busy, setBusy] = React.useState(false);

  const allSelected = rows.length > 0 && selected.size === rows.length;
  const someSelected = selected.size > 0 && selected.size < rows.length;

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }
  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function applyBulkStatus() {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const result = await bulkUpdateStatus({ ids: [...selected], status: bulkStatus });
      toast.success(`Updated ${result.count} orders`, {
        description: `Status set to ${bulkStatus.replace(/_/g, " ")}`,
      });
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast.error("Bulk update failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function applyBulkInvoice() {
    if (selected.size === 0) return;
    const ok = window.confirm(
      `Send ${selected.size} invoice email${selected.size === 1 ? "" : "s"}? This will fire ${selected.size} Resend send${selected.size === 1 ? "" : "s"}.`,
    );
    if (!ok) return;
    setBusy(true);
    try {
      const result = await bulkEmailInvoice({ ids: [...selected] });
      const desc = result.failed > 0
        ? `${result.ok} sent, ${result.failed} failed`
        : `${result.ok} sent`;
      toast.success("Invoice batch complete", { description: desc });
      setSelected(new Set());
      router.refresh();
    } catch (err) {
      toast.error("Bulk invoice failed", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  function sortLink(field: string, label: string) {
    const flipped = sort === field && dir === "asc" ? "desc" : "asc";
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    params.set("sort", field);
    params.set("dir", flipped);
    return (
      <Link
        href={`?${params.toString()}`}
        className="inline-flex items-center gap-1 hover:text-ink"
      >
        {label}
        {sort === field && (
          <span className="text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>
        )}
      </Link>
    );
  }

  return (
    <div className="space-y-3">
      {selected.size > 0 && (
        <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm shadow-press">
          <span className="font-display font-semibold">
            {selected.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="h-9 rounded border border-ink/15 bg-white px-2 text-sm"
            disabled={busy}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyBulkStatus}
            disabled={busy}
            className="h-9 rounded bg-ink text-paper px-3 text-sm disabled:opacity-50"
          >
            {busy ? "Working…" : "Update status"}
          </button>
          <button
            type="button"
            onClick={applyBulkInvoice}
            disabled={busy}
            className="h-9 rounded bg-primary text-white px-3 text-sm disabled:opacity-50"
          >
            <Icon icon="paper-plane" /> Email invoice
          </button>
          <button
            type="button"
            onClick={() => setSelected(new Set())}
            disabled={busy}
            className="ml-auto h-9 rounded border border-ink/15 bg-white px-3 text-sm hover:border-primary"
          >
            Clear
          </button>
        </div>
      )}

      <div className="rounded-lg border border-ink/10 bg-white overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-paper-warm text-xs uppercase tracking-wider text-ink-mute">
            <tr>
              <th className="text-left px-3 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={toggleAll}
                  aria-label="Select all"
                />
              </th>
              <th className="text-left px-4 py-3">Order</th>
              <th className="text-left px-4 py-3">Customer</th>
              <th className="text-left px-4 py-3">{sortLink("created_at", "Placed")}</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">{sortLink("total_cents", "Total")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr
                key={o.id}
                className={`border-t border-ink/10 transition-colors ${
                  selected.has(o.id) ? "bg-primary/5" : "hover:bg-paper-warm"
                }`}
              >
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected.has(o.id)}
                    onChange={() => toggle(o.id)}
                    aria-label={`Select order ${o.id.slice(0, 8)}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-display font-semibold text-primary hover:underline"
                  >
                    #{o.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3">{o.email}</td>
                <td className="px-4 py-3 text-ink-mute">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="paper">{o.status.replace(/_/g, " ")}</Badge>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {formatMoneyCents(o.total_cents)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-ink-mute">
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
