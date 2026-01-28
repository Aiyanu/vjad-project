import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/db";
import { signJwt } from "../lib/auth";
import { authRateLimit, rateLimitError } from "../lib/rateLimit";
import { apiSuccess, apiError } from "../lib/api-response";
import { generateUniqueReferralCode } from "../lib/referral";
import { emailTemplates } from "../lib/emailTemplates";
import { sendMail } from "../lib/mailer";

const delay = (ms = 250) => new Promise((res) => setTimeout(res, ms));

export const login = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email || !password) {
      return apiError(res, "Email and password are required", 400);
    }

    const identifier = `login:${email}`;
    const rateLimitResult = authRateLimit(identifier);

    if (!rateLimitResult.allowed) {
      return rateLimitError(res, rateLimitResult.resetTime);
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
      },
    });

    if (!user) {
      await delay(300);
      return apiError(res, "Invalid credentials", 401);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      await delay(300);
      return apiError(res, "Invalid credentials", 401);
    }

    if (user.isDisabled) {
      return apiError(
        res,
        "Your account has been disabled. Please contact support.",
        403,
      );
    }

    if (!user.emailVerified) {
      return apiError(res, "Email not verified", 403, {
        email: user.email,
        isVerified: false,
      });
    }

    const token = signJwt({ sub: user.id, email: user.email, role: user.role });

    return apiSuccess(res, { token }, "Login successful");
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email: rawEmail,
      password,
      fullName: rawFullName,
      referralCode: inviterCode,
      bankCode: rawBankCode,
      accountNumber: rawAccountNumber,
      accountName,
    } = req.body;

    const email = (rawEmail || "").trim().toLowerCase();
    const fullName = (rawFullName || "").trim();
    const bankCode = (rawBankCode || "").trim();
    const accountNumber = (rawAccountNumber || "").trim();

    if (!email || !password || password.length < 8) {
      return apiError(
        res,
        "Email and password (min 8 chars) are required",
        400,
      );
    }

    if (!bankCode || accountNumber.length !== 10) {
      return apiError(
        res,
        "Bank code and 10-digit account number are required",
        400,
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return apiError(res, "Account already exists", 409);
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await generateUniqueReferralCode("VJ");

    let inviterAffiliate = null;
    if (inviterCode) {
      inviterAffiliate = await prisma.affiliate.findUnique({
        where: { referralCode: inviterCode },
        include: { user: true },
      });
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    const user = await prisma.$transaction(async (tx: any) => {
      const createdUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: fullName || null,
          verificationToken: verificationToken,
          verificationTokenExp: expiresAt,
          emailVerified: false,
        },
        select: { id: true, email: true },
      });

      await tx.affiliate.create({
        data: {
          userId: createdUser.id,
          referralCode,
          referrerId: inviterAffiliate?.id ?? null,
          bankCode,
          accountNumber,
          accountName: accountName || undefined,
        },
      });

      return createdUser;
    });

    const verificationUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/auth/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;

    try {
      const emailContent = emailTemplates.verification(
        fullName || "there",
        verificationToken,
        verificationUrl,
      );

      await sendMail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return apiSuccess(
      res,
      { id: user.id, email: user.email, referralCode },
      "Registered successfully. Please check your email to verify your account.",
      201,
    );
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return apiError(res, "Invalid verification link", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email: String(email) },
    });
    if (!user) {
      return apiError(res, "Invalid verification link", 400);
    }

    if (user.verificationToken !== String(token)) {
      return apiError(res, "Invalid or expired token", 400);
    }

    if (!user.verificationTokenExp || user.verificationTokenExp < new Date()) {
      return apiError(res, "Token expired", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    return apiSuccess(res, null, "Email verified successfully");
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};

export const resendVerification = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail } = req.body;
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email) {
      return apiError(res, "Email is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { affiliate: true },
    });

    if (!user) {
      return apiSuccess(
        res,
        null,
        "If an account exists, a new verification code has been sent.",
      );
    }

    if (user.emailVerified) {
      return apiError(res, "Email is already verified", 400);
    }

    const verificationToken = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExp: expiresAt,
      },
    });

    const verificationUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/auth/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;

    try {
      const emailContent = emailTemplates.verification(
        user.fullName || "there",
        verificationToken,
        verificationUrl,
      );

      await sendMail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
    }

    return apiSuccess(
      res,
      null,
      "Verification code resent. Please check your email.",
    );
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email: rawEmail } = req.body;
    const email = (rawEmail || "").trim().toLowerCase();

    if (!email) {
      return apiSuccess(
        res,
        null,
        "If an account exists, a reset link will be sent.",
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return apiSuccess(
        res,
        null,
        "If an account exists, a reset link will be sent.",
      );
    }

    const token = crypto.randomBytes(16).toString("hex");
    const exp = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token, verificationTokenExp: exp },
    });

    const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/auth/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;

    try {
      const emailContent = emailTemplates.passwordReset(
        user.fullName || "there",
        resetUrl,
      );
      await sendMail({
        to: email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
    }

    return apiSuccess(
      res,
      null,
      "If an account exists, a reset link will be sent.",
    );
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return apiError(res, "Email, token and new password are required", 400);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.verificationToken !== token) {
      return apiError(res, "Invalid or expired token", 400);
    }

    if (!user.verificationTokenExp || user.verificationTokenExp < new Date()) {
      return apiError(res, "Token expired", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        verificationToken: null,
        verificationTokenExp: null,
      },
    });

    return apiSuccess(
      res,
      null,
      "Password reset successfully. You can now login.",
    );
  } catch (err) {
    return apiError(res, "Server error", 500, err);
  }
};

import crypto from "crypto";
