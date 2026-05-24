import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enrichSong } from "@/lib/api/enrich";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { songId } = await req.json();
  if (!songId) return NextResponse.json({ error: "songId required" }, { status: 400 });

  const result = await enrichSong(songId);
  return NextResponse.json(result);
}
