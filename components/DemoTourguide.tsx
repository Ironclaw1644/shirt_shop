"use client";

import { useEffect } from "react";
import { mountTourguide } from "@/lib/tourguide";

/**
 * Demo-mode overlay — mounted from app/layout.tsx only when DEMO_MODE=1.
 * Steps use selectors that exist in the real pages:
 *   #hero-search      → app home, components/home/hero-search.tsx
 *   #categories       → app home, components/home/category-grid-client.tsx
 *   main#main h1      → (shop)/(marketing) layouts wrap pages in <main id="main">;
 *                       product / designer / cart / quote each render one h1.
 */
export function DemoTourguide() {
  useEffect(() => {
    mountTourguide({
      siteSlug: "ecommerce",
      adminUrl: "/admin",
      steps: [
        {
          route: "/",
          selector: "#hero-search",
          title: "search 10,000+ products",
          body: "one box, the whole catalog. type 'hoodie' or 'yard sign' and hit enter.",
        },
        {
          route: "/",
          selector: "#categories",
          title: "seven departments",
          body: "printing, apparel, awards, drinkware, gifts — every tile is a real landing page with its own catalog.",
        },
        {
          route: "/product/standard-business-cards",
          selector: "main#main h1",
          title: "real product pages",
          body: "quantity breaks, tier pricing, decoration options. all demo data — change whatever you want.",
        },
        {
          route: "/designer",
          selector: "main#main h1",
          title: "design in the browser",
          body: "add text, upload art, drag it around. the proof you see is the proof the shop prints from.",
        },
        {
          route: "/cart",
          selector: "main#main h1",
          title: "invoice-only checkout",
          body: "no card forms. orders land as invoices the shop reviews, then bills. in demo mode nothing sends.",
        },
        {
          route: "/quote",
          selector: "main#main h1",
          title: "big jobs go through quotes",
          body: "5,000 units? request a quote here — it shows up in the admin inbox, where you reply and convert it to an order.",
        },
      ],
    });
  }, []);

  return null;
}
