import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { ZodError } from "zod";

interface ErrorResponse {
  error: string;
  message: string;
  details?: unknown;
  stack?: string;
}

/**
 * Global error handler for the Hono API
 * Catches and formats all errors consistently
 */
export const errorHandler = (err: Error, c: Context): Response => {
  // Log error for debugging (in production, send to monitoring service)
  console.error("[API Error]", {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
  });

  const response: ErrorResponse = {
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  };

  // Handle HTTP exceptions (from our middleware/routes)
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: getStatusText(err.status),
        message: err.message,
      },
      err.status
    );
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "Validation Error",
        message: "Invalid request data",
        details: err.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      400
    );
  }

  // Handle known error types
  if (err.name === "NotFoundError") {
    return c.json(
      {
        error: "Not Found",
        message: err.message,
      },
      404
    );
  }

  if (err.name === "UnauthorizedError") {
    return c.json(
      {
        error: "Unauthorized",
        message: err.message,
      },
      401
    );
  }

  if (err.name === "ForbiddenError") {
    return c.json(
      {
        error: "Forbidden",
        message: err.message,
      },
      403
    );
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return c.json(response, 500);
};

/**
 * Get human-readable status text for HTTP status codes
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return statusTexts[status] || "Error";
}

/**
 * Custom error classes for specific error types
 */
export class NotFoundError extends Error {
  constructor(message = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class ValidationError extends Error {
  constructor(message = "Validation failed") {
    super(message);
    this.name = "ValidationError";
  }
}

