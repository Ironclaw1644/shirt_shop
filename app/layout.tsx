import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { fontDisplay, fontEditorial, fontMono, fontSans } from "./fonts";
import { Providers } from "./providers";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils/cn";
import { JsonLd } from "@/components/seo/json-ld";
import { localBusinessSchema } from "@/lib/seo/schema";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} · Alpharetta, GA`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  keywords: [
    "custom printing Alpharetta",
    "custom t-shirts Atlanta",
    "screen printing Georgia",
    "laser engraving",
    "trophies Alpharetta",
    "promotional products Atlanta",
    "corporate awards",
    "embroidery North Georgia",
    "DTF transfers",
    "yard signs Alpharetta",
  ],
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    locale: "en_US",
    images: [
      {
        url: "/images/generated/og-default.webp",
        width: 1200,
        height: 630,
        alt: `${siteConfig.name} — ${siteConfig.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: ["/images/generated/og-default.webp"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
};

export const viewport: Viewport = {
  themeColor: "#FAFAF7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={cn(
        fontSans.variable,
        fontDisplay.variable,
        fontEditorial.variable,
        fontMono.variable,
      )}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <JsonLd data={localBusinessSchema()} />
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
