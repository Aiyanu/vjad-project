// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { signJwt } from "@/lib/auth";
import { authRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { apiSuccess, apiError } from "@/lib/api-response-server";

type Body = { email?: string; password?: string };

function delay(ms = 250) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      const [response, status] = apiError(
        "Email and password are required",
        400
      );
      return NextResponse.json(response, { status });
    }

    // Apply rate limiting based on email
    const identifier = `login:${email}`;
    const rateLimitResult = authRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        emailVerified: true,
        isDisabled: true,
        fullName: true,
        phone: true,
        createdAt: true,
        affiliate: {
          select: {
            referralCode: true,
            bankName: true,
            bankCode: true,
            accountNumber: true,
            accountName: true,
          },
        },
      },
    });

    // do not reveal existence
    if (!user) {
      await delay(300);
      const [response, status] = apiError("Invalid credentials", 401);
      return NextResponse.json(response, { status });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await delay(300);
      const [response, status] = apiError("Invalid credentials", 401);
      return NextResponse.json(response, { status });
    }

    // Check if account is disabled
    if (user.isDisabled) {
      const [response, status] = apiError(
        "Your account has been disabled. Please contact support for assistance.",
        403
      );
      return NextResponse.json(response, { status });
    }

    if (!user.emailVerified) {
      const [response, status] = apiError("Email not verified", 403);
      return NextResponse.json(
        { ...response, data: { email: user.email, isVerified: false } },
        { status }
      );
    }

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });

    const [response, status] = apiSuccess(
      {
        token,
        // user: {
        //   id: user.id,
        //   email: user.email,
        //   fullName: user.fullName,
        //   role: user.role,
        //   referralCode: user.referralCode,
        //   phone: user.phone,
        //   emailVerified: user.emailVerified,
        // },
      },
      "Login successful",
      200
    );
    return NextResponse.json(response, { status });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
