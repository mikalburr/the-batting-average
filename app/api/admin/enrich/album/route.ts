import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { enrichAlbum } from "@/lib/api/enrich";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { albumId } = await req.json();
  if (!albumId) return NextResponse.json({ error: "albumId required" }, { status: 400 });

  const result = await enrichAlbum(albumId);
  return NextResponse.json(result);
}
