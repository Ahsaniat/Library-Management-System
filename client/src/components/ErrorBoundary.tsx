import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Unhandled UI error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div
            className="max-w-md w-full rounded-lg p-8 text-center"
            style={{
              backgroundColor: 'var(--parchment-light)',
              border: '1px solid var(--parchment-border)',
            }}
          >
            <h1 className="text-2xl font-bold mb-3" style={{ color: 'var(--ink-primary)' }}>
              Something went wrong
            </h1>
            <p className="mb-4" style={{ color: 'var(--ink-secondary)' }}>
              An unexpected error occurred. Reload the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg text-white"
              style={{ backgroundColor: 'var(--accent-warm)' }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
