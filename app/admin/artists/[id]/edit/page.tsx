export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ArtistEditForm } from "./form";

interface Props {
  params: { id: string };
}

export default async function EditArtistPage({ params }: Props) {
  const artist = await prisma.artist.findUnique({ where: { id: params.id } });
  if (!artist) notFound();

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-3xl tracking-wider text-text-primary mb-8">
        Edit: {artist.name}
      </h1>
      <ArtistEditForm artist={artist} />
    </div>
  );
}
