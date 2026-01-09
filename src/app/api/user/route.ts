import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    // Accept email, id, or referralCode query for dev convenience
    const email = url.searchParams.get("email") ?? undefined;
    const id = url.searchParams.get("id") ?? undefined;
    const referralCode = url.searchParams.get("referralCode") ?? undefined;

    // If email, id, or referralCode provided, return that user (dev)
    if (email || id || referralCode) {
      const user = await prisma.user.findUnique({
        where: email
          ? { email }
          : id
          ? { id }
          : { referralCode: referralCode! },
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          referralCode: true,
          phone: true,
          emailVerified: true,
          isDisabled: true,
          accountName: true,
          accountNumber: true,
          bankCode: true,
          createdAt: true,
        },
      });
      if (!user)
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true, user });
    }

    // Otherwise try to read session cookie
    // Note: in Next.js Route Handlers, req.cookies isn't available on Request; parse from headers
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/vj_session=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;

    const payload = verifyJwt(token);
    if (!payload || typeof payload === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (payload as any).sub as string;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        referralCode: true,
        phone: true,
        emailVerified: true,
        isDisabled: true,
        accountName: true,
        accountNumber: true,
        bankCode: true,
        createdAt: true,
      },
    });

    if (!user)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
