// src/app/api/auth/forgot/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";

function randomTokenHex(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json().catch(() => ({}));
    if (!email) return NextResponse.json({ ok: true }); // don't leak existence

    // Check if user exists in database before sending email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log(
        `❌ Password reset attempted for non-existent email: ${email}`
      );
      return NextResponse.json({ ok: true }); // silently succeed to prevent email enumeration
    }

    const token = randomTokenHex(16);
    const exp = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationTokenExp: exp },
    });

    const resetUrl = `${
      process.env.APP_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000"
    }/auth/reset-password?token=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;

    // Send password reset email
    try {
      const emailContent = emailTemplates.passwordReset(
        user.fullName || "there",
        resetUrl
      );

      await sendMail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`✅ Password reset email sent to: ${email}`);
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't expose email sending errors to the client
    }

    return NextResponse.json({
      ok: true,
      message: "If your account exists, you will receive a reset link.",
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
