import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSongScores } from "@/lib/api/aiScore";

// Batch AI score all songs with zero/null quality scores
// Auto-accepts scores — use the individual endpoint for review workflow
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  // Find songs where quality scores are all zero (unscored)
  const songs = await prisma.song.findMany({
    where: {
      OR: [
        { quality_score_calc: null },
        { quality_score_calc: 0 },
      ],
    },
    include: {
      primaryArtist: { select: { name: true, artistTier: true } },
      album: { select: { title: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const results: { title: string; success: boolean; tier?: string }[] = [];
  let scored = 0;

  for (const song of songs) {
    const aiScores = await generateSongScores({
      artistName: song.primaryArtist.name,
      title:      song.title,
      year:       song.year,
      artistTier: song.primaryArtist.artistTier,
      album:      song.album?.title,
    });

    if (!aiScores) {
      results.push({ title: song.title, success: false });
      continue;
    }

    await prisma.song.update({
      where: { id: song.id },
      data: {
        lyricism_score:       aiScores.lyricism?.score ?? null,
        production_score:     aiScores.production.score,
        engineering_score:    aiScores.engineering.score,
        creativity_score:     aiScores.creativity.score,
        performance_score:    aiScores.performance.score,
        longevity_score:      aiScores.longevity.score,
        sample_score:         aiScores.sample.score,
        critical_score:       aiScores.critical.score,
        cultural_moment_score: aiScores.culturalMoment.score,
        peer_score:           aiScores.peer.score,
      },
    });

    const updated = await prisma.song.findUnique({ where: { id: song.id }, select: { tier: true } });
    results.push({ title: song.title, success: true, tier: updated?.tier ?? undefined });
    scored++;
  }

  return NextResponse.json({
    total: songs.length,
    scored,
    failed: songs.length - scored,
    results,
  });
}
