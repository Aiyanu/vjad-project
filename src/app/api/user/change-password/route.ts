import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
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
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      const [response, httpStatus] = apiError(
        "Password must be at least 6 characters",
        400
      );
      return NextResponse.json(response, { status: httpStatus });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.userId },
      data: { passwordHash },
    });

    const [response, httpStatus] = apiSuccess(
      null,
      "Password updated successfully",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    const [response, httpStatus] = apiError(
      "Failed to change password",
      500,
      error
    );
    return NextResponse.json(response, { status: httpStatus });
  }
}
