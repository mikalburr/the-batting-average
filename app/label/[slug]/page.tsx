import { notFound } from "next/navigation";
import { getLabelBySlug } from "@/lib/db/labels";
import { AvgDisplay } from "@/components/ui/AvgDisplay";
import { TierBadge } from "@/components/ui/TierBadge";
import { ArtistCard } from "@/components/ArtistCard";
import { CreditCard } from "@/components/CreditCard";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export default async function LabelPage({ params }: Props) {
  const label = await getLabelBySlug(params.slug);
  if (!label) notFound();

  return (
    <>
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <p className="text-xs text-text-muted mb-6">
          Labels / <span className="text-text-primary">{label.name}</span>
        </p>

        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-8">
          <div className="flex-1">
            <h1 className="font-display text-6xl tracking-wider text-text-primary leading-none">
              {label.name}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <TierBadge tier={label.labelTier} size="md" />
              <span className="text-xs text-text-muted">
                {label.artistsWithAvg.length} artists
              </span>
            </div>
          </div>
          <AvgDisplay value={label.labelBattingAvg} tier={label.labelTier} size="xl" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
              Roster
            </h2>
            <div className="space-y-2">
              {label.artistsWithAvg.map((artist, i) => (
                <ArtistCard key={artist.id} artist={artist} rank={i + 1} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">
              Top Credits
            </h2>
            <div className="space-y-2">
              {label.topCredits.map((c) => (
                <CreditCard key={c.id} credit={{ ...c, role: c.role as import("@prisma/client").CreditRole }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
