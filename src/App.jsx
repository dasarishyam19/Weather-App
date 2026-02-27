import { WeatherProvider } from './context/WeatherContext';
import SearchBar from './components/SearchBar';
import ThemeToggle from './components/ThemeToggle';
import { useWeatherContext } from './context/WeatherContext';
import Home from './pages/Home';
import './styles/index.css';

const Header = () => {
  const { units, toggleUnits } = useWeatherContext();
  return (
    <header className="app-header">
      <div className="app-logo">⛅ WeatherNow</div>
      <SearchBar />
      <div className="header-controls">
        <button className="unit-toggle" onClick={toggleUnits}>
          {units === 'metric' ? '°C → °F' : '°F → °C'}
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
};

const AppInner = () => (
  <div className="app-wrapper">
    <Header />
    <Home />
  </div>
);

const App = () => (
  <WeatherProvider>
    <AppInner />
  </WeatherProvider>
);

export default App;
