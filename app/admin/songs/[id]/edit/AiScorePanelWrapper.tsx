"use client";

import { AiScorePanel } from "@/components/admin/AiScorePanel";
import { useRouter } from "next/navigation";

export function AiScorePanelWrapper({ songId }: { songId: string }) {
  const router = useRouter();

  async function handleAccept(scores: Record<string, number | null>) {
    const res = await fetch(`/api/admin/songs/${songId}/scores`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(scores),
    });
    if (res.ok) router.refresh();
  }

  return <AiScorePanel songId={songId} onAccept={handleAccept} />;
}
