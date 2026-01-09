import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not defined");
}

const JWT_SECRET: string = process.env.JWT_SECRET;
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN ?? "7d";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signJwt(payload: Record<string, any>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
}

export function verifyJwt(token?: string): string | jwt.JwtPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
