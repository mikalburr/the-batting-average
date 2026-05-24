import { describe, expect, it } from "vitest";
import { fmtAvg } from "./format";

describe("fmtAvg", () => {
  it("formats 0.891 as .891 (no leading zero)", () => {
    expect(fmtAvg(0.891)).toBe(".891");
  });

  it("formats 0 as .000", () => {
    expect(fmtAvg(0)).toBe(".000");
  });

  it("formats 1 as 1.000", () => {
    expect(fmtAvg(1)).toBe("1.000");
  });

  it("rounds to 3 decimals", () => {
    expect(fmtAvg(0.8919)).toBe(".892");
    expect(fmtAvg(0.8914)).toBe(".891");
  });

  it("clamps values above 1 to 1.000", () => {
    expect(fmtAvg(1.5)).toBe("1.000");
  });

  it("clamps negatives to .000", () => {
    expect(fmtAvg(-0.1)).toBe(".000");
  });

  it("returns em-dash for null", () => {
    expect(fmtAvg(null)).toBe("—");
  });

  it("returns em-dash for undefined", () => {
    expect(fmtAvg(undefined)).toBe("—");
  });

  it("returns em-dash for NaN", () => {
    expect(fmtAvg(Number.NaN)).toBe("—");
  });
});
