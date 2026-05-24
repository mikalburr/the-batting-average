import type { Tier } from "@prisma/client";
import { TIER_THRESHOLDS } from "./constants";

export function getTier(battingAvg: number): Tier {
  if (battingAvg >= TIER_THRESHOLDS.CLASSIC) return "CLASSIC";
  if (battingAvg >= TIER_THRESHOLDS.GREAT) return "GREAT";
  if (battingAvg >= TIER_THRESHOLDS.GOOD) return "GOOD";
  if (battingAvg >= TIER_THRESHOLDS.MID) return "MID";
  return "SKIP";
}
