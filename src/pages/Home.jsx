import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherContext } from '../context/WeatherContext';
import WeatherCard from '../components/WeatherCard';
import WeatherDetails from '../components/WeatherDetails';
import HourlyForecast from '../components/HourlyForecast';
import ForecastSection from '../components/ForecastSection';

const Home = () => {
    const { loading, error, current, recentCities, loadWeather } = useWeatherContext();

    return (
        <main>
            <AnimatePresence mode="wait">
                {loading && (
                    <motion.div
                        key="loader"
                        className="loading-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <div className="spinner" />
                        <p className="loading-text">Fetching weather data…</p>
                    </motion.div>
                )}

                {!loading && error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="error-banner"
                    >
                        ⚠️ {error}
                    </motion.div>
                )}

                {!loading && !error && current && (
                    <motion.div
                        key={current.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <WeatherCard />
                        <WeatherDetails />
                        <HourlyForecast />
                        <ForecastSection />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Recent Cities */}
            {recentCities.length > 1 && !loading && (
                <div>
                    <div className="section-title" style={{ marginTop: 8 }}>Recent Searches</div>
                    <div className="recent-cities">
                        {recentCities.slice(1).map((city) => (
                            <button
                                key={city}
                                className="recent-chip"
                                onClick={() => loadWeather(city)}
                            >
                                🕐 {city}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
};

export default Home;
