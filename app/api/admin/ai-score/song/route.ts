import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSongScores } from "@/lib/api/aiScore";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set" }, { status: 503 });
  }

  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: "songId required" }, { status: 400 });

  const song = await prisma.song.findUnique({
    where: { id: songId },
    include: {
      primaryArtist: { select: { name: true, artistTier: true } },
      album: { select: { title: true } },
    },
  });
  if (!song) return NextResponse.json({ error: "Song not found" }, { status: 404 });

  const scores = await generateSongScores({
    artistName: song.primaryArtist.name,
    title:      song.title,
    year:       song.year,
    artistTier: song.primaryArtist.artistTier,
    album:      song.album?.title,
  });

  if (!scores) return NextResponse.json({ error: "AI scoring failed" }, { status: 500 });

  return NextResponse.json(scores);
}
