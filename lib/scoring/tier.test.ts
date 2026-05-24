import { describe, expect, it } from "vitest";
import { getTier } from "./tier";

describe("getTier", () => {
  it("returns CLASSIC at the threshold of .800", () => {
    expect(getTier(0.8)).toBe("CLASSIC");
  });

  it("returns GREAT just below .800", () => {
    expect(getTier(0.799)).toBe("GREAT");
  });

  it("returns GREAT at .650", () => {
    expect(getTier(0.65)).toBe("GREAT");
  });

  it("returns GOOD just below .650", () => {
    expect(getTier(0.649)).toBe("GOOD");
  });

  it("returns GOOD at .550", () => {
    expect(getTier(0.55)).toBe("GOOD");
  });

  it("returns MID just below .550", () => {
    expect(getTier(0.549)).toBe("MID");
  });

  it("returns MID at .400", () => {
    expect(getTier(0.4)).toBe("MID");
  });

  it("returns SKIP just below .400", () => {
    expect(getTier(0.399)).toBe("SKIP");
  });

  it("returns SKIP at .000", () => {
    expect(getTier(0)).toBe("SKIP");
  });

  it("returns CLASSIC at 1.000", () => {
    expect(getTier(1)).toBe("CLASSIC");
  });
});
