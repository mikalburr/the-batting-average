import type { CreditRole } from "@prisma/client";

// Subset of Song fields needed to compute role-specific batting averages.
// Each role draws from the sub-score most specific to their contribution —
// a producer's BA isn't diluted by lyricism they didn't write.
export interface RoleSourceSong {
  lyricism_score: number | null;
  production_score: number;
  engineering_score: number;
  performance_score: number;
  composite_score: number | null;
}

function songScoreForRole(song: RoleSourceSong, role: CreditRole): number | null {
  switch (role) {
    case "PRODUCER":
      return song.production_score;
    case "ENGINEER":
      return song.engineering_score;
    case "SONGWRITER":
      return song.lyricism_score;
    case "FEATURE":
      return song.lyricism_score == null
        ? song.performance_score
        : (song.lyricism_score + song.performance_score) / 2;
    case "VOCALIST":
      return song.performance_score;
  }
}

// Returns the role-specific batting avg (0–1) across the given songs,
// or null if the role has no scorable songs (e.g. pure-instrumental
// SONGWRITER credit, or empty roster). UI renders null as "—".
export function creditAvg(
  songs: ReadonlyArray<RoleSourceSong>,
  role: CreditRole,
): number | null {
  const scores: number[] = [];
  for (const song of songs) {
    const s = songScoreForRole(song, role);
    if (s != null) scores.push(s);
  }
  if (scores.length === 0) return null;
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  return mean / 100;
}

// Label batting avg uses the full composite across the label's full song roster.
export function labelAvg(songs: ReadonlyArray<{ composite_score: number | null }>): number | null {
  const scores = songs
    .map((s) => s.composite_score)
    .filter((s): s is number => s != null);
  if (scores.length === 0) return null;
  return scores.reduce((a, b) => a + b, 0) / scores.length / 100;
}

// Artist batting avg = mean of song batting avgs for songs they're the primary artist on.
export function artistAvg(songs: ReadonlyArray<{ batting_avg: number | null }>): number | null {
  const avgs = songs
    .map((s) => s.batting_avg)
    .filter((a): a is number => a != null);
  if (avgs.length === 0) return null;
  return avgs.reduce((a, b) => a + b, 0) / avgs.length;
}
