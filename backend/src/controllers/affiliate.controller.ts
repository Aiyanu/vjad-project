import { Response } from "express";
import { prisma } from "../lib/db";
import { apiSuccess, apiError } from "../lib/api-response";
import { AuthenticatedRequest } from "../middlewares/auth";

export const getReferrals = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) return apiError(res, "Unauthorized", 401);

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: req.user.userId },
    });

    if (!affiliate) return apiError(res, "Affiliate profile not found", 404);

    const referrals = await prisma.affiliate.findMany({
      where: { referrerId: affiliate.id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedReferrals = referrals.map((ref) => ({
      id: ref.id,
      fullName: ref.user.fullName,
      email: ref.user.email,
      createdAt: ref.user.createdAt,
      referralCode: ref.referralCode,
    }));

    return apiSuccess(res, formattedReferrals, "Referrals fetched");
  } catch (err) {
    return apiError(res, "Failed to fetch referrals", 500, err);
  }
};

export const getReferralCount = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) return apiError(res, "Unauthorized", 401);

    const affiliate = await prisma.affiliate.findUnique({
      where: { userId: req.user.userId },
      include: { _count: { select: { referrals: true } } },
    });

    return apiSuccess(
      res,
      { count: affiliate?._count.referrals ?? 0 },
      "Referral count fetched",
    );
  } catch (err) {
    return apiError(res, "Failed to fetch referral count", 500, err);
  }
};

export const getTransactions = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    if (!req.user) return apiError(res, "Unauthorized", 401);

    // Transactions are not fully modeled in Prisma yet, returning placeholders
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

    return apiSuccess(res, transactions, "Transactions fetched");
  } catch (err) {
    return apiError(res, "Failed to fetch transactions", 500, err);
  }
};
