// src/lib/referral.ts
import { customAlphabet } from "nanoid";
import { prisma } from "./db";

const nano = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 7);

export async function generateUniqueReferralCode(prefix = "VJ") {
  for (let i = 0; i < 6; i++) {
    const code = `${prefix}-${nano()}`;
    const exists = await prisma.affiliate.findUnique({
      where: { referralCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}
