import { prisma } from "@/lib/prisma";
import { creditAvg, labelAvg } from "@/lib/scoring/creditAvg";
import { getTier } from "@/lib/scoring/tier";
import type { CreditRole, Tier } from "@prisma/client";

const ROLE_PATH: Record<CreditRole, string> = {
  PRODUCER: "producer",
  ENGINEER: "engineer",
  SONGWRITER: "producer",
  FEATURE: "producer",
  VOCALIST: "producer",
};

export async function getTopCredits(role: CreditRole, limit = 5) {
  const credits = await prisma.credit.findMany({
    where: { role },
    include: {
      songs: {
        where: { song: { batting_avg: { gt: 0 } } },
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

  const withAvg = credits.map((c) => {
    const songs = c.songs.map((sc) => sc.song);
    const avg = creditAvg(songs, role);
    const tier: Tier | null = avg != null ? getTier(avg) : null;
    return { id: c.id, name: c.name, slug: c.slug, role: c.role, avg, tier, songCount: songs.length };
  })
    .filter((c) => c.avg != null && c.songCount >= 1)
    .sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))
    .slice(0, limit);

  return withAvg;
}

export async function getCreditBySlug(slug: string) {
  const credit = await prisma.credit.findUnique({
    where: { slug },
    include: {
      songs: {
        where: { song: { batting_avg: { gt: 0 } } },
        include: {
          song: {
            include: {
              primaryArtist: { select: { name: true, slug: true } },
              album: { select: { title: true, slug: true } },
            },
          },
        },
        orderBy: { song: { batting_avg: "desc" } },
      },
    },
  });
  if (!credit) return null;

  const songs = credit.songs.map((sc) => sc.song);
  const avg = creditAvg(songs, credit.role);
  const tier: Tier | null = avg != null ? getTier(avg) : null;

  const byArtist = songs.reduce<Record<string, { name: string; slug: string; scores: number[] }>>(
    (acc, s) => {
      const a = s.primaryArtist;
      if (!acc[a.slug]) acc[a.slug] = { name: a.name, slug: a.slug, scores: [] };
      const roleScore = getRoleScore(s, credit.role);
      if (roleScore != null) acc[a.slug].scores.push(roleScore);
      return acc;
    },
    {},
  );

  const artistBreakdown = Object.values(byArtist).map((a) => ({
    ...a,
    avg: a.scores.length ? a.scores.reduce((x, y) => x + y, 0) / a.scores.length / 100 : null,
  })).sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0));

  return { ...credit, songs, avg, tier, artistBreakdown, path: ROLE_PATH[credit.role] };
}

function getRoleScore(
  song: {
    production_score: number; engineering_score: number;
    lyricism_score: number | null; performance_score: number; composite_score: number | null;
  },
  role: CreditRole,
): number | null {
  switch (role) {
    case "PRODUCER": return song.production_score;
    case "ENGINEER": return song.engineering_score;
    case "SONGWRITER": return song.lyricism_score;
    case "FEATURE": return song.lyricism_score == null
      ? song.performance_score
      : (song.lyricism_score + song.performance_score) / 2;
    case "VOCALIST": return song.performance_score;
  }
}
