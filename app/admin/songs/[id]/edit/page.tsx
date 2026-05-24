import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SongForm } from "@/components/admin/SongForm";
import { EnrichButton } from "@/components/admin/EnrichButton";

interface Props {
  params: { id: string };
}

export default async function EditSongPage({ params }: Props) {
  const [song, artists, albums, credits] = await Promise.all([
    prisma.song.findUnique({
      where: { id: params.id },
      include: { credits: { select: { creditId: true } } },
    }),
    prisma.artist.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.album.findMany({
      orderBy: { year: "desc" },
      select: { id: true, title: true, year: true, artist: { select: { name: true } } },
    }),
    prisma.credit.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
  ]);
  if (!song) notFound();

  const initialData = {
    ...song,
    albumId: song.albumId ?? "",
    creditIds: song.credits.map((c) => c.creditId),
    lifetime_streams: Number(song.lifetime_streams),
  } as any;

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wider text-text-primary mb-8">
        Edit: {song.title}
      </h1>

      {/* Enrich panel — auto-fills chart position, cert level, and credits */}
      <div className="bg-surface border border-border rounded-lg p-4 mb-6 max-w-xl">
        <p className="text-xs text-text-muted font-body mb-3">
          Auto-fill peak chart position, RIAA certification, and producer/engineer credits from
          Wikidata + MusicBrainz.
        </p>
        <EnrichButton target="song" id={song.id} label="Enrich from APIs (Wikidata + MusicBrainz)" />
      </div>

      <SongForm artists={artists} albums={albums} credits={credits} initialData={initialData} />
    </div>
  );
}
