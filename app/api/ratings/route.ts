import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcComposite } from "@/lib/scoring/composite";
import type { ArtistTier, ViralityDurability } from "@prisma/client";

// GET /api/ratings?songId=xxx — fetch aggregate for a song
export async function GET(req: NextRequest) {
  const songId = req.nextUrl.searchParams.get("songId");
  if (!songId) return NextResponse.json({ error: "songId required" }, { status: 400 });

  const song = await prisma.song.findUnique({
    where: { id: songId },
    select: { communityAvg: true, communityCount: true },
  });
  return NextResponse.json(song ?? { communityAvg: null, communityCount: 0 });
}

// POST /api/ratings — submit a rating (requires user session)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !("userId" in session)) {
    return NextResponse.json({ error: "Sign in to rate songs" }, { status: 401 });
  }

  const body = await req.json();
  const { songId, scores } = body as {
    songId: string;
    scores: {
      lyricism_score?: number | null;
      production_score?: number;
      engineering_score?: number;
      creativity_score?: number;
      performance_score?: number;
      longevity_score?: number;
      sample_score?: number;
      critical_score?: number;
      cultural_moment_score?: number;
      peer_score?: number;
    };
  };

  if (!songId) return NextResponse.json({ error: "songId required" }, { status: 400 });

  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: { primaryArtist: true },
  });
  if (!song) return NextResponse.json({ error: "Song not found" }, { status: 404 });

  // Compute composite from user's sub-scores using same formula
  const artistTier = song.primaryArtist.artistTier as ArtistTier;
  const computed = calcComposite({
    lyricism_score:       scores.lyricism_score ?? null,
    production_score:     scores.production_score ?? 50,
    engineering_score:    scores.engineering_score ?? 50,
    creativity_score:     scores.creativity_score ?? 50,
    performance_score:    scores.performance_score ?? 50,
    longevity_score:      scores.longevity_score ?? 50,
    sample_score:         scores.sample_score ?? 50,
    critical_score:       scores.critical_score ?? 50,
    cultural_moment_score: scores.cultural_moment_score ?? 50,
    peer_score:           scores.peer_score ?? 50,
    lifetime_streams:     song.lifetime_streams,
    peak_chart_position:  song.peak_chart_position,
    chart_name:           song.chart_name,
    certification_level:  song.certification_level,
    physical_sales:       song.physical_sales,
    digital_sales:        song.digital_sales,
    tiktok_video_count:   song.tiktok_video_count,
    platform_trend_peaks: song.platform_trend_peaks,
    ugc_volume:           song.ugc_volume,
    stream_spike_post_viral: song.stream_spike_post_viral,
    search_volume_surge:  song.search_volume_surge,
    sync_placement_count: song.sync_placement_count,
    virality_durability:  song.virality_durability as ViralityDurability,
    year:                 song.year,
  }, artistTier);

  const composite_score = computed.composite;
  const batting_avg = computed.battingAvg;
  const userId = (session as { userId: string }).userId;

  const rating = await prisma.userRating.upsert({
    where: { userId_songId: { userId, songId } },
    create: { userId, songId, ...scores, composite_score, batting_avg },
    update: { ...scores, composite_score, batting_avg },
  });

  // Update cached community aggregate on Song
  const agg = await prisma.userRating.aggregate({
    where: { songId },
    _avg: { batting_avg: true },
    _count: { id: true },
  });

  await prisma.song.update({
    where: { id: songId },
    data: {
      communityAvg:   agg._avg.batting_avg,
      communityCount: agg._count.id,
    },
  });

  return NextResponse.json({ rating, communityAvg: agg._avg.batting_avg, communityCount: agg._count.id });
}
