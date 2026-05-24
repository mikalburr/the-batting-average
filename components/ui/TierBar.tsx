import { TIER_COLORS } from "@/lib/scoring/constants";

interface TierCounts {
  CLASSIC: number;
  GREAT: number;
  GOOD: number;
  MID: number;
  SKIP: number;
}

interface Props {
  counts: TierCounts;
  showLabels?: boolean;
}

const TIERS = ["CLASSIC", "GREAT", "GOOD", "MID", "SKIP"] as const;

export function TierBar({ counts, showLabels = true }: Props) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  return (
    <div className="w-full">
      <div className="flex h-3 w-full overflow-hidden rounded-full gap-px">
        {TIERS.map((tier) => {
          const count = counts[tier];
          if (count === 0) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={tier}
              title={`${tier}: ${count}`}
              className="h-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: TIER_COLORS[tier] }}
            />
          );
        })}
      </div>
      {showLabels && (
        <div className="flex mt-2 gap-4 flex-wrap">
          {TIERS.map((tier) => {
            const count = counts[tier];
            if (count === 0) return null;
            return (
              <span key={tier} className="flex items-center gap-1 text-xs font-body text-text-muted">
                <span
                  className="inline-block w-2 h-2 rounded-sm"
                  style={{ backgroundColor: TIER_COLORS[tier] }}
                />
                <span style={{ color: TIER_COLORS[tier] }} className="font-semibold">{tier}</span>
                <span>{count}</span>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
