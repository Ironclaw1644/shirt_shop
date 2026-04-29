import { notFound } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ClearCartOnMount } from "@/components/shop/clear-cart-on-mount";
import { OrderDetail, type OrderDetailData } from "@/components/shop/order-detail";

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}) {
  const { id } = await params;
  const { placed } = await searchParams;
  const supa = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supa.auth.getUser();
  if (!user) return null;

  const { data: order } = await supa
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .maybeSingle();

  if (!order) return notFound();

  return (
    <>
      {placed === "1" && <ClearCartOnMount />}
      <OrderDetail order={order as OrderDetailData} />
    </>
  );
}
