"use client";

import { useState } from "react";
import type { AIScoredSong, AIScoredField } from "@/lib/api/aiScore";

interface Props {
  songId: string;
  onAccept: (scores: Record<string, number | null>) => void;
}

const CONFIDENCE_COLOR: Record<string, string> = {
  HIGH:   "text-tier-good",
  MEDIUM: "text-tier-classic",
  LOW:    "text-tier-skip",
};

const FIELDS: { key: keyof AIScoredSong; label: string; category: string }[] = [
  { key: "lyricism",      label: "Lyricism",          category: "Quality" },
  { key: "production",    label: "Production",         category: "Quality" },
  { key: "engineering",   label: "Engineering & Mix",  category: "Quality" },
  { key: "creativity",    label: "Creativity",         category: "Quality" },
  { key: "performance",   label: "Performance",        category: "Quality" },
  { key: "longevity",     label: "Longevity",          category: "Cultural" },
  { key: "sample",        label: "Sample/Interpolation", category: "Cultural" },
  { key: "critical",      label: "Critical Consensus", category: "Cultural" },
  { key: "culturalMoment", label: "Cultural Moment",   category: "Cultural" },
  { key: "peer",          label: "Peer Recognition",   category: "Cultural" },
];

export function AiScorePanel({ songId, onAccept }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [scores, setScores] = useState<AIScoredSong | null>(null);
  const [edited, setEdited] = useState<Record<string, number>>({});

  async function generate() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/ai-score/song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data: AIScoredSong = await res.json();
      setScores(data);
      setState("done");
    } catch {
      setState("error");
    }
  }

  function acceptAll() {
    if (!scores) return;
    const out: Record<string, number | null> = {};
    for (const { key } of FIELDS) {
      const field = scores[key] as AIScoredField | null;
      if (field === null) { out[`${key}_score`] = null; continue; }
      out[`${key === "culturalMoment" ? "cultural_moment" : key}_score`] =
        edited[key as string] ?? field.score;
    }
    onAccept(out);
  }

  const currentScore = (key: string, field: AIScoredField | null): number =>
    edited[key] ?? field?.score ?? 0;

  if (!process.env.NEXT_PUBLIC_HAS_AI && state === "idle") {
    // Show regardless — server checks the key
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-display tracking-wider text-text-primary">AI SCORE DRAFT</p>
          <p className="text-xs text-text-muted font-body mt-0.5">
            Claude generates first-pass scores — review before accepting
          </p>
        </div>
        {state === "idle" && (
          <button
            onClick={generate}
            className="bg-tier-great text-bg font-display tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
          >
            Generate AI Scores
          </button>
        )}
        {state === "loading" && (
          <span className="text-xs text-text-muted font-mono animate-pulse">Analyzing…</span>
        )}
        {state === "done" && (
          <div className="flex gap-2">
            <button
              onClick={() => { setState("idle"); setScores(null); setEdited({}); }}
              className="border border-border text-text-muted font-body text-xs px-3 py-1.5 rounded hover:border-text-muted transition-colors"
            >
              Regenerate
            </button>
            <button
              onClick={acceptAll}
              className="bg-tier-great text-bg font-display tracking-wider px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm"
            >
              Accept All
            </button>
          </div>
        )}
      </div>

      {state === "error" && (
        <p className="text-xs text-tier-skip">AI scoring failed. Check ANTHROPIC_API_KEY is set.</p>
      )}

      {state === "done" && scores && (
        <>
          {scores.notes && (
            <p className="text-xs text-text-muted font-body italic border-l-2 border-border pl-3">
              {scores.notes}
            </p>
          )}

          {["Quality", "Cultural"].map((category) => (
            <div key={category}>
              <p className="text-xs text-text-muted font-display tracking-wider mb-2">{category.toUpperCase()}</p>
              <div className="space-y-2">
                {FIELDS.filter((f) => f.category === category).map(({ key, label }) => {
                  const field = scores[key] as AIScoredField | null;
                  if (key === "lyricism" && scores.isInstrumental) {
                    return (
                      <div key={key} className="flex items-center gap-3 text-xs opacity-40">
                        <span className="w-36 text-text-muted font-body">{label}</span>
                        <span className="text-text-muted font-mono">N/A (instrumental)</span>
                      </div>
                    );
                  }
                  if (!field) return null;
                  return (
                    <div key={key} className="flex items-start gap-3">
                      <span className="w-36 shrink-0 text-xs text-text-muted font-body pt-1">{label}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={currentScore(key as string, field)}
                          onChange={(e) => setEdited((p) => ({ ...p, [key as string]: Number(e.target.value) }))}
                          className="w-14 bg-bg border border-border rounded px-2 py-0.5 text-xs font-mono text-text-primary focus:outline-none focus:border-tier-great text-right"
                        />
                        <span className={`text-xs font-mono ${CONFIDENCE_COLOR[field.confidence]}`}>
                          {field.confidence}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted font-body leading-snug">{field.reasoning}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
