import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: "Password must be 8+ characters" }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Account already exists" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name: name || null, password: hashed } });

  return NextResponse.json({ id: user.id, email: user.email });
}
