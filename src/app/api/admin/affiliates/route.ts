import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export async function GET(request: NextRequest) {
  try {
    const { user, error, status } = requireAdmin(request);
    if (error) {
      const [response, httpStatus] = apiError(error, status);
      return NextResponse.json(response, { status: httpStatus });
    }

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

    // Build where clause for search
    const where: any = { role: "affiliate", affiliate: { isNot: null } };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        {
          affiliate: {
            is: { referralCode: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    // Build orderBy clause - validate sortField to prevent injection
    const validSortFields: Record<string, string> = {
      fullName: "fullName",
      email: "email",
      phone: "phone",
      createdAt: "createdAt",
      isDisabled: "isDisabled",
      referralsCount: "referralsCount", // will be handled after fetching
    };
    const orderByField = validSortFields[sortField] || "createdAt";
    const orderByDir = sortOrder === "asc" ? "asc" : "desc";

    // Get total count
    const total = await prisma.user.count({ where });

    // Get paginated affiliates with their referral counts
    let affiliates = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        emailVerified: true,
        isDisabled: true,
        createdAt: true,
        phone: true,
        affiliate: {
          select: {
            referralCode: true,
            bankName: true,
            accountNumber: true,
            bankCode: true,
            accountName: true,
            _count: { select: { referrals: true } },
          },
        },
      },
      orderBy:
        sortField === "referralsCount"
          ? undefined
          : { [orderByField]: orderByDir },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Map to response format with referralsCount
    let formattedAffiliates = affiliates.map((aff) => ({
      ...aff,
      referralCode: aff.affiliate?.referralCode ?? null,
      bankName: aff.affiliate?.bankName ?? null,
      accountNumber: aff.affiliate?.accountNumber ?? null,
      bankCode: aff.affiliate?.bankCode ?? null,
      accountName: aff.affiliate?.accountName ?? null,
      referralsCount: aff.affiliate?._count.referrals ?? 0,
      affiliate: undefined,
    }));

    // Sort by referralsCount if needed (can't sort in DB query with _count)
    if (sortField === "referralsCount") {
      formattedAffiliates.sort((a, b) => {
        const diff = a.referralsCount - b.referralsCount;
        return orderByDir === "asc" ? diff : -diff;
      });
    }

    const [response, httpStatus] = apiSuccess(
      {
        affiliates: formattedAffiliates,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Affiliates fetched",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    const [response, status] = apiError(
      "Failed to fetch affiliates",
      500,
      error
    );
    return NextResponse.json(response, { status });
  }
}
