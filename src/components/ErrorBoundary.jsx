import React from 'react';
import { logError, ErrorIds } from '../utils/logger';

/**
 * Error Boundary Component
 * Catches React component errors and displays a friendly fallback UI
 * instead of a blank white screen. Logs all errors for debugging.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to our logging service
    logError(ErrorIds.VALIDATION_ERROR, error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise use default
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="error-fallback"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '1rem',
            }}
          >
            ⚠️
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              marginBottom: '1rem',
              color: 'var(--text-primary)',
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              marginBottom: '1.5rem',
              color: 'var(--text-secondary)',
            }}
          >
            We're sorry, but the weather app encountered an unexpected error.
            {import.meta.env.DEV && this.state.error && (
              <span
                style={{
                  display: 'block',
                  marginTop: '1rem',
                  fontSize: '0.875rem',
                  color: '#ff6b6b',
                }}
              >
                Error: {this.state.error.message}
              </span>
            )}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'var(--accent-1)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--text-muted)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
