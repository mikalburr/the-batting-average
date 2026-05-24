export const dynamic = "force-dynamic";
import { prisma } from "@/lib/prisma";
import NewAlbumForm from "./form";

export default async function NewAlbumPage() {
  const artists = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl tracking-wider text-text-primary mb-8">Add Album</h1>
      <NewAlbumForm artists={artists} />
    </div>
  );
}
