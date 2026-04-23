import { SiteHeader } from "@/components/layout/header";
import { SiteFooter } from "@/components/layout/footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
