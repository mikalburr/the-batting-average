"use client";

import { useState } from "react";

interface EnrichAllResult {
  artistsProcessed: number;
  albumsProcessed: number;
  albumsUpdated: number;
  artistResults: Record<string, string[]>;
}

export function EnrichAllButton() {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<EnrichAllResult | null>(null);

  async function run() {
    if (!confirm("Enrich all artists and albums? This calls external APIs and may take 1–2 minutes.")) return;
    setState("loading");
    try {
      const res = await fetch("/api/admin/enrich/all", { method: "POST" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResult(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="space-y-1">
      <button
        onClick={run}
        disabled={state === "loading"}
        className="border border-border text-text-muted font-body text-sm px-5 py-2.5 rounded-lg hover:border-tier-classic hover:text-tier-classic transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? "Enriching… (may take ~2 min)" : state === "done" ? "✓ Enriched" : "Enrich All Artists + Albums"}
      </button>

      {state === "done" && result && (
        <p className="text-xs text-tier-good font-mono">
          {result.artistsProcessed} artists, {result.albumsUpdated}/{result.albumsProcessed} albums updated
        </p>
      )}

      {state === "error" && (
        <p className="text-xs text-tier-skip">Enrichment failed. Check server logs.</p>
      )}
    </div>
  );
}
