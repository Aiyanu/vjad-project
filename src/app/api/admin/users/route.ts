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

    const role = (payload as any).role as string | undefined;
    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        referralCode: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, users });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
