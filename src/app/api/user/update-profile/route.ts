import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
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
    const { fullName, phone, bankCode, accountNumber, accountName } = body;

    if (!fullName && !phone && !bankCode && !accountNumber && !accountName) {
      return NextResponse.json(
        { error: "Please provide data to update" },
        { status: 400 }
      );
    }

    const updateData: any = {
      ...(fullName && { fullName }),
      ...(phone && { phone }),
      ...(bankCode && { bankCode }),
      ...(accountNumber && { accountNumber }),
      ...(accountName && { accountName }),
    };

    const user = await db.user.update({
      where: { id: (payload as any).sub as string },
      data: updateData,
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
