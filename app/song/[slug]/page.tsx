import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getSongBySlug } from "@/lib/db/songs";
import { AvgDisplay } from "@/components/ui/AvgDisplay";
import { TierBadge } from "@/components/ui/TierBadge";
import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { CreditCard } from "@/components/CreditCard";
import { ScoreRadar } from "@/components/charts/ScoreRadar";
import { SiteHeader } from "@/components/SiteHeader";
import { CommunityRating } from "@/components/CommunityRating";
import { TIER_COLORS } from "@/lib/scoring/constants";
import { fmtAvg } from "@/lib/scoring/format";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const song = await getSongBySlug(params.slug);
  if (!song) return { title: "Song Not Found" };
  const avg = song.batting_avg != null ? fmtAvg(song.batting_avg) : null;
  return {
    title: `${song.title} — ${song.primaryArtist.name} | The Batting Average`,
    description: `${song.title} by ${song.primaryArtist.name} (${song.year}) scores ${avg ?? "—"} on The Batting Average${song.tier ? ` — ${song.tier}` : ""}.`,
  };
}

export default async function SongPage({ params }: Props) {
  const song = await getSongBySlug(params.slug);
  if (!song) notFound();

  const tierColor = song.tier ? TIER_COLORS[song.tier] : "#555";

  return (
    <>
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <p className="text-xs text-text-muted mb-6">
          <Link href={`/artist/${song.primaryArtist.slug}`} className="hover:underline">
            {song.primaryArtist.name}
          </Link>
          {song.album && (
            <>
              {" / "}
              <Link href={`/album/${song.album.slug}`} className="hover:underline">
                {song.album.title}
              </Link>
            </>
          )}
          {" / "}
          <span className="text-text-primary">{song.title}</span>
        </p>

        {/* Hero */}
        <div
          className="rounded-xl p-8 mb-8 border"
          style={{ borderColor: `${tierColor}33`, backgroundColor: `${tierColor}08` }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <TierBadge tier={song.tier} size="md" />
              <h1
                className="font-display text-5xl md:text-6xl tracking-wider mt-2 leading-none"
                style={{ color: tierColor }}
              >
                {song.title.toUpperCase()}
              </h1>
              <p className="font-body text-text-muted mt-2">
                {song.primaryArtist.name} · {song.year}
              </p>
            </div>
            <div className="text-center md:text-right">
              <AvgDisplay value={song.batting_avg} tier={song.tier} size="xl" />
              <p className="text-xs text-text-muted font-body mt-1">batting avg</p>
            </div>
          </div>
        </div>

        {/* Editorial vs Community */}
        <div className="mb-8">
          <CommunityRating
            editorialAvg={song.batting_avg}
            editorialTier={song.tier}
            communityAvg={song.communityAvg ?? null}
            communityCount={song.communityCount ?? 0}
          />
        </div>

        {/* Score breakdown + radar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2 space-y-4">
            <ScoreBreakdown
              title="Quality"
              dimensions={song.qualityDimensions}
              pillarScore={song.quality_score_calc ?? undefined}
              accentColor="#FFD700"
            />
            <ScoreBreakdown
              title="Cultural Impact"
              dimensions={song.culturalDimensions}
              pillarScore={song.cultural_impact_calc ?? undefined}
              accentColor="#00E5B0"
            />
            <div className="bg-surface rounded-lg p-5 border border-border">
              <div className="flex items-baseline justify-between mb-2">
                <h3 className="font-display text-lg tracking-wider text-text-primary">Commercial</h3>
                <span className="font-mono text-sm text-tier-good">
                  {song.commercial_score_calc?.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-text-muted font-body">
                Scored relative to artist tier ({song.primaryArtist.artistTier.toLowerCase()})
                using EPB normalization.
              </p>
            </div>
          </div>

          {song.quality_score_calc != null && song.cultural_impact_calc != null && song.commercial_score_calc != null && (
            <div className="bg-surface rounded-lg border border-border p-4 flex flex-col">
              <h3 className="font-display text-lg tracking-wider text-text-primary mb-2">
                Composite
              </h3>
              <div className="flex-1 flex items-center">
                <ScoreRadar
                  quality={song.quality_score_calc}
                  cultural={song.cultural_impact_calc}
                  commercial={song.commercial_score_calc}
                />
              </div>
            </div>
          )}
        </div>

        {/* Credits */}
        {song.creditsWithAvg.length > 0 && (
          <div>
            <h2 className="font-display text-2xl tracking-wider text-text-primary mb-4">Credits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {song.creditsWithAvg.map((c) => (
                <CreditCard key={c.id} credit={c} />
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
