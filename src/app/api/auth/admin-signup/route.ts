import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";

function generateReferralCode() {
  return "REF" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if a super admin already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: {
        role: "super_admin",
      },
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        {
          error:
            "A super admin account already exists. Only one super admin is allowed.",
        },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create super admin account
    const superAdmin = await db.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: hashedPassword,
        fullName,
        role: "super_admin",
        emailVerified: true, // Auto-verify super admin
        referralCode: generateReferralCode(),
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Super admin account created successfully",
        user: superAdmin,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin signup error:", error);
    return NextResponse.json(
      { error: "Failed to create admin account" },
      { status: 500 }
    );
  }
}
