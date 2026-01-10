// src/app/api/auth/verify/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token") ?? undefined;
    const email = url.searchParams.get("email") ?? undefined;
    if (!token || !email) {
      const [response, status] = apiError("Invalid verification link", 400);
      return NextResponse.json(response, { status });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const [response, status] = apiError("Invalid verification link", 400);
      return NextResponse.json(response, { status });
    }

    if (user.verificationToken !== token) {
      const [response, status] = apiError("Invalid or expired token", 400);
      return NextResponse.json(response, { status });
    }
    if (!user.verificationTokenExp || user.verificationTokenExp < new Date()) {
      const [response, status] = apiError("Token expired", 400);
      return NextResponse.json(response, { status });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    const [response, status] = apiSuccess(null, "Email verified", 200);
    return NextResponse.json(response, { status });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
