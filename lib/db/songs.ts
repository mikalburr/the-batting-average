import { prisma } from "@/lib/prisma";
import { creditAvg } from "@/lib/scoring/creditAvg";
import { getTier } from "@/lib/scoring/tier";
import { QUALITY_WEIGHTS, CULTURAL_WEIGHTS } from "@/lib/scoring/constants";
import type { Tier } from "@prisma/client";

export async function getRecentSongs(limit = 8) {
  return prisma.song.findMany({
    where: { batting_avg: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      slug: true, title: true, year: true, batting_avg: true, tier: true,
      album: { select: { title: true, slug: true } },
      primaryArtist: { select: { name: true, slug: true } },
    },
  });
}

export async function getSongBySlug(slug: string) {
  const song = await prisma.song.findUnique({
    where: { slug },
    include: {
      album: { select: { title: true, slug: true } },
      primaryArtist: { select: { id: true, name: true, slug: true, artistTier: true } },
      credits: {
        include: {
          credit: {
            include: {
              songs: {
                include: {
                  song: {
                    select: {
                      production_score: true, engineering_score: true,
                      lyricism_score: true, performance_score: true, composite_score: true,
                      batting_avg: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!song) return null;

  const creditsWithAvg = song.credits.map((sc) => {
    const songs = sc.credit.songs.map((s) => s.song);
    return {
      id: sc.credit.id, name: sc.credit.name, slug: sc.credit.slug, role: sc.credit.role,
      avg: creditAvg(songs, sc.credit.role),
      songCount: songs.length,
    };
  });

  const qualityDimensions = [
    { label: "Lyricism", score: song.lyricism_score ?? 0, weight: song.lyricism_score == null ? 0 : QUALITY_WEIGHTS.LYRICISM },
    { label: "Production", score: song.production_score, weight: QUALITY_WEIGHTS.PRODUCTION },
    { label: "Engineering & Mix", score: song.engineering_score, weight: QUALITY_WEIGHTS.ENGINEERING },
    { label: "Creativity & Originality", score: song.creativity_score, weight: QUALITY_WEIGHTS.CREATIVITY },
    { label: "Performance", score: song.performance_score, weight: QUALITY_WEIGHTS.PERFORMANCE },
  ].filter((d) => d.weight > 0);

  const culturalDimensions = [
    { label: "Longevity", score: song.longevity_score, weight: CULTURAL_WEIGHTS.LONGEVITY },
    { label: "Sample / Interpolation", score: song.sample_score, weight: CULTURAL_WEIGHTS.SAMPLE },
    { label: "Critical Consensus", score: song.critical_score, weight: CULTURAL_WEIGHTS.CRITICAL },
    { label: "Cultural Moment", score: song.cultural_moment_score, weight: CULTURAL_WEIGHTS.CULTURAL_MOMENT },
    { label: "Peer Recognition", score: song.peer_score, weight: CULTURAL_WEIGHTS.PEER },
  ];

  return { ...song, creditsWithAvg, qualityDimensions, culturalDimensions };
}

export async function getAllSongsByArtistSlug(artistSlug: string) {
  const artist = await prisma.artist.findUnique({ where: { slug: artistSlug }, select: { id: true } });
  if (!artist) return null;
  return prisma.song.findMany({
    where: { primaryArtistId: artist.id, batting_avg: { gt: 0 } },
    orderBy: { batting_avg: "desc" },
    include: { album: { select: { title: true, slug: true } } },
  });
}
