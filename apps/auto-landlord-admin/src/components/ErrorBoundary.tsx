import { Component, ErrorInfo, ReactNode } from "react";
import { GlassCard } from "./Glass";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] items-center justify-center p-8">
          <GlassCard className="max-w-md text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-red-500/20">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={this.handleRetry}
              className="glass-button flex items-center gap-2 mx-auto bg-blue-500/20 hover:bg-blue-500/30 text-blue-300"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Wrapper component for pages/features
 */
export const PageErrorBoundary = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>{children}</ErrorBoundary>
);

