/**
 * scripts/enrich-companycasuals-images.ts
 *
 * Upgrades the 128W thumbnail URLs in tmp/scraped-blanks-companycasuals.json
 * to 1200W variants by scraping each product's PDP HTML.
 *
 * Sanmar exposes 128W thumbnails in four URL shapes; we extract a stem
 * identifier from any of them:
 *   - /128W_<stem>/<stem>.jpg            ("new")
 *   - <stem>-128W.jpg                    ("old")
 *   - 128W-<stem>.jpg                    ("prefix")
 *   - <stem>.jpg with no size marker     ("unmarked", small thumbnails)
 *
 * Strategy (4-tier fallback per product):
 *   1. Stem match — search the PDP HTML for any cdnp.sanmar.com URL containing
 *      both "1200W" and the exact stem (preserves the listing's camera angle).
 *   2. og:image fallback — accept any 1200W URL from the og:image meta tag.
 *   3. Any 1200W — first cdnp.sanmar.com 1200W URL on the PDP (different angle
 *      but same product). Excludes the "1200W-null" placeholder.
 *   4. Keep listing URL — log and skip.
 *
 * Resumable: skips rows whose imageUrl already contains "1200W" (handles all
 * upgraded shapes) and rows that point at the "128W-null" placeholder (no real
 * image). Writes back to the same JSON every 25 successful upgrades + at end
 * so crashes leave state consistent.
 *
 * Politeness: 1000ms delay between PDP fetches with the same UA used by
 * scrape-companycasuals.ts.
 *
 * Usage:
 *   npx tsx scripts/enrich-companycasuals-images.ts                 # full run
 *   npx tsx scripts/enrich-companycasuals-images.ts --limit 5       # first 5 unprocessed (smoke)
 *   npx tsx scripts/enrich-companycasuals-images.ts --delay 500     # custom delay (ms)
 */
import fs from "node:fs/promises";
import path from "node:path";

const UA = "GAPHCatalogBot/1.0 (+admin@gaprinthub.com)";
const BASE = "https://catalog.companycasuals.com";
const DEFAULT_DELAY_MS = 1000;

const FILE = path.join(process.cwd(), "tmp", "scraped-blanks-companycasuals.json");

type Row = {
  slug: string;
  supplierCode: string;
  styleNumber: string | null;
  title: string;
  brand: string | null;
  description: string;
  imageUrl: string | null;
  supplierUrl: string;
  ourCategory: string;
  ourSubcategory: string;
  sourceCategoryKey: string;
};

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Extract a stem identifier that uniquely names this product/angle from any
 *  of sanmar's known 128W URL shapes. Returns null for already-upgraded URLs,
 *  null URLs, or "128W-null" placeholders (no real image). */
function extractStem(url: string | null): string | null {
  if (!url) return null;
  if (/1200W/.test(url)) return null; // already upgraded
  const fname = url.split("/").pop() || "";
  if (/^128W-null\./i.test(fname)) return null; // placeholder, no real image

  // New format: /128W_<stem>/<stem>.jpg
  let m = url.match(/\/128W_([^/]+)\//);
  if (m) return m[1];

  // Old format: <stem>-128W.jpg
  m = fname.match(/^(.+)-128W\.[a-z]+$/i);
  if (m) return m[1];

  // Prefix format: 128W-<stem>.jpg
  m = fname.match(/^128W-(.+)\.[a-z]+$/i);
  if (m) return m[1];

  // Unmarked: bare filename without extension. Sanity floor of 6 chars to
  // avoid matching nonsense like "x.jpg".
  m = fname.match(/^(.{6,})\.[a-z]+$/i);
  return m ? m[1] : null;
}

/** Tier 1: find a cdnp.sanmar.com URL containing both "1200W" and the exact
 *  stem (any of the three known shapes: 1200W_<stem>/, <stem>-1200W., 1200W-<stem>.).
 *  Preserves the listing's camera angle. The stem is normalized so that `_` and
 *  `-` are interchangeable — sanmar's listing/PDP URLs inconsistently use either
 *  separator between the supplier code and color name. */
function findStemMatch(html: string, stem: string): string | null {
  const flexStem = stem
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/[_-]/g, "[_-]");
  const re = new RegExp(
    `cdnp\\.sanmar\\.com/medias/sys_master/[^"'\\s]*?` +
      `(?:1200W_${flexStem}/[^"'\\s]+?\\.(?:jpg|jpeg|png|webp)` +
      `|/${flexStem}-1200W\\.(?:jpg|jpeg|png|webp)` +
      `|/1200W-${flexStem}\\.(?:jpg|jpeg|png|webp))`,
    "i",
  );
  const m = html.match(re);
  return m ? "https://" + m[0] : null;
}

/** Tier 2: extract a 1200W cdnp.sanmar.com URL from the og:image meta tag.
 *  Note: og:image content is malformed: "https://catalog.companycasuals.com:443//cdnp.sanmar.com/...".
 *  We strip everything before "cdnp.sanmar.com" and accept any 1200W URL except
 *  the "1200W-null" placeholder. */
function findOgImage(html: string): string | null {
  const m = html.match(
    /<meta\s+property="og:image"\s+content="[^"]*?(cdnp\.sanmar\.com\/[^"]+\.(?:jpg|jpeg|png|webp))"/i,
  );
  if (!m) return null;
  const url = "https://" + m[1];
  if (!/1200W/.test(url)) return null;
  if (/1200W-null\./i.test(url)) return null;
  return url;
}

/** Tier 3: find ANY cdnp.sanmar.com 1200W URL on the PDP (not the listing's
 *  exact angle, but the same product — same SKU/color). Excludes the placeholder. */
function findAnyHighRes(html: string): string | null {
  const re = /cdnp\.sanmar\.com\/medias\/sys_master\/[^"'\s]*1200W[^"'\s]*\.(?:jpg|jpeg|png|webp)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const url = "https://" + m[0];
    if (/1200W-null\./i.test(url)) continue;
    return url;
  }
  return null;
}

async function fetchPdp(code: string): Promise<{ status: number; html: string | null }> {
  const url = `${BASE}/p/${encodeURIComponent(code)}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "text/html,application/xhtml+xml",
      },
      // 30s safety timeout
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) return { status: res.status, html: null };
    const html = await res.text();
    return { status: res.status, html };
  } catch (e) {
    return { status: 0, html: null };
  }
}

function parseArgs(): { limit: number | null; delayMs: number } {
  const args = process.argv.slice(2);
  let limit: number | null = null;
  let delayMs = DEFAULT_DELAY_MS;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--limit") limit = Number(args[++i]) || null;
    else if (args[i] === "--delay") delayMs = Number(args[++i]) || DEFAULT_DELAY_MS;
  }
  return { limit, delayMs };
}

async function main() {
  const { limit, delayMs } = parseArgs();
  const raw = await fs.readFile(FILE, "utf8");
  const rows: Row[] = JSON.parse(raw);

  // Resumable: skip already-upgraded (any 1200W shape) and the 128W-null placeholder.
  const todo = rows.filter((r) => {
    if (!r.imageUrl) return false;
    if (/1200W/.test(r.imageUrl)) return false;
    const fname = r.imageUrl.split("/").pop() || "";
    if (/^128W-null\./i.test(fname)) return false;
    return true;
  });
  const already = rows.length - todo.length;
  const work = limit !== null ? todo.slice(0, limit) : todo;
  console.log(
    `Total ${rows.length} rows; already 1200W or null-placeholder: ${already}; todo: ${todo.length}; processing: ${work.length}`,
  );
  console.log(`Delay between requests: ${delayMs}ms`);

  let tier1 = 0,
    tier2 = 0,
    tier3 = 0,
    tier4 = 0,
    httpErr = 0;

  for (let i = 0; i < work.length; i++) {
    const row = work[i];
    if (!row.imageUrl) continue;
    const stem = extractStem(row.imageUrl);
    if (!stem) {
      console.log(`[${i + 1}/${work.length}] ${row.slug} → skip (no stem)`);
      tier4 += 1;
      continue;
    }

    const { status, html } = await fetchPdp(row.supplierCode);
    if (!html) {
      console.log(`[${i + 1}/${work.length}] ${row.slug} → HTTP ${status}`);
      httpErr += 1;
      await delay(delayMs);
      continue;
    }

    let upgraded: string | null = findStemMatch(html, stem);
    let tier: 1 | 2 | 3 | 4 = 1;
    if (!upgraded) {
      upgraded = findOgImage(html);
      if (upgraded) tier = 2;
    }
    if (!upgraded) {
      upgraded = findAnyHighRes(html);
      if (upgraded) tier = 3;
    }

    if (upgraded) {
      // Index back into rows[] by slug to update.
      const idx = rows.findIndex((r) => r.slug === row.slug);
      if (idx >= 0) rows[idx].imageUrl = upgraded;
      if (tier === 1) tier1 += 1;
      else if (tier === 2) tier2 += 1;
      else tier3 += 1;
      console.log(`[${i + 1}/${work.length}] ${row.slug} → tier${tier} 1200W ✓`);
      // Persist after every 25 successful upgrades so partial runs are durable.
      if ((tier1 + tier2 + tier3) % 25 === 0) {
        await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
      }
    } else {
      tier4 += 1;
      console.log(`[${i + 1}/${work.length}] ${row.slug} → tier4 keep listing (no match)`);
    }

    await delay(delayMs);
  }

  // Final write.
  await fs.writeFile(FILE, JSON.stringify(rows, null, 2));
  console.log(
    `\nDone. tier1=${tier1} tier2=${tier2} tier3=${tier3} tier4=${tier4} httpErr=${httpErr} (skipped=${already})`,
  );
  console.log(`Updated ${FILE}`);
  console.log(`\nNext: re-run \`npx tsx scripts/import-scraped-blanks.ts\` to regenerate lib/catalog/imported-blanks.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
