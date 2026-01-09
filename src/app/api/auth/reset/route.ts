// src/app/api/auth/reset/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json().catch(() => ({}));
    if (!email || !token || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Invalid token or email" },
        { status: 400 }
      );

    if (
      user.verificationToken !== token ||
      !user.verificationTokenExp ||
      user.verificationTokenExp < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    return NextResponse.json({ ok: true, message: "Password updated" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
