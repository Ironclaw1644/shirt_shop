import type { Metadata } from "next";
import { DesignerClient } from "@/components/designer/designer-client";
import { productBySlug } from "@/lib/catalog/sample-products";

export const metadata: Metadata = {
  title: "Designer",
  description:
    "Design your order in the browser. Upload artwork, add text, choose placement, and preview a production-accurate proof before ordering.",
};

type Search = {
  product?: string;
  method?: string;
  qty?: string;
};

export default async function DesignerPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const sp = await searchParams;
  const product = sp.product ? productBySlug(sp.product) : undefined;
  return <DesignerClient initial={sp} product={product} />;
}
