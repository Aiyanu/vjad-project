import { NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

export function rateLimit(config: RateLimitConfig) {
  return (
    identifier: string
  ): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || entry.resetTime < now) {
      // First request or expired window
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
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Increment count
    entry.count++;
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

// Helper function to create rate limit response
export function rateLimitResponse(resetTime: number) {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "Retry-After": retryAfter.toString(),
        "X-RateLimit-Reset": new Date(resetTime).toISOString(),
      },
    }
  );
}

// Predefined rate limiters
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 requests per 15 minutes for auth endpoints
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute for general API
});

export const resendCodeRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 verification emails per hour
});
