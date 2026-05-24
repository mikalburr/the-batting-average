import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enrichArtist } from "@/lib/api/enrich";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { artistId } = await req.json();
  if (!artistId) return NextResponse.json({ error: "artistId required" }, { status: 400 });

  const result = await enrichArtist(artistId);
  return NextResponse.json(result);
}
