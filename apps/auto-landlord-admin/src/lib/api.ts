import axios, { InternalAxiosRequestConfig, AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Get full URL for an image stored in R2
 * @param path - The relative path returned from upload API (e.g., /upload/r2/xxx)
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string): string => {
  if (!path) return "";
  // If already a full URL, return as-is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  // Construct full URL from API base
  return `${API_URL}${path}`;
};

// Token will be set by the auth provider
let authToken: string | null = null;

// Callback for handling auth errors (set by AuthProvider)
let onAuthError: (() => void) | null = null;

// Callback for refreshing token (set by AuthProvider)
let refreshTokenFn: (() => Promise<string | null>) | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const setAuthErrorHandler = (handler: () => void) => {
  onAuthError = handler;
};

export const setRefreshTokenFn = (fn: () => Promise<string | null>) => {
  refreshTokenFn = fn;
};

// Add interceptor for auth token
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If we have a refresh function, try to refresh the token
      if (refreshTokenFn) {
        if (isRefreshing) {
          // Wait for the refresh to complete
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (token && originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshTokenFn();
          if (newToken) {
            setAuthToken(newToken);
            processQueue(null, newToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          } else {
            // Token refresh returned null - user needs to log in again
            processQueue(new Error("Token refresh failed"), null);
            if (onAuthError) {
              onAuthError();
            }
            return Promise.reject(error);
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          // Refresh failed - trigger logout
          if (onAuthError) {
            onAuthError();
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // No refresh function - trigger logout
        console.error("Authentication error - please sign in again");
        if (onAuthError) {
          onAuthError();
        }
      }
    }

    return Promise.reject(error);
  }
);
