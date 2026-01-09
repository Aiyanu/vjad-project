import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get auth token
    const token = request.cookies.get("vj_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyJwt(token);
    if (!payload || typeof payload === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await db.user.findUnique({
      where: { id: (payload as any).sub },
    });

    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get affiliate details with referrals
    const affiliate = await db.user.findUnique({
      where: {
        id: id,
        role: "affiliate",
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        referralCode: true,
        emailVerified: true,
        isDisabled: true,
        createdAt: true,
        phone: true,
        bankName: true,
        accountNumber: true,
        referrals: {
          select: {
            id: true,
            email: true,
            fullName: true,
            emailVerified: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      affiliate: {
        ...affiliate,
        referralsCount: affiliate.referrals.length,
      },
    });
  } catch (error) {
    console.error("Get affiliate details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliate details" },
      { status: 500 }
    );
  }
}
