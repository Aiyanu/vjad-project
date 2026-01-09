// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? undefined;
    const email = url.searchParams.get("email") ?? undefined;
    if (!token || !email) {
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json(
        { error: "Invalid verification link" },
        { status: 400 }
      );

    if (user.verificationToken !== token)
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    if (!user.verificationTokenExp || user.verificationTokenExp < new Date()) {
      return NextResponse.json({ error: "Token expired" }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    return NextResponse.json({ ok: true, message: "Email verified" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
