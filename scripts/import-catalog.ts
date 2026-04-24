/**
 * Catalog import notes — Phase 3.
 *
 * The first import batch (lib/catalog/imported-products.ts, ~120 SKUs) was
 * sourced by walking the homepage of each competitor catalog with the WebFetch
 * tool, extracting category structures + product types, and hand-mapping into
 * our taxonomy with the brand-name policy applied (keep brand only when the
 * brand IS the spec; genericize otherwise).
 *
 * Source sites visited:
 *   - whitesquirrelmktg.com         (broad services site, thin product names)
 *   - printtales.com                (deep print catalog: cards, flyers, banners)
 *   - catalog.companycasuals.com    (apparel catalog by garment type)
 *   - premiercorporateawards.com    (plaques, awards, drinkware, gifts)
 *   - premierdrinkware.com          (drinkware deep dive)
 *   - premiercustomcolor.com        (full-color personalized photo gifts)
 *   - premierpersonalizedgifts.com  (engraved gifts: leatherette, wood, etc.)
 *   - premiersportawards.com        (resin trophies, medals, cup trophies)
 *   - gapromotional.com             (broad promo catalog: apparel, awards, bags)
 *
 * To extend the catalog further, the workflow is:
 *   1. WebFetch a deeper category-listing URL on the source site.
 *   2. For each new product type, write a SampleProduct entry into
 *      lib/catalog/imported-products.ts.
 *   3. Add a matching image-manifest.json entry for the heroPromptKey so
 *      `npm run generate:images` can render a unique hero image.
 *   4. Build, browse the new product page locally, and commit in batches of
 *      ~50 SKUs so each diff is reviewable.
 *
 * NOTE: this file is documentation only and does not run anything. The Phase 3
 * import was executed inline rather than via an automated scraper because the
 * source sites have inconsistent structures and JS-only renders that block
 * pure HTML scraping. WebFetch + LLM-driven extraction proved more reliable
 * than building a per-site cheerio parser for each.
 */

export {};
