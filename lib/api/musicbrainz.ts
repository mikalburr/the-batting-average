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
