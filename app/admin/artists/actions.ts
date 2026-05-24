"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { ArtistTier } from "@prisma/client";

interface ArtistFormData {
  name: string;
  slug: string;
  artistTier: string;
  labelId: string;
  image: string;
  bio: string;
  era: string;
}

export async function saveArtist(data: ArtistFormData): Promise<{ error?: string } | void> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  if (!data.name?.trim()) return { error: "Name is required" };
  if (!data.artistTier) return { error: "Artist tier is required" };

  const slug =
    data.slug?.trim() ||
    data.name
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  await prisma.artist.create({
    data: {
      name: data.name.trim(),
      slug,
      artistTier: data.artistTier as ArtistTier,
      labelId: data.labelId || null,
      image: data.image?.trim() || null,
      bio: data.bio?.trim() || null,
      era: data.era?.trim() || null,
    },
  });

  redirect("/admin");
}

export async function updateArtist(id: string, data: ArtistFormData): Promise<{ error?: string } | void> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  if (!data.name?.trim()) return { error: "Name is required" };
  if (!data.artistTier) return { error: "Artist tier is required" };

  await prisma.artist.update({
    where: { id },
    data: {
      name: data.name.trim(),
      artistTier: data.artistTier as ArtistTier,
      labelId: data.labelId || null,
      image: data.image?.trim() || null,
      bio: data.bio?.trim() || null,
      era: data.era?.trim() || null,
    },
  });

  redirect("/admin");
}
