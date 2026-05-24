import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { enrichSong } from "@/lib/api/enrich";

// Enriches all songs — runs sequentially to respect Discogs 25 req/min rate limit
// Expect ~4 minutes for 100 songs
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const songs = await prisma.song.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "asc" },
  });

  const results: Record<string, string[]> = {};
  let updatedCount = 0;

  for (const song of songs) {
    const result = await enrichSong(song.id);
    results[song.title] = result.updated;
    if (result.updated.length > 0) updatedCount++;
  }

  return NextResponse.json({
    songsProcessed: songs.length,
    songsUpdated: updatedCount,
    results,
  });
}
