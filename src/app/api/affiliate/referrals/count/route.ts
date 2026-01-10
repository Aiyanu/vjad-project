import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export async function GET(request: Request) {
  try {
    const { user, error, status } = requireAuth(request);
    if (error) {
      const [response, httpStatus] = apiError(error, status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const userId = user.userId;

    // Get current user's affiliate record
    const currentUserAffiliate = await prisma.affiliate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!currentUserAffiliate) {
      const [response, httpStatus] = apiError(
        "Affiliate profile not found",
        404
      );
      return NextResponse.json(response, { status: httpStatus });
    }

    // Count referrals for this affiliate
    const count = await prisma.affiliate.count({
      where: { referrerId: currentUserAffiliate.id },
    });

    const [response, httpStatus] = apiSuccess(
      { count },
      "Referral count fetched",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, statusCode] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status: statusCode });
  }
}
