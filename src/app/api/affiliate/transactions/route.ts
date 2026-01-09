import { NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";

// Transactions are not modelled in Prisma yet. Return placeholder data.
export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/vj_session=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;

    const payload = verifyJwt(token);
    if (!payload || typeof payload === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return sample transactions for now
    const transactions = [
      {
        id: "t1",
        amount: 1200,
        type: "commission",
        status: "paid",
        createdAt: new Date(),
      },
      {
        id: "t2",
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
