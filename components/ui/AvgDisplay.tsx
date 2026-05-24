import { fmtAvg } from "@/lib/scoring/format";
import { TIER_COLORS } from "@/lib/scoring/constants";
import type { Tier } from "@prisma/client";

interface Props {
  value: number | null | undefined;
  tier?: Tier | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "text-sm",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-6xl",
} as const;

export function AvgDisplay({ value, tier, size = "md", className = "" }: Props) {
  const display = fmtAvg(value);
  const color = tier ? TIER_COLORS[tier] : value == null ? "#555" : "#e0e0e0";

  return (
    <span
      className={`font-mono font-bold tabular-nums ${sizes[size]} ${className}`}
      style={{ color }}
    >
      {display}
    </span>
  );
}
