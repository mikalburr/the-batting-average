import { getTopArtists } from "@/lib/db/artists";
import { getTopCredits } from "@/lib/db/credits";
import { getRecentSongs } from "@/lib/db/songs";
import { ArtistCard } from "@/components/ArtistCard";
import { CreditCard } from "@/components/CreditCard";
import { SongRow } from "@/components/SongRow";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [topArtists, topProducers, topEngineers, recentSongs] = await Promise.all([
    getTopArtists(10),
    getTopCredits("PRODUCER", 5),
    getTopCredits("ENGINEER", 5),
    getRecentSongs(8),
  ]);

  return (
    <>
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-display text-7xl md:text-8xl tracking-wider text-text-primary">
            THE BATTING AVERAGE
          </h1>
          <p className="mt-3 font-body text-text-muted text-lg">Every song has a stat line.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Artists */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl tracking-wider text-text-primary mb-4">
              Top Artists
            </h2>
            <div className="space-y-2">
              {topArtists.map((artist, i) => (
                <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
              ))}
            </div>
          </div>

          {/* Sidebar: Producers + Engineers + Recent */}
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
                Top Producers
              </h2>
              <div className="space-y-2">
                {topProducers.map((c) => (
                  <CreditCard key={c.id} credit={c} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
                Top Engineers
              </h2>
              <div className="space-y-2">
                {topEngineers.map((c) => (
                  <CreditCard key={c.id} credit={c} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
                Recent Ratings
              </h2>
              <div className="bg-surface rounded-lg border border-border overflow-hidden">
                <table className="w-full">
                  <tbody>
                    {recentSongs.map((song) => (
                      <SongRow key={song.slug} song={song} showAlbum />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
