import { Context, Next } from "hono";

/**
 * Request ID middleware
 * Generates a unique ID for each request for tracing purposes
 */
export const requestId = () => {
  return async (c: Context, next: Next) => {
    // Check if client provided a request ID
    const clientRequestId = c.req.header("X-Request-ID");
    
    // Use client's ID if provided, otherwise generate a new one
    const requestId = clientRequestId || crypto.randomUUID();
    
    // Store in context for access in route handlers
    c.set("requestId", requestId);
    
    // Add to response headers
    c.header("X-Request-ID", requestId);
    
    // Log request with ID
    const start = Date.now();
    await next();
    const duration = Date.now() - start;
    
    // Log completion
    console.log(
      JSON.stringify({
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })
    );
    
    return;
  };
};

