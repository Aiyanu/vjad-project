import { Response } from "express";

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

export function apiSuccess<T>(
  res: Response,
  data: T,
  message: string = "Success",
  status: number = 200
) {
  return res.status(status).json({
    success: true,
    status,
    data,
    message,
  });
}

export function apiError(
  res: Response,
  message: string = "An error occurred",
  status: number = 400,
  error?: any
) {
  if (error) {
    console.error(`[API Error ${status}] ${message}:`, error);
  } else {
    console.error(`[API Error ${status}] ${message}`);
  }

  return res.status(status).json({
    success: false,
    status,
    message,
  });
}
