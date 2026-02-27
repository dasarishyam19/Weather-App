import { useContext } from 'react';
import { WeatherContext } from './WeatherContext';

export const useWeatherContext = () => useContext(WeatherContext);
