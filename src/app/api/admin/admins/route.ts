import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";
import { requireAdmin } from "@/lib/authMiddleware";
import { apiSuccess, apiError } from "@/lib/api-response-server";

// GET - Fetch admins with pagination/sort
export async function GET(request: NextRequest) {
  const { error, status } = requireAdmin(request);
  if (error) {
    const [response, httpStatus] = apiError(error, status);
    return NextResponse.json(response, { status: httpStatus });
  }

  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(url.searchParams.get("limit") || "10"))
    );
    const search = (url.searchParams.get("search") || "").trim();
    const sortField = url.searchParams.get("sortField") || "createdAt";
    const sortOrder = (
      url.searchParams.get("sortOrder") || "desc"
    ).toLowerCase();

    const where: any = {
      role: { in: ["admin", "super_admin"] },
    };
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { fullName: { contains: search, mode: "insensitive" } },
      ];
    }

    const validSortFields: Record<string, string> = {
      fullName: "fullName",
      email: "email",
      role: "role",
      createdAt: "createdAt",
    };
    const orderByField = validSortFields[sortField] || "createdAt";
    const orderByDir = sortOrder === "asc" ? "asc" : "desc";

    const total = await prisma.user.count({ where });

    const admins = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
      orderBy: { [orderByField]: orderByDir },
      skip: (page - 1) * limit,
      take: limit,
    });

    const [response, httpStatus] = apiSuccess(
      {
        admins,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Admins fetched",
      200
    );
    return NextResponse.json(response, { status: httpStatus });
  } catch (error) {
    const [response, httpStatus] = apiError(
      "Failed to fetch admins",
      500,
      error
    );
    return NextResponse.json(response, { status: httpStatus });
  }
}

// POST - Create new admin (super_admin only)
export async function POST(request: NextRequest) {
  const { user, error, status } = requireAdmin(request, true);
  if (error) {
    const [response, httpStatus] = apiError(error, status);
    return NextResponse.json(response, { status: httpStatus });
  }

  try {
    const { fullName, email, role: requestedRole } = await request.json();

    // Validate input
    if (!fullName || !email) {
      const [response, status] = apiError(
        "Full name and email are required",
        400
      );
      return NextResponse.json(response, { status });
    }

    const role = requestedRole === "super_admin" ? "super_admin" : "admin";

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const [response, status] = apiError("Email already exists", 409);
      return NextResponse.json(response, { status });
    }

    // Generate random password (12 characters)
    const randomPassword = crypto.randomBytes(6).toString("hex");

    // Hash password
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Create admin user
    const newAdmin = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash: hashedPassword,
        role,
        emailVerified: true, // Admins are pre-verified
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    // Send welcome email with credentials
    try {
      const loginUrl = `${
        process.env.APP_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        "http://localhost:3000"
      }/auth`;

      await sendMail({
        to: email,
        subject: "Your Admin Account Has Been Created",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="${
                process.env.APP_URL ||
                process.env.NEXT_PUBLIC_APP_URL ||
                "http://localhost:3000"
              }/vijad-projects.png" alt="Vijad Projects" style="max-width: 150px;" />
            </div>
            
            <h2 style="color: #0046FF; margin-bottom: 20px;">Welcome to Vijad Projects Admin</h2>
            
            <p style="color: #666; line-height: 1.6;">
              Hello ${fullName},
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              Your admin account has been created. Here are your login credentials:
            </p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Temporary Password:</strong> <code style="background: #fff; padding: 5px 10px; border-radius: 4px;">${randomPassword}</code></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background-color: #0046FF; color: white; padding: 14px 28px; text-decoration: none; 
                        border-radius: 6px; display: inline-block; font-weight: 600;">
                Login to Admin Dashboard
              </a>
            </div>
            
            <p style="color: #666; line-height: 1.6; font-size: 14px;">
              <strong>Important:</strong> Please change your password after your first login for security purposes.
            </p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #999; font-size: 12px; line-height: 1.6;">
              If you didn't expect this email or have any questions, please contact support immediately.
            </p>
            
            <p style="color: #999; font-size: 12px;">
              © ${new Date().getFullYear()} Vijad Projects. All rights reserved.
            </p>
          </div>
        `,
        text: `
Welcome to Vijad Projects Admin

Hello ${fullName},

Your admin account has been created. Here are your login credentials:

Email: ${email}
Temporary Password: ${randomPassword}

Login URL: ${loginUrl}

Important: Please change your password after your first login for security purposes.

If you didn't expect this email or have any questions, please contact support immediately.

© ${new Date().getFullYear()} Vijad Projects. All rights reserved.
        `,
      });

      console.log(`✅ Admin credentials sent to: ${email}`);
    } catch (emailError) {
      console.error("Failed to send admin credentials email:", emailError);
      // Don't fail the request if email fails, but log it
    }

    const [response, status] = apiSuccess(
      newAdmin,
      "Admin created successfully",
      201
    );
    return NextResponse.json(response, { status });
  } catch (error) {
    const [response, status] = apiError("Failed to create admin", 500, error);
    return NextResponse.json(response, { status });
  }
}
