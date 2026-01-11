import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { user, error, status } = requireAdmin(request);
    if (error || !user) {
      const [response, respStatus] = apiError(error || "Unauthorized", status);
      return NextResponse.json(response, { status: respStatus });
    }

    const currentUser = await db.user.findUnique({
      where: { id: user.userId },
    });

    if (!currentUser) {
      const [response, respStatus] = apiError("User not found", 404);
      return NextResponse.json(response, { status: respStatus });
    }

    const body = await request.json();
    const { isDisabled } = body;

    if (typeof isDisabled !== "boolean") {
      const [response, respStatus] = apiError(
        "isDisabled must be a boolean",
        400
      );
      return NextResponse.json(response, { status: respStatus });
    }

    // Get the user to be updated
    const userToUpdate = await db.user.findUnique({
      where: { id: id },
    });

    if (!userToUpdate) {
      const [response, respStatus] = apiError("User not found", 404);
      return NextResponse.json(response, { status: respStatus });
    }

    // Prevent disabling yourself
    if (userToUpdate.id === currentUser.id) {
      const [response, respStatus] = apiError(
        "You cannot disable your own account",
        400
      );
      return NextResponse.json(response, { status: respStatus });
    }

    // Only super admin can disable other admins or super admins
    if (
      (userToUpdate.role === "admin" || userToUpdate.role === "super_admin") &&
      currentUser.role !== "super_admin"
    ) {
      const [response, respStatus] = apiError(
        "Only super admin can disable admin accounts",
        403
      );
      return NextResponse.json(response, { status: respStatus });
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

    const [response, respStatus] = apiSuccess(
      { user: updatedUser },
      `User ${isDisabled ? "disabled" : "enabled"} successfully`,
      200
    );
    return NextResponse.json(response, { status: respStatus });
  } catch (error) {
    const [response, respStatus] = apiError(
      "Failed to update user status",
      500,
      error
    );
    return NextResponse.json(response, { status: respStatus });
  }
}
