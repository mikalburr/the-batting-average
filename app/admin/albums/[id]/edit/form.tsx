"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAlbum } from "../../actions";
import { EnrichButton } from "@/components/admin/EnrichButton";

interface Album {
  id: string;
  title: string;
  slug: string;
  year: number;
  artistId: string;
  image: string | null;
  artist: { name: string };
}

interface Artist {
  id: string;
  name: string;
}

export function AlbumEditForm({ album, artists }: { album: Album; artists: Artist[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await updateAlbum(album.id, {
      title: fd.get("title") as string,
      slug: album.slug,
      year: fd.get("year") as string,
      artistId: fd.get("artistId") as string,
    });
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-tier-skip/10 border border-tier-skip text-tier-skip rounded-lg p-3 text-sm font-body">
          {error}
        </div>
      )}

      {/* Enrich section */}
      <div className="bg-surface border border-border rounded-lg p-4">
        <p className="text-xs text-text-muted font-body mb-1.5">
          {album.image ? (
            <span className="text-tier-good">✓ Artwork set</span>
          ) : (
            "Fetch album artwork from iTunes (no API key required)."
          )}
        </p>
        <div className="mt-2">
          <EnrichButton target="album" id={album.id} label="Fetch artwork (iTunes)" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Title *</label>
            <input
              name="title"
              required
              defaultValue={album.title}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Artist *</label>
            <select
              name="artistId"
              required
              defaultValue={album.artistId}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            >
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Year *</label>
            <input
              name="year"
              type="number"
              required
              defaultValue={album.year}
              min={1900}
              max={2030}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-tier-great text-bg font-display tracking-wider px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            {submitting ? "SAVING..." : "SAVE CHANGES"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-border text-text-muted font-body text-sm px-6 py-2.5 rounded-lg hover:border-text-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
