export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AlbumEditForm } from "./form";

interface Props {
  params: { id: string };
}

export default async function EditAlbumPage({ params }: Props) {
  const [album, artists] = await Promise.all([
    prisma.album.findUnique({
      where: { id: params.id },
      include: { artist: { select: { name: true } } },
    }),
    prisma.artist.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!album) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl tracking-wider text-text-primary mb-8">
        Edit: {album.title}
      </h1>
      <AlbumEditForm album={album} artists={artists} />
    </div>
  );
}
