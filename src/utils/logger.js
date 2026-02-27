/**
 * Error Logging Utility
 * Provides structured error logging with error IDs for tracking
 */

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

/**
 * Logs an error with structured data
 * In development: logs to console with full details
 * In production: can be extended to send to error tracking service
 *
 * @param errorId - Unique identifier for the error type
 * @param error - The error object or message
 * @param context - Additional context about the error
 */
export const logError = (errorId, error, context = {}) => {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  const errorData = {
    errorId,
    message: errorMessage,
    stack: errorStack,
    context,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  // In development, log detailed error to console
  if (import.meta.env.DEV) {
    console.error(`[${errorId}]`, errorMessage);
    console.error('Context:', context);
    if (errorStack) {
      console.error('Stack:', errorStack);
    }
  }

  // In production, send to error tracking service
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

  return errorData;
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
