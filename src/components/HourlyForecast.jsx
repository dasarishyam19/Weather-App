import { motion } from 'framer-motion';
import { useWeatherContext } from '../context/useWeatherContext';
import { logError, ErrorIds } from '../utils/logger';
import { useEffect } from 'react';

const formatHour = (dtTxt, tz) => {
  const unix = new Date(dtTxt).getTime() / 1000;
  const cityTime = new Date((unix + tz) * 1000);
  return cityTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const HourlyForecast = () => {
  const { forecast, current } = useWeatherContext();

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

  if (!forecast || !current) return null;

  // Validate timezone data
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
  const safeTz = tz || 0;

  // Validate forecast.list structure
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
    return null;
  }

  const hourly = forecast.list.slice(0, 9);

  return (
    <div>
      <div className="section-title">Hourly Forecast</div>
      <div className="hourly-scroll">
        <div className="hourly-row">
          {hourly.map((item, i) => {
            const iconUrl = `https://openweathermap.org/img/wn/${item.weather?.[0]?.icon}@2x.png`;
            const description = item.weather?.[0]?.description || 'weather';
            const pop = Math.round((item.pop || 0) * 100);
            return (
              <motion.div
                key={item.dt}
                className="glass-card hourly-card"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
              >
                <div className="hourly-time">
                  {i === 0 ? 'Now' : formatHour(item.dt_txt, safeTz)}
                </div>
                <img src={iconUrl} alt={description} className="hourly-icon" />
                <div className="hourly-temp">{Math.round(item.main.temp)}°</div>
                {pop > 0 && <div className="hourly-pop">💧{pop}%</div>}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HourlyForecast;
