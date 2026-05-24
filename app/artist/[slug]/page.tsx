import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getArtistBySlug, getArtistTopCredits } from "@/lib/db/artists";
import { AvgDisplay } from "@/components/ui/AvgDisplay";
import { TierBadge } from "@/components/ui/TierBadge";
import { TierBar } from "@/components/ui/TierBar";
import { SongRow } from "@/components/SongRow";
import { CreditCard } from "@/components/CreditCard";
import { AlbumTimeline } from "@/components/charts/AlbumTimeline";
import { SiteHeader } from "@/components/SiteHeader";
import { fmtAvg } from "@/lib/scoring/format";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const artist = await getArtistBySlug(params.slug);
  if (!artist) return { title: "Artist Not Found" };
  const avg = artist.avg != null ? fmtAvg(artist.avg) : null;
  return {
    title: `${artist.name} | The Batting Average`,
    description: `${artist.name} batting average: ${avg ?? "—"}${artist.tier ? ` (${artist.tier})` : ""}. ${artist.allSongs.length} songs rated on The Batting Average.`,
  };
}

export default async function ArtistPage({ params }: Props) {
  const [artist, credits] = await Promise.all([
    getArtistBySlug(params.slug),
    getArtistBySlug(params.slug).then((a) => a ? getArtistTopCredits(a.id) : []),
  ]);
  if (!artist) notFound();

  const allSongs = artist.allSongs.sort((a, b) => (b.batting_avg ?? 0) - (a.batting_avg ?? 0));

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <p className="text-xs text-text-muted font-body mb-6">
          {artist.label && (
            <>
              <Link href={`/label/${artist.label.slug}`} className="hover:underline">
                {artist.label.name}
              </Link>
              {" / "}
            </>
          )}
          <span className="text-text-primary">{artist.name}</span>
        </p>

        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex-1">
            <h1 className="font-display text-6xl md:text-7xl tracking-wider text-text-primary leading-none">
              {artist.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <TierBadge tier={artist.tier} size="md" />
              <span className="text-xs text-text-muted font-body capitalize">
                {artist.artistTier.toLowerCase()} · {artist.era ?? ""}
              </span>
            </div>
          </div>
          <AvgDisplay value={artist.avg} tier={artist.tier} size="xl" />
        </div>

        {/* Tier bar */}
        <div className="mb-8">
          <TierBar counts={artist.tierCounts} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discography */}
          <div className="lg:col-span-2 space-y-8">
            {/* Albums with song lists */}
            {artist.albums.map((album) => (
              <div key={album.id}>
                <div className="flex items-center justify-between mb-3">
                  <Link href={`/album/${album.slug}`}>
                    <h2 className="font-display text-xl tracking-wider text-text-primary hover:text-tier-great transition-colors">
                      {album.title}
                    </h2>
                  </Link>
                  <span className="font-mono text-sm text-text-muted">{album.year}</span>
                </div>
                <div className="bg-surface rounded-lg border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Song</th>
                        <th className="py-2 px-3 text-center text-xs text-text-muted font-body">Year</th>
                        <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Tier</th>
                        <th className="py-2 px-3 text-right text-xs text-text-muted font-body">AVG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {album.songs.map((song) => (
                        <SongRow key={song.slug} song={song} showAlbum={false} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Album timeline */}
            {artist.albumTimeline.length >= 2 && (
              <div>
                <h3 className="font-display text-lg tracking-wider text-text-primary mb-3">
                  Album Averages
                </h3>
                <div className="bg-surface rounded-lg border border-border p-4">
                  <AlbumTimeline data={artist.albumTimeline} />
                </div>
              </div>
            )}

            {/* Top credits */}
            {credits.length > 0 && (
              <div>
                <h3 className="font-display text-lg tracking-wider text-text-primary mb-3">
                  Credits
                </h3>
                <div className="space-y-2">
                  {credits.slice(0, 6).map((c) => (
                    <CreditCard key={c.id} credit={c} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
