import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/vj_session=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;

    const payload = verifyJwt(token);
    if (!payload || typeof payload === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (payload as any).sub as string;

    const referrals = await prisma.user.findMany({
      where: { referrerId: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        referralCode: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, referrals });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
