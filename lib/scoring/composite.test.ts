import { describe, expect, it } from "vitest";
import { calcComposite, type SongScoreInputs } from "./composite";

const perfectQuality = {
  lyricism_score: 100,
  production_score: 100,
  engineering_score: 100,
  creativity_score: 100,
  performance_score: 100,
};

const perfectCultural = {
  longevity_score: 100,
  sample_score: 100,
  critical_score: 100,
  cultural_moment_score: 100,
  peer_score: 100,
};

const baseCommercial = {
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
  virality_durability: "LASTING" as const,
};

describe("calcComposite", () => {
  it("perfect quality + perfect cultural + zero commercial yields composite ≈ 81 → CLASSIC", () => {
    const song: SongScoreInputs = { ...perfectQuality, ...perfectCultural, ...baseCommercial };
    const r = calcComposite(song, "MAINSTREAM");
    // quality 100 * .45 + cultural 100 * .35 + commercial ~1 * .20 ≈ 80.2
    expect(r.quality).toBeCloseTo(100, 2);
    expect(r.culturalImpact).toBeCloseTo(100, 2);
    expect(r.composite).toBeGreaterThan(80);
    expect(r.composite).toBeLessThan(82);
    expect(r.battingAvg).toBeGreaterThan(0.8);
    expect(r.tier).toBe("CLASSIC");
  });

  it("UNDERGROUND artist with strong commercial signals (relative to EPB) gets a boosted composite", () => {
    const song: SongScoreInputs = {
      ...perfectQuality,
      ...perfectCultural,
      ...baseCommercial,
      lifetime_streams: 8_000_000, // 10× EPB underground
      certification_level: "GOLD",
    };
    const r = calcComposite(song, "UNDERGROUND");
    expect(r.commercial).toBeGreaterThan(30);
    expect(r.tier).toBe("CLASSIC");
  });

  it("an instrumental composite computes correctly with redistributed quality weights", () => {
    const song: SongScoreInputs = {
      lyricism_score: null,
      production_score: 100,
      engineering_score: 100,
      creativity_score: 100,
      performance_score: 100,
      ...perfectCultural,
      ...baseCommercial,
    };
    const r = calcComposite(song, "MAINSTREAM");
    expect(r.quality).toBeCloseTo(100, 2);
  });

  it("low-tier scoring yields SKIP", () => {
    const song: SongScoreInputs = {
      lyricism_score: 30,
      production_score: 30,
      engineering_score: 30,
      creativity_score: 30,
      performance_score: 30,
      longevity_score: 20,
      sample_score: 20,
      critical_score: 20,
      cultural_moment_score: 20,
      peer_score: 20,
      ...baseCommercial,
    };
    const r = calcComposite(song, "MAINSTREAM");
    expect(r.tier).toBe("SKIP");
  });

  it("battingAvg = composite / 100 always", () => {
    const song: SongScoreInputs = { ...perfectQuality, ...perfectCultural, ...baseCommercial };
    const r = calcComposite(song, "MAINSTREAM");
    expect(r.battingAvg).toBeCloseTo(r.composite / 100, 10);
  });
});
