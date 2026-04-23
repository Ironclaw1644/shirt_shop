import { Inter, Inter_Tight, Fraunces, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontDisplay = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const fontEditorial = Fraunces({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
  style: ["italic", "normal"],
  axes: ["SOFT", "opsz"],
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
