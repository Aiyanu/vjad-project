import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

function generateReferralCode() {
  return "REF" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    // Check if super admin already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: {
        role: "super_admin",
      },
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { error: "Super admin already exists" },
        { status: 400 }
      );
    }

    // Check if the specific email already exists
    const existingUser = await db.user.findUnique({
      where: {
        email: "admin@vijadproject.com",
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash("password", 10);
    const superAdmin = await db.user.create({
      data: {
        email: "admin@vijadproject.com",
        passwordHash: hashedPassword,
        fullName: "Super Admin",
        role: "super_admin",
        emailVerified: true,
        referralCode: generateReferralCode(),
        phone: "+234 800 000 0000",
        bankName: "First Bank",
        accountNumber: "0000000000",
      },
    });

    return NextResponse.json(
      {
        message: "Super admin account created successfully",
        email: superAdmin.email,
        role: superAdmin.role,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: "Failed to create super admin account" },
      { status: 500 }
    );
  }
}
