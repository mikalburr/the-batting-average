interface ScoreDimension {
  label: string;
  score: number;
  weight: number;
  description?: string;
}

interface Props {
  title: string;
  dimensions: ScoreDimension[];
  pillarScore?: number;
  accentColor?: string;
}

export function ScoreBreakdown({ title, dimensions, pillarScore, accentColor = "#00E5B0" }: Props) {
  return (
    <div className="bg-surface rounded-lg p-5 border border-border">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="font-display text-lg tracking-wider text-text-primary">{title}</h3>
        {pillarScore != null && (
          <span className="font-mono text-sm" style={{ color: accentColor }}>
            {pillarScore.toFixed(1)}
          </span>
        )}
      </div>
      <div className="space-y-3">
        {dimensions.map((d) => (
          <div key={d.label}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-text-muted font-body">
                {d.label}
                <span className="ml-1 text-[10px] opacity-50">{d.weight * 100}%</span>
              </span>
              <span className="font-mono text-xs text-text-primary">{d.score.toFixed(0)}</span>
            </div>
            <div className="h-1.5 bg-raised rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${d.score}%`,
                  backgroundColor: accentColor,
                  opacity: 0.7 + (d.weight * 0.5),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
