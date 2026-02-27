import { motion } from 'framer-motion';
import { useWeatherContext } from '../context/useWeatherContext';
import {
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiDaySunny,
} from 'react-icons/wi';
import { FiEye } from 'react-icons/fi';

const pad = (n) => String(n).padStart(2, '0');

const formatTime = (unix, tz) => {
  const d = new Date((unix + tz) * 1000);
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
};

const Detail = ({ icon, label, value, delay }) => (
  <motion.div
    className="glass-card detail-card"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
  >
    <div className="detail-icon">{icon}</div>
    <div className="detail-label">{label}</div>
    <div className="detail-value">{value}</div>
  </motion.div>
);

const WeatherDetails = () => {
  const { current, units } = useWeatherContext();
  if (!current) return null;

  const tz = current.timezone || 0;
  const speedUnit = units === 'metric' ? 'm/s' : 'mph';

  const visibilityUnit = units === 'metric' ? 'km' : 'mi';
  const visibilityDivider = units === 'metric' ? 1000 : 1609.34;

  const details = [
    {
      icon: <WiHumidity />,
      label: 'Humidity',
      value: `${current.main?.humidity}%`,
    },
    {
      icon: <WiStrongWind />,
      label: 'Wind',
      value: `${Math.round(current.wind?.speed)} ${speedUnit}`,
    },
    {
      icon: <WiBarometer />,
      label: 'Pressure',
      value: `${current.main?.pressure} hPa`,
    },
    {
      icon: <FiEye />,
      label: 'Visibility',
      value: `${((current.visibility || 0) / visibilityDivider).toFixed(1)} ${visibilityUnit}`,
    },
    {
      icon: <WiSunrise />,
      label: 'Sunrise',
      value: formatTime(current.sys?.sunrise, tz),
    },
    {
      icon: <WiSunset />,
      label: 'Sunset',
      value: formatTime(current.sys?.sunset, tz),
    },
    {
      icon: <WiDaySunny />,
      label: 'Max Temp',
      value: `${Math.round(current.main?.temp_max)}°`,
    },
    {
      icon: <WiDaySunny style={{ color: 'var(--accent-2)' }} />,
      label: 'Min Temp',
      value: `${Math.round(current.main?.temp_min)}°`,
    },
  ];

  return (
    <div>
      <div className="section-title">Weather Details</div>
      <div className="details-grid">
        {details.map((d, i) => (
          <Detail key={d.label} {...d} delay={i * 0.05} />
        ))}
      </div>
    </div>
  );
};

export default WeatherDetails;
