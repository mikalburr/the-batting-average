import Link from "next/link";
import type { Tier } from "@prisma/client";
import { AvgDisplay } from "./ui/AvgDisplay";
import { TierBadge } from "./ui/TierBadge";

interface Props {
  song: {
    slug: string;
    title: string;
    year: number;
    batting_avg: number | null;
    tier: Tier | null;
    album?: { title: string; slug: string } | null;
  };
  showAlbum?: boolean;
  rank?: number;
}

export function SongRow({ song, showAlbum = true, rank }: Props) {
  return (
    <tr className="border-b border-border hover:bg-raised transition-colors group">
      {rank != null && (
        <td className="py-3 pl-4 pr-2 w-8 text-xs text-text-muted font-mono">{rank}</td>
      )}
      <td className="py-3 px-3">
        <Link
          href={`/song/${song.slug}`}
          className="font-body text-text-primary hover:text-tier-great transition-colors"
        >
          {song.title}
        </Link>
        {showAlbum && song.album && (
          <div className="text-xs text-text-muted mt-0.5">
            <Link href={`/album/${song.album.slug}`} className="hover:underline">
              {song.album.title}
            </Link>
          </div>
        )}
      </td>
      <td className="py-3 px-3 text-center">
        <span className="text-xs text-text-muted font-mono">{song.year}</span>
      </td>
      <td className="py-3 px-3">
        <TierBadge tier={song.tier} />
      </td>
      <td className="py-3 px-3 text-right">
        <AvgDisplay value={song.batting_avg} tier={song.tier} size="sm" />
      </td>
    </tr>
  );
}
