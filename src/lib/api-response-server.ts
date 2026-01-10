//* Server-side API Response Helpers
//* Use these in all API routes (app/api/**/route.ts files)

import { NextResponse } from "next/server";

export interface ApiSuccessResponse<T = any> {
  success: true;
  status: number;
  data?: T;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  status: number;
  message: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Create a success response
 * @param data The data to return
 * @param message User-friendly message
 * @param status HTTP status code (default: 200)
 */
export function apiSuccess<T>(
  data: T,
  message: string = "Success",
  status: number = 200
): [ApiSuccessResponse<T>, number] {
  return [
    {
      success: true,
      status,
      data,
      message,
    },
    status,
  ];
}

/**
 * Create an error response
 * @param message Error message to return to client
 * @param status HTTP status code (default: 400)
 * @param error Optional error object to log
 */
export function apiError(
  message: string = "An error occurred",
  status: number = 400,
  error?: any
): [ApiErrorResponse, number] {
  // Log error details to console for debugging
  if (error) {
    console.error(`[API Error ${status}] ${message}:`, error);
  } else {
    console.error(`[API Error ${status}] ${message}`);
  }

  return [
    {
      success: false,
      status,
      message,
    },
    status,
  ];
}

/**
 * Usage in API routes:
 *
 * // Success response
 * const [response, status] = apiSuccess({ id: "123" }, "User created", 201);
 * return NextResponse.json(response, { status });
 *
 * // Error response
 * const [response, status] = apiError("Invalid email", 400);
 * return NextResponse.json(response, { status });
 *
 * // Error with logging
 * const [response, status] = apiError("Database error", 500, err);
 * return NextResponse.json(response, { status });
 */
