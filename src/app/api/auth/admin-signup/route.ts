import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { apiSuccess, apiError } from "@/lib/api-response-server";

function generateReferralCode() {
  return "REF" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, phone, password } = body;

    // Validate required fields
    if (!fullName || !email || !password) {
      const [response, status] = apiError(
        "Full name, email, and password are required",
        400
      );
      return NextResponse.json(response, { status });
    }

    // Validate password length
    if (password.length < 6) {
      const [response, status] = apiError(
        "Password must be at least 6 characters",
        400
      );
      return NextResponse.json(response, { status });
    }

    // Check if a super admin already exists
    const existingSuperAdmin = await db.user.findFirst({
      where: {
        role: "super_admin",
      },
    });

    if (existingSuperAdmin) {
      const [response, status] = apiError(
        "A super admin account already exists. Only one super admin is allowed.",
        400
      );
      return NextResponse.json(response, { status });
    }

    // Check if email is already taken
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      const [response, status] = apiError(
        "An account with this email already exists",
        400
      );
      return NextResponse.json(response, { status });
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

    const [response, status] = apiSuccess(
      superAdmin,
      "Super admin account created successfully",
      201
    );
    return NextResponse.json(response, { status });
  } catch (error) {
    const [response, status] = apiError(
      "Failed to create admin account",
      500,
      error
    );
    return NextResponse.json(response, { status });
  }
}
