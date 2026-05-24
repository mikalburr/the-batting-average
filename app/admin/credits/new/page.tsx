"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCredit } from "../actions";

const ROLES = ["PRODUCER", "ENGINEER", "SONGWRITER", "FEATURE", "VOCALIST"];

export default function NewCreditPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const result = await saveCredit({
      name: fd.get("name") as string,
      slug: fd.get("slug") as string,
      role: fd.get("role") as string,
      bio: fd.get("bio") as string,
    });
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl tracking-wider text-text-primary mb-8">Add Credit</h1>

      {error && (
        <div className="bg-tier-skip/10 border border-tier-skip text-tier-skip rounded-lg p-3 mb-6 text-sm font-body">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-surface border border-border rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Name *</label>
            <input
              name="name"
              required
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Slug (auto-generated if blank)</label>
            <input
              name="slug"
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-mono focus:outline-none focus:border-tier-great"
              placeholder="e.g. sounwave"
            />
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Primary Role *</label>
            <select
              name="role"
              required
              className="w-full bg-bg border border-border rounded px-3 py-2 text-sm text-text-primary font-body focus:outline-none focus:border-tier-great"
            >
              <option value="">— Select role —</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-text-muted font-body mb-1.5">Bio (optional)</label>
            <textarea
              name="bio"
              rows={3}
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
            {submitting ? "SAVING..." : "SAVE CREDIT"}
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
