"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

interface AlbumFormData {
  title: string;
  slug: string;
  year: string;
  artistId: string;
}

export async function saveAlbum(data: AlbumFormData): Promise<{ error?: string } | void> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  if (!data.title?.trim()) return { error: "Title is required" };
  if (!data.artistId) return { error: "Artist is required" };
  if (!data.year || isNaN(Number(data.year))) return { error: "Valid year is required" };

  const slug =
    data.slug?.trim() ||
    data.title
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  await prisma.album.create({
    data: {
      title: data.title.trim(),
      slug,
      year: Number(data.year),
      artistId: data.artistId,
    },
  });

  redirect("/admin");
}

export async function updateAlbum(id: string, data: AlbumFormData): Promise<{ error?: string } | void> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  if (!data.title?.trim()) return { error: "Title is required" };
  if (!data.year || isNaN(Number(data.year))) return { error: "Valid year is required" };

  await prisma.album.update({
    where: { id },
    data: {
      title: data.title.trim(),
      year: Number(data.year),
      artistId: data.artistId,
    },
  });

  redirect("/admin");
}
