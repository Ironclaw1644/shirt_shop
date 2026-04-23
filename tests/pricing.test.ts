import { describe, it, expect } from "vitest";
import { formatMoneyCents } from "@/lib/utils/money";

describe("formatMoneyCents", () => {
  it("formats whole dollar amounts with cents by default", () => {
    expect(formatMoneyCents(1299)).toBe("$12.99");
    expect(formatMoneyCents(100)).toBe("$1.00");
  });
  it("returns em-dash for null/undefined", () => {
    expect(formatMoneyCents(null)).toBe("—");
    expect(formatMoneyCents(undefined)).toBe("—");
  });
  it("supports whole-number formatting", () => {
    expect(formatMoneyCents(12500, { whole: true })).toBe("$125");
  });
});

describe("tier pricing", () => {
  const tiers = [
    { minQty: 12, unitCents: 1299 },
    { minQty: 24, unitCents: 1099 },
    { minQty: 72, unitCents: 899 },
  ];
  function unit(qty: number) {
    let match = tiers[0];
    for (const t of tiers) if (qty >= t.minQty) match = t;
    return match.unitCents;
  }
  it("chooses the lowest-qualifying tier", () => {
    expect(unit(12)).toBe(1299);
    expect(unit(23)).toBe(1299);
    expect(unit(24)).toBe(1099);
    expect(unit(500)).toBe(899);
  });
});
