// .XXX rule: 3 decimals, no leading zero (".891" not "0.891").
// `null` returns an em-dash so empty rosters/songs render as "—" instead of ".000".
export function fmtAvg(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  const clamped = Math.max(0, Math.min(1, n));
  const fixed = clamped.toFixed(3);
  return fixed.startsWith("0.") ? fixed.slice(1) : fixed;
}
