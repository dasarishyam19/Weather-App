import { motion } from 'framer-motion';
import { useWeatherContext } from '../context/useWeatherContext';
import { logError, ErrorIds } from '../utils/logger';
import { useEffect } from 'react';

const getConditionClass = (weatherMain) => {
  if (!weatherMain) return 'default';
  const s = weatherMain.toLowerCase();
  if (s.includes('clear')) return 'clear';
  if (s.includes('cloud')) return 'clouds';
  if (s.includes('rain') || s.includes('drizzle')) return 'rain';
  if (s.includes('thunder') || s.includes('storm')) return 'storm';
  if (s.includes('snow')) return 'snow';
  if (s.includes('mist') || s.includes('fog') || s.includes('haze'))
    return 'mist';
  return 'default';
};

const formatDateTime = (timezone) => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const cityTime = new Date(utc + timezone * 1000);
  return cityTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const WeatherCard = () => {
  const { current, units } = useWeatherContext();

  // Log if weather data is missing
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

  if (!current) return null;

  const condClass = getConditionClass(current.weather?.[0]?.main);
  const iconUrl = `https://openweathermap.org/img/wn/${current.weather?.[0]?.icon}@4x.png`;
  const unit = units === 'metric' ? '°C' : '°F';

  return (
    <>
      {/* Inject condition class onto bg */}
      <WeatherBackground condClass={condClass} />
      <motion.div
        className="glass-card weather-hero"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        key={current.id}
      >
        <div className="weather-hero-left">
          <div className="weather-city">{current.name}</div>
          <div className="weather-country">
            <span>{current.sys?.country}</span>
            <span className="weather-date-time">
              · {formatDateTime(current.timezone)}
            </span>
          </div>
          <div className="weather-temp">
            {Math.round(current.main?.temp)}
            {unit}
          </div>
          <div className="weather-feels">
            Feels like {Math.round(current.main?.feels_like)}
            {unit}
          </div>
          <div className="weather-desc">
            {current.weather?.[0]?.description}
          </div>
        </div>
        <div className="weather-hero-right">
          <motion.img
            src={iconUrl}
            alt={current.weather?.[0]?.description}
            className="weather-icon-large"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              type: 'spring',
              stiffness: 100,
            }}
          />
        </div>
      </motion.div>
    </>
  );
};

// Separate component to update background class dynamically
const WeatherBackground = ({ condClass }) => {
  return <div className={`app-bg-gradient ${condClass}`} />;
};

export default WeatherCard;
