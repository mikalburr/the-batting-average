"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  artistId: string;
  artistName: string;
}

type State = "idle" | "loading" | "done" | "error";

export function ImportDiscographyButton({ artistId, artistName }: Props) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");

  async function handleImport() {
    setState("loading");
    setMessage("");
    try {
      const res = await fetch("/api/admin/import/discography", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setState("error");
        setMessage(data.error ?? "Unknown error");
      } else {
        setState("done");
        setMessage(`+${data.songsCreated} songs`);
        router.refresh();
      }
    } catch (err) {
      setState("error");
      setMessage(String(err));
    }
  }

  if (state === "idle") {
    return (
      <button
        onClick={handleImport}
        title={`Import full discography for ${artistName} from MusicBrainz`}
        className="text-xs text-text-muted hover:text-tier-great font-body transition-colors underline decoration-dotted"
      >
        Import
      </button>
    );
  }

  if (state === "loading") {
    return (
      <span className="text-xs text-text-muted font-mono animate-pulse">fetching…</span>
    );
  }

  if (state === "done") {
    return (
      <span className="text-xs text-tier-good font-body" title="Imported from MusicBrainz">
        {message}
      </span>
    );
  }

  // error
  return (
    <span className="text-xs text-tier-skip font-body cursor-help" title={message}>
      error
    </span>
  );
}
