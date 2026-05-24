import { describe, expect, it } from "vitest";
import { calcCulturalImpact } from "./cultural";

describe("calcCulturalImpact", () => {
  it("computes the 5-factor weighted average", () => {
    const c = calcCulturalImpact({
      longevity_score: 90,
      sample_score: 60,
      critical_score: 80,
      cultural_moment_score: 70,
      peer_score: 50,
    });
    // 90*.30 + 60*.20 + 80*.20 + 70*.20 + 50*.10 = 27 + 12 + 16 + 14 + 5 = 74
    expect(c).toBeCloseTo(74, 6);
  });

  it("returns 0 for all-zero inputs", () => {
    const c = calcCulturalImpact({
      longevity_score: 0,
      sample_score: 0,
      critical_score: 0,
      cultural_moment_score: 0,
      peer_score: 0,
    });
    expect(c).toBe(0);
  });

  it("returns 100 for all-100 inputs", () => {
    const c = calcCulturalImpact({
      longevity_score: 100,
      sample_score: 100,
      critical_score: 100,
      cultural_moment_score: 100,
      peer_score: 100,
    });
    expect(c).toBeCloseTo(100, 6);
  });
});
