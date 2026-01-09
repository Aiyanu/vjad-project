// src/app/api/auth/resend-verification/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { resendCodeRateLimit, rateLimitResponse } from "@/lib/rateLimit";
import { sendMail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";

function randomTokenHex(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Apply rate limiting based on email
    const identifier = `resend:${email.toLowerCase()}`;
    const rateLimitResult = resendCodeRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetTime);
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Don't leak user existence
      return NextResponse.json({
        ok: true,
        message:
          "If an account exists with this email, a verification link has been sent.",
      });
    }

    // If already verified, no need to resend
    if (user.emailVerified) {
      return NextResponse.json({
        ok: true,
        message: "This email is already verified.",
      });
    }

    // Generate new 6-digit OTP verification token
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationToken,
        verificationTokenExp: expiresAt,
      },
    });

    // Build verification link
    const verificationUrl = `${
      process.env.APP_URL ?? ""
    }/auth/verify-email?token=${encodeURIComponent(
      verificationToken
    )}&email=${encodeURIComponent(email)}`;

    // Send verification email
    try {
      const emailContent = emailTemplates.verification(
        user.fullName || "there",
        verificationToken,
        verificationUrl
      );

      await sendMail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`✅ Resent verification email to: ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return NextResponse.json({
      ok: true,
      message:
        "If an account exists with this email, a verification link has been sent.",
    });
  } catch (err) {
    console.error("Resend verification error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
