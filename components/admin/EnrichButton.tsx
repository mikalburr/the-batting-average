"use client";

import { useState } from "react";

type EnrichTarget = "artist" | "album" | "song";

interface Props {
  target: EnrichTarget;
  id: string;
  label?: string;
}

const ENDPOINT: Record<EnrichTarget, string> = {
  artist: "/api/admin/enrich/artist",
  album:  "/api/admin/enrich/album",
  song:   "/api/admin/enrich/song",
};

const BODY_KEY: Record<EnrichTarget, string> = {
  artist: "artistId",
  album:  "albumId",
  song:   "songId",
};

export function EnrichButton({ target, id, label = "Enrich from APIs" }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<{ updated: string[]; skipped: string[] } | null>(null);

  async function run() {
    setState("loading");
    try {
      const res = await fetch(ENDPOINT[target], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [BODY_KEY[target]]: id }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={run}
        disabled={state === "loading"}
        className="border border-border text-text-muted font-body text-sm px-4 py-2 rounded-lg hover:border-tier-great hover:text-tier-great transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Enriching…" : state === "done" ? "✓ Done" : label}
      </button>

      {state === "done" && result && (
        <div className="text-xs font-mono space-y-1">
          {result.updated.length > 0 && (
            <div className="text-tier-good">
              ↑ {result.updated.join(", ")}
            </div>
          )}
          {result.skipped.length > 0 && (
            <div className="text-text-muted">
              – {result.skipped.join(", ")}
            </div>
          )}
        </div>
      )}

      {state === "error" && (
        <p className="text-xs text-tier-skip">Enrichment failed. Check console.</p>
      )}
    </div>
  );
}
