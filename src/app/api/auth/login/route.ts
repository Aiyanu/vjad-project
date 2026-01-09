// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/db";
import { signJwt } from "@/lib/auth";
import { authRateLimit, rateLimitResponse } from "@/lib/rateLimit";

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
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
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
        referralCode: true,
        phone: true,
        createdAt: true,
      },
    });

    // do not reveal existence
    if (!user) {
      await delay(300);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await delay(300);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is disabled
    if (user.isDisabled) {
      return NextResponse.json(
        {
          error:
            "Your account has been disabled. Please contact support for assistance.",
          code: "ACCOUNT_DISABLED",
        },
        { status: 403 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        {
          error: "Email not verified",
          code: "EMAIL_NOT_VERIFIED",
          email: user.email,
        },
        { status: 403 }
      );
    }

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });

    const res = NextResponse.json({
      ok: true,
      authToken: token,
    });

    res.cookies.set({
      name: "vj_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: Number(process.env.JWT_COOKIE_MAX_AGE ?? 60 * 60 * 24 * 7),
    });

    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
