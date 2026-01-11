import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Check if seeding is enabled via environment variable
    if (process.env.ENABLE_SEED !== "true") {
      return NextResponse.json(
        {
          error: "Seeding is disabled",
        },
        { status: 403 }
      );
    }

    // Super Admin credentials
    const superAdminEmail = "admin@vijadprojects.com";
    const superAdminPassword = "VijadAdmin@2026"; // Change this
    const superAdminName = "Super Admin";

    // Check if super admin already exists
    const existingSuperAdmin = await prisma.user.findUnique({
      where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
      return NextResponse.json(
        { message: "Super admin already exists", email: superAdminEmail },
        { status: 200 }
      );
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(superAdminPassword, 10);

    // Create the super admin
    await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        fullName: superAdminName,
        role: "super_admin",
        emailVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "✅ Super admin created successfully!",
      credentials: {
        email: superAdminEmail,
        password: superAdminPassword,
        note: "Please change the password after first login!",
      },
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Failed to seed database", details: error.message },
      { status: 500 }
    );
  }
}
