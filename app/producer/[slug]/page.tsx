import { notFound } from "next/navigation";
import Link from "next/link";
import { getCreditBySlug } from "@/lib/db/credits";
import { AvgDisplay } from "@/components/ui/AvgDisplay";
import { TierBadge } from "@/components/ui/TierBadge";
import { SiteHeader } from "@/components/SiteHeader";
import { fmtAvg } from "@/lib/scoring/format";
import { getTier } from "@/lib/scoring/tier";

export const revalidate = 3600;

interface Props {
  params: { slug: string };
}

export default async function ProducerPage({ params }: Props) {
  const credit = await getCreditBySlug(params.slug);
  if (!credit || (credit.role !== "PRODUCER" && credit.role !== "SONGWRITER")) notFound();

  return (
    <>
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-xs text-text-muted mb-6">
          Producers / <span className="text-text-primary">{credit.name}</span>
        </p>

        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex-1">
            <h1 className="font-display text-6xl tracking-wider text-text-primary leading-none">
              {credit.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <TierBadge tier={credit.tier} size="md" />
              <span className="text-xs text-text-muted">
                Producer · {credit.songs.length} songs
              </span>
            </div>
          </div>
          <AvgDisplay value={credit.avg} tier={credit.tier} size="xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Song list */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
              Production Credits
            </h2>
            <div className="bg-surface rounded-lg border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Song</th>
                    <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Artist</th>
                    <th className="py-2 px-3 text-right text-xs text-text-muted font-body">Prod Score</th>
                    <th className="py-2 px-3 text-right text-xs text-text-muted font-body">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {credit.songs.map((song) => {
                    const prodAvg = song.production_score / 100;
                    const prodTier = getTier(prodAvg);
                    return (
                      <tr key={song.slug} className="border-b border-border hover:bg-raised transition-colors">
                        <td className="py-3 px-3">
                          <Link href={`/song/${song.slug}`} className="font-body text-sm text-text-primary hover:text-tier-great transition-colors">
                            {song.title}
                          </Link>
                          <div className="text-xs text-text-muted">{song.year}</div>
                        </td>
                        <td className="py-3 px-3">
                          <Link href={`/artist/${song.primaryArtist.slug}`} className="text-xs text-text-muted hover:underline">
                            {song.primaryArtist.name}
                          </Link>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-mono text-sm" style={{ color: "#FFD700" }}>
                            {fmtAvg(prodAvg)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <AvgDisplay value={song.batting_avg} tier={song.tier} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Per-artist breakdown */}
          <div>
            <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
              By Artist
            </h2>
            <div className="space-y-2">
              {credit.artistBreakdown.map((a) => {
                const avgTier = a.avg != null ? getTier(a.avg) : null;
                return (
                  <Link
                    key={a.slug}
                    href={`/artist/${a.slug}`}
                    className="flex items-center justify-between bg-raised p-3 rounded-lg border border-border hover:border-tier-great/50 transition-colors"
                  >
                    <div>
                      <p className="font-body text-sm text-text-primary">{a.name}</p>
                      <p className="text-xs text-text-muted">{a.scores.length} songs</p>
                    </div>
                    <AvgDisplay value={a.avg} tier={avgTier} size="sm" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
