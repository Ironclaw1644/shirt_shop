import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const GA_PATH =
  "M9 10 L24 10 L24 8.6 L27 8.6 L27 11 L32 18 Q31.8 23 30.3 26.2 L27 31 L9 31 Z";

const headerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="240" height="240">
  <rect x="2" y="2" width="36" height="36" rx="8" fill="#1A1A1A" />
  <rect x="6" y="6" width="28" height="28" rx="5" fill="#FAFAF7" />
  <path d="${GA_PATH}" fill="#B8142B" />
  <circle cx="15.5" cy="16" r="1.4" fill="#D4A017" />
  <text x="20" y="26" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" fill="#FAFAF7">P</text>
</svg>`;

const footerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="240" height="240">
  <rect x="2" y="2" width="36" height="36" rx="8" fill="#FAFAF7" />
  <rect x="6" y="6" width="28" height="28" rx="5" fill="#1A1A1A" />
  <path d="${GA_PATH}" fill="#D4A017" />
  <circle cx="15.5" cy="16" r="1.4" fill="#B8142B" />
  <text x="20" y="26" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="900" fill="#1A1A1A">P</text>
</svg>`;

async function run() {
  const outDir = path.join(process.cwd(), "tmp-logo-preview");
  await fs.mkdir(outDir, { recursive: true });
  await sharp(Buffer.from(headerSvg)).png().toFile(path.join(outDir, "header.png"));
  await sharp(Buffer.from(footerSvg)).png().toFile(path.join(outDir, "footer.png"));
  console.log("Wrote", outDir);
}
run();
