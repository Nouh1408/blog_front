import { AxiosError } from "axios";

export interface ParsedApiError {
  generalMessage: string | null;
  fieldErrors: Record<string, string>;
  isRateLimited: boolean;
}

export function parseApiError(error: unknown): ParsedApiError {
  const axiosError = error as AxiosError<{
    message?: string;
    errors?: Array<{ field: string; message: string }>;
  }>;

  const status = axiosError.response?.status;
  const data = axiosError.response?.data;

  // 1. Handle Rate Limiting (HTTP 429)
  if (status === 429) {
    return {
      generalMessage:
        data?.message ||
        "Too many attempts. Please try again after 15 minutes.",
      fieldErrors: {},
      isRateLimited: true,
    };
  }

  // 2. Zod validation errors (HTTP 400 with errors array)
  if (data?.errors && Array.isArray(data.errors)) {
    const fieldErrors: Record<string, string> = {};
    for (const err of data.errors) {
      if (err.field && err.message) {
        fieldErrors[err.field] = err.message;
      }
    }

    return {
      generalMessage: data.message || "Please correct the highlighted errors.",
      fieldErrors,
      isRateLimited: false,
    };
  }

  // 3. Handle standard API errors (e.g., 401, 404, 409)
  if (data?.message) {
    return {
      generalMessage: data.message,
      fieldErrors: {},
      isRateLimited: false,
    };
  }

  // 4. Fallback for network errors or unhandled exceptions
  return {
    generalMessage:
      axiosError.message || "An unexpected error occurred. Please try again.",
    fieldErrors: {},
    isRateLimited: false,
  };
}