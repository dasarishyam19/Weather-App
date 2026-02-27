import { useState, useRef, useEffect, useCallback } from 'react';
import { FiSearch, FiMapPin, FiClock } from 'react-icons/fi';
import { searchCities } from '../api/weatherApi';
import { useWeatherContext } from '../context/WeatherContext';

const SearchBar = () => {
    const { loadWeather, loadWeatherByCoords, recentCities } = useWeatherContext();
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
        if (val.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchCities(val);
                setSuggestions(results);
                setShowDropdown(true);
            } catch { setSuggestions([]); }
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
        if (!navigator.geolocation) return;
        setLocating(true);
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                await loadWeatherByCoords(coords.latitude, coords.longitude);
                setLocating(false);
            },
            () => setLocating(false),
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

    const dropdownItems = showDropdown && suggestions.length > 0
        ? suggestions
        : !showDropdown && recentCities.length > 0 && !query
            ? null
            : [];

    return (
        <div ref={wrapperRef} className="search-wrapper">
            <form onSubmit={handleSubmit} className="search-input-row">
                <FiSearch style={{ color: 'var(--text-muted)', fontSize: '1rem', flexShrink: 0 }} />
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search for a city..."
                    value={query}
                    onChange={handleInput}
                    onFocus={() => { if (suggestions.length > 0) setShowDropdown(true); }}
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
                    {locating
                        ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                        : <FiMapPin />}
                </button>
                <button type="submit" className="search-btn">Search</button>
            </form>

            {showDropdown && suggestions.length > 0 && (
                <div className="search-dropdown">
                    {suggestions.map((s, i) => (
                        <div
                            key={i}
                            className="search-dropdown-item"
                            onClick={() => handleSelect(`${s.name},${s.country}`)}
                        >
                            <span className="city-dot" />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                {s.state ? `${s.state}, ` : ''}{s.country}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
