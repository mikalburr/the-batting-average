import Link from "next/link";
import Image from "next/image";
import type { Tier } from "@prisma/client";
import { AvgDisplay } from "./ui/AvgDisplay";
import { TierBadge } from "./ui/TierBadge";

interface Props {
  artist: {
    name: string;
    slug: string;
    image?: string | null;
    avg: number | null;
    tier: Tier | null;
    songCount?: number;
  };
  rank?: number;
}

export function ArtistCard({ artist, rank }: Props) {
  return (
    <Link
      href={`/artist/${artist.slug}`}
      className="flex items-center gap-4 bg-raised p-4 rounded-lg border border-border hover:border-tier-great/50 transition-colors group"
    >
      {rank != null && (
        <span className="font-mono text-sm text-text-muted w-4 shrink-0">{rank}</span>
      )}
      {artist.image ? (
        <Image
          src={artist.image}
          alt={artist.name}
          width={40}
          height={40}
          className="rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center shrink-0">
          <span className="font-display text-sm text-text-muted">
            {artist.name[0].toUpperCase()}
          </span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-text-primary group-hover:text-tier-great transition-colors truncate">
          {artist.name}
        </p>
        {artist.songCount != null && (
          <p className="text-xs text-text-muted">{artist.songCount} {artist.songCount === 1 ? "song" : "songs"}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <AvgDisplay value={artist.avg} tier={artist.tier} size="md" />
        <div className="mt-1">
          <TierBadge tier={artist.tier} size="xs" />
        </div>
      </div>
    </Link>
  );
}
