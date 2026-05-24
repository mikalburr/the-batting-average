"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveAlbum } from "../actions";

interface Artist {
  id: string;
  name: string;
}

export default function NewAlbumForm({ artists }: { artists: Artist[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await saveAlbum({
      title: fd.get("title") as string,
      slug: fd.get("slug") as string,
      year: fd.get("year") as string,
      artistId: fd.get("artistId") as string,
    });
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <>
      {error && (
        <div className="bg-tier-skip/10 border border-tier-skip text-tier-skip rounded-lg p-3 mb-6 text-sm font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Title *</label>
            <input
              name="title"
              required
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Slug (auto-generated if blank)</label>
            <input
              name="slug"
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-tier-great"
              placeholder="e.g. good-kid-maad-city"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Release Year *</label>
            <input
              name="year"
              type="number"
              required
              min={1950}
              max={new Date().getFullYear() + 1}
              defaultValue={new Date().getFullYear()}
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Artist *</label>
            <select
              name="artistId"
              required
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            >
              <option value="">— Select artist —</option>
              {artists.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-tier-great text-bg font-display tracking-wider px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-sm disabled:opacity-50"
          >
            {submitting ? "SAVING..." : "SAVE ALBUM"}
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
    </>
  );
}
