import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";
import { verifyJwt } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(
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

    const affiliateId = id;
    const body = await request.json();
    const { isDisabled } = body;

    if (typeof isDisabled !== "boolean") {
      const [response, respStatus] = apiError(
        "isDisabled must be a boolean",
        400
      );
      return NextResponse.json(response, { status: respStatus });
    }

    // Check if affiliate exists and is actually an affiliate
    const affiliate = await prisma.user.findUnique({
      where: { id: affiliateId },
      select: { role: true },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    if (affiliate.role !== "affiliate") {
      return NextResponse.json(
        { error: "User is not an affiliate" },
        { status: 400 }
      );
    }

    // Update the affiliate
    const updated = await prisma.user.update({
      where: { id: affiliateId },
      data: { isDisabled },
      select: {
        id: true,
        email: true,
        fullName: true,
        isDisabled: true,
      },
    });

    const [response, respStatus] = apiSuccess(
      { affiliate: updated },
      "Affiliate updated successfully",
      200
    );
    return NextResponse.json(response, { status: respStatus });
  } catch (err) {
    const [response, respStatus] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status: respStatus });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieHeader = req.headers.get("cookie") ?? "";
    const match = cookieHeader.match(/vj_session=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : undefined;

    const payload = verifyJwt(token);
    if (!payload || typeof payload === "string") {
      const [response, respStatus] = apiError("Unauthorized", 401);
      return NextResponse.json(response, { status: respStatus });
    }

    const userId = (payload as any).sub as string;

    // Verify user is admin or super_admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
      const [response, respStatus] = apiError("Forbidden", 403);
      return NextResponse.json(response, { status: respStatus });
    }

    const affiliateId = id;

    // Check if affiliate exists and is actually an affiliate
    const affiliate = await prisma.user.findUnique({
      where: { id: affiliateId },
      select: { role: true },
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    if (affiliate.role !== "affiliate") {
      return NextResponse.json(
        { error: "User is not an affiliate" },
        { status: 400 }
      );
    }

    // Delete the affiliate (cascade will handle referrals)
    await prisma.user.delete({
      where: { id: affiliateId },
    });

    const [response, respStatus] = apiSuccess(
      null,
      "Affiliate removed successfully",
      200
    );
    return NextResponse.json(response, { status: respStatus });
  } catch (err) {
    const [response, respStatus] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status: respStatus });
  }
}
