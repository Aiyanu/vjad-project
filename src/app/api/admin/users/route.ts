import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export async function GET(request: Request) {
  try {
    const { user, error, status } = requireAdmin(request);
    if (error) {
      const [response, httpStatus] = apiError(error, status);
      return NextResponse.json(response, { status: httpStatus });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    const [response, httpStatus] = apiSuccess(users, "Users fetched", 200);
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
