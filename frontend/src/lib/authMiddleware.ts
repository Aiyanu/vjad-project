import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export interface AuthUser {
  userId: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

export function authenticateToken(request: NextRequest): {
  user: AuthUser | null;
  error: string | null;
} {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, error: "No token provided" };
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    return {
      user: {
        userId: decoded.sub || decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      error: null,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return { user: null, error: "Invalid or expired token" };
  }
}

export function requireAuth(request: NextRequest, requiredRole?: string) {
  const { user, error } = authenticateToken(request);

  if (error || !user) {
    return { user: null, error: error || "Unauthorized", status: 401 };
  }

  if (requiredRole && user.role !== requiredRole) {
    return {
      user: null,
      error: `Forbidden: ${requiredRole} role required`,
      status: 403,
    };
  }

  return { user, error: null, status: 200 };
}

export function requireAdmin(
  request: NextRequest,
  requireSuperAdmin: boolean = false
) {
  const { user, error } = authenticateToken(request);

  if (error || !user) {
    return { user: null, error: error || "Unauthorized", status: 401 };
  }

  if (requireSuperAdmin && user.role !== "super_admin") {
    return {
      user: null,
      error: "Forbidden: Super admin access required",
      status: 403,
    };
  }

  if (!["admin", "super_admin"].includes(user.role)) {
    return {
      user: null,
      error: "Forbidden: Admin access required",
      status: 403,
    };
  }

  return { user, error: null, status: 200 };
}
