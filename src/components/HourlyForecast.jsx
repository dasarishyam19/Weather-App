import { motion } from 'framer-motion';
import { useWeatherContext } from '../context/useWeatherContext';

const formatHour = (dtTxt, tz) => {
  const unix = new Date(dtTxt).getTime() / 1000;
  const d = new Date((unix + tz) * 1000);
  const h = d.getUTCHours();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}${ampm}`;
};

const HourlyForecast = () => {
  const { forecast, current } = useWeatherContext();
  if (!forecast || !current) return null;

  const tz = current.timezone || 0;
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
                  {i === 0 ? 'Now' : formatHour(item.dt_txt, tz)}
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
