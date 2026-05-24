const BASE = "https://itunes.apple.com/search";

interface ItunesResult {
  artworkUrl100?: string;
  artworkUrl60?: string;
  collectionName?: string;
  artistName?: string;
  releaseDate?: string;
  trackName?: string;
}

function hires(url: string): string {
  return url.replace("100x100bb", "3000x3000bb").replace("60x60bb", "3000x3000bb");
}

export async function getAlbumArt(artist: string, album: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${artist} ${album}`);
    const res = await fetch(`${BASE}?term=${q}&media=music&entity=album&limit=5`);
    if (!res.ok) return null;
    const data = await res.json() as { results: ItunesResult[] };

    const match = data.results.find(
      (r) =>
        r.collectionName?.toLowerCase().includes(album.toLowerCase()) ||
        album.toLowerCase().includes((r.collectionName ?? "").toLowerCase())
    ) ?? data.results[0];

    return match?.artworkUrl100 ? hires(match.artworkUrl100) : null;
  } catch {
    return null;
  }
}

export async function getArtistImage(artist: string): Promise<string | null> {
  try {
    const q = encodeURIComponent(artist);
    const res = await fetch(`${BASE}?term=${q}&media=music&entity=musicArtist&limit=3`);
    if (!res.ok) return null;
    const data = await res.json() as { results: Array<{ artworkUrl100?: string }> };
    const img = data.results[0]?.artworkUrl100;
    return img ? hires(img) : null;
  } catch {
    return null;
  }
}

export async function getTrackMeta(artist: string, title: string): Promise<{
  releaseDate?: string;
  artworkUrl?: string;
} | null> {
  try {
    const q = encodeURIComponent(`${artist} ${title}`);
    const res = await fetch(`${BASE}?term=${q}&media=music&entity=song&limit=5`);
    if (!res.ok) return null;
    const data = await res.json() as { results: ItunesResult[] };

    const match = data.results.find(
      (r) =>
        r.trackName?.toLowerCase().includes(title.toLowerCase()) &&
        r.artistName?.toLowerCase().includes(artist.toLowerCase().split(" ")[0])
    ) ?? data.results[0];

    if (!match) return null;
    return {
      releaseDate: match.releaseDate,
      artworkUrl: match.artworkUrl100 ? hires(match.artworkUrl100) : undefined,
    };
  } catch {
    return null;
  }
}
