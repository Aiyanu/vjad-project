import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";

// Admin transactions placeholder
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

    const transactions = [
      {
        id: "t1",
        affiliateId: "a1",
        amount: 1200,
        type: "commission",
        status: "paid",
        createdAt: new Date(),
      },
      {
        id: "t2",
        affiliateId: "a2",
        amount: 500,
        type: "referral_bonus",
        status: "pending",
        createdAt: new Date(),
      },
    ];

    return NextResponse.json({ ok: true, transactions });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
