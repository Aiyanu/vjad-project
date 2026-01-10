import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

const flattenUser = (user: any) => {
  if (!user) return null;
  const affiliate = user.affiliate;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    emailVerified: user.emailVerified,
    isDisabled: user.isDisabled,
    createdAt: user.createdAt,
    referralCode: affiliate?.referralCode ?? null,
    bankName: affiliate?.bankName ?? null,
    bankCode: affiliate?.bankCode ?? null,
    accountNumber: affiliate?.accountNumber ?? null,
    accountName: affiliate?.accountName ?? null,
  };
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    // Accept email, id, or referralCode query for dev convenience
    const email = url.searchParams.get("email") ?? undefined;
    const id = url.searchParams.get("id") ?? undefined;
    const referralCode = url.searchParams.get("referralCode") ?? undefined;

    // If email, id, or referralCode provided, return that user (dev)
    if (email || id || referralCode) {
      let user = null;

      if (referralCode) {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode },
          include: {
            user: {
              include: {
                affiliate: true,
              },
            },
          },
        });
        user = affiliate?.user || null;
      } else {
        user = await prisma.user.findUnique({
          where: email ? { email } : { id: id! },
          include: { affiliate: true },
        });
      }

      const flatUser = flattenUser(user);
      if (!user) {
        const [response, status] = apiError("Not found", 404);
        return NextResponse.json(response, { status });
      }
      const [response, status] = apiSuccess(flatUser, "User found", 200);
      return NextResponse.json(response, { status });
    }

    // Verify authentication
    const { user: authUser, error, status } = requireAuth(request);
    if (error || !authUser) {
      const [response, httpStatus] = apiError(error || "Unauthorized", status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const userId = authUser.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { affiliate: true },
    });

    const flatUser = flattenUser(user);

    if (!flatUser) {
      const [response, status] = apiError("Not found", 404);
      return NextResponse.json(response, { status });
    }

    const [response, httpStatus] = apiSuccess(flatUser, "User found", 200);
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
