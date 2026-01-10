import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiError, apiSuccess } from "@/lib/api-response-server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status } = requireAdmin(request as any, true);
  if (error) {
    const [response, httpStatus] = apiError(error, status);
    return NextResponse.json(response, { status: httpStatus });
  }

  try {
    const admin = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!admin || !["admin", "super_admin"].includes(admin.role)) {
      const [response, httpStatus] = apiError("Admin not found", 404);
      return NextResponse.json(response, { status: httpStatus });
    }

    if (admin.role === "super_admin") {
      const [response, httpStatus] = apiError(
        "Cannot remove a super admin",
        403
      );
      return NextResponse.json(response, { status: httpStatus });
    }

    await prisma.user.delete({ where: { id } });

    const [response, httpStatus] = apiSuccess({ id }, "Admin removed", 200);
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, httpStatus] = apiError("Failed to remove admin", 500, err);
    return NextResponse.json(response, { status: httpStatus });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { error, status } = requireAdmin(request as any, true);
  if (error) {
    const [response, httpStatus] = apiError(error, status);
    return NextResponse.json(response, { status: httpStatus });
  }

  try {
    const { role } = await request.json();
    if (role !== "admin" && role !== "super_admin") {
      const [response, httpStatus] = apiError("Invalid role", 400);
      return NextResponse.json(response, { status: httpStatus });
    }

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });

    if (!existing || !["admin", "super_admin"].includes(existing.role)) {
      const [response, httpStatus] = apiError("Admin not found", 404);
      return NextResponse.json(response, { status: httpStatus });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, role: true },
    });

    const [response, httpStatus] = apiSuccess(
      updated,
      "Admin role updated",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (err) {
    const [response, httpStatus] = apiError(
      "Failed to update admin role",
      500,
      err
    );
    return NextResponse.json(response, { status: httpStatus });
  }
}
