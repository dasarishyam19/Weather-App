import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { logError, ErrorIds } from '../utils/logger';

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  padding: '2rem',
  textAlign: 'center',
};

const iconStyle = {
  marginBottom: '1rem',
};

const titleStyle = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  color: 'var(--text-primary)',
};

const messageStyle = {
  marginBottom: '1.5rem',
  color: 'var(--text-secondary)',
};

const errorDetailStyle = {
  display: 'block',
  marginTop: '1rem',
  fontSize: '0.875rem',
  color: '#ff6b6b',
};

const buttonsContainerStyle = {
  display: 'flex',
  gap: '1rem',
};

const buttonStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
};

const primaryButtonStyle = {
  ...buttonStyle,
  background: 'var(--accent-1)',
  color: 'white',
  border: 'none',
};

const secondaryButtonStyle = {
  ...buttonStyle,
  background: 'transparent',
  color: 'var(--text-primary)',
  border: '1px solid var(--text-muted)',
};

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
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
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
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-fallback" style={containerStyle}>
          <FiAlertTriangle size={64} style={iconStyle} />
          <h1 style={titleStyle}>Something went wrong</h1>
          <p style={messageStyle}>
            We're sorry, but the weather app encountered an unexpected error.
            {import.meta.env.DEV && this.state.error && (
              <span style={errorDetailStyle}>
                Error: {this.state.error.message}
              </span>
            )}
          </p>
          <div style={buttonsContainerStyle}>
            <button onClick={this.handleReset} style={primaryButtonStyle}>
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              style={secondaryButtonStyle}
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
