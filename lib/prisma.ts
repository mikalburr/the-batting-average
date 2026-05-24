import { PrismaClient, type Prisma } from "@prisma/client";
import { calcComposite, type SongScoreInputs } from "./scoring/composite";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function buildClient(): PrismaClient {
  const client = new PrismaClient();

  // Recompute cached score fields on every Song create/update so they never go stale.
  // Read-side queries can trust quality_score_calc / composite_score / batting_avg / tier
  // without recomputing. Bulk recalc lives at /api/admin/recalc.
  client.$use(async (params, next) => {
    if (params.model !== "Song") return next(params);
    if (params.action !== "create" && params.action !== "update" && params.action !== "upsert") {
      return next(params);
    }

    // upsert splits data across .create and .update; create/update use .data
    const args = params.args as Record<string, unknown>;
    const data: Record<string, unknown> | undefined =
      params.action === "upsert"
        ? (args.create as Record<string, unknown> | undefined)
        : (args.data as Record<string, unknown> | undefined);
    if (!data) return next(params);

    // For an update we only have the deltas, so we have to fetch the existing
    // row to compute against the merged state. For create/upsert.create we
    // need the artistTier looked up from the primaryArtist relation.
    const merged = await mergeForCompute(client, params, data);
    if (!merged) return next(params);

    const score = calcComposite(merged.song, merged.artistTier);
    const computed = {
      quality_score_calc: score.quality,
      cultural_impact_calc: score.culturalImpact,
      commercial_score_calc: score.commercial,
      composite_score: score.composite,
      batting_avg: score.battingAvg,
      tier: score.tier,
    };

    Object.assign(data, computed);
    // For upsert, also inject into the update payload so re-upserts stay fresh
    if (params.action === "upsert" && args.update && typeof args.update === "object") {
      Object.assign(args.update, computed);
    }

    return next(params);
  });

  return client;
}

interface MergedScoreContext {
  song: SongScoreInputs;
  artistTier: import("@prisma/client").ArtistTier;
}

async function mergeForCompute(
  client: PrismaClient,
  params: Prisma.MiddlewareParams,
  data: Record<string, unknown>,
): Promise<MergedScoreContext | null> {
  const where = (params.args as { where?: { id?: string } })?.where;
  let existing: Awaited<ReturnType<PrismaClient["song"]["findUnique"]>> | null = null;
  if ((params.action === "update" || params.action === "upsert") && where?.id) {
    existing = await client.song.findUnique({ where: { id: where.id } });
  }

  const merged = { ...(existing ?? {}), ...data } as Record<string, unknown>;

  // Required scalar fields — bail if any are missing on a create.
  const required = [
    "year",
    "production_score",
    "engineering_score",
    "creativity_score",
    "performance_score",
    "longevity_score",
    "sample_score",
    "critical_score",
    "cultural_moment_score",
    "peer_score",
  ];
  for (const k of required) {
    if (merged[k] == null) return null;
  }

  // Look up artistTier — `data.primaryArtistId` may be a raw id (create) or
  // nested under `primaryArtist.connect.id` (relation form). Existing rows
  // always have primaryArtistId.
  const primaryArtistId =
    (merged.primaryArtistId as string | undefined) ??
    extractConnectId(data.primaryArtist) ??
    null;
  if (!primaryArtistId) return null;
  const artist = await client.artist.findUnique({
    where: { id: primaryArtistId },
    select: { artistTier: true },
  });
  if (!artist) return null;

  const song: SongScoreInputs = {
    lyricism_score: (merged.lyricism_score as number | null) ?? null,
    production_score: merged.production_score as number,
    engineering_score: merged.engineering_score as number,
    creativity_score: merged.creativity_score as number,
    performance_score: merged.performance_score as number,
    longevity_score: merged.longevity_score as number,
    sample_score: merged.sample_score as number,
    critical_score: merged.critical_score as number,
    cultural_moment_score: merged.cultural_moment_score as number,
    peer_score: merged.peer_score as number,
    year: merged.year as number,
    lifetime_streams: (merged.lifetime_streams as bigint | number | undefined) ?? 0n,
    peak_chart_position: (merged.peak_chart_position as number | null | undefined) ?? null,
    chart_name: (merged.chart_name as SongScoreInputs["chart_name"] | undefined) ?? null,
    certification_level:
      (merged.certification_level as SongScoreInputs["certification_level"] | undefined) ?? null,
    physical_sales: (merged.physical_sales as number | null | undefined) ?? null,
    digital_sales: (merged.digital_sales as number | null | undefined) ?? null,
    tiktok_video_count: (merged.tiktok_video_count as number | null | undefined) ?? null,
    platform_trend_peaks: (merged.platform_trend_peaks as number | null | undefined) ?? null,
    ugc_volume: (merged.ugc_volume as number | null | undefined) ?? null,
    stream_spike_post_viral: (merged.stream_spike_post_viral as boolean | undefined) ?? false,
    search_volume_surge: (merged.search_volume_surge as boolean | undefined) ?? false,
    sync_placement_count: (merged.sync_placement_count as number | undefined) ?? 0,
    virality_durability:
      (merged.virality_durability as SongScoreInputs["virality_durability"]) ?? "LASTING",
  };

  return { song, artistTier: artist.artistTier };
}

function extractConnectId(rel: unknown): string | null {
  if (!rel || typeof rel !== "object") return null;
  const connect = (rel as { connect?: { id?: string } }).connect;
  return connect?.id ?? null;
}

export { buildClient };
export const prisma = globalThis.__prisma ?? buildClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
