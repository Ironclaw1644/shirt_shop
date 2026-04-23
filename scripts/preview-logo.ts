import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/**
 * Georgia silhouette path candidates.
 * All drawn in 40x40 viewBox, state occupying roughly x:11-30, y:9-31.
 * Correct aspect ratio: Georgia is ~1.25:1 tall:wide.
 */
// V13: polished refinement of V7 with cleaner proportions + smoother coast
const FINAL_PATH =
  "M11 10 L20 10 L21.5 8.2 L23.8 8.2 L24.8 10 L25.2 10 L29.8 18 Q30.2 22.5 28.2 26 L24.5 30.8 L11 30.8 Z";

const CANDIDATES: { name: string; path: string; atlanta: [number, number] | null }[] = [
  { name: "final-with-dot", path: FINAL_PATH, atlanta: [15.5, 15.8] },
  { name: "final-no-dot", path: FINAL_PATH, atlanta: null },
  // slightly taller / narrower
  {
    name: "final-tall",
    path: "M11.5 9.5 L20 9.5 L21.5 7.8 L23.5 7.8 L24.5 9.5 L24.9 9.5 L29.5 17.5 Q30 22 28 25.8 L24 30.8 L11.5 30.8 Z",
    atlanta: [15.5, 15.2],
  },
];

function renderCard(
  label: string,
  gaPath: string,
  atlanta: [number, number] | null,
  size: number,
  variant: "header" | "footer",
): string {
  const isHeader = variant === "header";
  const outerFill = isHeader ? "#1A1A1A" : "#FAFAF7";
  const innerFill = isHeader ? "#FAFAF7" : "#1A1A1A";
  const stateFill = isHeader ? "#B8142B" : "#D4A017";
  const dotFill = isHeader ? "#D4A017" : "#B8142B";
  const dot = atlanta
    ? `<circle cx="${atlanta[0]}" cy="${atlanta[1]}" r="1.6" fill="${dotFill}" />`
    : "";
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
  <rect x="2" y="2" width="36" height="36" rx="8" fill="${outerFill}" />
  <rect x="6" y="6" width="28" height="28" rx="5" fill="${innerFill}" />
  <path d="${gaPath}" fill="${stateFill}" stroke-linejoin="round" />
  ${dot}
</svg>
  `.trim();
}

async function run() {
  const outDir = path.join(process.cwd(), "tmp-logo-preview");
  await fs.mkdir(outDir, { recursive: true });

  for (const c of CANDIDATES) {
    const largeHeader = renderCard(c.name, c.path, c.atlanta, 400, "header");
    await sharp(Buffer.from(largeHeader))
      .png()
      .toFile(path.join(outDir, `${c.name}-header-400.png`));

    const smallHeader = renderCard(c.name, c.path, c.atlanta, 40, "header");
    await sharp(Buffer.from(smallHeader))
      .resize(120, 120, { kernel: "nearest" })
      .png()
      .toFile(path.join(outDir, `${c.name}-header-40x3.png`));
  }

  console.log("Wrote", outDir);
}

run();
