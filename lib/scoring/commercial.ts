import type { ArtistTier, CertLevel, ChartName, ViralityDurability } from "@prisma/client";
import {
  CERT_SCORE,
  CHART_PRESTIGE,
  COMMERCIAL_WEIGHTS,
  DURABILITY_MULTIPLIER,
  EPB,
  VIRALITY_BASELINES,
  VIRALITY_WEIGHTS,
  eraMultiplier,
} from "./constants";

export interface CommercialInputs {
  year: number;
  lifetime_streams: bigint | number;
  peak_chart_position: number | null;
  chart_name: ChartName | null;
  certification_level: CertLevel | null;
  physical_sales: number | null;
  digital_sales: number | null;
  tiktok_video_count: number | null;
  platform_trend_peaks: number | null;
  ugc_volume: number | null;
  stream_spike_post_viral: boolean;
  search_volume_surge: boolean;
  sync_placement_count: number;
  virality_durability: ViralityDurability;
}

export function normalize(actual: number, baseline: number): number {
  if (baseline <= 0) return 0;
  return Math.min((actual / baseline) * 100, 100);
}

export function calcVirality(s: Pick<CommercialInputs,
  | "tiktok_video_count"
  | "platform_trend_peaks"
  | "ugc_volume"
  | "stream_spike_post_viral"
  | "search_volume_surge"
  | "virality_durability"
>): number {
  const tiktok = normalize(s.tiktok_video_count ?? 0, VIRALITY_BASELINES.TIKTOK_VIDEOS);
  const peaks = Math.min((s.platform_trend_peaks ?? 0) * 20, 100);
  const ugc = normalize(s.ugc_volume ?? 0, VIRALITY_BASELINES.UGC_VOLUME);
  const spike = s.stream_spike_post_viral ? 80 : 20;
  const search = s.search_volume_surge ? 80 : 20;

  const raw =
    tiktok * VIRALITY_WEIGHTS.TIKTOK +
    peaks * VIRALITY_WEIGHTS.PLATFORM_PEAKS +
    ugc * VIRALITY_WEIGHTS.UGC +
    spike * VIRALITY_WEIGHTS.STREAM_SPIKE +
    search * VIRALITY_WEIGHTS.SEARCH_SURGE;

  return Math.min(raw * DURABILITY_MULTIPLIER[s.virality_durability], 100);
}

function chartScore(peak: number | null, chartName: ChartName | null): number {
  if (peak == null || peak < 1) return 0;
  const positionScore = Math.max(0, 100 - (peak - 1) * 1.5);
  const prestige = chartName ? CHART_PRESTIGE[chartName] : CHART_PRESTIGE.HOT_100;
  return positionScore * prestige;
}

export function calcCommercial(s: CommercialInputs, artistTier: ArtistTier): number {
  const epb = EPB[artistTier];
  const era = eraMultiplier(s.year);

  const streams = typeof s.lifetime_streams === "bigint"
    ? Number(s.lifetime_streams)
    : s.lifetime_streams;

  const streaming = Math.min(normalize(streams, epb.streams) * era, 100);
  const chart = Math.min(chartScore(s.peak_chart_position, s.chart_name) * era, 100);
  const cert = CERT_SCORE[s.certification_level ?? "NONE"];
  const sales = Math.min(
    normalize((s.physical_sales ?? 0) + (s.digital_sales ?? 0), epb.sales),
    100,
  );
  const virality = calcVirality(s);
  const sync = Math.min((s.sync_placement_count ?? 0) * 10, 100);

  return (
    streaming * COMMERCIAL_WEIGHTS.STREAMING +
    chart * COMMERCIAL_WEIGHTS.CHART +
    cert * COMMERCIAL_WEIGHTS.CERT +
    sales * COMMERCIAL_WEIGHTS.SALES +
    virality * COMMERCIAL_WEIGHTS.VIRALITY +
    sync * COMMERCIAL_WEIGHTS.SYNC
  );
}
