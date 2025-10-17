import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetKeys?: unknown[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

function SomethingWentWrong({ onClick }: { onClick: () => void }) {
  return (
    <div className="p-4 bg-red-50 rounded border border-red-200">
      <p className="text-sm text-red-600 font-medium">Something went wrong</p>
      <button
        onClick={onClick}
        className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
      >
        Try again
      </button>
    </div>
  );
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // Send to error tracking service (Sentry, etc.)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props) {
    // Auto-reset error when resetKeys change (e.g., navigating to new page)
    if (this.state.hasError && this.props.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, i) => key !== prevProps.resetKeys?.[i],
      );
      if (hasChanged) {
        this.setState({ hasError: false, error: null });
      }
    }
  }

  render() {
    if (this.state.hasError) {
      // Show custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SomethingWentWrong
          onClick={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}
