import { siteConfig } from "@/lib/site-config";

export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    image: `${siteConfig.url}/images/generated/og-default.webp`,
    url: siteConfig.url,
    telephone: siteConfig.phone || undefined,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    areaServed: siteConfig.areasServed.map((city) => ({
      "@type": "City",
      name: `${city}, GA`,
    })),
    founder: { "@type": "Organization", name: siteConfig.name },
    foundingDate: `${siteConfig.founded}`,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "10:00",
        closes: "14:00",
      },
    ],
    sameAs: Object.values(siteConfig.social),
  } as const;
}

export function productSchema(p: {
  name: string;
  description: string;
  image: string;
  sku: string;
  brand?: string;
  priceCents?: number | null;
  url: string;
  availability?: "InStock" | "PreOrder" | "OutOfStock";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    image: p.image,
    sku: p.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers: p.priceCents
      ? {
          "@type": "Offer",
          priceCurrency: "USD",
          price: (p.priceCents / 100).toFixed(2),
          availability: `https://schema.org/${p.availability ?? "InStock"}`,
          url: p.url,
        }
      : undefined,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
