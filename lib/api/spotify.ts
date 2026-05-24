// Spotify Web API — Client Credentials flow (no user login needed)
// Requires: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET in env

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE  = "https://api.spotify.com/v1";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  const clientId     = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });
    if (!res.ok) return null;
    const data = await res.json() as { access_token: string; expires_in: number };
    cachedToken = {
      value:     data.access_token,
      expiresAt: Date.now() + (data.expires_in - 60) * 1000,
    };
    return cachedToken.value;
  } catch {
    return null;
  }
}

async function spotifyGet<T>(path: string): Promise<T | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

export interface SpotifyArtistMeta {
  id: string;
  name: string;
  popularity: number;           // 0–100
  followers: number;
  imageUrl: string | null;      // highest-res image
  genres: string[];
}

export async function getSpotifyArtist(name: string): Promise<SpotifyArtistMeta | null> {
  const data = await spotifyGet<{
    artists: {
      items: Array<{
        id: string;
        name: string;
        popularity: number;
        followers: { total: number };
        images: Array<{ url: string; width: number; height: number }>;
        genres: string[];
      }>;
    };
  }>(`/search?q=${encodeURIComponent(name)}&type=artist&limit=3`);

  const item = data?.artists?.items?.[0];
  if (!item) return null;

  const bestImage = item.images.sort((a, b) => b.width - a.width)[0];
  return {
    id:         item.id,
    name:       item.name,
    popularity: item.popularity,
    followers:  item.followers.total,
    imageUrl:   bestImage?.url ?? null,
    genres:     item.genres,
  };
}

export async function getSpotifyTrack(artistName: string, title: string): Promise<{
  id: string;
  popularity: number;
  albumImageUrl: string | null;
  previewUrl: string | null;
} | null> {
  const q = `track:${title} artist:${artistName}`;
  const data = await spotifyGet<{
    tracks: {
      items: Array<{
        id: string;
        popularity: number;
        preview_url: string | null;
        album: { images: Array<{ url: string; width: number }> };
      }>;
    };
  }>(`/search?q=${encodeURIComponent(q)}&type=track&limit=3`);

  const item = data?.tracks?.items?.[0];
  if (!item) return null;

  const bestImage = item.album.images.sort((a, b) => b.width - a.width)[0];
  return {
    id:           item.id,
    popularity:   item.popularity,
    albumImageUrl: bestImage?.url ?? null,
    previewUrl:   item.preview_url,
  };
}
