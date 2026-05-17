import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "@fortawesome/react-fontawesome",
      "lucide-react",
      "framer-motion",
    ],
  },
  images: {
    // Vercel's /_next/image optimization service was returning HTTP 402 in
    // production (free-tier monthly transformation quota exhausted), which
    // broke EVERY <Image> component on the site — homepage how-it-works,
    // category heroes, product cards, the lot. Disable optimization so images
    // are served straight from /public/ (and from supplier CDNs for external
    // sources). Trade-off: no responsive srcSet, no on-the-fly resizing —
    // but our generated WebPs are already sized appropriately.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "generativelanguage.googleapis.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "d2tl9ctlpnidkn.cloudfront.net" },
      { protocol: "https", hostname: "cdnp.sanmar.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
