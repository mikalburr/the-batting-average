"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { CreditRole } from "@prisma/client";

interface CreditFormData {
  name: string;
  slug: string;
  role: string;
  bio: string;
}

export async function saveCredit(data: CreditFormData): Promise<{ error?: string } | void> {
  const session = await getServerSession(authOptions);
  if (!session) return { error: "Unauthorized" };

  if (!data.name?.trim()) return { error: "Name is required" };
  if (!data.role) return { error: "Role is required" };

  const slug =
    data.slug?.trim() ||
    data.name
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  await prisma.credit.create({
    data: {
      name: data.name.trim(),
      slug,
      role: data.role as CreditRole,
      bio: data.bio?.trim() || null,
    },
  });

  redirect("/admin");
}
