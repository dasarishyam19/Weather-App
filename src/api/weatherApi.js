import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;

if (!API_KEY) {
  console.error(
    'VITE_WEATHER_API_KEY is not defined. Please check your .env file.'
  );
}

if (!BASE_URL) {
  console.error(
    'VITE_WEATHER_BASE_URL is not defined. Please check your .env file.'
  );
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout for all requests
});

export const fetchCurrentWeather = async (city, units = 'metric') => {
  if (!API_KEY) {
    throw new Error(
      'API key is not configured. Please check your environment variables.'
    );
  }
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
  if (!API_KEY) {
    throw new Error(
      'API key is not configured. Please check your environment variables.'
    );
  }
  const response = await api.get('/data/2.5/weather', {
    params: { lat, lon, appid: API_KEY, units },
  });
  return response.data;
};

export const fetchForecast = async (city, units = 'metric') => {
  if (!API_KEY) {
    throw new Error(
      'API key is not configured. Please check your environment variables.'
    );
  }
  const response = await api.get('/data/2.5/forecast', {
    params: { q: city, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};

export const fetchForecastByCoords = async (lat, lon, units = 'metric') => {
  if (!API_KEY) {
    throw new Error(
      'API key is not configured. Please check your environment variables.'
    );
  }
  const response = await api.get('/data/2.5/forecast', {
    params: { lat, lon, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};

export const searchCities = async (query) => {
  if (!API_KEY) {
    throw new Error(
      'API key is not configured. Please check your environment variables.'
    );
  }
  const response = await api.get('/geo/1.0/direct', {
    params: { q: query, limit: 5, appid: API_KEY },
  });
  return response.data;
};
