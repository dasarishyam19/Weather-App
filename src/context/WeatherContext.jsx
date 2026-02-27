import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
    fetchCurrentWeather,
    fetchCurrentWeatherByCoords,
    fetchForecast,
    fetchForecastByCoords,
} from '../api/weatherApi';

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
    const [city, setCity] = useState('Kolkata');
    const [units, setUnits] = useState(() => localStorage.getItem('units') || 'metric');
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentCities, setRecentCities] = useState(
        () => JSON.parse(localStorage.getItem('recentCities') || '[]')
    );

    const loadWeather = useCallback(async (cityName, unitPref = units) => {
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
                const next = [cityName, ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase())].slice(0, 5);
                localStorage.setItem('recentCities', JSON.stringify(next));
                return next;
            });
        } catch (err) {
            setError(err.response?.data?.message || 'City not found. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [units]);

    const loadWeatherByCoords = useCallback(async (lat, lon) => {
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
            setError('Could not fetch weather for your location.');
        } finally {
            setLoading(false);
        }
    }, [units]);

    const toggleUnits = useCallback(() => {
        const next = units === 'metric' ? 'imperial' : 'metric';
        setUnits(next);
        localStorage.setItem('units', next);
        if (city) loadWeather(city, next);
    }, [units, city, loadWeather]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            return next;
        });
    }, []);

    useEffect(() => {
        loadWeather(city);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <WeatherContext.Provider
            value={{
                city, units, theme, current, forecast,
                loading, error, recentCities,
                loadWeather, loadWeatherByCoords, toggleUnits, toggleTheme,
            }}
        >
            {children}
        </WeatherContext.Provider>
    );
};

export const useWeatherContext = () => useContext(WeatherContext);
