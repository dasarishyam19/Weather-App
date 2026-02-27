import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';
import { searchCities } from '../api/weatherApi';
import { useWeatherContext } from '../context/useWeatherContext';
import { logError, normalizeError, ErrorIds } from '../utils/logger';

const SearchBar = () => {
  const { loadWeather, loadWeatherByCoords, setError } = useWeatherContext();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchCities(val);
        setSuggestions(results);
        setShowDropdown(true);
      } catch (error) {
        logError(ErrorIds.CITY_SEARCH_FAILED, normalizeError(error), {
          query: val,
        });
        setSuggestions([]);
      }
    }, 350);
  };

  const handleSelect = (cityName) => {
    setQuery(cityName);
    setShowDropdown(false);
    setSuggestions([]);
    loadWeather(cityName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      handleSelect(query.trim());
    }
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          await loadWeatherByCoords(coords.latitude, coords.longitude);
        } catch (error) {
          logError(ErrorIds.GEOLOCATION_FAILED, normalizeError(error), {
            context: 'after_geolocation',
          });
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        logError(ErrorIds.GEOLOCATION_DENIED, error, {
          code: error.code,
          message: error.message,
        });
        setLocating(false);

        const geolocationErrors = {
          [error.PERMISSION_DENIED]:
            'Location access denied. Please enable location permissions.',
          [error.POSITION_UNAVAILABLE]: 'Location information unavailable.',
          [error.TIMEOUT]: 'Location request timed out. Please try again.',
        };

        setError(
          geolocationErrors[error.code] ||
            'An unknown error occurred getting your location.'
        );
      },
      { timeout: 8000 }
    );
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  return (
    <div ref={wrapperRef} className="search-wrapper">
      <form onSubmit={handleSubmit} className="search-input-row">
        <FiSearch
          style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        />
        <input
          className="search-input"
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={handleInput}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="icon-btn"
          style={{ border: 'none', borderRadius: '8px' }}
          onClick={handleGeolocate}
          title="Use my location"
          aria-label="Use my location"
        >
          {locating ? (
            <span
              className="spinner"
              style={{ width: 18, height: 18, borderWidth: 2 }}
            />
          ) : (
            <FiMapPin />
          )}
        </button>
        <button type="submit" className="search-btn">
          Search
        </button>
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map((s) => (
            <div
              key={`${s.lat}-${s.lon}-${s.name}-${s.country}`}
              className="search-dropdown-item"
              onClick={() => handleSelect(`${s.name},${s.country}`)}
            >
              <span className="city-dot" />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {s.name}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                {s.state ? `${s.state}, ` : ''}
                {s.country}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
