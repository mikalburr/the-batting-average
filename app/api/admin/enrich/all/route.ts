import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichArtist, enrichAlbum } from "@/lib/api/enrich";

// Enriches all artists (image + mbid) and all albums (artwork)
// Runs sequentially to respect MusicBrainz 1 req/s rate limit
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const artists = await prisma.artist.findMany({ select: { id: true, name: true } });
  const albums = await prisma.album.findMany({ select: { id: true } });

  const artistResults: Record<string, string[]> = {};
  for (const artist of artists) {
    const result = await enrichArtist(artist.id);
    artistResults[artist.name] = result.updated;
  }

  const albumsEnriched: number[] = [];
  for (const album of albums) {
    const result = await enrichAlbum(album.id);
    if (result.updated.length > 0) albumsEnriched.push(1);
  }

  return NextResponse.json({
    artistsProcessed: artists.length,
    albumsProcessed: albums.length,
    albumsUpdated: albumsEnriched.length,
    artistResults,
  });
}
