import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = import.meta.env.VITE_WEATHER_BASE_URL;

const api = axios.create({ baseURL: BASE_URL });

export const fetchCurrentWeather = async (city, units = 'metric') => {
  const response = await api.get('/data/2.5/weather', {
    params: { q: city, appid: API_KEY, units },
  });
  return response.data;
};

export const fetchCurrentWeatherByCoords = async (lat, lon, units = 'metric') => {
  const response = await api.get('/data/2.5/weather', {
    params: { lat, lon, appid: API_KEY, units },
  });
  return response.data;
};

export const fetchForecast = async (city, units = 'metric') => {
  const response = await api.get('/data/2.5/forecast', {
    params: { q: city, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};

export const fetchForecastByCoords = async (lat, lon, units = 'metric') => {
  const response = await api.get('/data/2.5/forecast', {
    params: { lat, lon, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};

export const searchCities = async (query) => {
  const response = await api.get('/geo/1.0/direct', {
    params: { q: query, limit: 5, appid: API_KEY },
  });
  return response.data;
};
