import React, { createContext, useState, useCallback, useEffect } from 'react';
import {
  fetchCurrentWeather,
  fetchCurrentWeatherByCoords,
  fetchForecast,
  fetchForecastByCoords,
} from '../api/weatherApi';
import {
  logError,
  normalizeError,
  readLocalStorage,
  writeLocalStorage,
  ErrorIds,
} from '../utils/logger';

const WeatherContext = createContext();

const VALID_UNITS = ['metric', 'imperial'];
const VALID_THEMES = ['dark', 'light'];

const getApiErrorMessage = (error) => {
  const status = error.response?.status;
  const isNetworkError = !error.response && error.message === 'Network Error';

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

const getGeolocationErrorMessage = (error) => {
  const status = error.response?.status;
  const isNetworkError = !error.response && error.message === 'Network Error';

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

export const WeatherProvider = ({ children }) => {
  const [city, setCity] = useState('Kolkata');
  const [units, setUnits] = useState(() =>
    readLocalStorage(
      'units',
      'metric',
      ErrorIds.LOCAL_STORAGE_UNITS_FAILED,
      (saved) => (VALID_UNITS.includes(saved) ? saved : 'metric')
    )
  );
  const [theme, setTheme] = useState(() =>
    readLocalStorage(
      'theme',
      'dark',
      ErrorIds.LOCAL_STORAGE_THEME_FAILED,
      (saved) => (VALID_THEMES.includes(saved) ? saved : 'dark')
    )
  );
  const [current, setCurrent] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recentCities, setRecentCities] = useState(() => {
    const parseArray = (saved) => {
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : null;
    };

    const result = readLocalStorage(
      'recentCities',
      null,
      ErrorIds.LOCAL_STORAGE_RECENT_CITIES_PARSE_FAILED,
      parseArray
    );

    if (result === null) {
      // Clear corrupted data
      try {
        localStorage.removeItem('recentCities');
      } catch (cleanupError) {
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
      return [];
    }
    return result;
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
          writeLocalStorage(
            'recentCities',
            JSON.stringify(next),
            ErrorIds.LOCAL_STORAGE_FAILED
          );
          return next;
        });
      } catch (err) {
        const error = normalizeError(err);

        if (error.response?.status) {
          logError(ErrorIds.API_NETWORK_ERROR, error, {
            city: cityName,
            status: error.response.status,
            data: error.response.data,
          });
        } else {
          logError(ErrorIds.WEATHER_LOAD_FAILED, error, { city: cityName });
        }

        setError(getApiErrorMessage(error));
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
        const error = normalizeError(err);

        logError(ErrorIds.GEOLOCATION_FAILED, error, {
          lat,
          lon,
          status: error.response?.status,
        });

        setError(getGeolocationErrorMessage(error));
      } finally {
        setLoading(false);
      }
    },
    [units]
  );

  const toggleUnits = useCallback(() => {
    const next = units === 'metric' ? 'imperial' : 'metric';
    setUnits(next);
    writeLocalStorage('units', next, ErrorIds.LOCAL_STORAGE_UNITS_FAILED);
    if (city) loadWeather(city, next);
  }, [units, city, loadWeather]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      writeLocalStorage('theme', next, ErrorIds.LOCAL_STORAGE_THEME_FAILED);
      return next;
    });
  }, []);

  useEffect(() => {
    loadWeather(city);
    // Only run on mount - let user actions handle subsequent city changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
