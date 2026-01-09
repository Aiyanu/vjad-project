// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { generateUniqueReferralCode } from "@/lib/referral";
import { sendMail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";

type Body = {
  email?: string;
  password?: string;
  fullName?: string;
  referralCode?: string;
  bankCode?: string;
  accountNumber?: string;
  accountName?: string;
};

function randomTokenHex(len = 32) {
  return crypto.randomBytes(len).toString("hex");
}

export async function POST(req: Request) {
  try {
    const body: Body = await req.json().catch(() => ({}));

    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const fullName = (body.fullName || "").trim();
    const inviterCode = body.referralCode?.trim() || undefined;
    const bankCode = (body.bankCode || "").trim();
    const accountNumber = (body.accountNumber || "").trim();

    if (!email || !password || password.length < 8) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (!bankCode || accountNumber.length !== 10) {
      return NextResponse.json(
        { error: "Bank code and 10-digit account number are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 409 }
      );
    }

    // Verify account server-side to avoid trusting client input
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey) {
      console.error("PAYSTACK_SECRET_KEY not configured");
      return NextResponse.json(
        { error: "Payment verification not configured" },
        { status: 500 }
      );
    }

    const verifyRes = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const verifyJson = await verifyRes.json();
    if (!verifyRes.ok || !verifyJson.status) {
      return NextResponse.json(
        { error: verifyJson.message || "Could not verify account" },
        { status: 400 }
      );
    }
    const verifiedAccountName: string | undefined =
      verifyJson.data?.account_name;
    if (!verifiedAccountName) {
      return NextResponse.json(
        { error: "Could not resolve account name" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode("VJ");

    // find inviter if provided
    let inviter = null;
    if (inviterCode) {
      inviter = await prisma.user.findUnique({
        where: { referralCode: inviterCode },
      });
    }

    // verification token (6-digit OTP)
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
        referralCode,
        referrerId: inviter?.id ?? null,
        // use verificationToken/verificationTokenExp for email verification
        verificationToken: verificationToken,
        verificationTokenExp: expiresAt,
        emailVerified: false,
        bankCode,
        accountNumber,
        accountName: verifiedAccountName,
      },
      select: { id: true, email: true, referralCode: true },
    });

    // Build verification link (send via email in prod)
    const verificationUrl = `${
      process.env.APP_URL ?? ""
    }/auth/verify?token=${encodeURIComponent(
      verificationToken
    )}&email=${encodeURIComponent(email)}`;

    // Send verification email
    try {
      const emailContent = emailTemplates.verification(
        fullName || "there",
        verificationToken,
        verificationUrl
      );

      await sendMail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      console.log(`✅ Verification email sent to: ${email}`);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Registered. Check your email to verify your account.",
        user,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
