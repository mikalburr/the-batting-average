import type { ArtistTier, Tier } from "@prisma/client";
import { COMPOSITE_WEIGHTS } from "./constants";
import { calcQuality, type QualityInputs } from "./quality";
import { calcCulturalImpact, type CulturalInputs } from "./cultural";
import { calcCommercial, type CommercialInputs } from "./commercial";
import { getTier } from "./tier";

export type SongScoreInputs = QualityInputs & CulturalInputs & CommercialInputs;

export interface ComputedSongScore {
  quality: number;
  culturalImpact: number;
  commercial: number;
  composite: number;
  battingAvg: number;
  tier: Tier;
}

export function calcComposite(
  song: SongScoreInputs,
  artistTier: ArtistTier,
): ComputedSongScore {
  const quality = calcQuality(song);
  const culturalImpact = calcCulturalImpact(song);
  const commercial = calcCommercial(song, artistTier);
  const composite =
    quality * COMPOSITE_WEIGHTS.QUALITY +
    culturalImpact * COMPOSITE_WEIGHTS.CULTURAL +
    commercial * COMPOSITE_WEIGHTS.COMMERCIAL;
  const battingAvg = composite / 100;

  return {
    quality,
    culturalImpact,
    commercial,
    composite,
    battingAvg,
    tier: getTier(battingAvg),
  };
}
