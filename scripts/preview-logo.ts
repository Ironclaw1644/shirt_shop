import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Accurate Georgia outline derived from US Census state boundaries,
// simplified to 51 vertices, mapped to 40x40 viewBox with state in x:10-30, y:7-31.
const GA_PATH =
  "M20.58 7.0 L19.68 8.1 L19.61 8.64 L21.02 9.74 L21.46 9.66 L22.11 10.79 L22.25 11.39 L22.93 12.46 L23.9 13.11 L24.46 14.08 L25.59 14.95 L25.55 15.55 L26.29 16.51 L27.43 17.3 L27.7 18.15 L27.75 19.25 L28.33 19.62 L29.0 21.01 L29.03 21.89 L30.0 22.34 L28.96 24.1 L28.77 25.0 L28.33 25.79 L28.28 26.61 L27.82 26.98 L27.64 29.19 L26.48 28.99 L25.5 28.57 L25.11 28.96 L25.27 29.93 L25.08 30.97 L24.57 31.0 L24.36 29.9 L18.93 29.5 L13.13 29.16 L12.55 27.66 L12.09 26.25 L12.39 24.89 L11.97 23.33 L12.34 22.45 L12.32 21.8 L13.04 21.15 L12.55 20.84 L12.74 20.33 L12.28 19.51 L11.79 18.07 L10.74 11.53 L10.0 7.08 L15.45 7.06 L18.42 7.08 L20.58 7.0 Z";

const ATLANTA: [number, number] = [15.16, 13.47];

const STAR_POINTS =
  "15.16,11.97 15.51,12.985 16.58,13.01 15.73,13.655 16.04,14.68 15.16,14.07 14.28,14.68 14.59,13.655 13.74,13.01 14.81,12.985";

function render(size: number, variant: "header" | "footer"): string {
  const isHeader = variant === "header";
  const outerFill = isHeader ? "#1A1A1A" : "#FAFAF7";
  const innerFill = isHeader ? "#FAFAF7" : "#1A1A1A";
  const strokeColor = isHeader ? "#B8142B" : "#D4A017";
  const starFill = isHeader ? "#D4A017" : "#B8142B";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 44 44" width="${size}" height="${size}">
    <g transform="rotate(-6 20 20)">
      <rect x="2" y="2" width="36" height="36" rx="8" fill="${outerFill}" />
      <rect x="6" y="6" width="28" height="28" rx="5" fill="${innerFill}" />
      <g transform="translate(0 1.5)">
        <path d="${GA_PATH}" fill="none" stroke="${strokeColor}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" />
        <polygon points="${STAR_POINTS}" fill="${starFill}" />
      </g>
    </g>
  </svg>`;
}

async function run() {
  const outDir = path.join(process.cwd(), "tmp-logo-preview");
  await fs.mkdir(outDir, { recursive: true });

  for (const variant of ["header", "footer"] as const) {
    await sharp(Buffer.from(render(400, variant)))
      .png()
      .toFile(path.join(outDir, `${variant}-400.png`));
    await sharp(Buffer.from(render(40, variant)))
      .resize(120, 120, { kernel: "nearest" })
      .png()
      .toFile(path.join(outDir, `${variant}-40x3.png`));
  }

  console.log("Wrote", outDir);
}

run();
