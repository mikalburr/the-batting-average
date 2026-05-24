import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calcComposite } from "@/lib/scoring/composite";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const songs = await prisma.song.findMany({
    include: { primaryArtist: { select: { artistTier: true } } },
  });

  let updated = 0;
  for (const song of songs) {
    const score = calcComposite(
      {
        lyricism_score: song.lyricism_score,
        production_score: song.production_score,
        engineering_score: song.engineering_score,
        creativity_score: song.creativity_score,
        performance_score: song.performance_score,
        longevity_score: song.longevity_score,
        sample_score: song.sample_score,
        critical_score: song.critical_score,
        cultural_moment_score: song.cultural_moment_score,
        peer_score: song.peer_score,
        year: song.year,
        lifetime_streams: song.lifetime_streams,
        peak_chart_position: song.peak_chart_position,
        chart_name: song.chart_name,
        certification_level: song.certification_level,
        physical_sales: song.physical_sales,
        digital_sales: song.digital_sales,
        tiktok_video_count: song.tiktok_video_count,
        platform_trend_peaks: song.platform_trend_peaks,
        ugc_volume: song.ugc_volume,
        stream_spike_post_viral: song.stream_spike_post_viral,
        search_volume_surge: song.search_volume_surge,
        sync_placement_count: song.sync_placement_count,
        virality_durability: song.virality_durability,
      },
      song.primaryArtist.artistTier,
    );

    await prisma.song.update({
      where: { id: song.id },
      data: {
        quality_score_calc: score.quality,
        cultural_impact_calc: score.culturalImpact,
        commercial_score_calc: score.commercial,
        composite_score: score.composite,
        batting_avg: score.battingAvg,
        tier: score.tier,
      },
    });
    updated++;
  }

  return NextResponse.json({ updated, message: `Recalculated ${updated} songs.` });
}
