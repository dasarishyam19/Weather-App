# Weather App - Complete Code Flow Documentation

This document provides a line-by-line explanation of how the Weather App works from application startup to rendering.

## Table of Contents

1. [Application Entry Point](#application-entry-point)
2. [App Component](#app-component)
3. [WeatherProvider Context](#weatherprovider-context)
4. [ErrorBoundary Component](#errorboundary-component)
5. [SearchBar Component](#searchbar-component)
6. [WeatherCard Component](#weathercard-component)
7. [WeatherDetails Component](#weatherdetails-component)
8. [HourlyForecast Component](#hourlyforecast-component)
9. [ForecastSection Component](#forecastsection-component)
10. [API Layer](#api-layer)
11. [Logger Utility](#logger-utility)

---

## Application Entry Point

### File: `src/main.jsx`

```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css'; // 1. Import global CSS styles
import App from './App.jsx'; // 2. Import the main App component
import { motion } from 'framer-motion'; // 3. Import animation library (unused here)

// 4. Get the DOM element with id 'root' (from index.html)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {' '}
    // 5. Enable React strict mode for development checks
    <App /> // 6. Render the App component as the root
  </StrictMode>
);
```

**What happens:**

1. React imports CSS styles first
2. Imports the main App component
3. Finds the `<div id="root"></div>` in index.html
4. Creates a React root and renders the App component

---

## App Component

### File: `src/App.jsx`

```javascript
// 1. Import the WeatherProvider context wrapper
import { WeatherProvider } from './context/WeatherContext';

// 2. Import the SearchBar component for city search
import SearchBar from './components/SearchBar';

// 3. Import the ThemeToggle component for dark/light mode
import ThemeToggle from './components/ThemeToggle';

// 4. Import the hook to access weather context
import { useWeatherContext } from './context/useWeatherContext';

// 5. Import the Home page component
import Home from './pages/Home';

// 6. Import the ErrorBoundary component for error handling
import ErrorBoundary from './components/ErrorBoundary';

// 7. Import global CSS styles
import './styles/index.css';

// 8. Define the Header component that displays app title and controls
const Header = () => {
  // 9. Destructure units and toggleUnits from weather context
  const { units, toggleUnits } = useWeatherContext();

  // 10. Return the header JSX
  return (
    <header className="app-header">
      {' '}
      // 11. Header container with CSS class
      <div className="app-logo">⛅ WeatherNow</div> // 12. App logo with emoji
      {/* 13. SearchBar component - allows users to search for cities */}
      <SearchBar />
      {/* 14. Header controls container */}
      <div className="header-controls">
        {/* 15. Unit toggle button - switches between metric (°C) and imperial (°F) */}
        <button className="unit-toggle" onClick={toggleUnits}>
          {units === 'metric' ? '°C → °F' : '°F → °C'} // 16. Button text shows
          current conversion direction
        </button>

        {/* 17. Theme toggle component - switches between dark and light mode */}
        <ThemeToggle />
      </div>
    </header>
  );
};

// 18. Define the inner app component (wrapped by providers)
const AppInner = () => (
  <div className="app-wrapper">
    {' '}
    // 19. Main app wrapper div
    <Header /> // 20. Render the header
    <Home /> // 21. Render the home page content
  </div>
);

// 22. Define the main App component with error boundary and providers
const App = () => (
  <ErrorBoundary>
    {' '}
    // 23. Wrap everything in ErrorBoundary
    <WeatherProvider>
      {' '}
      // 24. Wrap everything in WeatherProvider context
      <AppInner /> // 25. Render the inner app component
    </WeatherProvider>
  </ErrorBoundary>
);

// 26. Export App as default export
export default App;
```

**What happens:**

1. All necessary imports are loaded
2. Header component accesses weather context for unit toggle
3. Header renders SearchBar, unit toggle button, and theme toggle
4. App wraps everything in ErrorBoundary (catches React errors) and WeatherProvider (provides weather state)
5. AppInner renders Header and Home components

---

## ErrorBoundary Component

### File: `src/components/ErrorBoundary.jsx`

```javascript
// 1. Import React for creating class components
import React from 'react';

// 2. Import FiAlertTriangle icon from react-icons
import { FiAlertTriangle } from 'react-icons/fi';

// 3. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 4. Define styles for the error container (flexbox centered layout)
const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px', // 5. Minimum height ensures visibility
  padding: '2rem',
  textAlign: 'center',
};

// 6. Define styles for the warning icon
const iconStyle = {
  marginBottom: '1rem',
};

// 7. Define styles for the error title
const titleStyle = {
  fontSize: '1.5rem',
  marginBottom: '1rem',
  color: 'var(--text-primary)', // 8. Uses CSS variable for theming
};

// 9. Define styles for the error message
const messageStyle = {
  marginBottom: '1.5rem',
  color: 'var(--text-secondary)',
};

// 10. Define styles for error details (shown only in development)
const errorDetailStyle = {
  display: 'block',
  marginTop: '1rem',
  fontSize: '0.875rem',
  color: '#ff6b6b', // 11. Red color for error messages
};

// 12. Define styles for the button container
const buttonsContainerStyle = {
  display: 'flex',
  gap: '1rem', // 13. Space between buttons
};

// 14. Define common button styles
const buttonStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '1rem',
};

// 15. Define primary button styles (filled accent color)
const primaryButtonStyle = {
  ...buttonStyle, // 16. Spread common button styles
  background: 'var(--accent-1)',
  color: 'white',
  border: 'none',
};

// 17. Define secondary button styles (outlined)
const secondaryButtonStyle = {
  ...buttonStyle, // 18. Spread common button styles
  background: 'transparent',
  color: 'var(--text-primary)',
  border: '1px solid var(--text-muted)',
};

// 19. Documentation comment explaining the component's purpose
/**
 * Error Boundary Component
 * Catches React component errors and displays a friendly fallback UI
 * instead of a blank white screen. Logs all errors for debugging.
 */

// 20. Define ErrorBoundary as a React class component
class ErrorBoundary extends React.Component {
  // 21. Constructor initializes component state
  constructor(props) {
    super(props); // 22. Call parent React.Component constructor
    // 23. Initialize state to track error status
    this.state = {
      hasError: false, // 24. Whether an error has occurred
      error: null, // 25. The error object (if any)
      errorInfo: null, // 26. Additional React error info
    };
  }

  // 27. Static method called when an error is thrown in a child component
  static getDerivedStateFromError(error) {
    // 28. Update state to show the fallback UI
    return { hasError: true, error };
  }

  // 29. Lifecycle method called when an error is caught
  componentDidCatch(error, errorInfo) {
    // 30. Log the error using our structured logging utility
    logError(ErrorIds.VALIDATION_ERROR, error, {
      componentStack: errorInfo.componentStack, // 31. Include React component stack
      errorBoundary: true, // 32. Flag indicating this came from ErrorBoundary
    });
  }

  // 33. Method to reset error state and try again
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  // 34. Render method determines what to display based on error state
  render() {
    // 35. Check if an error has occurred
    if (this.state.hasError) {
      // 36. If a custom fallback was provided as a prop, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 37. Otherwise, render the default error UI
      return (
        <div className="error-fallback" style={containerStyle}>
          {/* 38. Display warning icon */}
          <FiAlertTriangle size={64} style={iconStyle} />

          {/* 39. Error title */}
          <h1 style={titleStyle}>Something went wrong</h1>

          {/* 40. Error message with optional details in development */}
          <p style={messageStyle}>
            We're sorry, but the weather app encountered an unexpected error.
            {/* 41. In development mode, show the actual error message */}
            {import.meta.env.DEV && this.state.error && (
              <span style={errorDetailStyle}>
                Error: {this.state.error.message}
              </span>
            )}
          </p>

          {/* 42. Action buttons */}
          <div style={buttonsContainerStyle}>
            {/* 43. Try Again button - resets error state and re-renders children */}
            <button onClick={this.handleReset} style={primaryButtonStyle}>
              Try Again
            </button>

            {/* 44. Reload Page button - does a full page reload */}
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

    // 45. If no error, render children normally
    return this.props.children;
  }
}

// 46. Export ErrorBoundary as default export
export default ErrorBoundary;
```

**What happens:**

1. ErrorBoundary wraps the entire app
2. Normally, it just renders its children (the app)
3. When a component throws an error:
   - `getDerivedStateFromError` updates state to show error UI
   - `componentDidCatch` logs the error with context
   - `render` displays error fallback with icon and buttons
4. User can click "Try Again" to reset error state or "Reload Page" to refresh

---

## WeatherProvider Context

### File: `src/context/WeatherContext.jsx`

```javascript
// 1. Import React hooks and context creation
import React, { createContext, useState, useCallback, useEffect } from 'react';

// 2. Import API functions
import {
  fetchCurrentWeather,                                 // 3. Fetch current weather by city name
  fetchCurrentWeatherByCoords,                         // 4. Fetch current weather by coordinates
  fetchForecast,                                       // 5. Fetch 5-day forecast by city name
  fetchForecastByCoords,                               // 6. Fetch 5-day forecast by coordinates
} from '../api/weatherApi';

// 7. Import error logging utilities
import {
  logError,                                            // 8. Log errors with structured data
  normalizeError,                                      // 9. Convert errors to Error objects
  readLocalStorage,                                    // 10. Read from localStorage with error handling
  writeLocalStorage,                                   // 11. Write to localStorage with error handling
  ErrorIds,                                            // 12. Error identifier constants
} from '../utils/logger';

// 13. Create the WeatherContext object
const WeatherContext = createContext();

// 14. Define valid unit values (for validation)
const VALID_UNITS = ['metric', 'imperial'];

// 15. Define valid theme values (for validation)
const VALID_THEMES = ['dark', 'light'];

// 16. Helper function to generate appropriate API error messages
const getApiErrorMessage = (error) => {
  const status = error.response?.status;                // 17. Get HTTP status code if available
  const isNetworkError = !error.response && error.message === 'Network Error';

  // 18. Return specific message based on error type
  if (status === 401) {
    return 'API authentication failed. Please check your configuration.';
  }
  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (status === 404) {
    return 'City not found. Please check the spelling and try again.';
  }
  if (isNetworkError) {
    return 'Network error. Please check your connection and try again.';
  }
  return error.response?.data?.message || 'City not found. Please try again.';
};

// 19. Helper function to generate geolocation error messages
const getGeolocationErrorMessage = (error) => {
  const status = error.response?.status;
  const isNetworkError = !error.response && error.message === 'Network Error';

  // 20. Return specific message based on error type
  if (status === 401) {
    return 'API authentication failed. Please check your configuration.';
  }
  if (status === 429) {
    return 'Too many requests. Please wait a moment and try again.';
  }
  if (status === 404) {
    return 'Unable to find weather for your location.';
  }
  if (isNetworkError) {
    return 'Network error. Please check your connection and try again.';
  }
  return 'Could not fetch weather for your location.';
};

// 21. Define the WeatherProvider component that wraps the app
export const WeatherProvider = ({ children }) => {

  // ========== STATE INITIALIZATION ==========

  // 22. Initialize city state with default value 'Kolkata'
  const [city, setCity] = useState('Kolkata');

  // 23. Initialize units state from localStorage or default to 'metric'
  const [units, setUnits] = useState(() =>
    readLocalStorage(
      'units',                                           // 24. localStorage key
      'metric',                                          // 25. Default value
      ErrorIds.LOCAL_STORAGE_UNITS_FAILED,               // 26. Error ID to use if read fails
      (saved) => (VALID_UNITS.includes(saved) ? saved : 'metric') // 27. Validator function
    )
  );

  // 28. Initialize theme state from localStorage or default to 'dark'
  const [theme, setTheme] = useState(() =>
    readLocalStorage(
      'theme',
      'dark',
      ErrorIds.LOCAL_STORAGE_THEME_FAILED,
      (saved) => (VALID_THEMES.includes(saved) ? saved : 'dark')
    )
  );

  // 29. Initialize current weather state (null = no data loaded yet)
  const [current, setCurrent] = useState(null);

  // 30. Initialize forecast state (null = no data loaded yet)
  const [forecast, setForecast] = useState(null);

  // 31. Initialize loading state (false = not currently loading)
  const [loading, setLoading] = useState(false);

  // 32. Initialize error state (null = no error)
  const [error, setError] = useState(null);

  // 33. Initialize recent cities from localStorage with array parsing
  const [recentCities, setRecentCities] = useState(() => {
    // 34. Define parser function to convert JSON string to array
    const parseArray = (saved) => {
      const parsed = JSON.parse(saved);                  // 35. Parse JSON string
      return Array.isArray(parsed) ? parsed : null;      // 36. Return null if not an array
    };

    // 37. Read from localStorage with custom parser
    const result = readLocalStorage(
      'recentCities',
      null,                                              // 38. Default to null if read fails
      ErrorIds.LOCAL_STORAGE_RECENT_CITIES_PARSE_FAILED,
      parseArray
    );

    // 39. If result is null (corrupted data), clear localStorage
    if (result === null) {
      try {
        localStorage.removeItem('recentCities');         // 40. Remove corrupted data
      } catch (cleanupError) {
        // 41. Log cleanup error with structured logging
        logError(
          ErrorIds.LOCAL_STORAGE_FAILED,
          cleanupError instanceof Error
            ? cleanupError
            : new Error(String(cleanupError)),
          {
            operation: 'cleanup_corrupted_data',
            key: 'recentCities',
          }
        );
      }
      return [];                                          // 42. Return empty array as fallback
    }
    return result;                                        // 43. Return parsed array
  });

  // ========== CORE FUNCTIONS ==========

  // 44. Load weather data for a specific city
  const loadWeather = useCallback(
    async (cityName, unitPref = units) {                 // 45. Accept city name and optional units
      setLoading(true);                                  // 46. Set loading state to true
      setError(null);                                    // 47. Clear any previous errors

      try {
        // 48. Fetch both current weather and forecast in parallel for speed
        const [cur, fore] = await Promise.all([
          fetchCurrentWeather(cityName, unitPref),       // 49. Fetch current weather
          fetchForecast(cityName, unitPref),              // 50. Fetch 5-day forecast
        ]);

        // 51. Update state with fetched data
        setCurrent(cur);                                 // 52. Store current weather data
        setForecast(fore);                               // 53. Store forecast data
        setCity(cityName);                               // 54. Update current city name

        // 55. Update recent cities list
        setRecentCities((prev) => {
          // 56. Add new city at the beginning, remove duplicates
          const next = [
            cityName,
            ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase()),
          ].slice(0, 5);                                 // 57. Keep only the 5 most recent

          // 58. Save to localStorage with error handling
          writeLocalStorage('recentCities', JSON.stringify(next), ErrorIds.LOCAL_STORAGE_FAILED);

          return next;
        });
      } catch (err) {
        // 59. Handle errors from API calls
        const error = normalizeError(err);               // 60. Ensure error is an Error object

        // 61. Log the error with context
        if (error.response?.status) {
          logError(ErrorIds.API_NETWORK_ERROR, error, {
            city: cityName,
            status: error.response.status,
            data: error.response.data,
          });
        } else {
          logError(ErrorIds.WEATHER_LOAD_FAILED, error, { city: cityName });
        }

        // 62. Set user-facing error message
        setError(getApiErrorMessage(error));
      } finally {
        // 63. Always execute this code (success or error)
        setLoading(false);                               // 64. Set loading state to false
      }
    },
    [units]                                               // 65. Recreate function when units change
  );

  // 66. Load weather data for specific coordinates (latitude/longitude)
  const loadWeatherByCoords = useCallback(
    async (lat, lon) => {                                 // 67. Accept latitude and longitude
      setLoading(true);
      setError(null);

      try {
        // 68. Fetch both current weather and forecast in parallel
        const [cur, fore] = await Promise.all([
          fetchCurrentWeatherByCoords(lat, lon, units),   // 69. Fetch by coordinates
          fetchForecastByCoords(lat, lon, units),         // 70. Fetch forecast by coordinates
        ]);

        // 71. Update state with fetched data
        setCurrent(cur);
        setForecast(fore);
        setCity(cur.name);                                // 72. Use city name from API response
      } catch (err) {
        // 73. Handle errors from API calls
        const error = normalizeError(err);

        // 74. Log the error with context
        logError(ErrorIds.GEOLOCATION_FAILED, error, {
          lat,
          lon,
          status: error.response?.status,
        });

        // 75. Set user-facing error message
        setError(getGeolocationErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [units]                                               // 76. Recreate function when units change
  );

  // 77. Toggle between metric and imperial units
  const toggleUnits = useCallback(() => {
    const next = units === 'metric' ? 'imperial' : 'metric'; // 78. Calculate new units value
    setUnits(next);

    // 79. Save to localStorage with error handling
    writeLocalStorage('units', next, ErrorIds.LOCAL_STORAGE_UNITS_FAILED);

    // 80. Reload weather data with new units if a city is selected
    if (city) loadWeather(city, next);
  }, [units, city, loadWeather]);                         // 81. Dependencies for useCallback

  // 82. Toggle between dark and light theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {                                  // 83. Use functional update to access previous value
      const next = prev === 'dark' ? 'light' : 'dark';    // 84. Calculate new theme value

      // 85. Save to localStorage with error handling
      writeLocalStorage('theme', next, ErrorIds.LOCAL_STORAGE_THEME_FAILED);

      return next;
    });
  }, []);                                                 // 86. No dependencies, function never changes

  // ========== SIDE EFFECTS ==========

  // 87. Load weather for default city on component mount
  useEffect(() => {
    loadWeather(city);                                    // 88. Load weather for default city (Kolkata)
  }, []);                                                 // 89. Empty array = run only once on mount

  // 90. Apply theme to document element when theme state changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme); // 91. Set data-theme attribute on <html>
  }, [theme]);                                            // 92. Run whenever theme changes

  // ========== CONTEXT PROVIDER ==========

  // 93. Render the context provider with all state and functions
  return (
    <WeatherContext.Provider
      value={{
        city,                                              // 94. Current city name
        units,                                             // 95. Current unit system (metric/imperial)
        theme,                                             // 96. Current theme (dark/light)
        current,                                           // 97. Current weather data
        forecast,                                          // 98. Forecast data
        loading,                                           // 99. Loading state
        error,                                             // 100. Error message
        recentCities,                                      // 101. List of recent cities
        loadWeather,                                       // 102. Function to load weather by city
        loadWeatherByCoords,                               // 103. Function to load weather by coordinates
        toggleUnits,                                       // 104. Function to toggle units
        toggleTheme,                                       // 105. Function to toggle theme
      }}
    >
      {children}                                          // 106. Render child components
    </WeatherContext.Provider>
  );
};

// 107. Export WeatherContext for use in other components
export { WeatherContext };
```

**What happens:**

1. WeatherProvider initializes all state from localStorage or defaults
2. On mount, loads weather for default city (Kolkata)
3. Provides weather state, functions, and setters to all child components
4. All weather data loading is centralized here
5. Handles all API errors and provides user-friendly messages
6. Saves user preferences (units, theme, recent cities) to localStorage

---

## useWeatherContext Hook

### File: `src/context/useWeatherContext.js`

```javascript
// 1. Import useContext hook from React
import { useContext } from 'react';

// 2. Import the WeatherContext
import { WeatherContext } from './WeatherContext';

// 3. Create and export a custom hook for accessing weather context
export const useWeatherContext = () => {
  // 4. Get the current context value
  const context = useContext(WeatherContext);

  // 5. Error handling: ensure hook is used within WeatherProvider
  if (!context) {
    throw new Error('useWeatherContext must be used within a WeatherProvider');
  }

  // 6. Return the context value
  return context;
};

// 7. Export WeatherContext for direct access (rarely needed)
export { WeatherContext };
```

**What happens:**

1. Custom hook wraps useContext for easier typing
2. Throws descriptive error if used outside WeatherProvider
3. Returns the current context value (all weather state and functions)

---

## Logger Utility

### File: `src/utils/logger.js`

```javascript
// 1. Define all error IDs as constants for consistent tracking
export const ErrorIds = {
  LOCAL_STORAGE_FAILED: 'local_storage_failed',
  LOCAL_STORAGE_UNITS_FAILED: 'local_storage_units_failed',
  LOCAL_STORAGE_THEME_FAILED: 'local_storage_theme_failed',
  LOCAL_STORAGE_RECENT_CITIES_PARSE_FAILED:
    'local_storage_recent_cities_parse_failed',
  API_NETWORK_ERROR: 'api_network_error',
  API_RATE_LIMIT: 'api_rate_limit',
  API_AUTH_FAILED: 'api_auth_failed',
  API_NOT_FOUND: 'api_not_found',
  API_SERVER_ERROR: 'api_server_error',
  API_TIMEOUT: 'api_timeout',
  GEOLOCATION_DENIED: 'geolocation_denied',
  GEOLOCATION_UNAVAILABLE: 'geolocation_unavailable',
  GEOLOCATION_TIMEOUT: 'geolocation_timeout',
  GEOLOCATION_FAILED: 'geolocation_failed',
  CITY_SEARCH_FAILED: 'city_search_failed',
  WEATHER_LOAD_FAILED: 'weather_load_failed',
  VALIDATION_ERROR: 'validation_error',
};

// 2. Normalize error to ensure it's an Error object (has stack trace)
export const normalizeError = (error) =>
  error instanceof Error ? error : new Error(String(error));

// 3. Helper function to read from localStorage with error handling
export const readLocalStorage = (key, defaultValue, errorId, parser) => {
  try {
    const saved = localStorage.getItem(key); // 4. Attempt to read value
    if (saved) {
      return parser ? parser(saved) : saved; // 5. Parse if parser provided
    }
  } catch (error) {
    // 6. Log error with structured data
    logError(errorId, normalizeError(error), { operation: `read_${key}` });
  }
  return defaultValue; // 7. Return default if read fails
};

// 8. Helper function to write to localStorage with error handling
export const writeLocalStorage = (key, value, errorId) => {
  try {
    localStorage.setItem(key, value); // 9. Attempt to write value
  } catch (error) {
    // 10. Log error with structured data
    logError(errorId, normalizeError(error), { operation: `save_${key}` });
  }
};

/**
 * Logs an error with structured data
 * In development: logs to console with full details
 * In production: can be extended to send to error tracking service
 */
export const logError = (errorId, error, context = {}) => {
  // 11. Extract error message (handle both Error objects and strings)
  const errorMessage = error instanceof Error ? error.message : error;

  // 12. Extract stack trace if available
  const errorStack = error instanceof Error ? error.stack : undefined;

  // 13. Build error data object with all context
  const errorData = {
    errorId, // 14. Unique error identifier
    message: errorMessage, // 15. Human-readable error message
    stack: errorStack, // 16. Stack trace for debugging
    context, // 17. Additional context object
    timestamp: new Date().toISOString(), // 18. When the error occurred
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // 19. In development, log detailed error to console
  if (import.meta.env.DEV) {
    console.error(`[${errorId}]`, errorMessage);
    console.error('Context:', context);
    if (errorStack) {
      console.error('Stack:', errorStack);
    }
  }

  // 20. In production, send to error tracking service
  // Uncomment when you have Sentry, LogRocket, or similar service configured
  /*
  if (import.meta.env.PROD) {
    // Example with Sentry:
    // Sentry.captureException(error instanceof Error ? error : new Error(errorMessage), {
    //   tags: { errorId },
    //   extra: context
    // });

    // Example with custom endpoint:
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // }).catch(() => {
    //   // Silently fail if error logging fails
    // });
  }
  */

  return errorData; // 21. Return error data for testing
};

/**
 * Logs a warning (non-critical issue)
 */
export const logWarning = (message, context = {}) => {
  if (import.meta.env.DEV) {
    console.warn(`[WARNING]`, message);
    console.warn('Context:', context);
  }
};

/**
 * Logs an info message (for debugging)
 */
export const logInfo = (message, context = {}) => {
  if (import.meta.env.DEV) {
    console.log(`[INFO]`, message);
    console.log('Context:', context);
  }
};
```

**What happens:**

1. ErrorIds constants provide unique identifiers for each error type
2. normalizeError ensures all errors are Error objects with stack traces
3. readLocalStorage and writeLocalStorage provide safe localStorage access with automatic error logging
4. logError creates structured error data with timestamp, userAgent, URL, and context
5. In development, logs detailed errors to console
6. Ready for production integration with Sentry or similar services

---

## API Layer

### File: `src/api/weatherApi.js`

```javascript
// 1. Import axios for HTTP requests
import axios from 'axios';

// 2. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 3. Get API key from environment variables
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

// 4. Get base URL from environment variables
const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;

// 5. Define reusable error message for missing API key
const API_KEY_ERROR =
  'API key is not configured. Please check your environment variables.';

// 6. Validate API key on module load
if (!API_KEY) {
  logError(
    ErrorIds.API_AUTH_FAILED,
    new Error('VITE_WEATHER_API_KEY is not configured'),
    {
      configCheck: 'missing_api_key',
      environment: import.meta.env.MODE, // 7. Log environment (dev/prod)
    }
  );
}

// 8. Validate base URL on module load
if (!BASE_URL) {
  logError(
    ErrorIds.API_AUTH_FAILED,
    new Error('VITE_WEATHER_BASE_URL is not configured'),
    {
      configCheck: 'missing_base_url',
      environment: import.meta.env.MODE,
    }
  );
}

// 9. Create axios instance with base configuration
const api = axios.create({
  baseURL: BASE_URL, // 10. Use base URL for all requests
  timeout: 10000, // 11. 10 second timeout for all requests
});

// 12. Helper function to ensure API key exists before making requests
const ensureApiKey = () => {
  if (!API_KEY) {
    throw new Error(API_KEY_ERROR);
  }
};

// 13. Fetch current weather by city name
export const fetchCurrentWeather = async (city, units = 'metric') => {
  ensureApiKey(); // 14. Throw error if API key is missing
  const response = await api.get('/data/2.5/weather', {
    params: {
      // 15. Query parameters
      q: city, // 16. City name
      appid: API_KEY, // 17. API key for authentication
      units, // 18. Unit system (metric/imperial)
    },
  });
  return response.data; // 19. Return response data (weather info)
};

// 20. Fetch current weather by coordinates
export const fetchCurrentWeatherByCoords = async (
  lat,
  lon,
  units = 'metric'
) => {
  ensureApiKey();
  const response = await api.get('/data/2.5/weather', {
    params: {
      lat, // 21. Latitude
      lon, // 22. Longitude
      appid: API_KEY,
      units,
    },
  });
  return response.data;
};

// 23. Fetch 5-day forecast by city name
export const fetchForecast = async (city, units = 'metric') => {
  ensureApiKey();
  const response = await api.get('/data/2.5/forecast', {
    params: {
      q: city,
      appid: API_KEY,
      units,
      cnt: 40, // 24. Request 40 data points (5 days * 8 per day)
    },
  });
  return response.data;
};

// 25. Fetch 5-day forecast by coordinates
export const fetchForecastByCoords = async (lat, lon, units = 'metric') => {
  ensureApiKey();
  const response = await api.get('/data/2.5/forecast', {
    params: {
      lat,
      lon,
      appid: API_KEY,
      units,
      cnt: 40,
    },
  });
  return response.data;
};

// 26. Search for cities by name (geocoding API)
export const searchCities = async (query) => {
  ensureApiKey();
  const response = await api.get('/geo/1.0/direct', {
    params: {
      q: query, // 27. City name to search for
      limit: 5, // 28. Return max 5 results
      appid: API_KEY,
    },
  });
  return response.data; // 29. Returns array of city objects with lat/lon
};
```

**What happens:**

1. Module validates configuration on load (API key and base URL)
2. Creates axios instance with 10-second timeout
3. All API functions validate API key before making requests
4. Each function makes a GET request to OpenWeatherMap API
5. Returns response data (weather info, forecast, or city search results)
6. All errors propagate to the caller with axios error objects

---

## SearchBar Component

### File: `src/components/SearchBar.jsx`

```javascript
// 1. Import React hooks
import { useState, useRef, useEffect } from 'react';

// 2. Import icons from react-icons
import { FiSearch, FiMapPin, FiClock } from 'react-icons/fi';

// 3. Import API function for city search
import { searchCities } from '../api/weatherApi';

// 4. Import weather context hook
import { useWeatherContext } from '../context/useWeatherContext';

// 5. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 6. Define the SearchBar component
const SearchBar = () => {
  // 7. Destructure needed values and functions from context
  const { loadWeather, loadWeatherByCoords, setError } = useWeatherContext();

  // 8. Initialize state for search input value
  const [query, setQuery] = useState('');

  // 9. Initialize state for search suggestions (results from city search API)
  const [suggestions, setSuggestions] = useState([]);

  // 10. Initialize state to control dropdown visibility
  const [showDropdown, setShowDropdown] = useState(false);

  // 11. Initialize state to track geolocation loading state
  const [locating, setLocating] = useState(false);

  // 12. Create ref for debounce timer (to avoid excessive API calls)
  const debounceRef = useRef(null);

  // 13. Create ref for dropdown wrapper (for click-outside detection)
  const wrapperRef = useRef(null);

  // 14. Handle input changes with debouncing
  const handleInput = (e) => {
    const val = e.target.value; // 15. Get input value
    setQuery(val); // 16. Update query state

    // 17. Clear any existing debounce timer
    clearTimeout(debounceRef.current);

    // 18. Don't search if query is too short
    if (val.trim().length < 2) {
      setSuggestions([]); // 19. Clear suggestions
      setShowDropdown(false); // 20. Hide dropdown
      return;
    }

    // 21. Set new debounce timer (350ms delay)
    debounceRef.current = setTimeout(async () => {
      try {
        // 22. Search for cities matching the query
        const results = await searchCities(val);
        setSuggestions(results); // 23. Update suggestions state
        setShowDropdown(true); // 24. Show dropdown
      } catch (error) {
        // 25. Log search errors with context
        logError(ErrorIds.CITY_SEARCH_FAILED, normalizeError(error), {
          query: val,
        });
        setSuggestions([]); // 26. Clear suggestions on error
      }
    }, 350); // 27. 350ms delay reduces API calls
  };

  // 28. Handle selection of a city from suggestions
  const handleSelect = (cityName) => {
    setQuery(cityName); // 29. Update input with selected city
    setShowDropdown(false); // 30. Hide dropdown
    setSuggestions([]); // 31. Clear suggestions
    loadWeather(cityName); // 32. Load weather for selected city
  };

  // 33. Handle form submission (search button press or Enter key)
  const handleSubmit = (e) => {
    e.preventDefault(); // 34. Prevent form from submitting/refreshing page
    if (query.trim()) {
      // 35. Check if query is not empty
      handleSelect(query.trim()); // 36. Load weather for typed city
    }
  };

  // 37. Handle geolocation button click
  const handleGeolocate = () => {
    // 38. Check if browser supports geolocation
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true); // 39. Show loading indicator

    // 40. Request user's current position
    navigator.geolocation.getCurrentPosition(
      // 41. Success callback - position obtained
      async ({ coords }) => {
        try {
          // 42. Load weather using coordinates
          await loadWeatherByCoords(coords.latitude, coords.longitude);
        } catch (error) {
          // 43. Log errors that occur during weather loading
          logError(ErrorIds.GEOLOCATION_FAILED, normalizeError(error), {
            context: 'after_geolocation',
          });
          // Error is already set by loadWeatherByCoords
        } finally {
          // 44. Always hide loading indicator
          setLocating(false);
        }
      },
      // 45. Error callback - position failed
      (error) => {
        // 46. Log geolocation error with details
        logError(ErrorIds.GEOLOCATION_DENIED, error, {
          code: error.code,
          message: error.message,
        });

        setLocating(false); // 47. Hide loading indicator

        // 48. Map geolocation error codes to user-friendly messages
        const geolocationErrors = {
          [error.PERMISSION_DENIED]:
            'Location access denied. Please enable location permissions.',
          [error.POSITION_UNAVAILABLE]: 'Location information unavailable.',
          [error.TIMEOUT]: 'Location request timed out. Please try again.',
        };

        setError(
          geolocationErrors[error.code] ||
            'An unknown error occurred getting your location.'
        );
      },
      { timeout: 8000 } // 49. 8 second timeout for geolocation
    );
  };

  // 50. Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      // 51. Check if click is outside the dropdown wrapper
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    // 52. Add mousedown event listener to document
    document.addEventListener('mousedown', handler);
    // 53. Cleanup function - remove event listener on unmount
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // 54. Cleanup debounce timer on component unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // 55. Render the SearchBar UI
  return (
    <div ref={wrapperRef} className="search-wrapper">
      {/* 56. Search form with input and buttons */}
      <form onSubmit={handleSubmit} className="search-input-row">
        {/* 57. Search icon */}
        <FiSearch
          style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            flexShrink: 0, // 58. Prevent icon from shrinking
          }}
        />

        {/* 59. Search input field */}
        <input
          className="search-input"
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={handleInput}
          onFocus={() => {
            // 60. Show dropdown on focus if there are suggestions
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          autoComplete="off" // 61. Disable browser autocomplete
          spellCheck={false} // 62. Disable spell check
        />

        {/* 63. Geolocation button */}
        <button
          type="button"
          className="icon-btn"
          style={{ border: 'none', borderRadius: '8px' }}
          onClick={handleGeolocate}
          title="Use my location"
          aria-label="Use my location"
        >
          {locating ? (
            // 64. Show spinner while getting location
            <span
              className="spinner"
              style={{ width: 18, height: 18, borderWidth: 2 }}
            />
          ) : (
            // 65. Show location icon otherwise
            <FiMapPin />
          )}
        </button>

        {/* 66. Search submit button */}
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {/* 67. Search suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map((s) => (
            // 68. Render each suggestion as a clickable item
            <div
              // 69. Use composite key for uniqueness (lat-lon-name-country)
              key={`${s.lat}-${s.lon}-${s.name}-${s.country}`}
              className="search-dropdown-item"
              onClick={() => handleSelect(`${s.name},${s.country}`)}
            >
              {/* 70. Visual indicator (styled dot) */}
              <span className="city-dot" />

              {/* 71. City name */}
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {s.name}
              </span>

              {/* 72. State and country */}
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {s.state ? `${s.state}, ` : ''}
                {s.country}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 73. Export SearchBar as default export
export default SearchBar;
```

**What happens:**

1. User types in search input → handleInput is called
2. After 350ms of no typing, searchCities API is called
3. Suggestions are displayed in dropdown
4. User can click a suggestion or press Enter
5. loadWeather is called to fetch weather data
6. User can also click geolocation button to get weather for current location
7. Dropdown closes when clicking outside

---

## WeatherCard Component

### File: `src/components/WeatherCard.jsx`

```javascript
// 1. Import motion for animations
import { motion } from 'framer-motion';

// 2. Import weather context hook
import { useWeatherContext } from '../context/useWeatherContext';

// 3. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 4. Import useEffect for side effects
import { useEffect } from 'react';

// 5. Helper function to map weather conditions to CSS classes
const getConditionClass = (weatherMain) => {
  if (!weatherMain) return 'default'; // 6. Return default class if no weather data
  const s = weatherMain.toLowerCase(); // 7. Convert to lowercase for comparison

  // 8. Return appropriate CSS class based on weather condition
  if (s.includes('clear')) return 'clear';
  if (s.includes('cloud')) return 'clouds';
  if (s.includes('rain') || s.includes('drizzle')) return 'rain';
  if (s.includes('thunder') || s.includes('storm')) return 'storm';
  if (s.includes('snow')) return 'snow';
  if (s.includes('mist') || s.includes('fog') || s.includes('haze'))
    return 'mist';
  return 'default'; // 9. Return default if no match
};

// 10. Helper function to format time based on timezone offset
const formatDateTime = (timezone) => {
  const now = new Date(); // 11. Get current date/time
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // 12. Convert to UTC timestamp
  const cityTime = new Date(utc + timezone * 1000); // 13. Apply city timezone offset

  // 14. Format using locale-aware time formatting (FIXED - was using broken toISOString)
  return cityTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// 15. Define the WeatherCard component
const WeatherCard = () => {
  // 16. Get current weather data and units from context
  const { current, units } = useWeatherContext();

  if (!current) return null; // 17. Don't render if no data

  // 18. Log if weather data is missing (validation)
  useEffect(() => {
    if (current && !current.weather) {
      logError(
        ErrorIds.VALIDATION_ERROR,
        new Error('API response missing weather data'),
        {
          city: current.name,
          responseKeys: Object.keys(current),
        }
      );
    }
  }, [current]);

  // 19. Get CSS class for background gradient based on weather condition
  const condClass = getConditionClass(current.weather?.[0]?.main);

  // 20. Build URL for weather icon
  const iconUrl = `https://openweathermap.org/img/wn/${current.weather?.[0]?.icon}@4x.png`;

  // 21. Get temperature unit symbol
  const unit = units === 'metric' ? '°C' : '°F';

  // 22. Render the weather card with animations
  return (
    <>
      {/* 23. Background gradient component (separate to update class dynamically) */}
      <WeatherBackground condClass={condClass} />

      {/* 24. Main weather card with glass morphism effect */}
      <motion.div
        className="glass-card weather-hero"
        initial={{ opacity: 0, y: 24 }} // 25. Start invisible and slightly down
        animate={{ opacity: 1, y: 0 }} // 26. Animate to visible and normal position
        transition={{ duration: 0.5, ease: 'easeOut' }} // 27. Animation timing
        key={current.id} // 28. Re-animate when city changes
      >
        {/* 29. Left side: city info and temperature */}
        <div className="weather-hero-left">
          {/* 30. City name */}
          <div className="weather-city">{current.name}</div>

          {/* 31. Country and current time */}
          <div className="weather-country">
            <span>{current.sys?.country}</span>
            <span className="weather-date-time">
              · {formatDateTime(current.timezone)}
            </span>
          </div>

          {/* 32. Current temperature */}
          <div className="weather-temp">
            {Math.round(current.main?.temp)}
            {unit}
          </div>

          {/* 33. Feels like temperature */}
          <div className="weather-feels">
            Feels like {Math.round(current.main?.feels_like)}
            {unit}
          </div>

          {/* 34. Weather description */}
          <div className="weather-desc">
            {current.weather?.[0]?.description}
          </div>
        </div>

        {/* 35. Right side: weather icon */}
        <div className="weather-hero-right">
          <motion.img
            src={iconUrl}
            alt={current.weather?.[0]?.description}
            className="weather-icon-large"
            initial={{ scale: 0.8, opacity: 0 }} // 36. Start small and invisible
            animate={{ scale: 1, opacity: 1 }} // 37. Animate to full size and visible
            transition={{
              duration: 0.6,
              delay: 0.2, // 38. Start animation after card appears
              type: 'spring', // 39. Use spring physics for natural feel
              stiffness: 100,
            }}
          />
        </div>
      </motion.div>
    </>
  );
};

// 40. Separate component to update background class dynamically
const WeatherBackground = ({ condClass }) => {
  // 41. Render a div with the weather condition class
  return <div className={`app-bg-gradient ${condClass}`} />;
};

// 42. Export WeatherCard as default export
export default WeatherCard;
```

**What happens:**

1. WeatherCard gets current weather data from context
2. Validates that weather data exists, logs error if missing
3. Gets CSS class based on weather condition for background gradient
4. Builds weather icon URL from OpenWeatherMap
5. Formats current time for the city's timezone
6. Displays city name, country, temperature, feels-like temp, and description
7. Shows weather icon with spring animation
8. Background gradient changes based on weather condition

---

## WeatherDetails Component

### File: `src/components/WeatherDetails.jsx`

```javascript
// 1. Import motion for animations
import { motion } from 'framer-motion';

// 2. Import weather context hook
import { useWeatherContext } from '../context/useWeatherContext';

// 3. Import weather icons from react-icons/wi
import {
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiDaySunny,
} from 'react-icons/wi';

// 4. Import eye icon from react-icons/fi
import { FiEye } from 'react-icons/fi';

// 5. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 6. Import useEffect for side effects
import { useEffect } from 'react';

// 7. Helper function to format time based on timezone offset (FIXED)
const formatTime = (unix, tz) => {
  const cityTime = new Date((unix + tz) * 1000); // 8. Convert Unix timestamp to city time

  // 9. Format using locale-aware time formatting
  return cityTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// 10. Detail card component (reusable for each weather detail)
const Detail = ({ icon, label, value, delay }) => (
  <motion.div
    className="glass-card detail-card"
    initial={{ opacity: 0, y: 16 }} // 11. Start invisible and slightly down
    animate={{ opacity: 1, y: 0 }} // 12. Animate to visible position
    transition={{ duration: 0.4, delay }} // 13. Stagger animations using delay
  >
    <div className="detail-icon">{icon}</div>
    <div className="detail-label">{label}</div>
    <div className="detail-value">{value}</div>
  </motion.div>
);

// 14. Define the WeatherDetails component
const WeatherDetails = () => {
  // 15. Get current weather data and units from context
  const { current, units } = useWeatherContext();

  if (!current) return null; // 16. Don't render if no data

  // 17. Log if weather data is missing (validation)
  useEffect(() => {
    if (current && !current.weather) {
      logError(
        ErrorIds.VALIDATION_ERROR,
        new Error('API response missing weather data'),
        {
          city: current.name,
          responseKeys: Object.keys(current),
        }
      );
    }
  }, [current]);

  // 18. Validate timezone data (log if missing, use safe fallback)
  const tz = current.timezone;
  if (tz === undefined || tz === null) {
    logError(
      ErrorIds.VALIDATION_ERROR,
      new Error('Missing timezone in weather data'),
      {
        city: current.name,
        hasTimezone: 'timezone' in current,
        timezoneValue: tz,
      }
    );
  }
  const safeTz = tz || 0; // 19. Fallback to UTC if timezone missing

  // 20. Determine unit symbols based on current units
  const speedUnit = units === 'metric' ? 'm/s' : 'mph';

  const visibilityUnit = units === 'metric' ? 'km' : 'mi';
  const visibilityDivider = units === 'metric' ? 1000 : 1609.34; // 21. Convert meters to km or miles

  // 22. Build array of detail objects to display
  const details = [
    {
      icon: <WiHumidity />, // 23. Humidity icon
      label: 'Humidity',
      value: `${current.main?.humidity}%`,
    },
    {
      icon: <WiStrongWind />, // 24. Wind icon
      label: 'Wind',
      value: `${Math.round(current.wind?.speed)} ${speedUnit}`,
    },
    {
      icon: <WiBarometer />, // 25. Pressure icon
      label: 'Pressure',
      value: `${current.main?.pressure} hPa`,
    },
    {
      icon: <FiEye />, // 26. Visibility icon
      label: 'Visibility',
      value: `${((current.visibility || 0) / visibilityDivider).toFixed(1)} ${visibilityUnit}`,
    },
    {
      icon: <WiSunrise />, // 27. Sunrise icon
      label: 'Sunrise',
      value: formatTime(current.sys?.sunrise, safeTz), // 28. Use safeTz for consistency
    },
    {
      icon: <WiSunset />, // 29. Sunset icon
      label: 'Sunset',
      value: formatTime(current.sys?.sunset, safeTz), // 30. Use safeTz for consistency
    },
    {
      icon: <WiDaySunny />, // 31. Max temp icon
      label: 'Max Temp',
      value: `${Math.round(current.main?.temp_max)}°`,
    },
    {
      icon: <WiDaySunny style={{ color: 'var(--accent-2)' }} />, // 32. Min temp icon (different color)
      label: 'Min Temp',
      value: `${Math.round(current.main?.temp_min)}°`,
    },
  ];

  // 33. Render the weather details section
  return (
    <div>
      <div className="section-title">Weather Details</div>

      {/* 34. Grid of detail cards */}
      <div className="details-grid">
        {details.map((d, i) => (
          // 35. Render each detail with staggered animation
          <Detail key={d.label} {...d} delay={i * 0.05} /> // 36. Delay increases for each card
        ))}
      </div>
    </div>
  );
};

// 37. Export WeatherDetails as default export
export default WeatherDetails;
```

**What happens:**

1. WeatherDetails gets current weather data from context
2. Validates that weather data exists, logs error if missing
3. Validates timezone data, logs error if missing (but uses fallback)
4. Builds array of 8 detail cards (humidity, wind, pressure, visibility, sunrise, sunset, max temp, min temp)
5. Each detail card is displayed with its icon, label, and value
6. Cards animate in sequence with increasing delays
7. Sunrise/sunset times are formatted for the city's timezone

---

## HourlyForecast Component

### File: `src/components/HourlyForecast.jsx`

```javascript
// 1. Import motion for animations
import { motion } from 'framer-motion';

// 2. Import weather context hook
import { useWeatherContext } from '../context/useWeatherContext';

// 3. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 4. Import useEffect for side effects
import { useEffect } from 'react';

// 5. Helper function to format hour based on timezone offset (FIXED)
const formatHour = (dtTxt, tz) => {
  const unix = new Date(dtTxt).getTime() / 1000; // 6. Convert date string to Unix timestamp
  const cityTime = new Date((unix + tz) * 1000); // 7. Apply timezone offset

  // 8. Format using locale-aware time formatting (12-hour format with AM/PM)
  return cityTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

// 9. Define the HourlyForecast component
const HourlyForecast = () => {
  // 10. Get forecast and current weather data from context
  const { forecast, current } = useWeatherContext();

  if (!forecast || !current) return null; // 11. Don't render if no data

  // 12. Log if weather data is missing (validation)
  useEffect(() => {
    if (current && !current.weather) {
      logError(
        ErrorIds.VALIDATION_ERROR,
        new Error('API response missing weather data'),
        {
          city: current.name,
          responseKeys: Object.keys(current),
        }
      );
    }
  }, [current]);

  // 13. Validate timezone data (log if missing, use safe fallback)
  const tz = current.timezone;
  if (tz === undefined || tz === null) {
    logError(
      ErrorIds.VALIDATION_ERROR,
      new Error('Missing timezone in weather data'),
      {
        city: current.name,
        hasTimezone: 'timezone' in current,
        timezoneValue: tz,
      }
    );
  }
  const safeTz = tz || 0; // 14. Fallback to UTC if timezone missing

  // 15. Validate forecast.list structure before accessing
  if (
    !forecast.list ||
    !Array.isArray(forecast.list) ||
    forecast.list.length === 0
  ) {
    logError(
      ErrorIds.VALIDATION_ERROR,
      new Error('Invalid forecast data structure'),
      {
        hasList: 'list' in forecast,
        isListArray: Array.isArray(forecast.list),
        listLength: forecast.list?.length,
        forecastKeys: Object.keys(forecast),
      }
    );
    return null; // 16. Return null if forecast data is invalid
  }

  // 17. Get first 9 items (next 9 hours from forecast)
  const hourly = forecast.list.slice(0, 9);

  // 18. Render the hourly forecast section
  return (
    <div>
      <div className="section-title">Hourly Forecast</div>

      {/* 19. Horizontal scrolling container */}
      <div className="hourly-scroll">
        <div className="hourly-row">
          {hourly.map((item, i) => {
            // 20. Build icon URL for this hour
            const iconUrl = `https://openweathermap.org/img/wn/${item.weather?.[0]?.icon}@2x.png`;

            // 21. Get weather description with fallback
            const description = item.weather?.[0]?.description || 'weather';

            // 22. Calculate precipitation probability percentage
            const pop = Math.round((item.pop || 0) * 100);

            // 23. Return hourly card component
            return (
              <motion.div
                key={item.dt}
                className="glass-card hourly-card"
                initial={{ opacity: 0, x: 20 }} // 24. Start invisible and offset to right
                animate={{ opacity: 1, x: 0 }} // 25. Animate to visible position
                transition={{ duration: 0.35, delay: i * 0.05 }} // 26. Stagger animations
              >
                {/* 27. Time label (or "Now" for first item) */}
                <div className="hourly-time">
                  {i === 0 ? 'Now' : formatHour(item.dt_txt, safeTz)}
                </div>

                {/* 28. Weather icon */}
                <img src={iconUrl} alt={description} className="hourly-icon" />

                {/* 29. Temperature */}
                <div className="hourly-temp">{Math.round(item.main.temp)}°</div>

                {/* 30. Precipitation indicator (if > 0%) */}
                {pop > 0 && <div className="hourly-pop">💧{pop}%</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 31. Export HourlyForecast as default export
export default HourlyForecast;
```

**What happens:**

1. HourlyForecast gets forecast and current weather data from context
2. Validates weather data exists, logs error if missing
3. Validates timezone data, logs error if missing (but uses fallback)
4. Validates forecast.list structure and existence, logs error if invalid
5. Gets first 9 items from forecast (next 9 hours of weather)
6. For each hour, displays time, weather icon, temperature, and precipitation chance
7. First item shows "Now" instead of time
8. Cards animate in sequence with increasing delays

---

## ForecastSection Component

### File: `src/components/ForecastSection.jsx`

```javascript
// 1. Import motion for animations
import { motion } from 'framer-motion';

// 2. Import weather context hook
import { useWeatherContext } from '../context/useWeatherContext';

// 3. Import error logging utilities
import { logError, ErrorIds } from '../utils/logger';

// 4. Day name constants for formatting
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 5. Helper function to group forecast items by day
const groupByDay = (list) => {
  const days = {};

  // 6. Loop through all forecast items and group by date
  list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0]; // 7. Extract date portion (YYYY-MM-DD)
    if (!days[date]) days[date] = []; // 8. Create array for this date if not exists
    days[date].push(item); // 9. Add item to this date's array
  });

  // 10. Convert to array and skip today, take next 5 days
  return Object.entries(days).slice(1, 6); // 11. Returns [[date, [items]], ...]
};

// 12. Define the ForecastSection component
const ForecastSection = () => {
  // 13. Get forecast data from context
  const { forecast } = useWeatherContext();

  if (!forecast) return null; // 14. Don't render if no data

  // 15. Validate forecast.list structure before accessing
  if (
    !forecast.list ||
    !Array.isArray(forecast.list) ||
    forecast.list.length === 0
  ) {
    logError(
      ErrorIds.VALIDATION_ERROR,
      new Error('Invalid forecast data structure'),
      {
        hasList: 'list' in forecast,
        isListArray: Array.isArray(forecast.list),
        listLength: forecast.list?.length,
        forecastKeys: Object.keys(forecast),
      }
    );
    return null; // 16. Return null if forecast data is invalid
  }

  // 17. Group forecast items by day
  const days = groupByDay(forecast.list);

  // 18. Render the 5-day forecast section
  return (
    <div>
      <div className="section-title">5-Day Forecast</div>

      {/* 19. Grid of forecast cards */}
      <div className="forecast-grid">
        {days.map(([date, items], i) => {
          // 20. Get day of week from date string
          const dayIdx = new Date(date).getDay();
          const dayName = DAY_NAMES[dayIdx];

          // 21. Get all temperatures for this day
          const temps = items.map((x) => x.main.temp);

          // 22. Calculate high and low temperatures
          const high = Math.round(Math.max(...temps));
          const low = Math.round(Math.min(...temps));

          // 23. Pick midday forecast item (or first available)
          const rep = items.find((x) => x.dt_txt.includes('12:00')) || items[0];

          // 24. Build icon URL
          const iconUrl = `https://openweathermap.org/img/wn/${rep.weather?.[0]?.icon}@2x.png`;

          // 25. Get weather description with fallback
          const description = rep.weather?.[0]?.description || 'forecast';

          // 26. Calculate max precipitation probability for the day
          const pop = Math.round(
            Math.max(...items.map((x) => x.pop || 0)) * 100
          );

          // 27. Return forecast card component
          return (
            <motion.div
              key={date}
              className="glass-card forecast-card"
              initial={{ opacity: 0, y: 20 }} // 28. Start invisible and slightly down
              animate={{ opacity: 1, y: 0 }} // 29. Animate to visible position
              transition={{ duration: 0.4, delay: i * 0.07 }} // 30. Stagger animations
            >
              {/* 31. Day name */}
              <div className="forecast-day">{dayName}</div>

              {/* 32. Weather icon */}
              <img src={iconUrl} alt={description} className="forecast-icon" />

              {/* 33. Weather description */}
              <div className="forecast-desc">{description}</div>

              {/* 34. Temperature range (high / low) */}
              <div className="forecast-temps">
                <span className="forecast-high">{high}°</span>
                <span className="forecast-low">/ {low}°</span>
              </div>

              {/* 35. Precipitation indicator (if > 0%) */}
              {pop > 0 && <div className="forecast-pop">💧 {pop}%</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// 36. Export ForecastSection as default export
export default ForecastSection;
```

**What happens:**

1. ForecastSection gets forecast data from context
2. Validates forecast.list structure and existence, logs error if invalid
3. Groups 40 forecast items (8 per day for 5 days) by date
4. Skips today's forecasts, takes next 5 days
5. For each day, calculates high/low temps from all items
6. Picks midday item (12:00) for icon and description, or first available
7. Calculates maximum precipitation probability for the day
8. Displays day name, icon, description, temp range, and precipitation

---

## Home Page Component

### File: `src/pages/Home.jsx`

```javascript
// 1. Import motion for animations
import { motion } from 'framer-motion';

// 2. Import weather context hook
import { useWeatherContext } from '../context/useWeatherContext';

// 3. Import all weather display components
import WeatherCard from '../components/WeatherCard';
import WeatherDetails from '../components/WeatherDetails';
import HourlyForecast from '../components/HourlyForecast';
import ForecastSection from '../components/ForecastSection';

// 4. Define the Home page component
const Home = () => {
  // 5. Get weather state from context
  const { loading, error, current } = useWeatherContext();

  // 6. Show loading indicator while fetching data
  if (loading) {
    return (
      <div className="loading-container">
        <div
          className="spinner"
          style={{ width: 48, height: 48, borderWidth: 3 }}
        ></div>
        <p className="loading-text">Loading weather data...</p>
      </div>
    );
  }

  // 7. Show error message if API request failed
  if (error) {
    return (
      <motion.div
        className="error-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="error-icon">⚠️</div>
        <h2 className="error-title">Unable to Load Weather</h2>
        <p className="error-message">{error}</p>
        <p className="error-hint">Please try searching for another city.</p>
      </motion.div>
    );
  }

  // 8. Show message if no data is loaded yet
  if (!current) {
    return (
      <motion.div
        className="empty-state"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p>Search for a city to get started</p>
      </motion.div>
    );
  }

  // 9. Render all weather components when data is available
  return (
    <motion.div
      className="home-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* 10. Current weather card */}
      <WeatherCard />

      {/* 11. Weather details grid */}
      <WeatherDetails />

      {/* 12. Hourly forecast (horizontal scroll) */}
      <HourlyForecast />

      {/* 13. 5-day forecast grid */}
      <ForecastSection />
    </motion.div>
  );
};

// 14. Export Home as default export
export default Home;
```

**What happens:**

1. Home component gets loading, error, and current weather state from context
2. If loading is true, shows spinner with loading text
3. If error exists, shows error message with helpful hint
4. If no data loaded yet, shows empty state message
5. If data is available, renders all 4 weather display components:
   - WeatherCard: Current weather with icon and temperature
   - WeatherDetails: 8 detail cards (humidity, wind, pressure, etc.)
   - HourlyForecast: Next 9 hours of weather
   - ForecastSection: 5-day forecast with high/low temps

---

## Complete Application Flow

### Step 1: Application Startup

1. `main.jsx` mounts `<App />` to `<div id="root">`
2. `App.jsx` renders with `ErrorBoundary` → `WeatherProvider` → `AppInner`
3. `WeatherProvider` initializes state from localStorage
4. On mount, `WeatherProvider` calls `loadWeather('Kolkata')` with default city

### Step 2: Initial Data Load

1. `loadWeather` sets `loading` to true
2. Makes parallel API calls: `fetchCurrentWeather` and `fetchForecast`
3. API calls include API key, city name, and units in request parameters
4. Responses update state: `current`, `forecast`, `city`
5. Recent cities updated and saved to localStorage
6. `loading` set to false

### Step 3: Rendering

1. `Home` component sees `loading` is false and `current` exists
2. Renders 4 child components with weather data
3. Each component gets data from `useWeatherContext()` hook
4. Components validate data and log errors if missing
5. Framer Motion animates components onto screen

### Step 4: User Searches for City

1. User types in search input → `handleInput` called
2. After 350ms debounce, `searchCities` API called
3. Suggestions displayed in dropdown
4. User clicks suggestion or presses Enter
5. `handleSelect` calls `loadWeather` with selected city
6. Repeat Step 2 for new city

### Step 5: User Uses Geolocation

1. User clicks location button → `handleGeolocate` called
2. `navigator.geolocation.getCurrentPosition` requests location
3. On success, `loadWeatherByCoords` called with coordinates
4. On error, appropriate error message displayed
5. Repeat Step 2 for user's location

### Step 6: User Toggles Units

1. User clicks unit toggle button → `toggleUnits` called
2. New units calculated (metric ↔ imperial)
3. Saved to localStorage
4. `loadWeather` called again with new units
5. Repeat Step 2 with new units

### Step 7: Error Scenarios

1. **API 404 Error**: "City not found" message displayed
2. **API 401 Error**: "API authentication failed" message
3. **API 429 Error**: "Too many requests" message
4. **Network Error**: "Network error" message
5. **Missing Data**: Validation errors logged, safe fallbacks used
6. **Component Error**: `ErrorBoundary` catches and shows fallback UI

---

## Data Flow Diagram

```
User Input
    ↓
SearchBar / Geolocation Button
    ↓
WeatherContext.loadWeather() / loadWeatherByCoords()
    ↓
API Layer (axios)
    ↓
OpenWeatherMap API
    ↓
Response Data
    ↓
WeatherContext State Updates
    ↓
Components Re-render
    ↓
User Sees Weather Information
```

---

## State Management Flow

```
WeatherProvider (Single Source of Truth)
    ├── city (string)
    ├── units (metric | imperial)
    ├── theme (dark | light)
    ├── current (object | null)
    ├── forecast (object | null)
    ├── loading (boolean)
    ├── error (string | null)
    └── recentCities (array)
    ↓
useWeatherContext() Hook
    ↓
Components Access State
```

---

## Error Handling Flow

```
Error Occurs
    ↓
try { ... } catch (error)
    ↓
normalizeError(error) - Ensure Error object
    ↓
logError(ErrorIds.XXX, error, context)
    ↓
In Dev: console.error with full details
In Prod: Send to error tracking service (future)
    ↓
Set User-Facing Error Message
    ↓
Display Error UI to User
```

---

## Complete Component Tree

```
App
├── ErrorBoundary (error boundary wrapper)
└── WeatherProvider (context provider)
    └── AppInner
        ├── Header
        │   ├── SearchBar
        │   └── Header Controls
        │       ├── Unit Toggle
        │       └── ThemeToggle
        └── Home
            ├── WeatherCard
            │   └── WeatherBackground
            ├── WeatherDetails
            │   └── Detail (×8)
            ├── HourlyForecast
            │   └── Hourly Cards (×9)
            └── ForecastSection
                └── Forecast Cards (×5)
```

---

## Key Patterns Used

1. **Context API**: Centralized state management for weather data
2. **Custom Hooks**: `useWeatherContext` for easier context access
3. **Error Boundaries**: Class component to catch React errors
4. **Structured Logging**: `logError` with error IDs and context
5. **Debouncing**: 350ms delay on search input to reduce API calls
6. **Optional Chaining**: `?.` for safe access to nested data
7. **Nullish Coalescing**: `??` and `||` for fallback values
8. **Framer Motion**: Declarative animations
9. **Axios Instance**: Centralized HTTP client configuration
10. **localStorage Helpers**: Safe read/write with error handling

---

## Recent Improvements (Post-PR Review)

1. **Fixed Timezone Calculation**: Now uses `toLocaleTimeString()` instead of broken `toISOString()` approach
2. **Icon Consistency**: ErrorBoundary uses `FiAlertTriangle` from react-icons/fi
3. **Validation Logging**: All components validate data and log errors
4. **Timezone Validation**: Explicit checks with logging before using fallback
5. **Array Validation**: Validate `forecast.list` before accessing
6. **Structured Logging**: All errors logged with error IDs and context
7. **Helper Functions**: `normalizeError`, `readLocalStorage`, `writeLocalStorage` reduce duplication
8. **React Hooks Order**: All useEffect hooks called before early returns

---

End of Code Flow Documentation
