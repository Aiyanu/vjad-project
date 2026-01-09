import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
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

    const affiliateId = id;
    const body = await req.json();
    const { isDisabled } = body;

    if (typeof isDisabled !== "boolean") {
      return NextResponse.json(
        { error: "isDisabled must be a boolean" },
        { status: 400 }
      );
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

    return NextResponse.json({
      ok: true,
      message: "Affiliate updated successfully",
      affiliate: updated,
    });
  } catch (err) {
    console.error("Error updating affiliate:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
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

    return NextResponse.json({
      ok: true,
      message: "Affiliate removed successfully",
    });
  } catch (err) {
    console.error("Error removing affiliate:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
