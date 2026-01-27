import { Response } from "express";
import { prisma } from "../lib/db";
import { apiSuccess, apiError } from "../lib/api-response";
import { AuthenticatedRequest } from "../middlewares/auth";

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

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, id, referralCode } = req.query;

    // Dev utility to fetch any user by query params
    if (email || id || referralCode) {
      let user = null;

      if (referralCode) {
        const affiliate = await prisma.affiliate.findUnique({
          where: { referralCode: String(referralCode) },
          include: { user: { include: { affiliate: true } } },
        });
        user = affiliate?.user || null;
      } else {
        user = await prisma.user.findUnique({
          where: email ? { email: String(email) } : { id: String(id) },
          include: { affiliate: true },
        });
      }

      if (!user) {
        return apiError(res, "User not found", 404);
      }

      return apiSuccess(res, flattenUser(user), "User found");
    }

    // Normal profile fetch for authenticated user
    if (!req.user) {
      return apiError(res, "Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { affiliate: true },
    });

    if (!user) {
      return apiError(res, "User not found", 404);
    }

    return apiSuccess(res, flattenUser(user), "User found");
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return apiError(res, "Unauthorized", 401);
    
    const { fullName, phone } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { fullName, phone },
      include: { affiliate: true }
    });

    return apiSuccess(res, flattenUser(user), "Profile updated successfully");
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};
