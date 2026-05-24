"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateArtist } from "../../actions";
import { EnrichButton } from "@/components/admin/EnrichButton";
import type { Artist } from "@prisma/client";

const TIERS = ["SUPERSTAR", "MAINSTREAM", "RISING", "INDEPENDENT", "UNDERGROUND"];

export function ArtistEditForm({ artist }: { artist: Artist }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await updateArtist(artist.id, {
      name: fd.get("name") as string,
      slug: artist.slug,
      artistTier: fd.get("artistTier") as string,
      labelId: fd.get("labelId") as string,
      image: fd.get("image") as string,
      bio: fd.get("bio") as string,
      era: fd.get("era") as string,
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
        <p className="text-xs text-text-muted font-body mb-3">
          Auto-fill artist image (iTunes) and MusicBrainz ID — no API key required.
        </p>
        <EnrichButton target="artist" id={artist.id} label="Enrich from APIs (iTunes + MusicBrainz)" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Name *</label>
            <input
              name="name"
              required
              defaultValue={artist.name}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Artist Tier *</label>
            <select
              name="artistTier"
              required
              defaultValue={artist.artistTier}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            >
              {TIERS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Era</label>
            <input
              name="era"
              defaultValue={artist.era ?? ""}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Image URL</label>
            <input
              name="image"
              type="url"
              defaultValue={artist.image ?? ""}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Bio</label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={artist.bio ?? ""}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great resize-none"
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
