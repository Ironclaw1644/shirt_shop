import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/shop/breadcrumbs";
import { Button } from "@/components/ui/button";
import { ClearCartOnMount } from "@/components/shop/clear-cart-on-mount";
import { OrderDetail, type OrderDetailData } from "@/components/shop/order-detail";
import {
  getSupabaseServerClient,
  getSupabaseServiceRoleClient,
} from "@/lib/supabase/server";
import { verifyOrderToken } from "@/lib/orders/token";

export const metadata: Metadata = {
  title: "Order confirmation",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PublicOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string; placed?: string }>;
}) {
  const { id } = await params;
  const { t: token, placed } = await searchParams;

  const userClient = await getSupabaseServerClient();
  const {
    data: { user },
  } = await userClient.auth.getUser();

  const tokenValid = verifyOrderToken(id, token);

  if (!tokenValid && !user) {
    return (
      <div className="container py-16 max-w-2xl">
        <Breadcrumbs crumbs={[{ label: "Order" }]} />
        <div className="mt-6 rounded-lg border border-ink/10 bg-paper-warm p-8 text-center">
          <h1 className="heading-display text-2xl sm:text-3xl">We can&rsquo;t verify this link</h1>
          <p className="mt-3 text-ink-soft">
            The confirmation link is missing or has been altered. Check your email for the original
            link, or sign in to view your orders.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/">Back to shop</Link>
            </Button>
            <Button asChild>
              <Link href={`/auth/sign-in?next=/account/orders/${id}`}>Sign in</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const service = getSupabaseServiceRoleClient();
  const { data: order } = await service
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) return notFound();

  if (!tokenValid && user && order.user_id !== user.id) {
    return notFound();
  }

  const showAccountLink = !!user && order.user_id === user.id;

  return (
    <div className="container py-12 max-w-4xl">
      {placed === "1" && <ClearCartOnMount />}
      <Breadcrumbs crumbs={[{ label: "Order" }]} />
      <div className="mt-6">
        <OrderDetail order={order as OrderDetailData} />
      </div>
      {showAccountLink && (
        <div className="mt-8 text-sm text-ink-mute">
          <Link href={`/account/orders/${order.id}`} className="underline hover:text-primary">
            View this order in your account →
          </Link>
        </div>
      )}
    </div>
  );
}
