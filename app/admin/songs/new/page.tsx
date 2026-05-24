import { prisma } from "@/lib/prisma";
import { SongForm } from "@/components/admin/SongForm";

export default async function NewSongPage() {
  const [artists, albums, credits] = await Promise.all([
    prisma.artist.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.album.findMany({
      orderBy: { year: "desc" },
      select: { id: true, title: true, year: true, artist: { select: { name: true } } },
    }),
    prisma.credit.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, role: true } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl tracking-wider text-text-primary mb-8">Add Song</h1>
      <SongForm artists={artists} albums={albums} credits={credits} />
    </div>
  );
}
