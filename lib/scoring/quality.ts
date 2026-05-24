import { QUALITY_WEIGHTS, QUALITY_WEIGHTS_INSTRUMENTAL } from "./constants";

export interface QualityInputs {
  lyricism_score: number | null;
  production_score: number;
  engineering_score: number;
  creativity_score: number;
  performance_score: number;
}

export function calcQuality(s: QualityInputs): number {
  const w = s.lyricism_score == null ? QUALITY_WEIGHTS_INSTRUMENTAL : QUALITY_WEIGHTS;
  return (
    (s.lyricism_score ?? 0) * w.LYRICISM +
    s.production_score * w.PRODUCTION +
    s.engineering_score * w.ENGINEERING +
    s.creativity_score * w.CREATIVITY +
    s.performance_score * w.PERFORMANCE
  );
}
