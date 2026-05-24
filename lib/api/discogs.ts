// Discogs API — User Token auth, 25 req/min rate limit
// Requires: DISCOGS_USER_TOKEN in env
// Best source for producer/engineer credits (more complete than MusicBrainz)

const BASE = "https://api.discogs.com";
const UA   = "TheBattingAverage/1.0 +thebattingaverage.app";

let lastRequest = 0;
async function discogsGet<T>(path: string, params: Record<string, string> = {}): Promise<T | null> {
  const token = process.env.DISCOGS_USER_TOKEN;
  if (!token) return null;

  // 25 req/min = ~2400ms between requests (conservative)
  const wait = 2500 - (Date.now() - lastRequest);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequest = Date.now();

  const qs = new URLSearchParams(params).toString();
  const url = `${BASE}${path}${qs ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":    UA,
        Authorization:   `Discogs token=${token}`,
      },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

interface DiscogsSearchResult {
  results: Array<{
    id: number;
    title: string;
    type: string;
    resource_url: string;
    thumb: string;
    cover_image?: string;
    year?: string;
    format?: string[];
    label?: string[];
    genre?: string[];
    style?: string[];
    master_id?: number;
    master_url?: string;
  }>;
}

interface DiscogsRelease {
  id: number;
  title: string;
  year?: number;
  images?: Array<{ uri: string; type: string; width: number; height: number }>;
  extraartists?: Array<{
    name: string;
    role: string;
    anv?: string;
  }>;
  tracklist?: Array<{
    title: string;
    position: string;
    extraartists?: Array<{ name: string; role: string }>;
  }>;
  labels?: Array<{ name: string; catno: string }>;
}

export interface DiscogsCredits {
  producers: string[];
  engineers: string[];
  mixEngineers: string[];
  masteredBy: string[];
}

function normalizeRole(role: string): keyof DiscogsCredits | null {
  const r = role.toLowerCase();
  if (r.includes("produced") || r.includes("producer")) return "producers";
  if (r.includes("mix") && !r.includes("remaster")) return "mixEngineers";
  if (r.includes("master")) return "masteredBy";
  if (r.includes("engineer") || r.includes("recorded") || r.includes("recording")) return "engineers";
  return null;
}

export async function getDiscogsReleaseCredits(
  artistName: string,
  title: string
): Promise<DiscogsCredits | null> {
  // Search for the release
  const search = await discogsGet<DiscogsSearchResult>("/database/search", {
    q:    `${title} ${artistName}`,
    type: "release",
    per_page: "5",
  });

  const release = search?.results?.[0];
  if (!release) return null;

  // Fetch full release details
  const details = await discogsGet<DiscogsRelease>(`/releases/${release.id}`);
  if (!details) return null;

  const credits: DiscogsCredits = {
    producers:    [],
    engineers:    [],
    mixEngineers: [],
    masteredBy:   [],
  };

  // Album-level credits
  for (const ea of details.extraartists ?? []) {
    const key = normalizeRole(ea.role);
    if (key && !credits[key].includes(ea.name)) {
      credits[key].push(ea.name);
    }
  }

  // Track-level credits (find matching track by title)
  const matchTrack = details.tracklist?.find((t) =>
    t.title.toLowerCase().includes(title.toLowerCase())
  );
  for (const ea of matchTrack?.extraartists ?? []) {
    const key = normalizeRole(ea.role);
    if (key && !credits[key].includes(ea.name)) {
      credits[key].push(ea.name);
    }
  }

  const hasAny =
    credits.producers.length > 0 ||
    credits.engineers.length > 0 ||
    credits.mixEngineers.length > 0;

  return hasAny ? credits : null;
}

export async function searchDiscogsArtist(name: string): Promise<{
  id: number;
  name: string;
  imageUrl: string | null;
} | null> {
  const data = await discogsGet<{
    results: Array<{ id: number; title: string; thumb: string; cover_image?: string }>;
  }>("/database/search", { q: name, type: "artist", per_page: "3" });

  const item = data?.results?.[0];
  if (!item) return null;

  return {
    id:       item.id,
    name:     item.title,
    imageUrl: item.cover_image ?? item.thumb ?? null,
  };
}
