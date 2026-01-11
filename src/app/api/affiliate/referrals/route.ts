import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = requireAuth(request);
    if (error || !user) {
      const [response, httpStatus] = apiError(error || "Unauthorized", status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const userId = user.userId;

    // Parse query parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "10"))
    );
    const search = (url.searchParams.get("search") || "").trim();
    const sortField = url.searchParams.get("sortField") || "createdAt";
    const sortOrder = (
      url.searchParams.get("sortOrder") || "desc"
    ).toLowerCase();

    // Get the current user's affiliate record to find their referrals
    const userAffiliate = await prisma.affiliate.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!userAffiliate) {
      const [response, status] = apiSuccess(
        {
          referrals: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
          },
        },
        "No referrals found",
        200
      );
      return NextResponse.json(response, { status });
    }

    // Build where clause for search on referrals (Affiliate records where referrerId matches current user's affiliate)
    const where: any = { referrerId: userAffiliate.id };

    // Get total count
    const total = await prisma.affiliate.count({ where });

    // Get paginated referrals via Affiliate.referrals
    const referrals = await prisma.affiliate.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            emailVerified: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: sortOrder === "asc" ? "asc" : "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Flatten the response to match expected shape
    const flattenedReferrals = referrals.map((aff) => ({
      id: aff.user.id,
      email: aff.user.email,
      fullName: aff.user.fullName,
      referralCode: aff.referralCode,
      emailVerified: aff.user.emailVerified,
      phone: aff.user.phone,
      createdAt: aff.user.createdAt,
    }));

    const [response, httpStatus] = apiSuccess(
      {
        referrals: flattenedReferrals,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Referrals fetched",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, statusCode] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status: statusCode });
  }
}
