import { prisma } from "@/lib/prisma";
import { creditAvg, artistAvg, labelAvg } from "@/lib/scoring/creditAvg";
import { getTier } from "@/lib/scoring/tier";
import type { Tier } from "@prisma/client";

export async function getLabelBySlug(slug: string) {
  const label = await prisma.label.findUnique({
    where: { slug },
    include: {
      artists: {
        include: {
          songs: {
            select: {
              id: true, slug: true, title: true, year: true,
              batting_avg: true, tier: true, composite_score: true,
              production_score: true, engineering_score: true,
              lyricism_score: true, performance_score: true,
              credits: {
                include: {
                  credit: {
                    select: { id: true, name: true, slug: true, role: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!label) return null;

  const allSongs = label.artists.flatMap((a) => a.songs);
  const labelBattingAvg = labelAvg(allSongs);
  const labelTier: Tier | null = labelBattingAvg != null ? getTier(labelBattingAvg) : null;

  const artistsWithAvg = label.artists.map((a) => {
    const avg = artistAvg(a.songs);
    return {
      id: a.id, name: a.name, slug: a.slug, image: a.image,
      avg, tier: avg != null ? getTier(avg) : null,
      songCount: a.songs.length,
    };
  }).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

  const creditMap = new Map<string, { id: string; name: string; slug: string; role: string; songs: typeof allSongs[0][] }>();
  for (const song of allSongs) {
    for (const sc of song.credits) {
      const c = sc.credit;
      if (!creditMap.has(c.id)) creditMap.set(c.id, { ...c, songs: [] });
      creditMap.get(c.id)!.songs.push(song);
    }
  }
  const topCredits = Array.from(creditMap.values())
    .map((c) => {
      const avg = creditAvg(c.songs, c.role as import("@prisma/client").CreditRole);
      return { id: c.id, name: c.name, slug: c.slug, role: c.role, avg, songCount: c.songs.length };
    })
    .filter((c) => c.avg != null)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    .slice(0, 8);

  return { ...label, artistsWithAvg, labelBattingAvg, labelTier, topCredits };
}
