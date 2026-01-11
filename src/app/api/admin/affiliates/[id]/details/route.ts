import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error, status } = requireAdmin(request);
    if (error) {
      const [response, respStatus] = apiError(error, status);
      return NextResponse.json(response, { status: respStatus });
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
        emailVerified: true,
        isDisabled: true,
        createdAt: true,
        phone: true,
        affiliate: {
          include: {
            referrals: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    fullName: true,
                    emailVerified: true,
                    createdAt: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
      },
    });

    if (!affiliate) {
      const [response, respStatus] = apiError("Affiliate not found", 404);
      return NextResponse.json(response, { status: respStatus });
    }

    const [response, respStatus] = apiSuccess(
      {
        affiliate: {
          ...affiliate,
          referralCode: affiliate.affiliate?.referralCode ?? null,
          bankName: affiliate.affiliate?.bankName ?? null,
          bankCode: affiliate.affiliate?.bankCode ?? null,
          accountName: affiliate.affiliate?.accountName ?? null,
          accountNumber: affiliate.affiliate?.accountNumber ?? null,
          referrals: (affiliate.affiliate?.referrals || []).map((ref) => ({
            id: ref.user.id,
            email: ref.user.email,
            fullName: ref.user.fullName,
            emailVerified: ref.user.emailVerified,
            createdAt: ref.user.createdAt,
          })),
          referralsCount: affiliate.affiliate?.referrals.length || 0,
        },
      },
      "Affiliate details retrieved",
      200
    );
    return NextResponse.json(response, { status: respStatus });
  } catch (error) {
    const [response, respStatus] = apiError(
      "Failed to fetch affiliate details",
      500,
      error
    );
    return NextResponse.json(response, { status: respStatus });
  }
}
