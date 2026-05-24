import { notFound } from "next/navigation";
import Link from "next/link";
import { getAlbumBySlug } from "@/lib/db/albums";
import { AvgDisplay } from "@/components/ui/AvgDisplay";
import { TierBadge } from "@/components/ui/TierBadge";
import { TierBar } from "@/components/ui/TierBar";
import { SongRow } from "@/components/SongRow";
import { ScoreRadar } from "@/components/charts/ScoreRadar";
import { SiteHeader } from "@/components/SiteHeader";
import type { Tier } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export default async function AlbumPage({ params }: Props) {
  const album = await getAlbumBySlug(params.slug);
  if (!album) notFound();

  const tierCounts = album.songs.reduce(
    (acc, s) => {
      if (s.tier) acc[s.tier] = (acc[s.tier] ?? 0) + 1;
      return acc;
    },
    { CLASSIC: 0, GREAT: 0, GOOD: 0, MID: 0, SKIP: 0 } as Record<Tier, number>,
  );

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-xs text-text-muted mb-6">
          <Link href={`/artist/${album.artist.slug}`} className="hover:underline">
            {album.artist.name}
          </Link>
          {" / "}
          <span className="text-text-primary">{album.title}</span>
        </p>

        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex-1">
            <p className="font-body text-text-muted text-sm mb-1">{album.year}</p>
            <h1 className="font-display text-5xl md:text-6xl tracking-wider text-text-primary leading-tight">
              {album.title}
            </h1>
            <div className="mt-3 flex items-center gap-3">
              <TierBadge tier={album.tier} size="md" />
              <span className="text-xs text-text-muted">{album.songs.length} tracks</span>
            </div>
          </div>
          <AvgDisplay value={album.avg} tier={album.tier} size="xl" />
        </div>

        <TierBar counts={tierCounts} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pl-4 pr-2 w-8 text-xs text-text-muted font-body">#</th>
                    <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Title</th>
                    <th className="py-2 px-3 text-center text-xs text-text-muted font-body">Year</th>
                    <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Tier</th>
                    <th className="py-2 px-3 text-right text-xs text-text-muted font-body">AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {album.songs.map((song, i) => (
                    <SongRow key={song.slug} song={song} showAlbum={false} rank={song.track_number ?? i + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {album.avgQuality != null && album.avgCultural != null && album.avgCommercial != null && (
            <div>
              <h3 className="font-display text-lg tracking-wider text-text-primary mb-3">
                Score Profile
              </h3>
              <div className="bg-surface rounded-lg border border-border p-4">
                <ScoreRadar
                  quality={album.avgQuality}
                  cultural={album.avgCultural}
                  commercial={album.avgCommercial}
                />
                <div className="mt-4 space-y-2">
                  {[
                    { label: "Quality", value: album.avgQuality, color: "#FFD700" },
                    { label: "Cultural Impact", value: album.avgCultural, color: "#00E5B0" },
                    { label: "Commercial", value: album.avgCommercial, color: "#4CAF50" },
                  ].map((d) => (
                    <div key={d.label} className="flex justify-between items-center">
                      <span className="text-xs text-text-muted">{d.label}</span>
                      <span className="font-mono text-xs" style={{ color: d.color }}>
                        {d.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
