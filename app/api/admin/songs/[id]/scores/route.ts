import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED = [
  "lyricism_score", "production_score", "engineering_score",
  "creativity_score", "performance_score", "longevity_score",
  "sample_score", "critical_score", "cultural_moment_score", "peer_score",
];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, number | null> = {};
  for (const key of ALLOWED) {
    if (key in body) data[key] = body[key];
  }

  const song = await prisma.song.update({ where: { id: params.id }, data });
  return NextResponse.json({ tier: song.tier, batting_avg: song.batting_avg });
}
