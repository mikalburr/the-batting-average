import { prisma } from "@/lib/prisma";
import { artistAvg } from "@/lib/scoring/creditAvg";
import { getTier } from "@/lib/scoring/tier";
import type { Tier } from "@prisma/client";

export async function getAlbumBySlug(slug: string) {
  const album = await prisma.album.findUnique({
    where: { slug },
    include: {
      artist: { select: { name: true, slug: true } },
      songs: {
        where: { batting_avg: { gt: 0 } },
        orderBy: { track_number: "asc" },
        select: {
          id: true, slug: true, title: true, year: true, track_number: true,
          batting_avg: true, tier: true,
          quality_score_calc: true, cultural_impact_calc: true, commercial_score_calc: true,
        },
      },
    },
  });
  if (!album) return null;

  const avg = artistAvg(album.songs.map((s) => ({ batting_avg: s.batting_avg })));
  const tier: Tier | null = avg != null ? getTier(avg) : null;

  const avgQuality = avg != null
    ? album.songs.reduce((s, x) => s + (x.quality_score_calc ?? 0), 0) / (album.songs.length || 1)
    : null;
  const avgCultural = avg != null
    ? album.songs.reduce((s, x) => s + (x.cultural_impact_calc ?? 0), 0) / (album.songs.length || 1)
    : null;
  const avgCommercial = avg != null
    ? album.songs.reduce((s, x) => s + (x.commercial_score_calc ?? 0), 0) / (album.songs.length || 1)
    : null;

  return { ...album, avg, tier, avgQuality, avgCultural, avgCommercial };
}
