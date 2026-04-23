import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./emails/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui"],
        editorial: ["var(--font-editorial)", "ui-serif", "Georgia"],
        mono: ["var(--font-mono)", "ui-monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#FDF2F4",
          100: "#FBE5E8",
          200: "#F7CBD3",
          300: "#EF9DAE",
          400: "#E36B86",
          500: "#CE3E5E",
          600: "#B8142B",
          700: "#970F22",
          800: "#7A0F1F",
          900: "#65121E",
          950: "#38050E",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#FDF8ED",
          100: "#F9EDCC",
          200: "#F2D895",
          300: "#E8BD5C",
          400: "#DFA837",
          500: "#D4A017",
          600: "#B8810F",
          700: "#935F10",
          800: "#794B15",
          900: "#673E17",
        },
        paper: {
          DEFAULT: "#FAFAF7",
          warm: "#F5F2EB",
          cool: "#F3F4F1",
        },
        ink: {
          DEFAULT: "#1A1A1A",
          soft: "#2A2A2A",
          mute: "#6B6A65",
        },
        surface: {
          DEFAULT: "#E8E6E1",
          raised: "#FFFFFF",
          sunken: "#DCD9D2",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "#0E7C4A",
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#C47A00",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        press: "0 1px 0 0 rgba(26,26,26,0.08), 0 10px 24px -12px rgba(26,26,26,0.18)",
        "press-lg":
          "0 1px 0 0 rgba(26,26,26,0.08), 0 28px 40px -20px rgba(26,26,26,0.22)",
        stamp: "3px 3px 0 0 #1A1A1A",
        "stamp-crimson": "3px 3px 0 0 #B8142B",
        ink: "inset 0 -2px 0 0 rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.4) inset",
      },
      backgroundImage: {
        "paper-grain":
          "radial-gradient(rgba(26,26,26,0.035) 1px, transparent 1px)",
        "cmyk-dot":
          "radial-gradient(circle at 20% 20%, rgba(255,0,102,0.12) 0 6%, transparent 7%), radial-gradient(circle at 70% 40%, rgba(0,170,255,0.12) 0 6%, transparent 7%), radial-gradient(circle at 40% 80%, rgba(255,220,0,0.14) 0 6%, transparent 7%)",
        "perforated-divider":
          "radial-gradient(circle, currentColor 1px, transparent 1.5px)",
      },
      backgroundSize: {
        "paper-grain": "4px 4px",
        perforation: "10px 2px",
      },
      keyframes: {
        "ink-stamp": {
          "0%": { transform: "translate(-2px,-3px) scale(0.98)", opacity: "0" },
          "55%": { transform: "translate(1px,2px) scale(1.01)", opacity: "0.88" },
          "100%": { transform: "translate(0,0) scale(1)", opacity: "1" },
        },
        "ink-cyan": {
          "0%": { transform: "translate(0,0)" },
          "55%": { transform: "translate(-3px,-2px)" },
          "100%": { transform: "translate(0,0)" },
        },
        "ink-magenta": {
          "0%": { transform: "translate(0,0)" },
          "55%": { transform: "translate(3px,2px)" },
          "100%": { transform: "translate(0,0)" },
        },
        "ink-yellow": {
          "0%": { transform: "translate(0,0)" },
          "55%": { transform: "translate(0,3px)" },
          "100%": { transform: "translate(0,0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "paper-fold": {
          "0%": { transform: "translateX(100%) skewY(-1deg)", opacity: "0" },
          "60%": { transform: "translateX(-1%) skewY(0.3deg)", opacity: "1" },
          "100%": { transform: "translateX(0) skewY(0)", opacity: "1" },
        },
        "wet-ink": {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "ink-stamp": "ink-stamp 0.9s cubic-bezier(.2,.7,.1,1) both",
        "ink-cyan": "ink-cyan 1.1s cubic-bezier(.2,.7,.1,1) both",
        "ink-magenta": "ink-magenta 1.1s cubic-bezier(.2,.7,.1,1) both",
        "ink-yellow": "ink-yellow 1.1s cubic-bezier(.2,.7,.1,1) both",
        marquee: "marquee 18s linear infinite",
        "paper-fold": "paper-fold 0.6s cubic-bezier(.2,.9,.2,1) both",
        "wet-ink": "wet-ink 1.4s ease-in-out infinite alternate",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
