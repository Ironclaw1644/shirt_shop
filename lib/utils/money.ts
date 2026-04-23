const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_WHOLE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatMoneyCents(cents: number | null | undefined, opts?: { whole?: boolean }) {
  if (cents === null || cents === undefined || Number.isNaN(cents)) return "—";
  const value = cents / 100;
  return (opts?.whole ? USD_WHOLE : USD).format(value);
}

export function formatMoneyFromDollars(dollars: number) {
  return USD.format(dollars);
}

export function formatQuantity(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}
