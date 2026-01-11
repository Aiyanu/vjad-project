// src/app/api/auth/reset/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, token, password } = await req.json().catch(() => ({}));
    if (!email || !token || !password || password.length < 8) {
      const [response, status] = apiError("Invalid payload", 400);
      return NextResponse.json(response, { status });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const [response, status] = apiError("Invalid token or email", 400);
      return NextResponse.json(response, { status });
    }

    if (
      user.verificationToken !== token ||
      !user.verificationTokenExp ||
      user.verificationTokenExp < new Date()
    ) {
      const [response, status] = apiError("Invalid or expired token", 400);
      return NextResponse.json(response, { status });
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

    const [response, status] = apiSuccess(null, "Password updated", 200);
    return NextResponse.json(response, { status });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
