import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { replyToQuote, convertQuoteToOrder } from "./actions";
import { Badge } from "@/components/ui/badge";

export default async function AdminQuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supa = await getSupabaseServerClient();
  const { data: quote } = await supa
    .from("quote_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!quote) return notFound();

  return (
    <div>
      <AdminPageHeader
        title={`Quote from ${quote.full_name ?? quote.email}`}
        subtitle={`${quote.email} · ${quote.company ?? "Individual"} · received ${new Date(quote.created_at).toLocaleString()}`}
        actions={<Badge variant="paper">{quote.status}</Badge>}
      />
      <div className="p-6 sm:p-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-white p-5 space-y-2 text-sm">
          <p className="font-display font-bold text-lg">Details</p>
          <p><span className="text-ink-mute">Est. quantity: </span>{quote.est_quantity ?? "—"}</p>
          <p><span className="text-ink-mute">In-hands: </span>{quote.in_hands_date ?? "—"}</p>
          <p><span className="text-ink-mute">Decoration: </span>{quote.decoration ?? "—"}</p>
          <p><span className="text-ink-mute">Phone: </span>{quote.phone ?? "—"}</p>
          <div className="pt-2 border-t border-ink/10">
            <p className="text-ink-mute">Message</p>
            <p className="mt-1 whitespace-pre-wrap">{quote.message ?? "—"}</p>
          </div>
          <div className="pt-2 border-t border-ink/10">
            <p className="text-ink-mute">Product refs</p>
            <pre className="mt-1 text-xs whitespace-pre-wrap">{JSON.stringify(quote.product_refs, null, 2)}</pre>
          </div>
        </section>

        <section className="space-y-4">
          <form action={replyToQuote} className="rounded-lg border border-ink/10 bg-white p-5 space-y-3">
            <input type="hidden" name="id" value={quote.id} />
            <div>
              <Label className="block mb-1">Quoted price (USD)</Label>
              <Input
                name="quoted_price"
                type="number"
                step="0.01"
                defaultValue={quote.quoted_price_cents ? (quote.quoted_price_cents / 100).toFixed(2) : ""}
              />
            </div>
            <div>
              <Label className="block mb-1">Reply</Label>
              <Textarea
                name="admin_reply"
                rows={8}
                defaultValue={quote.admin_reply ?? ""}
                placeholder="Price, tier breakdown, lead time, shipping…"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Send quote</Button>
              <Button type="submit" formAction={convertQuoteToOrder} variant="secondary">
                Convert to order
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
