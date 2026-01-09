import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyJwt } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Get auth token
    const token = request.cookies.get("vj_session")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token and get user
    const payload = verifyJwt(token);
    if (!payload || typeof payload === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const currentUser = await db.user.findUnique({
      where: { id: (payload as any).userId },
    });

    if (
      !currentUser ||
      (currentUser.role !== "admin" && currentUser.role !== "super_admin")
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { isDisabled } = body;

    if (typeof isDisabled !== "boolean") {
      return NextResponse.json(
        { error: "isDisabled must be a boolean" },
        { status: 400 }
      );
    }

    // Get the user to be updated
    const userToUpdate = await db.user.findUnique({
      where: { id: id },
    });

    if (!userToUpdate) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent disabling yourself
    if (userToUpdate.id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot disable your own account" },
        { status: 400 }
      );
    }

    // Only super admin can disable other admins or super admins
    if (
      (userToUpdate.role === "admin" || userToUpdate.role === "super_admin") &&
      currentUser.role !== "super_admin"
    ) {
      return NextResponse.json(
        { error: "Only super admin can disable admin accounts" },
        { status: 403 }
      );
    }

    // Update user disabled status
    const updatedUser = await db.user.update({
      where: { id: id },
      data: { isDisabled },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isDisabled: true,
      },
    });

    return NextResponse.json({
      message: `User ${isDisabled ? "disabled" : "enabled"} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user status error:", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}
