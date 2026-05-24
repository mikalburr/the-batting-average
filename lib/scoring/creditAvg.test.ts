import { describe, expect, it } from "vitest";
import { artistAvg, creditAvg, labelAvg } from "./creditAvg";

const songs = [
  {
    lyricism_score: 90,
    production_score: 80,
    engineering_score: 70,
    performance_score: 85,
    composite_score: 78,
    batting_avg: 0.78,
  },
  {
    lyricism_score: 70,
    production_score: 90,
    engineering_score: 80,
    performance_score: 75,
    composite_score: 82,
    batting_avg: 0.82,
  },
];

describe("creditAvg", () => {
  it("PRODUCER pulls from production_score", () => {
    expect(creditAvg(songs, "PRODUCER")).toBeCloseTo((80 + 90) / 2 / 100, 6);
  });

  it("ENGINEER pulls from engineering_score", () => {
    expect(creditAvg(songs, "ENGINEER")).toBeCloseTo((70 + 80) / 2 / 100, 6);
  });

  it("SONGWRITER pulls from lyricism_score and skips instrumentals", () => {
    const withInstrumental = [
      ...songs,
      {
        lyricism_score: null,
        production_score: 90,
        engineering_score: 90,
        performance_score: 90,
        composite_score: 90,
        batting_avg: 0.9,
      },
    ];
    expect(creditAvg(withInstrumental, "SONGWRITER")).toBeCloseTo((90 + 70) / 2 / 100, 6);
  });

  it("FEATURE averages lyricism + performance, falling back to performance only on instrumentals", () => {
    expect(creditAvg(songs, "FEATURE")).toBeCloseTo(
      ((90 + 85) / 2 + (70 + 75) / 2) / 2 / 100,
      6,
    );
  });

  it("VOCALIST pulls from performance_score", () => {
    expect(creditAvg(songs, "VOCALIST")).toBeCloseTo((85 + 75) / 2 / 100, 6);
  });

  it("returns null for an empty roster", () => {
    expect(creditAvg([], "PRODUCER")).toBeNull();
  });

  it("returns null when SONGWRITER has only instrumental songs", () => {
    const allInstrumental = [
      {
        lyricism_score: null,
        production_score: 90,
        engineering_score: 90,
        performance_score: 90,
        composite_score: 90,
        batting_avg: 0.9,
      },
    ];
    expect(creditAvg(allInstrumental, "SONGWRITER")).toBeNull();
  });
});

describe("labelAvg", () => {
  it("averages composite_score across the roster (then divides by 100)", () => {
    expect(labelAvg(songs)).toBeCloseTo((78 + 82) / 2 / 100, 6);
  });

  it("ignores songs with null composite_score", () => {
    const mixed = [...songs, { composite_score: null }];
    expect(labelAvg(mixed)).toBeCloseTo((78 + 82) / 2 / 100, 6);
  });

  it("returns null on an empty roster", () => {
    expect(labelAvg([])).toBeNull();
  });
});

describe("artistAvg", () => {
  it("averages batting_avg across an artist's songs", () => {
    expect(artistAvg(songs)).toBeCloseTo((0.78 + 0.82) / 2, 6);
  });

  it("returns null when an artist has no rated songs", () => {
    expect(artistAvg([])).toBeNull();
  });
});
