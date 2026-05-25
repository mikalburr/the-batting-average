import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReleasesWithTracks, groupReleasesByAlbum, searchArtist } from "@/lib/api/musicbrainz";

// Allow up to 60s for prolific artists with many albums
export const maxDuration = 60;

function makeSlug(s: string) {
  return s
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { artistId } = body as { artistId?: string };
  if (!artistId) return NextResponse.json({ error: "artistId required" }, { status: 400 });

  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) return NextResponse.json({ error: "Artist not found" }, { status: 404 });

  try {
    // ── Step 1: resolve MusicBrainz ID ────────────────────────────────────
    let mbid = artist.mbid ?? null;
    if (!mbid) {
      const mbArtist = await searchArtist(artist.name);
      if (!mbArtist) {
        return NextResponse.json(
          { error: `"${artist.name}" not found in MusicBrainz` },
          { status: 404 },
        );
      }
      mbid = mbArtist.id;
      await prisma.artist.update({ where: { id: artistId }, data: { mbid } });
    }

    // ── Step 2: fetch full discography with tracks ─────────────────────────
    const rawReleases = await getReleasesWithTracks(mbid);
    const albums = groupReleasesByAlbum(rawReleases);

    // ── Step 3: upsert albums + song shells ───────────────────────────────
    let albumsCreated = 0;
    let albumsSkipped = 0;
    let songsCreated = 0;
    let songsSkipped = 0;

    for (const album of albums) {
      const albumSlug = makeSlug(album.title);

      // Check if album already exists (might be from a different artist — reuse if same artist)
      const existingAlbum = await prisma.album.findUnique({ where: { slug: albumSlug } });

      let albumId: string;
      if (existingAlbum) {
        albumId = existingAlbum.id;
        albumsSkipped++;
      } else {
        const created = await prisma.album.create({
          data: {
            title: album.title,
            slug: albumSlug,
            year: album.year,
            artistId: artistId,
          },
        });
        albumId = created.id;
        albumsCreated++;
      }

      // Upsert song shells
      for (const track of album.tracks) {
        if (!track.title?.trim()) continue;

        // Dedup check: same artist + same title (case-insensitive)
        const existingSong = await prisma.song.findFirst({
          where: {
            primaryArtistId: artistId,
            title: { equals: track.title.trim(), mode: "insensitive" },
          },
          select: { id: true },
        });

        if (existingSong) {
          songsSkipped++;
          continue;
        }

        // Build a unique slug
        let songSlug = makeSlug(`${artist.name}-${track.title}`);
        const slugConflict = await prisma.song.findUnique({ where: { slug: songSlug } });
        if (slugConflict) {
          // Append album year to disambiguate
          songSlug = `${songSlug}-${album.year}`;
          const stillConflicts = await prisma.song.findUnique({ where: { slug: songSlug } });
          if (stillConflicts) songSlug = `${songSlug}-${Math.random().toString(36).slice(2, 5)}`;
        }

        await prisma.song.create({
          data: {
            title: track.title.trim(),
            slug: songSlug,
            year: album.year,
            albumId,
            primaryArtistId: artistId,
            track_number: track.trackNumber,
            // All editorial scores left at default (0) — public pages filter
            // quality_score_calc > 0, so these won't appear until manually scored.
          },
        });
        songsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      artist: artist.name,
      mbid,
      albumsFound: albums.length,
      albumsCreated,
      albumsSkipped,
      songsCreated,
      songsSkipped,
    });
  } catch (err) {
    console.error("[import/discography]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
