import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Validate required environment variables
const JWT_SECRET: string = process.env.JWT_SECRET || "fallback_secret";
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
