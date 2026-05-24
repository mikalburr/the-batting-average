import { CULTURAL_WEIGHTS } from "./constants";

export interface CulturalInputs {
  longevity_score: number;
  sample_score: number;
  critical_score: number;
  cultural_moment_score: number;
  peer_score: number;
}

export function calcCulturalImpact(s: CulturalInputs): number {
  return (
    s.longevity_score * CULTURAL_WEIGHTS.LONGEVITY +
    s.sample_score * CULTURAL_WEIGHTS.SAMPLE +
    s.critical_score * CULTURAL_WEIGHTS.CRITICAL +
    s.cultural_moment_score * CULTURAL_WEIGHTS.CULTURAL_MOMENT +
    s.peer_score * CULTURAL_WEIGHTS.PEER
  );
}
