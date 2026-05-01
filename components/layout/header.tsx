import { buildNavTree } from "@/lib/catalog/nav-tree";
import { SiteHeaderClient } from "./header-client";

export function SiteHeader() {
  const navTree = buildNavTree();
  return <SiteHeaderClient navTree={navTree} />;
}
