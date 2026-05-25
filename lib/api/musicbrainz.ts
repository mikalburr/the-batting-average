// MusicBrainz API — free, no key needed, 1 req/s rate limit
// Docs: https://musicbrainz.org/doc/MusicBrainz_API

const BASE = "https://musicbrainz.org/ws/2";
const UA = "TheBattingAverage/1.0 (thebattingaverage.app)";

let lastRequest = 0;
async function mb<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  // Enforce 1100ms between requests per MusicBrainz ToS
  const wait = 1100 - (Date.now() - lastRequest);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();

  const qs = new URLSearchParams({ ...params, fmt: "json" }).toString();
  try {
    const res = await fetch(`${BASE}${path}?${qs}`, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

export interface MBArtist {
  id: string;
  name: string;
  "sort-name": string;
  country?: string;
  disambiguation?: string;
}

export async function searchArtist(name: string): Promise<MBArtist | null> {
  const data = await mb<{ artists: MBArtist[] }>("/artist", {
    query: `artist:"${name}"`,
    limit: "3",
  });
  return data?.artists?.[0] ?? null;
}

export interface MBRelease {
  id: string;
  title: string;
  date?: string;
  relations?: MBRelation[];
}

export interface MBRelation {
  type: string;
  direction: string;
  artist?: MBArtist;
  attributes: string[];
}

export async function getReleaseCredits(artistName: string, title: string): Promise<{
  producers: string[];
  engineers: string[];
  mixEngineers: string[];
} | null> {
  // Search for a recording matching artist + title
  const query = `recording:"${title}" AND artist:"${artistName}"`;
  const data = await mb<{
    recordings: Array<{
      id: string;
      title: string;
      releases: Array<{ id: string }>;
    }>;
  }>("/recording", { query, limit: "3", inc: "artist-credits" });

  const recording = data?.recordings?.[0];
  if (!recording) return null;

  // Fetch the first release with relationships
  const releaseId = recording.releases?.[0]?.id;
  if (!releaseId) return null;

  const release = await mb<{ relations?: MBRelation[] }>(`/release/${releaseId}`, {
    inc: "artist-rels",
  });
  if (!release?.relations) return null;

  const producers: string[] = [];
  const engineers: string[] = [];
  const mixEngineers: string[] = [];

  for (const rel of release.relations) {
    if (!rel.artist) continue;
    const name = rel.artist.name;
    const type = rel.type.toLowerCase();
    if (type === "producer") producers.push(name);
    else if (type === "engineer" || type === "recording") engineers.push(name);
    else if (type === "mix" || type === "mix-engineer") mixEngineers.push(name);
  }

  return { producers, engineers, mixEngineers };
}

export async function getArtistMBID(name: string): Promise<string | null> {
  const artist = await searchArtist(name);
  return artist?.id ?? null;
}

// ─── Discography import ────────────────────────────────────────────────────

export interface MBTrack {
  id: string;
  number: string;
  title: string;
  recording: { id: string; title: string; length?: number };
}

export interface MBMedium {
  position?: number;
  format?: string;
  "track-count"?: number;
  tracks?: MBTrack[];
}

export interface MBReleaseWithTracks {
  id: string;
  title: string;
  date?: string;
  country?: string;
  "release-group"?: {
    id: string;
    title: string;
    "first-release-date"?: string;
    "primary-type"?: string;
    "secondary-types"?: string[];
  };
  media: MBMedium[];
}

/**
 * Get all official album releases for an artist MBID, with track listings.
 * Uses inc=recordings+release-groups so each release has its tracklist AND
 * its release-group metadata — meaning we can deduplicate by album in one call
 * instead of N calls per album.
 */
export async function getReleasesWithTracks(artistMbid: string): Promise<MBReleaseWithTracks[]> {
  const all: MBReleaseWithTracks[] = [];
  let offset = 0;

  while (true) {
    const data = await mb<{ releases?: MBReleaseWithTracks[]; "release-count"?: number }>(
      "/release",
      {
        artist: artistMbid,
        type: "album",
        status: "official",
        inc: "recordings+release-groups",
        limit: "100",
        offset: String(offset),
      },
    );
    const page = data?.releases ?? [];
    all.push(...page);
    offset += page.length;
    if (offset >= (data?.["release-count"] ?? 0) || page.length === 0) break;
  }

  // Strip compilations, soundtracks, remixes, live albums
  return all.filter((r) => {
    const sec = r["release-group"]?.["secondary-types"] ?? [];
    return !sec.some((t) =>
      ["Compilation", "Soundtrack", "Remix", "DJ-mix", "Mixtape/Street", "Live"].includes(t),
    );
  });
}

export interface AlbumWithTracks {
  releaseGroupId: string;
  title: string;
  year: number;
  tracks: Array<{ recordingId: string; title: string; trackNumber: number | null }>;
}

/**
 * Collapse raw MB releases into one AlbumWithTracks per release-group.
 * Deduplicates tracks by recording ID (handles standard + deluxe editions).
 */
export function groupReleasesByAlbum(releases: MBReleaseWithTracks[]): AlbumWithTracks[] {
  const byGroup = new Map<string, MBReleaseWithTracks[]>();
  for (const r of releases) {
    const rgId = r["release-group"]?.id;
    if (!rgId) continue;
    if (!byGroup.has(rgId)) byGroup.set(rgId, []);
    byGroup.get(rgId)!.push(r);
  }

  const albums: AlbumWithTracks[] = [];

  for (const [, group] of byGroup) {
    const rg = group[0]["release-group"]!;
    const rawDate = rg["first-release-date"] ?? group[0].date ?? "";
    const year = parseInt(rawDate.slice(0, 4));
    if (!year || isNaN(year)) continue;

    // Collect all unique recordings — largest release first (gets bonus tracks too)
    const sortedGroup = [...group].sort((a, b) => {
      const n = (r: MBReleaseWithTracks) =>
        r.media.reduce((s, m) => s + (m["track-count"] ?? m.tracks?.length ?? 0), 0);
      return n(b) - n(a);
    });

    const seen = new Set<string>();
    const tracks: AlbumWithTracks["tracks"] = [];

    for (const release of sortedGroup) {
      for (const medium of release.media) {
        for (const track of medium.tracks ?? []) {
          const recId = track.recording?.id;
          if (!recId || seen.has(recId)) continue;
          seen.add(recId);
          tracks.push({
            recordingId: recId,
            title: track.recording.title ?? track.title,
            trackNumber: parseInt(track.number) || null,
          });
        }
      }
    }

    if (tracks.length === 0) continue;
    albums.push({ releaseGroupId: rg.id, title: rg.title, year, tracks });
  }

  return albums.sort((a, b) => a.year - b.year);
}
