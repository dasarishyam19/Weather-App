import { motion } from 'framer-motion';
import { useWeatherContext } from '../context/useWeatherContext';
import { logError, ErrorIds } from '../utils/logger';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const groupByDay = (list) => {
  const days = {};
  list.forEach((item) => {
    const date = item.dt_txt.split(' ')[0];
    if (!days[date]) days[date] = [];
    days[date].push(item);
  });
  return Object.entries(days).slice(1, 6); // skip today, take next 5
};

const ForecastSection = () => {
  const { forecast } = useWeatherContext();
  if (!forecast) return null;

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

  const days = groupByDay(forecast.list);

  return (
    <div>
      <div className="section-title">5-Day Forecast</div>
      <div className="forecast-grid">
        {days.map(([date, items], i) => {
          const dayIdx = new Date(date).getDay();
          const dayName = DAY_NAMES[dayIdx];
          const temps = items.map((x) => x.main.temp);
          const high = Math.round(Math.max(...temps));
          const low = Math.round(Math.min(...temps));
          // pick midday slot or first available
          const rep = items.find((x) => x.dt_txt.includes('12:00')) || items[0];
          const iconUrl = `https://openweathermap.org/img/wn/${rep.weather?.[0]?.icon}@2x.png`;
          const description = rep.weather?.[0]?.description || 'forecast';
          const pop = Math.round(
            Math.max(...items.map((x) => x.pop || 0)) * 100
          );

          return (
            <motion.div
              key={date}
              className="glass-card forecast-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <div className="forecast-day">{dayName}</div>
              <img src={iconUrl} alt={description} className="forecast-icon" />
              <div className="forecast-desc">{description}</div>
              <div className="forecast-temps">
                <span className="forecast-high">{high}°</span>
                <span className="forecast-low">/ {low}°</span>
              </div>
              {pop > 0 && <div className="forecast-pop">💧 {pop}%</div>}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ForecastSection;
