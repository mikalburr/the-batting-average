import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { EnrichAllButton } from "@/components/admin/EnrichAllButton";

export default async function AdminDashboard() {
  const [songCount, artistCount, creditCount] = await Promise.all([
    prisma.song.count(),
    prisma.artist.count(),
    prisma.credit.count(),
  ]);

  const recentSongs = await prisma.song.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true, slug: true, title: true, tier: true, batting_avg: true,
      primaryArtist: { select: { name: true } },
    },
  });

  const artists = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, artistTier: true, image: true, mbid: true },
  });

  return (
    <div>
      <h1 className="font-display text-4xl tracking-wider text-text-primary mb-8">Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Songs", value: songCount },
          { label: "Artists", value: artistCount },
          { label: "Credits", value: creditCount },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-4 text-center">
            <p className="font-mono text-3xl text-text-primary">{s.value}</p>
            <p className="text-xs text-text-muted mt-1 font-body">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/admin/songs/new"
          className="bg-tier-great text-bg font-display tracking-wider px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm"
        >
          + ADD SONG
        </Link>
        <Link
          href="/admin/artists/new"
          className="border border-tier-great text-tier-great font-display tracking-wider px-5 py-2.5 rounded-lg hover:bg-tier-great/10 transition-colors text-sm"
        >
          + ADD ARTIST
        </Link>
        <Link
          href="/admin/albums/new"
          className="border border-border text-text-muted font-display tracking-wider px-5 py-2.5 rounded-lg hover:border-tier-great hover:text-tier-great transition-colors text-sm"
        >
          + ADD ALBUM
        </Link>
        <Link
          href="/admin/credits/new"
          className="border border-border text-text-muted font-display tracking-wider px-5 py-2.5 rounded-lg hover:border-tier-great hover:text-tier-great transition-colors text-sm"
        >
          + ADD CREDIT
        </Link>
        <RecalcButton />
        <EnrichAllButton />
      </div>

      {/* Artists table */}
      <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">Artists</h2>
      <div className="bg-surface border border-border rounded-lg overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Name</th>
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Tier</th>
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Image</th>
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">MBID</th>
              <th className="py-2 px-3 text-right text-xs text-text-muted font-body">Edit</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id} className="border-b border-border hover:bg-raised">
                <td className="py-2.5 px-3 font-body text-sm text-text-primary">{artist.name}</td>
                <td className="py-2.5 px-3 text-xs text-text-muted">{artist.artistTier}</td>
                <td className="py-2.5 px-3 text-xs">
                  {artist.image ? (
                    <span className="text-tier-good">✓</span>
                  ) : (
                    <span className="text-text-muted">—</span>
                  )}
                </td>
                <td className="py-2.5 px-3 text-xs font-mono text-text-muted truncate max-w-[120px]">
                  {artist.mbid ? artist.mbid.slice(0, 8) + "…" : "—"}
                </td>
                <td className="py-2.5 px-3 text-right">
                  <Link href={`/admin/artists/${artist.id}/edit`} className="text-xs text-tier-great hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent songs */}
      <h2 className="font-display text-xl tracking-wider text-text-primary mb-3">Recent Songs</h2>
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Title</th>
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Artist</th>
              <th className="py-2 px-3 text-left text-xs text-text-muted font-body">Tier</th>
              <th className="py-2 px-3 text-right text-xs text-text-muted font-body">Edit</th>
            </tr>
          </thead>
          <tbody>
            {recentSongs.map((song) => (
              <tr key={song.id} className="border-b border-border hover:bg-raised">
                <td className="py-2.5 px-3 font-body text-sm text-text-primary">{song.title}</td>
                <td className="py-2.5 px-3 text-xs text-text-muted">{song.primaryArtist.name}</td>
                <td className="py-2.5 px-3 text-xs" style={{ color: song.tier ? `var(--tier-${song.tier.toLowerCase()})` : "#555" }}>{song.tier}</td>
                <td className="py-2.5 px-3 text-right">
                  <Link href={`/admin/songs/${song.id}/edit`} className="text-xs text-tier-great hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Client component for recalc POST
function RecalcButton() {
  return (
    <form action="/api/admin/recalc" method="POST">
      <button
        type="submit"
        className="border border-border text-text-muted font-body text-sm px-5 py-2.5 rounded-lg hover:border-tier-great hover:text-tier-great transition-colors"
      >
        Recalculate All Scores
      </button>
    </form>
  );
}
