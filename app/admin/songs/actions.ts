"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { CertLevel, ChartName, ViralityDurability } from "@prisma/client";

interface SongFormData {
  songId?: string;
  title: string; slug: string; year: string | number;
  primaryArtistId: string; albumId: string;
  lyricism_score: string; production_score: string; engineering_score: string;
  creativity_score: string; performance_score: string;
  longevity_score: string; sample_score: string; critical_score: string;
  cultural_moment_score: string; peer_score: string;
  lifetime_streams: string; peak_chart_position: string; chart_name: string;
  certification_level: string; physical_sales: string; digital_sales: string;
  tiktok_video_count: string; platform_trend_peaks: string; ugc_volume: string;
  stream_spike_post_viral: boolean; search_volume_surge: boolean;
  sync_placement_count: string; virality_durability: string;
  creditIds: string[]; isInstrumental: boolean;
}

function num(v: string | number | undefined | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export async function saveSong(data: SongFormData): Promise<{ error?: string } | void> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  if (!data.title?.trim()) return { error: "Title is required" };
  if (!data.primaryArtistId) return { error: "Artist is required" };

  const slug = data.slug?.trim() ||
    data.title.toLowerCase().replace(/['']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const songData = {
    title: data.title.trim(),
    slug,
    year: Number(data.year),
    primaryArtistId: data.primaryArtistId,
    albumId: data.albumId || null,
    lyricism_score: data.isInstrumental ? null : num(data.lyricism_score),
    production_score: num(data.production_score) ?? 75,
    engineering_score: num(data.engineering_score) ?? 75,
    creativity_score: num(data.creativity_score) ?? 75,
    performance_score: num(data.performance_score) ?? 75,
    longevity_score: num(data.longevity_score) ?? 50,
    sample_score: num(data.sample_score) ?? 30,
    critical_score: num(data.critical_score) ?? 70,
    cultural_moment_score: num(data.cultural_moment_score) ?? 50,
    peer_score: num(data.peer_score) ?? 50,
    lifetime_streams: BigInt(num(data.lifetime_streams) ?? 0),
    peak_chart_position: num(data.peak_chart_position),
    chart_name: data.chart_name ? (data.chart_name as ChartName) : null,
    certification_level: (data.certification_level || "NONE") as CertLevel,
    physical_sales: num(data.physical_sales),
    digital_sales: num(data.digital_sales),
    tiktok_video_count: num(data.tiktok_video_count),
    platform_trend_peaks: num(data.platform_trend_peaks),
    ugc_volume: num(data.ugc_volume),
    stream_spike_post_viral: Boolean(data.stream_spike_post_viral),
    search_volume_surge: Boolean(data.search_volume_surge),
    sync_placement_count: num(data.sync_placement_count) ?? 0,
    virality_durability: (data.virality_durability || "LASTING") as ViralityDurability,
  };

  try {
    let songId: string;
    if (data.songId) {
      const song = await prisma.song.update({ where: { id: data.songId }, data: songData });
      songId = song.id;
    } else {
      const song = await prisma.song.create({ data: songData });
      songId = song.id;
    }

    // Update credits: replace all
    await prisma.songCredit.deleteMany({ where: { songId } });
    if (data.creditIds.length > 0) {
      await prisma.songCredit.createMany({
        data: data.creditIds.map((creditId) => ({ songId, creditId })),
        skipDuplicates: true,
      });
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("Unique constraint")) return { error: "A song with that slug already exists." };
    return { error: msg };
  }
}
