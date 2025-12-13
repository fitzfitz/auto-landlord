import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "./ErrorBoundary";
import { ReactNode } from "react";
import { GlassCard } from "./Glass";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface QueryErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error boundary specifically for React Query errors
 * Provides automatic retry functionality for failed queries
 */
export const QueryErrorBoundary = ({ children }: QueryErrorBoundaryProps) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary
        fallback={
          <div className="flex min-h-[400px] items-center justify-center p-8">
            <GlassCard className="max-w-md text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <h2 className="text-xl font-bold mb-2">Failed to load data</h2>
              <p className="text-gray-400 mb-4">
                There was a problem fetching the data. Please try again.
              </p>
              <button
                onClick={reset}
                className="glass-button flex items-center gap-2 mx-auto bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
              >
                <RefreshCw size={16} />
                Retry
              </button>
            </GlassCard>
          </div>
        }
      >
        {children}
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);

