import { describe, expect, it } from "vitest";
import { calcQuality } from "./quality";

describe("calcQuality", () => {
  it("computes the standard 5-pillar weighted average", () => {
    const q = calcQuality({
      lyricism_score: 90,
      production_score: 80,
      engineering_score: 70,
      creativity_score: 85,
      performance_score: 75,
    });
    // 90*.25 + 80*.25 + 70*.20 + 85*.20 + 75*.10 = 22.5 + 20 + 14 + 17 + 7.5 = 81
    expect(q).toBeCloseTo(81, 6);
  });

  it("returns 100 when every sub-score is 100", () => {
    const q = calcQuality({
      lyricism_score: 100,
      production_score: 100,
      engineering_score: 100,
      creativity_score: 100,
      performance_score: 100,
    });
    expect(q).toBeCloseTo(100, 6);
  });

  it("redistributes lyricism's 25% onto Production +12.5% and Engineering +12.5% for instrumentals", () => {
    const q = calcQuality({
      lyricism_score: null, // instrumental
      production_score: 80,
      engineering_score: 70,
      creativity_score: 85,
      performance_score: 75,
    });
    // weights: prod 0.375, eng 0.325, crea 0.20, perf 0.10
    // 80*.375 + 70*.325 + 85*.20 + 75*.10 = 30 + 22.75 + 17 + 7.5 = 77.25
    expect(q).toBeCloseTo(77.25, 6);
  });

  it("instrumental weights still sum to 1", () => {
    const q = calcQuality({
      lyricism_score: null,
      production_score: 100,
      engineering_score: 100,
      creativity_score: 100,
      performance_score: 100,
    });
    expect(q).toBeCloseTo(100, 6);
  });
});
