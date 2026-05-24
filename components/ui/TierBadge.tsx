import { TIER_COLORS } from "@/lib/scoring/constants";
import type { Tier } from "@prisma/client";

interface Props {
  tier: Tier | null | undefined;
  size?: "xs" | "sm" | "md";
}

const sizes = {
  xs: "px-1.5 py-0.5 text-[10px] tracking-wider",
  sm: "px-2 py-0.5 text-xs tracking-widest",
  md: "px-3 py-1 text-sm tracking-widest",
} as const;

export function TierBadge({ tier, size = "sm" }: Props) {
  if (!tier) return null;
  const color = TIER_COLORS[tier];
  return (
    <span
      className={`font-body font-semibold uppercase rounded ${sizes[size]}`}
      style={{
        color,
        backgroundColor: `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {tier}
    </span>
  );
}
