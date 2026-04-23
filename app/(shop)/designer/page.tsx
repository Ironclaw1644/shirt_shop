import type { Metadata } from "next";
import { DesignerClient } from "@/components/designer/designer-client";

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
  return <DesignerClient initial={sp} />;
}
