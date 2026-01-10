import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { requireAuth } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export async function POST(request: NextRequest) {
  try {
    const { user, error, status } = requireAuth(request);
    if (error) {
      const [response, httpStatus] = apiError(error, status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      const [response, status] = apiError(
        "Password must be at least 6 characters",
        400
      );
      return NextResponse.json(response, { status });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: user.userId },
      data: { passwordHash },
    });

    const [response, status] = apiSuccess(
      null,
      "Password updated successfully",
      200
    );
    return NextResponse.json(response, { status });
  } catch (error) {
    const [response, status] = apiError(
      "Failed to change password",
      500,
      error
    );
    return NextResponse.json(response, { status });
  }
}
