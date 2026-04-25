import {
  Inter,
  Inter_Tight,
  Fraunces,
  JetBrains_Mono,
  Montserrat,
  Oswald,
  Bebas_Neue,
  Anton,
  Playfair_Display,
  Lora,
  Pacifico,
  Caveat,
  Permanent_Marker,
} from "next/font/google";

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

// ─── Designer fonts (loaded globally so Fabric.js can render with them) ───
export const fontMontserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-designer-montserrat",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const fontOswald = Oswald({
  subsets: ["latin"],
  variable: "--font-designer-oswald",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const fontBebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-designer-bebas",
  display: "swap",
  weight: "400",
});

export const fontAnton = Anton({
  subsets: ["latin"],
  variable: "--font-designer-anton",
  display: "swap",
  weight: "400",
});

export const fontPlayfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-designer-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const fontLora = Lora({
  subsets: ["latin"],
  variable: "--font-designer-lora",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const fontPacifico = Pacifico({
  subsets: ["latin"],
  variable: "--font-designer-pacifico",
  display: "swap",
  weight: "400",
});

export const fontCaveat = Caveat({
  subsets: ["latin"],
  variable: "--font-designer-caveat",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const fontPermanentMarker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-designer-permanent-marker",
  display: "swap",
  weight: "400",
});

export const designerFontVariables = [
  fontMontserrat.variable,
  fontOswald.variable,
  fontBebasNeue.variable,
  fontAnton.variable,
  fontPlayfair.variable,
  fontLora.variable,
  fontPacifico.variable,
  fontCaveat.variable,
  fontPermanentMarker.variable,
];
