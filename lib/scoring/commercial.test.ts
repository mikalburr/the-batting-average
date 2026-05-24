import { describe, expect, it } from "vitest";
import { calcCommercial, calcVirality, normalize } from "./commercial";
import type { CommercialInputs } from "./commercial";

const baseCommercialInputs: CommercialInputs = {
  year: 2022,
  lifetime_streams: 0,
  peak_chart_position: null,
  chart_name: null,
  certification_level: null,
  physical_sales: null,
  digital_sales: null,
  tiktok_video_count: null,
  platform_trend_peaks: null,
  ugc_volume: null,
  stream_spike_post_viral: false,
  search_volume_surge: false,
  sync_placement_count: 0,
  virality_durability: "LASTING",
};

describe("normalize", () => {
  it("returns 0 when actual is 0", () => {
    expect(normalize(0, 100)).toBe(0);
  });

  it("returns 100 when actual matches baseline", () => {
    expect(normalize(100, 100)).toBe(100);
  });

  it("caps at 100 when actual exceeds baseline", () => {
    expect(normalize(500, 100)).toBe(100);
  });

  it("scales linearly below baseline", () => {
    expect(normalize(50, 100)).toBe(50);
  });

  it("returns 0 when baseline is 0 (avoid divide-by-zero)", () => {
    expect(normalize(50, 0)).toBe(0);
  });
});

describe("calcVirality", () => {
  it("returns 0 for an inert song with all zero/false inputs", () => {
    // search/spike default to 20 each — non-zero base from booleans
    const v = calcVirality({
      tiktok_video_count: 0,
      platform_trend_peaks: 0,
      ugc_volume: 0,
      stream_spike_post_viral: false,
      search_volume_surge: false,
      virality_durability: "LASTING",
    });
    // tiktok=0, peaks=0, ugc=0, spike=20, search=20
    // raw = 0 + 0 + 0 + 20*.15 + 20*.10 = 3 + 2 = 5
    expect(v).toBeCloseTo(5, 6);
  });

  it("FADED durability cuts the virality score by 35%", () => {
    const lasting = calcVirality({
      tiktok_video_count: 5_000_000,
      platform_trend_peaks: 5,
      ugc_volume: 1_000_000,
      stream_spike_post_viral: true,
      search_volume_surge: true,
      virality_durability: "LASTING",
    });
    const faded = calcVirality({
      tiktok_video_count: 5_000_000,
      platform_trend_peaks: 5,
      ugc_volume: 1_000_000,
      stream_spike_post_viral: true,
      search_volume_surge: true,
      virality_durability: "FADED",
    });
    expect(faded).toBeCloseTo(lasting * 0.65, 4);
  });

  it("SLOW_BURN durability boosts but caps at 100", () => {
    const v = calcVirality({
      tiktok_video_count: 5_000_000,
      platform_trend_peaks: 5,
      ugc_volume: 1_000_000,
      stream_spike_post_viral: true,
      search_volume_surge: true,
      virality_durability: "SLOW_BURN",
    });
    expect(v).toBe(100);
  });
});

describe("calcCommercial — EPB normalization", () => {
  it("an UNDERGROUND song hitting 8M streams (vs 800K EPB) maxes the streaming sub-score", () => {
    // EPB UNDERGROUND streams = 800_000. 8_000_000 / 800_000 = 10x → caps at 100.
    // Era 2022 multiplier = 1.0.
    const score = calcCommercial(
      { ...baseCommercialInputs, lifetime_streams: 8_000_000 },
      "UNDERGROUND",
    );
    // streaming alone: 100 * 0.25 = 25; rest are zero/baseline
    // virality with all-zero inputs but boolean defaults = 5 → 5 * 0.20 = 1
    // total ≈ 25 + 1 = 26
    expect(score).toBeGreaterThan(25);
  });

  it("a SUPERSTAR song hitting 200M streams (vs 800M EPB) does NOT max streaming", () => {
    // 200M / 800M = 0.25 → 25 streaming sub-score, * 1.0 era = 25.
    const score = calcCommercial(
      { ...baseCommercialInputs, lifetime_streams: 200_000_000 },
      "SUPERSTAR",
    );
    // streaming contribution = 25 * 0.25 = 6.25
    // plus virality baseline ~1
    expect(score).toBeLessThan(15);
  });

  it("era multiplier lifts a 1995 streaming score (×2.8) above an identical 2022 one", () => {
    const a = calcCommercial(
      { ...baseCommercialInputs, year: 1995, lifetime_streams: 50_000_000 },
      "MAINSTREAM",
    );
    const b = calcCommercial(
      { ...baseCommercialInputs, year: 2022, lifetime_streams: 50_000_000 },
      "MAINSTREAM",
    );
    expect(a).toBeGreaterThan(b);
  });

  it("Diamond cert contributes 100 * 0.15 = 15 points", () => {
    const score = calcCommercial(
      { ...baseCommercialInputs, certification_level: "DIAMOND" },
      "SUPERSTAR",
    );
    // baseline virality = ~5 * 0.20 = 1 → cert alone adds 15 → ~16
    expect(score).toBeGreaterThan(15);
    expect(score).toBeLessThan(18);
  });

  it("chart prestige weights HOT_100 above REGIONAL", () => {
    const hot = calcCommercial(
      { ...baseCommercialInputs, peak_chart_position: 1, chart_name: "HOT_100" },
      "MAINSTREAM",
    );
    const regional = calcCommercial(
      { ...baseCommercialInputs, peak_chart_position: 1, chart_name: "REGIONAL" },
      "MAINSTREAM",
    );
    expect(hot).toBeGreaterThan(regional);
  });
});
