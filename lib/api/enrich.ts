// Enrichment orchestrator
// Tier 1 (always): iTunes, MusicBrainz, Wikidata — no keys needed
// Tier 2 (when keys present): Spotify (images + popularity), Discogs (credits)

import { prisma } from "@/lib/prisma";
import { getAlbumArt, getArtistImage, getTrackMeta } from "./itunes";
import { getArtistMBID, getReleaseCredits as getMBCredits } from "./musicbrainz";
import { getSongData, getArtistData } from "./wikidata";
import { getSpotifyArtist, getSpotifyTrack } from "./spotify";
import { getDiscogsReleaseCredits } from "./discogs";
import type { CertLevel, CreditRole } from "@prisma/client";

const CERT_TO_DB: Record<string, CertLevel> = {
  DIAMOND:    "DIAMOND",
  FIVE_PLAT:  "FIVE_PLAT",
  FOUR_PLAT:  "FOUR_PLAT",
  THREE_PLAT: "THREE_PLAT",
  TWO_PLAT:   "TWO_PLAT",
  PLAT:       "PLAT",
  GOLD:       "GOLD",
};

export interface EnrichResult {
  updated: string[];
  skipped: string[];
}

async function upsertCredit(name: string, role: CreditRole, songId: string, existingCreditIds: string[]): Promise<boolean> {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const credit = await prisma.credit.upsert({
    where:  { slug },
    create: { name, slug, role },
    update: {},
  });
  if (existingCreditIds.includes(credit.id)) return false;
  await prisma.songCredit.create({ data: { songId, creditId: credit.id } }).catch(() => {});
  return true;
}

export async function enrichArtist(artistId: string): Promise<EnrichResult> {
  const artist = await prisma.artist.findUnique({ where: { id: artistId } });
  if (!artist) return { updated: [], skipped: ["artist not found"] };

  const updated: string[] = [];
  const skipped: string[] = [];
  const dbUpdate: Record<string, unknown> = {};

  // ── MusicBrainz MBID (Tier 1) ──────────────────────────────────────────
  if (!artist.mbid) {
    const mbid = await getArtistMBID(artist.name);
    if (mbid) { dbUpdate.mbid = mbid; updated.push("mbid"); }
    else skipped.push("mbid");
  } else {
    skipped.push("mbid (already set)");
  }

  // ── Image: Spotify first (Tier 2), fallback iTunes (Tier 1) ───────────
  if (!artist.image) {
    const hasSpotify = !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
    let image: string | null = null;

    if (hasSpotify) {
      const sp = await getSpotifyArtist(artist.name);
      if (sp?.imageUrl) { image = sp.imageUrl; updated.push("image (Spotify)"); }
      if (sp?.id && !artist.spotifyId) { dbUpdate.spotifyId = sp.id; updated.push("spotifyId"); }
    }

    if (!image) {
      image = await getArtistImage(artist.name);
      if (image) updated.push("image (iTunes)");
    }

    if (image) dbUpdate.image = image;
    else skipped.push("image");
  } else {
    skipped.push("image (already set)");
  }

  // ── Wikidata ────────────────────────────────────────────────────────────
  const wdArtist = await getArtistData(artist.name);
  if (wdArtist?.country) updated.push(`country: ${wdArtist.country}`);

  if (Object.keys(dbUpdate).length > 0) {
    await prisma.artist.update({ where: { id: artistId }, data: dbUpdate });
  }

  return { updated, skipped };
}

export async function enrichAlbum(albumId: string): Promise<EnrichResult> {
  const album = await prisma.album.findUnique({
    where:   { id: albumId },
    include: { artist: { select: { name: true } } },
  });
  if (!album) return { updated: [], skipped: ["album not found"] };

  const updated: string[] = [];
  const skipped: string[] = [];

  if (!album.image) {
    const image = await getAlbumArt(album.artist.name, album.title);
    if (image) {
      await prisma.album.update({ where: { id: albumId }, data: { image } });
      updated.push("image");
    } else {
      skipped.push("image");
    }
  } else {
    skipped.push("image (already set)");
  }

  return { updated, skipped };
}

export async function enrichSong(songId: string): Promise<EnrichResult> {
  const song = await prisma.song.findUnique({
    where:   { id: songId },
    include: {
      primaryArtist: { select: { name: true } },
      credits:       { select: { creditId: true } },
    },
  });
  if (!song) return { updated: [], skipped: ["song not found"] };

  const updated: string[] = [];
  const skipped: string[] = [];
  const artistName = song.primaryArtist.name;
  const existingCreditIds = song.credits.map((c) => c.creditId);
  const dbUpdates: Record<string, unknown> = {};

  // ── iTunes: release date (informational) ───────────────────────────────
  const itunesMeta = await getTrackMeta(artistName, song.title);
  if (itunesMeta?.releaseDate) updated.push(`releaseDate: ${itunesMeta.releaseDate.slice(0, 10)}`);

  // ── Spotify: track popularity → lifetime_streams proxy ─────────────────
  const hasSpotify = !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
  if (hasSpotify) {
    const spTrack = await getSpotifyTrack(artistName, song.title);
    if (spTrack?.popularity != null) {
      updated.push(`spotify popularity: ${spTrack.popularity}`);
      // Map 0–100 popularity to rough stream estimate if streams not set
      if (!song.lifetime_streams || song.lifetime_streams === BigInt(0)) {
        // popularity 100 ≈ 1B streams, exponential scale: streams ≈ 10^(pop/25)
        const estimated = Math.round(Math.pow(10, spTrack.popularity / 25) * 1_000);
        dbUpdates.lifetime_streams = BigInt(estimated);
        updated.push(`lifetime_streams (estimated): ${estimated.toLocaleString()}`);
      }
    }
  }

  // ── Wikidata: chart position + RIAA cert ───────────────────────────────
  const wdSong = await getSongData(artistName, song.title);

  if (wdSong?.peakChartPosition && !song.peak_chart_position) {
    dbUpdates.peak_chart_position = wdSong.peakChartPosition;
    dbUpdates.chart_name = "HOT_100";
    updated.push(`peak_chart_position: ${wdSong.peakChartPosition}`);
  } else {
    skipped.push("peak_chart_position");
  }

  if (wdSong?.certificationLevel && !song.certification_level) {
    const certDb = CERT_TO_DB[wdSong.certificationLevel];
    if (certDb) { dbUpdates.certification_level = certDb; updated.push(`cert: ${certDb}`); }
  } else {
    skipped.push("certification");
  }

  if (Object.keys(dbUpdates).length > 0) {
    await prisma.song.update({ where: { id: songId }, data: dbUpdates });
  }

  // ── Credits: Discogs first (Tier 2), fallback MusicBrainz (Tier 1) ─────
  const hasDiscogs = !!process.env.DISCOGS_USER_TOKEN;
  let creditsAdded = 0;

  if (hasDiscogs) {
    const dc = await getDiscogsReleaseCredits(artistName, song.title);
    if (dc) {
      const pairs: { name: string; role: CreditRole }[] = [
        ...dc.producers.map((n) => ({ name: n, role: "PRODUCER" as CreditRole })),
        ...dc.engineers.map((n) => ({ name: n, role: "ENGINEER" as CreditRole })),
        ...dc.mixEngineers.map((n) => ({ name: n, role: "ENGINEER" as CreditRole })),
      ];
      for (const { name, role } of pairs) {
        const added = await upsertCredit(name, role, songId, existingCreditIds);
        if (added) creditsAdded++;
      }
      if (creditsAdded > 0) updated.push(`${creditsAdded} credits (Discogs)`);
      else skipped.push("credits (Discogs: already set)");
    } else {
      // Fallback to MusicBrainz
      const mb = await getMBCredits(artistName, song.title);
      if (mb) {
        const pairs: { name: string; role: CreditRole }[] = [
          ...mb.producers.map((n) => ({ name: n, role: "PRODUCER" as CreditRole })),
          ...mb.engineers.map((n) => ({ name: n, role: "ENGINEER" as CreditRole })),
        ];
        for (const { name, role } of pairs) {
          const added = await upsertCredit(name, role, songId, existingCreditIds);
          if (added) creditsAdded++;
        }
        if (creditsAdded > 0) updated.push(`${creditsAdded} credits (MusicBrainz fallback)`);
        else skipped.push("credits (no match on Discogs or MusicBrainz)");
      } else {
        skipped.push("credits (no match)");
      }
    }
  } else {
    // No Discogs — use MusicBrainz only
    const mb = await getMBCredits(artistName, song.title);
    if (mb) {
      const pairs: { name: string; role: CreditRole }[] = [
        ...mb.producers.map((n) => ({ name: n, role: "PRODUCER" as CreditRole })),
        ...mb.engineers.map((n) => ({ name: n, role: "ENGINEER" as CreditRole })),
      ];
      for (const { name, role } of pairs) {
        const added = await upsertCredit(name, role, songId, existingCreditIds);
        if (added) creditsAdded++;
      }
      if (creditsAdded > 0) updated.push(`${creditsAdded} credits (MusicBrainz)`);
      else skipped.push("credits (MusicBrainz: no match)");
    } else {
      skipped.push("credits (no match)");
    }
  }

  return { updated, skipped };
}
