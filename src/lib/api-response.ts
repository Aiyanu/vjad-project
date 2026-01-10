/**
 * Standardized API Response Format
 * All API responses should follow this structure
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Helper to create a success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message: message || "Success",
  };
}

/**
 * Helper to create an error response
 */
export function errorResponse(
  error: string,
  message?: string
): ApiResponse<null> {
  return {
    success: false,
    error,
    message: message || error,
    data: null,
  };
}

/**
 * Type guard to check if response was successful
 */
export function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is ApiResponse<T> & { data: T } {
  return response.success && response.data !== undefined;
}
