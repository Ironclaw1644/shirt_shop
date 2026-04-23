import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
