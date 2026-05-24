import type { ArtistTier, CertLevel, ChartName, ViralityDurability } from "@prisma/client";

// ─── Tier thresholds ─────────────────────────────────────────────────────
// Applied to batting_avg (0.000–1.000), not raw composite (0–100).
export const TIER_THRESHOLDS = {
  CLASSIC: 0.8,
  GREAT: 0.65,
  GOOD: 0.55,
  MID: 0.4,
} as const;

// ─── Tier display ────────────────────────────────────────────────────────
export const TIER_COLORS: Record<"CLASSIC" | "GREAT" | "GOOD" | "MID" | "SKIP", string> = {
  CLASSIC: "#FFD700",
  GREAT: "#00E5B0",
  GOOD: "#4CAF50",
  MID: "#A0A0A0",
  SKIP: "#FF4444",
};

// ─── Composite weights ───────────────────────────────────────────────────
export const COMPOSITE_WEIGHTS = {
  QUALITY: 0.45,
  CULTURAL: 0.35,
  COMMERCIAL: 0.2,
} as const;

// ─── Quality sub-weights ─────────────────────────────────────────────────
export const QUALITY_WEIGHTS = {
  LYRICISM: 0.25,
  PRODUCTION: 0.25,
  ENGINEERING: 0.2,
  CREATIVITY: 0.2,
  PERFORMANCE: 0.1,
} as const;

// When lyricism is null (instrumental), redistribute its 25% to Production +12.5%
// and Engineering +12.5%.
export const QUALITY_WEIGHTS_INSTRUMENTAL = {
  LYRICISM: 0,
  PRODUCTION: QUALITY_WEIGHTS.PRODUCTION + QUALITY_WEIGHTS.LYRICISM / 2,
  ENGINEERING: QUALITY_WEIGHTS.ENGINEERING + QUALITY_WEIGHTS.LYRICISM / 2,
  CREATIVITY: QUALITY_WEIGHTS.CREATIVITY,
  PERFORMANCE: QUALITY_WEIGHTS.PERFORMANCE,
} as const;

// ─── Cultural sub-weights ────────────────────────────────────────────────
export const CULTURAL_WEIGHTS = {
  LONGEVITY: 0.3,
  SAMPLE: 0.2,
  CRITICAL: 0.2,
  CULTURAL_MOMENT: 0.2,
  PEER: 0.1,
} as const;

// ─── Commercial sub-weights ──────────────────────────────────────────────
export const COMMERCIAL_WEIGHTS = {
  STREAMING: 0.25,
  CHART: 0.2,
  CERT: 0.15,
  SALES: 0.1,
  VIRALITY: 0.2,
  SYNC: 0.1,
} as const;

// ─── Virality sub-weights ────────────────────────────────────────────────
export const VIRALITY_WEIGHTS = {
  TIKTOK: 0.35,
  PLATFORM_PEAKS: 0.2,
  UGC: 0.2,
  STREAM_SPIKE: 0.15,
  SEARCH_SURGE: 0.1,
} as const;

// ─── Expected Performance Baselines (per artist tier) ────────────────────
export const EPB: Record<ArtistTier, { streams: number; sales: number }> = {
  SUPERSTAR: { streams: 800_000_000, sales: 2_000_000 },
  MAINSTREAM: { streams: 150_000_000, sales: 400_000 },
  RISING: { streams: 30_000_000, sales: 80_000 },
  INDEPENDENT: { streams: 5_000_000, sales: 15_000 },
  UNDERGROUND: { streams: 800_000, sales: 3_000 },
};

// ─── Era multipliers (apply to streaming + chart only) ───────────────────
export function eraMultiplier(year: number): number {
  if (year < 1990) return 3.5;
  if (year < 2000) return 2.8;
  if (year < 2010) return 2.2;
  if (year < 2016) return 1.6;
  if (year < 2020) return 1.2;
  return 1.0;
}

// ─── Certification → score ───────────────────────────────────────────────
export const CERT_SCORE: Record<CertLevel, number> = {
  DIAMOND: 100,
  FIVE_PLAT: 85,
  FOUR_PLAT: 78,
  THREE_PLAT: 72,
  TWO_PLAT: 67,
  PLAT: 65,
  GOLD: 45,
  NONE: 0,
};

// ─── Chart prestige (Hot 100 > R&B/Hip-Hop > Rap > Regional) ─────────────
// Multiplies the chart sub-score before the era multiplier.
export const CHART_PRESTIGE: Record<ChartName, number> = {
  HOT_100: 1.0,
  R_B_HIP_HOP: 0.85,
  RAP: 0.75,
  REGIONAL: 0.5,
};

// ─── Virality durability multiplier ──────────────────────────────────────
export const DURABILITY_MULTIPLIER: Record<ViralityDurability, number> = {
  LASTING: 1.0,
  FADED: 0.65,
  SLOW_BURN: 1.1,
};

// ─── Virality input baselines (raw → 0–100 normalize targets) ────────────
export const VIRALITY_BASELINES = {
  TIKTOK_VIDEOS: 5_000_000,
  UGC_VOLUME: 1_000_000,
} as const;
