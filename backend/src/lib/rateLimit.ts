import { Response } from "express";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function rateLimit(config: RateLimitConfig) {
  return (
    identifier: string
  ): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime < now) {
      const resetTime = now + config.windowMs;
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime,
      });
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

export function rateLimitError(res: Response, resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return res.status(429)
    .set("Retry-After", retryAfter.toString())
    .set("X-RateLimit-Reset", new Date(resetTime).toISOString())
    .json({ error: "Too many requests. Please try again later." });
}

export const authRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 10,
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
});

export const resendCodeRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000,
  maxRequests: 5,
});
