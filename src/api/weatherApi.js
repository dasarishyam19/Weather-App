import axios from 'axios';
import { logError, ErrorIds } from '../utils/logger';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;

const API_KEY_ERROR =
  'API key is not configured. Please check your environment variables.';

if (!API_KEY) {
  logError(
    ErrorIds.API_AUTH_FAILED,
    new Error('VITE_WEATHER_API_KEY is not configured'),
    {
      configCheck: 'missing_api_key',
      environment: import.meta.env.MODE,
    }
  );
}

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

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

const ensureApiKey = () => {
  if (!API_KEY) {
    throw new Error(API_KEY_ERROR);
  }
};

export const fetchCurrentWeather = async (city, units = 'metric') => {
  ensureApiKey();
  const response = await api.get('/data/2.5/weather', {
    params: { q: city, appid: API_KEY, units },
  });
  return response.data;
};

export const fetchCurrentWeatherByCoords = async (
  lat,
  lon,
  units = 'metric'
) => {
  ensureApiKey();
  const response = await api.get('/data/2.5/weather', {
    params: { lat, lon, appid: API_KEY, units },
  });
  return response.data;
};

export const fetchForecast = async (city, units = 'metric') => {
  ensureApiKey();
  const response = await api.get('/data/2.5/forecast', {
    params: { q: city, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};

export const fetchForecastByCoords = async (lat, lon, units = 'metric') => {
  ensureApiKey();
  const response = await api.get('/data/2.5/forecast', {
    params: { lat, lon, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};

export const searchCities = async (query) => {
  ensureApiKey();
  const response = await api.get('/geo/1.0/direct', {
    params: { q: query, limit: 5, appid: API_KEY },
  });
  return response.data;
};
