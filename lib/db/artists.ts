import { prisma } from "@/lib/prisma";
import { creditAvg, artistAvg } from "@/lib/scoring/creditAvg";
import { getTier } from "@/lib/scoring/tier";
import type { Tier } from "@prisma/client";

export async function getTopArtists(limit = 10) {
  const rows = await prisma.song.groupBy({
    by: ["primaryArtistId"],
    _avg: { batting_avg: true },
    _count: { id: true },
    orderBy: { _avg: { batting_avg: "desc" } },
    take: limit,
    where: { batting_avg: { not: null } },
  });

  const artistIds = rows.map((r) => r.primaryArtistId);
  const artists = await prisma.artist.findMany({
    where: { id: { in: artistIds } },
    select: { id: true, name: true, slug: true, image: true, artistTier: true },
  });
  const artistMap = Object.fromEntries(artists.map((a) => [a.id, a]));

  return rows.map((r) => {
    const artist = artistMap[r.primaryArtistId];
    const avg = r._avg.batting_avg;
    return {
      ...artist,
      avg,
      tier: avg != null ? getTier(avg) : null,
      songCount: r._count.id,
    };
  });
}

export async function getArtistBySlug(slug: string) {
  const artist = await prisma.artist.findUnique({
    where: { slug },
    include: {
      label: true,
      albums: {
        include: {
          songs: {
            orderBy: { batting_avg: "desc" },
            select: {
              id: true, slug: true, title: true, year: true,
              batting_avg: true, tier: true,
              quality_score_calc: true, cultural_impact_calc: true, commercial_score_calc: true,
            },
          },
        },
        orderBy: { year: "asc" },
      },
      songs: {
        where: { albumId: null },
        orderBy: { batting_avg: "desc" },
        select: {
          id: true, slug: true, title: true, year: true,
          batting_avg: true, tier: true,
        },
      },
    },
  });
  if (!artist) return null;

  const allSongs = [
    ...artist.albums.flatMap((a) => a.songs),
    ...artist.songs,
  ];
  const avg = artistAvg(allSongs.map((s) => ({ batting_avg: s.batting_avg })));
  const tier: Tier | null = avg != null ? getTier(avg) : null;

  const tierCounts = {
    CLASSIC: 0, GREAT: 0, GOOD: 0, MID: 0, SKIP: 0,
  } as Record<Tier, number>;
  for (const s of allSongs) {
    if (s.tier) tierCounts[s.tier]++;
  }

  const albumTimeline = artist.albums.map((a) => {
    const albumAvg = a.songs.length
      ? a.songs.reduce((sum, s) => sum + (s.batting_avg ?? 0), 0) / a.songs.length
      : null;
    return { year: a.year, title: a.title, avg: albumAvg };
  }).filter((p): p is typeof p & { avg: number } => p.avg != null);

  return { ...artist, avg, tier, tierCounts, albumTimeline, allSongs };
}

export async function getArtistTopCredits(artistId: string) {
  const credits = await prisma.credit.findMany({
    where: { songs: { some: { song: { primaryArtistId: artistId } } } },
    include: {
      songs: {
        where: { song: { primaryArtistId: artistId } },
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
  });

  return credits.map((c) => {
    const songs = c.songs.map((sc) => sc.song);
    return {
      id: c.id, name: c.name, slug: c.slug, role: c.role,
      avg: creditAvg(songs, c.role),
      songCount: songs.length,
    };
  }).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));
}
