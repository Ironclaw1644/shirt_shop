import type { MetadataRoute } from "next";
import { categories } from "@/lib/catalog/categories";
import { sampleProducts } from "@/lib/catalog/sample-products";
import { cityLandings } from "@/lib/seo/cities";
import { siteConfig } from "@/lib/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  const staticPages = [
    "",
    "/about",
    "/contact",
    "/faq",
    "/quote",
    "/policies/privacy",
    "/policies/terms",
    "/policies/shipping",
    "/policies/returns",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.6,
  }));

  const categoryPages = categories.flatMap((c) => [
    {
      url: `${base}/${c.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    ...c.subcategories.map((s) => ({
      url: `${base}/${c.slug}/${s.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]);

  const productPages = sampleProducts.map((p) => ({
    url: `${base}/product/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const cities = cityLandings.map((c) => ({
    url: `${base}/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages, ...cities];
}
