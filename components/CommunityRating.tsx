import { fmtAvg } from "@/lib/scoring/format";
import { getTier } from "@/lib/scoring/tier";
import { TIER_COLORS } from "@/lib/scoring/constants";

interface Props {
  editorialAvg: number | null;
  editorialTier: string | null;
  communityAvg: number | null;
  communityCount: number;
}

export function CommunityRating({ editorialAvg, editorialTier, communityAvg, communityCount }: Props) {
  const editColor = editorialTier ? (TIER_COLORS[editorialTier as keyof typeof TIER_COLORS] ?? "#555") : "#555";
  const commTier  = communityAvg != null ? getTier(communityAvg) : null;
  const commColor = commTier ? (TIER_COLORS[commTier] ?? "#555") : "#555";

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="grid grid-cols-2 gap-4">
        {/* Editorial */}
        <div>
          <p className="text-xs text-text-muted font-body tracking-widest mb-1">EDITORIAL</p>
          <span
            className="font-mono text-4xl font-bold"
            style={{ color: editColor }}
          >
            {editorialAvg != null ? fmtAvg(editorialAvg) : "—"}
          </span>
          {editorialTier && (
            <p className="text-xs mt-1 font-display tracking-wider" style={{ color: editColor }}>
              {editorialTier}
            </p>
          )}
        </div>

        {/* Community */}
        <div>
          <p className="text-xs text-text-muted font-body tracking-widest mb-1">
            COMMUNITY{communityCount > 0 ? ` · ${communityCount.toLocaleString()}` : ""}
          </p>
          {communityAvg != null ? (
            <>
              <span
                className="font-mono text-4xl font-bold"
                style={{ color: commColor }}
              >
                {fmtAvg(communityAvg)}
              </span>
              {commTier && (
                <p className="text-xs mt-1 font-display tracking-wider" style={{ color: commColor }}>
                  {commTier}
                </p>
              )}
            </>
          ) : (
            <span className="font-mono text-4xl font-bold text-text-muted">—</span>
          )}
        </div>
      </div>

      {communityCount === 0 && (
        <p className="text-xs text-text-muted font-body mt-3">Be the first to rate this song.</p>
      )}
    </div>
  );
}
