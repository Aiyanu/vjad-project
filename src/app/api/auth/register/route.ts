// src/app/api/auth/register/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { generateUniqueReferralCode } from "@/lib/referral";
import { sendMail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";
import { apiSuccess, apiError } from "@/lib/api-response-server";

export const dynamic = "force-dynamic";

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
      const [response, status] = apiError("Invalid payload", 400);
      return NextResponse.json(response, { status });
    }

    if (!bankCode || accountNumber.length !== 10) {
      const [response, status] = apiError(
        "Bank code and 10-digit account number are required",
        400
      );
      return NextResponse.json(response, { status });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      const [response, status] = apiError("Account already exists", 409);
      return NextResponse.json(response, { status });
    }

    // Verify account server-side to avoid trusting client input
    // const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    // if (!paystackSecretKey) {
    //   console.error("PAYSTACK_SECRET_KEY not configured");
    //   const [response, status] = apiError(
    //     "Payment verification not configured",
    //     500
    //   );
    //   return NextResponse.json(response, { status });
    // }

    // const verifyRes = await fetch(
    //   `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    //   {
    //     headers: {
    //       Authorization: `Bearer ${paystackSecretKey}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // const verifyJson = await verifyRes.json();
    // if (!verifyRes.ok || !verifyJson.status) {
    //   const [response, status] = apiError(
    //     verifyJson.message || "Could not verify account",
    //     400
    //   );
    //   return NextResponse.json(response, { status });
    // }
    const verifiedAccountName: string | undefined =
      body.accountName || undefined;
    // if (!verifiedAccountName) {
    //   const [response, status] = apiError(
    //     "Could not resolve account name",
    //     400
    //   );
    //   return NextResponse.json(response, { status });
    // }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode("VJ");

    // find inviter if provided via affiliate referralCode
    let inviterAffiliate = null;
    if (inviterCode) {
      inviterAffiliate = await prisma.affiliate.findUnique({
        where: { referralCode: inviterCode },
        include: { user: true },
      });
    }

    // verification token (6-digit OTP)
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    // Use transaction to ensure atomicity of user + affiliate creation
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: fullName || null,
          // use verificationToken/verificationTokenExp for email verification
          verificationToken: verificationToken,
          verificationTokenExp: expiresAt,
          emailVerified: false,
        },
        select: { id: true, email: true },
      });

      // Create affiliate record for new user with bank details and referral code
      await tx.affiliate.create({
        data: {
          userId: createdUser.id,
          referralCode,
          referrerId: inviterAffiliate?.id ?? null,
          bankCode,
          accountNumber,
          accountName: verifiedAccountName,
        },
      });

      return createdUser;
    });

    // Build verification link (send via email in prod)
    const verificationUrl = `${
      process.env.APP_URL ?? ""
    }/auth/verify-email?token=${encodeURIComponent(
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

    const [response, status] = apiSuccess(
      { id: user.id, email: user.email, referralCode },
      "Registered. Check your email to verify your account.",
      201
    );
    return NextResponse.json(response, { status });
  } catch (err) {
    const [response, status] = apiError("Server error", 500, err);
    return NextResponse.json(response, { status });
  }
}
