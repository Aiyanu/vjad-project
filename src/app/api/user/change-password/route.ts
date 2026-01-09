import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { verifyJwt } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("vj_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyJwt(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.user.update({
      where: { id: (payload as any).sub as string },
      data: { passwordHash },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}
