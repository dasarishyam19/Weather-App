import React, { createContext, useState, useCallback, useEffect } from 'react';
import {
  fetchCurrentWeather,
  fetchCurrentWeatherByCoords,
  fetchForecast,
  fetchForecastByCoords,
} from '../api/weatherApi';
import { logError, ErrorIds } from '../utils/logger';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [city, setCity] = useState('Kolkata');
  const [units, setUnits] = useState(() => {
    try {
      const saved = localStorage.getItem('units');
      if (saved && (saved === 'metric' || saved === 'imperial')) {
        return saved;
      }
    } catch (error) {
      logError(
        ErrorIds.LOCAL_STORAGE_UNITS_FAILED,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'read_units',
        }
      );
    }
    return 'metric';
  });
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved && (saved === 'dark' || saved === 'light')) {
        return saved;
      }
    } catch (error) {
      logError(
        ErrorIds.LOCAL_STORAGE_THEME_FAILED,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'read_theme',
        }
      );
    }
    return 'dark';
  });
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentCities, setRecentCities] = useState(() => {
    try {
      const saved = localStorage.getItem('recentCities');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      logError(
        ErrorIds.LOCAL_STORAGE_RECENT_CITIES_PARSE_FAILED,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'read_recent_cities',
        }
      );
      // Clear corrupted data
      try {
        localStorage.removeItem('recentCities');
      } catch (cleanupError) {
        console.error('Failed to clear corrupted localStorage:', cleanupError);
      }
    }
    return [];
  });

  const loadWeather = useCallback(
    async (cityName, unitPref = units) => {
      setLoading(true);
      setError(null);
      try {
        const [cur, fore] = await Promise.all([
          fetchCurrentWeather(cityName, unitPref),
          fetchForecast(cityName, unitPref),
        ]);
        setCurrent(cur);
        setForecast(fore);
        setCity(cityName);
        setRecentCities((prev) => {
          const next = [
            cityName,
            ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase()),
          ].slice(0, 5);
          try {
            localStorage.setItem('recentCities', JSON.stringify(next));
          } catch (error) {
            logError(
              ErrorIds.LOCAL_STORAGE_FAILED,
              error instanceof Error ? error : new Error(String(error)),
              {
                operation: 'save_recent_cities',
                cityCount: next.length,
              }
            );
          }
          return next;
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        // Log the error with context
        if (error.response?.status) {
          logError(ErrorIds.API_NETWORK_ERROR, error, {
            city: cityName,
            status: error.response.status,
            data: error.response.data,
          });
        } else {
          logError(ErrorIds.WEATHER_LOAD_FAILED, error, { city: cityName });
        }

        // Provide specific error messages
        if (error.response?.status === 401) {
          setError(
            'API authentication failed. Please check your configuration.'
          );
        } else if (error.response?.status === 429) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (error.response?.status === 404) {
          setError('City not found. Please check the spelling and try again.');
        } else if (!error.response && error.message === 'Network Error') {
          setError(
            'Network error. Please check your connection and try again.'
          );
        } else {
          setError(
            error.response?.data?.message || 'City not found. Please try again.'
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [units]
  );

  const loadWeatherByCoords = useCallback(
    async (lat, lon) => {
      setLoading(true);
      setError(null);
      try {
        const [cur, fore] = await Promise.all([
          fetchCurrentWeatherByCoords(lat, lon, units),
          fetchForecastByCoords(lat, lon, units),
        ]);
        setCurrent(cur);
        setForecast(fore);
        setCity(cur.name);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        // Log the error with context
        logError(ErrorIds.GEOLOCATION_FAILED, error, {
          lat,
          lon,
          status: error.response?.status,
        });

        // Provide specific error messages
        if (error.response?.status === 401) {
          setError(
            'API authentication failed. Please check your configuration.'
          );
        } else if (error.response?.status === 429) {
          setError('Too many requests. Please wait a moment and try again.');
        } else if (error.response?.status === 404) {
          setError('Unable to find weather for your location.');
        } else if (!error.response && error.message === 'Network Error') {
          setError(
            'Network error. Please check your connection and try again.'
          );
        } else {
          setError('Could not fetch weather for your location.');
        }
      } finally {
        setLoading(false);
      }
    },
    [units]
  );

  const toggleUnits = useCallback(() => {
    const next = units === 'metric' ? 'imperial' : 'metric';
    setUnits(next);
    try {
      localStorage.setItem('units', next);
    } catch (error) {
      logError(
        ErrorIds.LOCAL_STORAGE_UNITS_FAILED,
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: 'save_units',
          value: next,
        }
      );
    }
    if (city) loadWeather(city, next);
  }, [units, city, loadWeather]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('theme', next);
      } catch (error) {
        logError(
          ErrorIds.LOCAL_STORAGE_THEME_FAILED,
          error instanceof Error ? error : new Error(String(error)),
          {
            operation: 'save_theme',
            value: next,
          }
        );
      }
      return next;
    });
  }, []);

  useEffect(() => {
    loadWeather(city);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Note: Only run on mount - let user actions handle subsequent city changes

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <WeatherContext.Provider
      value={{
        city,
        units,
        theme,
        current,
        forecast,
        loading,
        error,
        recentCities,
        loadWeather,
        loadWeatherByCoords,
        toggleUnits,
        toggleTheme,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export { WeatherContext };
