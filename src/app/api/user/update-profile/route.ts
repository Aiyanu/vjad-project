import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAuth } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = requireAuth(request);
    if (error || !user) {
      const [response, httpStatus] = apiError(error || "Unauthorized", status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const body = await request.json();
    const { fullName, phone, bankCode, accountNumber, accountName, bankName } =
      body;

    if (
      !fullName &&
      !phone &&
      !bankCode &&
      !accountNumber &&
      !accountName &&
      !bankName
    ) {
      const [response, httpStatus] = apiError(
        "Please provide data to update",
        400
      );
      return NextResponse.json(response, { status: httpStatus });
    }

    const userUpdate: any = {
      ...(fullName && { fullName }),
      ...(phone && { phone }),
    };

    const affiliateUpdate: any = {
      ...(bankCode && { bankCode }),
      ...(accountNumber && { accountNumber }),
      ...(accountName && { accountName }),
      ...(bankName && { bankName }),
    };

    if (Object.keys(userUpdate).length > 0) {
      await db.user.update({ where: { id: user.userId }, data: userUpdate });
    }

    if (Object.keys(affiliateUpdate).length > 0) {
      await db.affiliate.upsert({
        where: { userId: user.userId },
        create: { userId: user.userId, ...affiliateUpdate },
        update: affiliateUpdate,
      });
    }

    const updated = await db.user.findUnique({
      where: { id: user.userId },
      include: { affiliate: true },
    });

    const responsePayload = {
      id: updated?.id,
      email: updated?.email,
      fullName: updated?.fullName,
      role: updated?.role,
      phone: updated?.phone,
      emailVerified: updated?.emailVerified,
      isDisabled: updated?.isDisabled,
      createdAt: updated?.createdAt,
      referralCode: updated?.affiliate?.referralCode ?? null,
      bankName: updated?.affiliate?.bankName ?? null,
      bankCode: updated?.affiliate?.bankCode ?? null,
      accountNumber: updated?.affiliate?.accountNumber ?? null,
      accountName: updated?.affiliate?.accountName ?? null,
    };

    const [response, httpStatus] = apiSuccess(
      responsePayload,
      "Profile updated successfully",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    const [response, httpStatus] = apiError(
      "Failed to update profile",
      500,
      error
    );
    return NextResponse.json(response, { status: httpStatus });
  }
}
