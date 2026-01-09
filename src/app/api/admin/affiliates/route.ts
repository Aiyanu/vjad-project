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

    // Verify user is admin or super_admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Parse query parameters
    const url = new URL(req.url);
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
    const where: any = { role: "affiliate" };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { referralCode: { contains: search, mode: "insensitive" } },
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
        referralCode: true,
        emailVerified: true,
        isDisabled: true,
        createdAt: true,
        phone: true,
        bankName: true,
        accountNumber: true,
        _count: {
          select: {
            referrals: true,
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
      referralsCount: aff._count.referrals,
      _count: undefined,
    }));

    // Sort by referralsCount if needed (can't sort in DB query with _count)
    if (sortField === "referralsCount") {
      formattedAffiliates.sort((a, b) => {
        const diff = a.referralsCount - b.referralsCount;
        return orderByDir === "asc" ? diff : -diff;
      });
    }

    return NextResponse.json({
      affiliates: formattedAffiliates,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching affiliates:", error);
    return NextResponse.json(
      { error: "Failed to fetch affiliates" },
      { status: 500 }
    );
  }
}
