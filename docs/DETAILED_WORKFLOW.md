# Weather App - Complete Workflow Documentation

**Document Version:** 1.0
**Date:** 2026-02-27
**Author:** Claude Code Analysis

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Initial Application Load](#initial-application-load)
3. [Workflow 1: City Search with Autocomplete](#workflow-1-city-search-with-autocomplete)
4. [Workflow 2: Direct City Search](#workflow-2-direct-city-search)
5. [Workflow 3: Geolocation Search](#workflow-3-geolocation-search)
6. [Workflow 4: Unit Toggle (Metric/Imperial)](#workflow-4-unit-toggle-metricimperial)
7. [Workflow 5: Theme Toggle](#workflow-5-theme-toggle)
8. [Workflow 6: Recent City Selection](#workflow-6-recent-city-selection)
9. [Component Data Flow Diagram](#component-data-flow-diagram)
10. [State Management Deep Dive](#state-management-deep-dive)

---

## Architecture Overview

### Application Structure

```
App.jsx (Root Component)
  │
  ├── WeatherProvider (Context Provider)
  │   ├── State: city, units, theme, current, forecast, loading, error, recentCities
  │   ├── Methods: loadWeather, loadWeatherByCoords, toggleUnits, toggleTheme
  │   └── Side Effects: localStorage operations, API calls, DOM manipulation
  │
  └── AppInner
      │
      ├── Header Component
      │   ├── SearchBar (User Input)
      │   ├── Unit Toggle Button
      │   └── Theme Toggle Button
      │
      └── Home Page
          ├── Loading State (if loading)
          ├── Error Banner (if error)
          ├── WeatherCard (Current Weather)
          ├── WeatherDetails (Weather Details)
          ├── HourlyForecast (24-hour forecast)
          ├── ForecastSection (5-day forecast)
          └── Recent Cities List
```

### Data Flow Pattern

```
User Input → Component Event Handler → Context Method → API Call → State Update → Component Re-render → UI Update
```

---

## Initial Application Load

### Step-by-Step Execution Flow

#### Phase 1: Entry Point (main.jsx)

**Line 1-9: main.jsx**

```javascript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

**Execution Flow:**

1. **Line 1-3:** Import React StrictMode and createRoot function from react-dom
   - **Purpose:** Enable React's StrictMode for additional development checks
   - **createRoot:** Creates a React root container for rendering

2. **Line 5:** Import the App component
   - **Purpose:** Load the root application component

3. **Line 6:** Get the root DOM element from HTML
   - **Purpose:** Locate the `<div id="root">` in index.html
   - **Value:** Reference to the DOM element where React will mount

4. **Line 6-9:** Render the App component
   - **Purpose:** Mount the React application to the DOM
   - **StrictMode:** Wraps App for additional development warnings
   - **Result:** App.jsx component is instantiated and rendered

---

#### Phase 2: App Component Initialization (App.jsx)

**Line 31-35: App.jsx**

```javascript
const App = () => (
  <WeatherProvider>
    <AppInner />
  </WeatherProvider>
);
```

**Execution Flow:**

1. **Line 31:** App functional component is called
   - **Purpose:** Root component that sets up the application structure

2. **Line 32:** WeatherProvider component is instantiated
   - **Purpose:** Provides weather state context to all child components
   - **Context Scope:** All components inside can access weather state
   - **File:** src/context/WeatherContext.jsx

3. **Line 33:** AppInner component is rendered inside provider
   - **Purpose:** Renders the actual UI components within context scope
   - **Access:** AppInner and all its children can now use useWeatherContext hook

---

#### Phase 3: WeatherProvider Initialization (WeatherContext.jsx)

**Line 11-37: WeatherContext.jsx**

```javascript
export const WeatherProvider = ({ children }) => {
    const [city, setCity] = useState('Kolkata');
    const [units, setUnits] = useState(() => {
        try {
            return localStorage.getItem('units') || 'metric';
        } catch {
            return 'metric';
        }
    });
    const [theme, setTheme] = useState(() => {
        try {
            return localStorage.getItem('theme') || 'dark';
        } catch {
            return 'dark';
        }
    });
    const [current, setCurrent] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [recentCities, setRecentCities] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('recentCities') || '[]');
        } catch {
            return [];
        }
    });
```

**Execution Flow:**

1. **Line 11:** WeatherProvider function component receives `children` prop
   - **Purpose:** This prop contains all child components (AppInner)
   - **Value:** `<AppInner />` component tree

2. **Line 12:** Initialize `city` state
   - **Hook:** useState('Kolkata')
   - **Initial Value:** 'Kolkata'
   - **Purpose:** Store current selected city name
   - **State Variables:**
     - `city`: Current city string
     - `setCity`: Function to update city

3. **Line 13-19:** Initialize `units` state with lazy initialization
   - **Hook:** useState with function initializer
   - **Purpose:** Store temperature unit preference ('metric' or 'imperial')
   - **Lazy Initialization:** Function runs once on mount
   - **Line 14-15:** Try to read from localStorage
     - **Key:** 'units'
     - **Fallback:** If null/undefined, return 'metric'
   - **Line 16-18:** Catch block handles localStorage errors
     - **Error Scenario:** localStorage disabled, corrupted, or quota exceeded
     - **Fallback:** Return 'metric' as default
   - **Result:** units = 'metric' or 'imperial' from saved preference

4. **Line 20-26:** Initialize `theme` state with lazy initialization
   - **Purpose:** Store theme preference ('light' or 'dark')
   - **Process:** Same pattern as units state
   - **Key:** 'theme' in localStorage
   - **Fallback:** 'dark' theme

5. **Line 27:** Initialize `current` state
   - **Initial Value:** null
   - **Purpose:** Store current weather data object
   - **Structure:** Will contain API response from OpenWeatherMap
   - **Data:**
     ```javascript
     {
       name: "City Name",
       sys: { country: "XX", timezone: 19800 },
       main: { temp: 25, feels_like: 26, humidity: 65 },
       weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
       timezone: 19800,
       visibility: 10000,
       wind: { speed: 3.5 }
     }
     ```

6. **Line 28:** Initialize `forecast` state
   - **Initial Value:** null
   - **Purpose:** Store 5-day forecast data
   - **Structure:** Array of 40 forecast items (every 3 hours for 5 days)

7. **Line 29:** Initialize `loading` state
   - **Initial Value:** false
   - **Purpose:** Track API loading state
   - **UI Impact:** Shows/hides loading spinner

8. **Line 30:** Initialize `error` state
   - **Initial Value:** null
   - **Purpose:** Store error messages
   - **UI Impact:** Shows error banner when not null

9. **Line 31-37:** Initialize `recentCities` state with lazy initialization
   - **Purpose:** Store last 5 searched cities
   - **Data Structure:** Array of city name strings
   - **Example:** ['Kolkata', 'London', 'New York', 'Tokyo', 'Paris']
   - **Process:**
     - **Line 32-33:** Try to parse JSON from localStorage
     - **Line 34:** Return empty array if nothing stored
     - **Line 35-36:** Catch JSON parsing errors

---

#### Phase 4: Create Context Methods (WeatherContext.jsx)

**Line 39-64: loadWeather function**

```javascript
const loadWeather = useCallback(
  async (cityName, unitPref = units) => {
    setLoading(true);
    setError(null);
    try {
      const [cur, fore] = await Promise.all([
        fetchCurrentWeather(cityName, unitPref),
        fetchForecast(cityName, unitPref),
      ]);
      setCurrent(cur);
      setForecast(fore);
      setCity(cityName);
      setRecentCities((prev) => {
        const next = [
          cityName,
          ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase()),
        ].slice(0, 5);
        try {
          localStorage.setItem('recentCities', JSON.stringify(next));
        } catch {
          // Silently fail if localStorage is full or unavailable
        }
        return next;
      });
    } catch (err) {
      setError(
        err.response?.data?.message || 'City not found. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  },
  [units]
);
```

**Purpose:** Fetch weather data for a city by name

**How useCallback Works:**

- **Line 39:** useCallback memoizes the function
- **Dependency Array (line 64):** `[units]`
- **Effect:** Function only re-created if `units` changes
- **Performance:** Prevents unnecessary re-renders in child components

**Function Parameters:**

- `cityName`: Name of city to fetch weather for
- `unitPref`: Unit system ('metric' or 'imperial'), defaults to current units state

**Execution Flow (when called):**

1. **Line 40:** `setLoading(true)`
   - **Purpose:** Show loading state in UI
   - **Effect:** Triggers re-render, Home.jsx shows spinner
   - **Components Affected:** Home.jsx displays loading overlay

2. **Line 41:** `setError(null)`
   - **Purpose:** Clear any previous errors
   - **Effect:** Hides error banner if visible

3. **Line 42:** Start try block
   - **Purpose:** Wrap API calls for error handling

4. **Line 43-46:** Parallel API calls using Promise.all

   ```javascript
   const [cur, fore] = await Promise.all([
     fetchCurrentWeather(cityName, unitPref),
     fetchForecast(cityName, unitPref),
   ]);
   ```

   - **Promise.all:** Executes both API calls in parallel
   - **Performance:** Faster than sequential await (2x speed)
   - **Execution:**
     - Both requests start simultaneously
     - Waits for BOTH to complete
     - Returns array of results: [currentWeather, forecast]
   - **cur:** Current weather data object
   - **fore:** Forecast data object

5. **Line 47:** `setCurrent(cur)`
   - **Purpose:** Store current weather in state
   - **Effect:** Triggers re-render of all components using this data
   - **Components Updated:** WeatherCard, WeatherDetails, HourlyForecast

6. **Line 48:** `setForecast(fore)`
   - **Purpose:** Store forecast data in state
   - **Effect:** Triggers re-render of forecast components
   - **Components Updated:** HourlyForecast, ForecastSection

7. **Line 49:** `setCity(cityName)`
   - **Purpose:** Update current city name
   - **Effect:** Updates Header display if showing city

8. **Line 50-58:** Update recent cities with functional setState

   ```javascript
   setRecentCities((prev) => {
     const next = [
       cityName,
       ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase()),
     ].slice(0, 5);
     try {
       localStorage.setItem('recentCities', JSON.stringify(next));
     } catch {
       // Silently fail if localStorage is full or unavailable
     }
     return next;
   });
   ```

   - **Line 50:** Functional setState receives previous state
   - **Line 51:** Create new array:
     - `[cityName, ...prev.filter(...)]`: Add new city at beginning
     - `.filter(...)`: Remove duplicate city names (case-insensitive)
     - `.slice(0, 5)`: Keep only first 5 cities
   - **Line 52-55:** Save to localStorage
     - **Key:** 'recentCities'
     - **Value:** JSON stringified array
     - **Error Handling:** Silently fails if localStorage unavailable
   - **Line 57:** Return new array

9. **Line 59-60:** Catch block for API errors

   ```javascript
   } catch (err) {
       setError(err.response?.data?.message || 'City not found. Please try again.');
   ```

   - **Purpose:** Handle API failures gracefully
   - **Optional Chaining:** `err.response?.data?.message`
     - Safely accesses nested error message from API
   - **Fallback:** 'City not found. Please try again.'
   - **Effect:** Shows error banner in Home.jsx

10. **Line 61-63:** Finally block

    ```javascript
    } finally {
        setLoading(false);
    }
    ```

    - **Purpose:** Always hide loading state
    - **Runs:** Whether API succeeds or fails
    - **Effect:** Hides loading spinner

---

**Line 107-109: Initial weather load**

```javascript
useEffect(() => {
  loadWeather(city);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

**Purpose:** Load default city weather on app mount

**Execution Flow:**

1. **Line 107:** useEffect hook
   - **Dependency Array:** `[]` (empty)
   - **Behavior:** Runs only once on component mount
   - **Timing:** After all state is initialized

2. **Line 108:** Call loadWeather with initial city
   - **Parameter:** `city` state value ('Kolkata')
   - **Result:** Fetches Kolkata weather on app load
   - **User Experience:** User sees data immediately without searching

3. **Line 109:** ESLint disable comment
   - **Reason:** Intentionally omitting `city` from dependencies
   - **Why:** We only want to load on mount, not when city changes
   - **Alternative:** Would create infinite loop if city included

---

**Line 111-113: Theme application**

```javascript
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

**Purpose:** Apply theme to HTML element

**Execution Flow:**

1. **Line 111:** useEffect hook
   - **Dependency:** `[theme]`
   - **Behavior:** Runs when theme state changes

2. **Line 112:** Set data-theme attribute
   - **Target:** document.documentElement (<html> tag)
   - **Attribute:** 'data-theme'
   - **Value:** Current theme state ('light' or 'dark')
   - **CSS Impact:** CSS variables change based on `[data-theme="dark"]` selector
   - **Result:** Entire app colors update instantly

---

**Line 116-125: Context Provider**

```javascript
return (
  <WeatherContext.Provider
    value={{
      city,
      units,
      theme,
      current,
      forecast,
      loading,
      error,
      recentCities,
      loadWeather,
      loadWeatherByCoords,
      toggleUnits,
      toggleTheme,
    }}
  >
    {children}
  </WeatherContext.Provider>
);
```

**Purpose:** Provide state and methods to all child components

**Context Value Object:**

| Property              | Type        | Purpose                        |
| --------------------- | ----------- | ------------------------------ |
| `city`                | string      | Current city name              |
| `units`               | string      | 'metric' or 'imperial'         |
| `theme`               | string      | 'light' or 'dark'              |
| `current`             | object/null | Current weather data           |
| `forecast`            | object/null | Forecast data                  |
| `loading`             | boolean     | Loading state                  |
| `error`               | string/null | Error message                  |
| `recentCities`        | array       | Last 5 searched cities         |
| `loadWeather`         | function    | Fetch weather by city name     |
| `loadWeatherByCoords` | function    | Fetch weather by coordinates   |
| `toggleUnits`         | function    | Switch between metric/imperial |
| `toggleTheme`         | function    | Switch between light/dark      |

**Children Rendering:**

- **Line 123:** `{children}` renders AppInner component
- **Result:** All components in tree can now use `useWeatherContext()`

---

#### Phase 5: AppInner Rendering (App.jsx)

**Line 8-22: Header Component**

```javascript
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
```

**Execution Flow:**

1. **Line 8:** Header functional component renders
   - **Called from:** AppInner component
   - **Frequency:** Re-renders when context value changes

2. **Line 9:** useWeatherContext hook
   - **Purpose:** Access weather context
   - **File:** src/context/useWeatherContext.js
   - **Returned:** Context value object from WeatherProvider
   - **Destructuring:** Extracts `units` and `toggleUnits` from context

3. **Line 11:** Render <header> element
   - **CSS Class:** 'app-header'
   - **Styling:** Flex container for layout

4. **Line 12:** App logo
   - **Text:** '⛅ WeatherNow'
   - **Purpose:** Brand identifier

5. **Line 13:** SearchBar component
   - **Purpose:** City search input with autocomplete
   - **Detailed Flow:** See Workflow 1

6. **Line 14:** Header controls div
   - **Purpose:** Container for toggle buttons

7. **Line 15:** Unit toggle button
   - **Event Handler:** onClick={toggleUnits}
   - **Dynamic Text:** Shows current unit direction
   - **If units='metric':** '°C → °F'
   - **If units='imperial':** '°F → °C'
   - **Purpose:** Allow user to switch temperature units

8. **Line 18:** ThemeToggle component
   - **Purpose:** Toggle between light/dark theme
   - **Detailed Flow:** See Workflow 5

---

#### Phase 6: Home Page Rendering (Home.jsx)

**Line 8-9: Component Setup**

```javascript
const Home = () => {
    const { loading, error, current, recentCities, loadWeather } = useWeatherContext();
```

**Execution Flow:**

1. **Line 8:** Home functional component renders
   - **Purpose:** Main content area of the app

2. **Line 9:** useWeatherContext hook
   - **Destructuring:**
     - `loading`: Boolean loading state
     - `error`: Error message string
     - `current`: Current weather data object
     - `recentCities`: Array of recent searches
     - `loadWeather`: Function to fetch weather
   - **Reactivity:** Component re-renders when any of these values change

**Line 11-73: Conditional Rendering**

```javascript
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
        <div className="section-title" style={{ marginTop: 8 }}>
          Recent Searches
        </div>
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
```

**Rendering Logic:**

**State 1: Loading State (Line 14-25)**

- **Condition:** `loading &&`
- **When True:** Show loading overlay
- **Animation:**
  - `key="loader"`: Unique key for AnimatePresence
  - `initial={{ opacity: 0 }}`: Start invisible
  - `animate={{ opacity: 1 }}`: Fade in
  - `exit={{ opacity: 0 }}`: Fade out on exit
- **Content:**
  - Spinner div (CSS animation)
  - Text: "Fetching weather data…"

**State 2: Error State (Line 27-37)**

- **Condition:** `!loading && error &&`
- **When True:** Show error banner
- **Animation:**
  - `key="error"`: Unique key for AnimatePresence
  - `initial={{ opacity: 0, y: -10 }}`: Start invisible and offset up
  - `animate={{ opacity: 1, y: 0 }}`: Fade in and slide to position
- **Content:** ⚠️ {error message}
- **Effect:** User sees descriptive error message

**State 3: Success State (Line 39-52)**

- **Condition:** `!loading && !error && current &&`
- **When True:** Show all weather components
- **Animation:**
  - `key={current.id}`: Unique key for each city
  - `initial={{ opacity: 0 }}`: Start invisible
  - `animate={{ opacity: 1 }}`: Fade in
  - `transition={{ duration: 0.4 }}`: 400ms duration
- **Components Rendered:**
  1. WeatherCard - Main weather display
  2. WeatherDetails - Detailed metrics
  3. HourlyForecast - 24-hour forecast
  4. ForecastSection - 5-day forecast

**State 4: Recent Cities (Line 56-71)**

- **Condition:** `recentCities.length > 1 && !loading &&`
- **Why > 1:** Skip current city (index 0), show only history
- **Process:**
  - `recentCities.slice(1)`: Remove first city (current)
  - `.map((city) => ...)`: Map each city to button
  - `onClick={() => loadWeather(city)}`: Load weather on click
  - `key={city}`: Use city name as unique key
- **UI:** Chips with clock emoji and city name

---

## Workflow 1: City Search with Autocomplete

### User Action: User types "New" in search box

#### Phase 1: Input Event (SearchBar.jsx)

**Line 95-100: Input Element**

```javascript
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
```

**Element Properties:**

- **value={query}**: Controlled input bound to query state
- **onChange={handleInput}**: Event handler for input changes
- **onFocus**: Show dropdown if suggestions exist
- **autoComplete="off"**: Disable browser autocomplete
- **spellCheck={false}**: Disable spell checking

---

#### Phase 2: handleInput Function Execution

**Line 15-27: handleInput**

```javascript
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
    } catch {
      setSuggestions([]);
    }
  }, 350);
};
```

**Step-by-Step Execution:**

**Step 1: Event Object (Line 16)**

```javascript
const val = e.target.value;
```

- **e.target.value**: 'New' (current input value)
- **Purpose:** Extract text from input element
- **Result:** val = 'New'

**Step 2: Update Query State (Line 17)**

```javascript
setQuery(val);
```

- **Function:** setQuery from useState
- **New Value:** 'New'
- **Effect:** Re-renders input with new value
- **React Flow:**
  1. State update scheduled
  2. Component re-render queued
  3. Virtual DOM updates
  4. Actual DOM updates (input shows 'New')

**Step 3: Clear Previous Timeout (Line 18)**

```javascript
clearTimeout(debounceRef.current);
```

- **Purpose:** Cancel previous pending API call
- **Scenario:** User types continuously (N, Ne, New)
- **Effect:** Prevents API calls for partial inputs
- **Performance:** Reduces unnecessary API calls

**Step 4: Input Validation (Line 19)**

```javascript
if (val.trim().length < 2) {
  setSuggestions([]);
  setShowDropdown(false);
  return;
}
```

- **Condition:** If input length < 2 characters
- **Current Value:** 'New' (length 3)
- **Condition Result:** FALSE (continues to next step)
- **If TRUE:**
  - Clear suggestions array
  - Hide dropdown
  - Exit function early

**Step 5: Schedule Debounced API Call (Line 20-26)**

```javascript
debounceRef.current = setTimeout(async () => {
  try {
    const results = await searchCities(val);
    setSuggestions(results);
    setShowDropdown(true);
  } catch {
    setSuggestions([]);
  }
}, 350);
```

**Detailed Breakdown:**

**Line 20:** `setTimeout` schedules callback

- **Delay:** 350 milliseconds
- **Purpose:** Wait for user to stop typing
- **Behavior:** If user types within 350ms, timeout is cleared and restarted
- **Reference:** Stored in `debounceRef.current` for later clearing

**Timeline:**

```
t=0ms:    User types 'N'
t=0ms:    setTimeout scheduled for 350ms
t=100ms:  User types 'e' (clears previous timeout, schedules new)
t=200ms:  User types 'w' (clears previous timeout, schedules new)
t=550ms:  setTimeout callback executes (350ms after last keystroke)
```

**Line 21:** `try` block starts

- **Purpose:** Error handling for API call

**Line 22:** `await searchCities(val)`

- **Function Call:** searchCities('New')
- **File:** src/api/weatherApi.js
- **Execution:**
  1. Makes HTTP request to OpenWeatherMap Geocoding API
  2. Endpoint: /geo/1.0/direct
  3. Parameters: { q: 'New', limit: 5, appid: API_KEY }
  4. Waits for response (async)
  5. Returns array of matching cities

**API Response Example:**

```json
[
  {
    "name": "New York",
    "lat": 40.7128,
    "lon": -74.006,
    "country": "US",
    "state": "New York"
  },
  {
    "name": "New Delhi",
    "lat": 28.6139,
    "lon": 77.209,
    "country": "IN",
    "state": "Delhi"
  },
  {
    "name": "New Orleans",
    "lat": 29.9511,
    "lon": -90.0715,
    "country": "US",
    "state": "Louisiana"
  }
]
```

**Line 23:** `setSuggestions(results)`

- **State Update:** suggestions = [array of city objects]
- **Effect:** Triggers re-render of SearchBar
- **Purpose:** Store search results for display

**Line 24:** `setShowDropdown(true)`

- **State Update:** showDropdown = true
- **Effect:** Dropdown becomes visible
- **Result:** User sees city suggestions

**Line 25:** `catch` block

- **Purpose:** Handle API failures
- **Effect:** Clear suggestions if API error
- **Result:** No dropdown shown

---

#### Phase 3: Dropdown Rendering

**Line 119-135: Dropdown JSX**

```javascript
{
  showDropdown && suggestions.length > 0 && (
    <div className="search-dropdown">
      {suggestions.map((s, i) => (
        <div
          key={i}
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
  );
}
```

**Conditional Rendering:**

- **showDropdown = true:** Dropdown should be visible
- **suggestions.length > 0:** Has results to show
- **Both true:** Dropdown renders

**Mapping Loop:**

- **suggestions.map((s, i) => ...)**: Iterate through results
- **s:** Individual city object
- **i:** Array index (used as key)

**Example Rendered Output:**

```html
<div class="search-dropdown">
  <div class="search-dropdown-item" onClick="...">New York, New York, US</div>
  <div class="search-dropdown-item" onClick="...">New Delhi, Delhi, IN</div>
  <div class="search-dropdown-item" onClick="...">
    New Orleans, Louisiana, US
  </div>
</div>
```

---

#### Phase 4: User Selects Suggestion

**User Action:** User clicks "New York, US" suggestion

**Event Trigger:** onClick handler fires

**Line 125:** `onClick={() => handleSelect(`${s.name},${s.country}`)}`

**Arrow Function:**

- **s.name:** 'New York'
- **s.country:** 'US'
- **Result:** `handleSelect('New York,US')` called

---

#### Phase 5: handleSelect Function

**Line 29-34: handleSelect**

```javascript
const handleSelect = (cityName) => {
  setQuery(cityName);
  setShowDropdown(false);
  setSuggestions([]);
  loadWeather(cityName);
};
```

**Step-by-Step Execution:**

**Step 1: Update Query (Line 30)**

```javascript
setQuery(cityName);
```

- **Parameter:** 'New York,US'
- **State Update:** query = 'New York,US'
- **UI Effect:** Input shows selected city name

**Step 2: Hide Dropdown (Line 31)**

```javascript
setShowDropdown(false);
```

- **State Update:** showDropdown = false
- **UI Effect:** Dropdown disappears

**Step 3: Clear Suggestions (Line 32)**

```javascript
setSuggestions([]);
```

- **State Update:** suggestions = []
- **Purpose:** Clean up to prevent stale data

**Step 4: Load Weather (Line 33)**

```javascript
loadWeather(cityName);
```

- **Function Call:** loadWeather('New York,US')
- **Context Method:** From WeatherContext.jsx
- **Purpose:** Fetch weather for selected city

---

#### Phase 6: loadWeather Execution

**Detailed Flow (from Initial Load section):**

**Line 40:** `setLoading(true)`

- **State Update:** loading = true
- **UI Effect:** Home.jsx shows loading spinner
- **Animation:** Fades in loading overlay

**Line 41:** `setError(null)`

- **State Update:** error = null
- **UI Effect:** Hides error banner if visible

**Line 43-46:** Parallel API Calls

```javascript
const [cur, fore] = await Promise.all([
  fetchCurrentWeather('New York,US', 'metric'),
  fetchForecast('New York,US', 'metric'),
]);
```

**fetchCurrentWeather Execution:**

- **File:** src/api/weatherApi.js
- **Line 16-24:** Function definition

**Step-by-Step API Call:**

1. **Line 17-19:** API Key Validation

   ```javascript
   if (!API_KEY) {
     throw new Error('API key is not configured...');
   }
   ```

   - **Check:** API_KEY exists in environment
   - **Pass:** API_KEY is valid (from .env file)

2. **Line 20-22:** Axios GET Request

   ```javascript
   const response = await api.get('/data/2.5/weather', {
     params: { q: 'New York,US', appid: API_KEY, units: 'metric' },
   });
   ```

   - **Full URL:** https://api.openweathermap.org/data/2.5/weather?q=New%20York,US&appid=XXX&units=metric
   - **HTTP Method:** GET
   - **Query Parameters:**
     - q: 'New York,US' (city name)
     - appid: API_KEY (authentication)
     - units: 'metric' (Celsius, m/s, etc.)

3. **API Request Processing:**
   - **OpenWeatherMap Server:** Receives request
   - **Database Lookup:** Finds weather data for New York
   - **Data Retrieval:** Gets current conditions
   - **Response Construction:** Creates JSON response

4. **API Response Example:**

   ```json
   {
     "id": 5128581,
     "name": "New York",
     "sys": {
       "country": "US",
       "timezone": -18000,
       "sunrise": 1740628800,
       "sunset": 1740664800
     },
     "main": {
       "temp": 15.5,
       "feels_like": 14.2,
       "temp_min": 13.0,
       "temp_max": 17.0,
       "pressure": 1015,
       "humidity": 65
     },
     "weather": [
       {
         "main": "Clear",
         "description": "clear sky",
         "icon": "01d"
       }
     ],
     "timezone": -18000,
     "visibility": 10000,
     "wind": {
       "speed": 3.5,
       "deg": 230
     },
     "dt": 1740640800
   }
   ```

5. **Line 23:** Return data

   ```javascript
   return response.data;
   ```

   - **Return Value:** Current weather object
   - **Stored in:** cur variable (from Promise.all destructuring)

**fetchForecast Execution:**

- **File:** src/api/weatherApi.js
- **Line 36-44:** Function definition

1. **Line 40-42:** Axios GET Request

   ```javascript
   const response = await api.get('/data/2.5/forecast', {
     params: { q: 'New York,US', appid: API_KEY, units: 'metric', cnt: 40 },
   });
   ```

   - **Full URL:** https://api.openweathermap.org/data/2.5/forecast?q=New%20York,US&appid=XXX&units=metric&cnt=40
   - **Parameter cnt: 40:** Request 40 forecast items (5 days × 8 items/day)

2. **API Response Structure:**

   ```json
   {
     "city": { "name": "New York", "country": "US" },
     "list": [
       {
         "dt": 1740640800,
         "dt_txt": "2025-02-27 12:00:00",
         "main": { "temp": 15.5, "temp_min": 13.0, "temp_max": 17.0 },
         "weather": [
           { "main": "Clear", "description": "clear sky", "icon": "01d" }
         ],
         "wind": { "speed": 3.5 },
         "pop": 0.0
       }
       // ... 39 more items
     ]
   }
   ```

3. **Line 43:** Return data

   ```javascript
   return response.data;
   ```

   - **Return Value:** Forecast object with list array
   - **Stored in:** fore variable

**Promise.all Completion:**

- **Both requests complete**
- **Array destructured:** [cur, fore]
- **cur:** Current weather object
- **fore:** Forecast object
- **Execution continues** to state updates

---

#### Phase 7: State Updates

**Line 47:** `setCurrent(cur)`

- **State Update:** current = cur (New York weather data)
- **React Flow:**
  1. State change detected
  2. Components using context marked for re-render
  3. Re-render scheduled

**Line 48:** `setForecast(fore)`

- **State Update:** forecast = fore (5-day forecast data)
- **Effect:** Forecast components receive new data

**Line 49:** `setCity(cityName)`

- **State Update:** city = 'New York,US'
- **Effect:** Updates tracking of current city

**Line 50-58:** Update Recent Cities

```javascript
setRecentCities((prev) => {
  const next = [
    'New York,US',
    ...prev.filter((c) => c.toLowerCase() !== 'New York,US'.toLowerCase()),
  ].slice(0, 5);
  try {
    localStorage.setItem('recentCities', JSON.stringify(next));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
  return next;
});
```

**Execution:**

1. **prev:** ['Kolkata', 'London', 'Tokyo'] (previous recent cities)
2. **filter:** Removes 'Kolkata' if already exists (case-insensitive)
3. **Prepend:** Adds 'New York,US' to beginning
4. **slice(0, 5):** Keeps only 5 cities
5. **Result:** ['New York,US', 'London', 'Tokyo']
6. **localStorage:** Saved to browser
7. **State Update:** recentCities updated

**Line 62:** `setLoading(false)`

- **State Update:** loading = false
- **UI Effect:** Loading spinner disappears

---

#### Phase 8: Component Re-rendering

**Re-render Chain:**

1. **WeatherContext Provider**
   - Context value changed (current, forecast, city, recentCities, loading)
   - All consumers notified

2. **Home.jsx**
   - Reads new context values
   - **loading = false:** Hides loading overlay
   - **error = null:** No error banner
   - **current = object:** Shows weather components
   - **recentCities:** Updated recent cities list

3. **WeatherCard.jsx**
   - Receives new current data
   - Re-renders with New York weather
   - **Animation:** Fades in with new data

4. **WeatherDetails.jsx**
   - Receives new current data
   - Re-renders details grid
   - **Animation:** Staggered fade-in of detail cards

5. **HourlyForecast.jsx**
   - Receives new forecast data
   - Extracts first 9 items (24 hours)
   - Re-renders hourly cards

6. **ForecastSection.jsx**
   - Receives new forecast data
   - Groups by day
   - Re-renders 5-day forecast

---

#### Phase 9: WeatherCard Rendering (Detailed)

**Line 23-28: Component Setup**

```javascript
const WeatherCard = () => {
    const { current, units } = useWeatherContext();
    if (!current) return null;
```

**Execution:**

1. **Line 24:** Destructure context
   - **current:** New York weather object
   - **units:** 'metric'

2. **Line 25:** Guard clause
   - **Condition:** if (!current)
   - **Current State:** current exists (has data)
   - **Result:** Continues to render

**Line 27:** `getConditionClass(current.weather?.[0]?.main)`

- **Input:** 'Clear' (from API data)
- **Function (Line 4-14):**
  ```javascript
  const getConditionClass = (weatherMain) => {
    if (!weatherMain) return 'default';
    const s = weatherMain.toLowerCase();
    if (s.includes('clear')) return 'clear';
    if (s.includes('cloud')) return 'clouds';
    // ...
    return 'default';
  };
  ```
- **Result:** 'clear'
- **Purpose:** CSS class for background gradient

**Line 28:** `const iconUrl = ...`

- **URL:** `https://openweathermap.org/img/wn/01d@4x.png`
- **Size:** @4x (largest size)
- **Purpose:** High-res weather icon

**Line 29:** `const unit = units === 'metric' ? '°C' : '°F'`

- **Result:** '°C' (units is 'metric')

**Line 31-69:** JSX Rendering

**Key Elements:**

**Line 34:** `<WeatherBackground condClass={condClass} />`

- **Purpose:** Updates background gradient
- **condClass:** 'clear'
- **Result:** `<div class="app-bg-gradient clear" />`
- **CSS:** Changes background to sunny gradient

**Line 35-68:** Main Weather Card

- **Line 40:** key={current.id}
  - **Value:** 5128581 (unique ID for New York)
  - **Purpose:** React reconciliation key

**Line 43:** `{current.name}`

- **Rendered:** 'New York'

**Line 44-46:** Country and Time

```javascript
<span>{current.sys?.country}</span>
<span className="weather-date-time">· {formatDateTime(current.timezone)}</span>
```

- **Country:** 'US'
- **formatDateTime(-18000):** Converts timezone to local time
- **Function (Line 16-21):**
  ```javascript
  const formatDateTime = (timezone) => {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + timezone * 1000);
    return (
      local.toISOString().replace('T', ' ').split(' ')[1]?.substring(0, 5) || ''
    );
  };
  ```
- **Result:** '07:30' (local time in New York)

**Line 48-49:** Temperature Display

```javascript
<div className="weather-temp">
  {Math.round(current.main?.temp)}
  {unit}
</div>
```

- **current.main?.temp:** 15.5
- **Math.round(15.5):** 16
- **unit:** '°C'
- **Rendered:** '16°C'

**Line 51-52:** Feels Like

```javascript
<div className="weather-feels">
  Feels like {Math.round(current.main?.feels_like)}
  {unit}
</div>
```

- **feels_like:** 14.2
- **Math.round(14.2):** 14
- **Rendered:** 'Feels like 14°C'

**Line 54-55:** Description

```javascript
<div className="weather-desc">{current.weather?.[0]?.description}</div>
```

- **weather[0].description:** 'clear sky'
- **Rendered:** 'clear sky'

**Line 59-66:** Weather Icon

```javascript
<motion.img
  src={iconUrl}
  alt={current.weather?.[0]?.description}
  className="weather-icon-large"
  initial={{ scale: 0.8, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.6, delay: 0.2, type: 'spring', stiffness: 100 }}
/>
```

- **Animation:** Spring animation from 80% to 100% scale
- **Delay:** 0.2 seconds
- **Effect:** Icon bounces in smoothly

---

## Workflow 2: Direct City Search

### User Action: User types "London" and presses Enter

#### Phase 1: Form Submission

**Line 36-41: handleSubmit**

```javascript
const handleSubmit = (e) => {
  e.preventDefault();
  if (query.trim()) {
    handleSelect(query.trim());
  }
};
```

**Execution Flow:**

**Step 1: Prevent Default (Line 37)**

```javascript
e.preventDefault();
```

- **Purpose:** Stop form from submitting and refreshing page
- **Default Behavior:** Form submission would reload page
- **After Prevention:** Page stays, JavaScript handles submission

**Step 2: Validate Input (Line 38)**

```javascript
if (query.trim())
```

- **query:** 'London' (current input value)
- **trim():** Removes whitespace from ends
- **Result:** 'London' (truthy)
- **Condition:** TRUE → Proceeds

**Step 3: Handle Selection (Line 39)**

```javascript
handleSelect(query.trim());
```

- **Parameter:** 'London' (trimmed)
- **Function:** handleSelect (defined in Workflow 1)
- **Effect:** Loads weather for London

---

#### Phase 2: Same Execution as Workflow 1

**From this point, execution is identical to Workflow 1:**

1. Update query state
2. Hide dropdown
3. Clear suggestions
4. Call loadWeather('London')
5. Set loading state
6. Make API calls
7. Update current and forecast states
8. Update recent cities
9. Clear loading state
10. Re-render components

---

## Workflow 3: Geolocation Search

### User Action: User clicks location button (📍)

#### Phase 1: handleGeolocate Execution

**Line 43-72: handleGeolocate**

```javascript
const handleGeolocate = () => {
  if (!navigator.geolocation) {
    setError('Geolocation is not supported by your browser.');
    return;
  }
  setLocating(true);
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      await loadWeatherByCoords(coords.latitude, coords.longitude);
      setLocating(false);
    },
    (error) => {
      setLocating(false);
      switch (error.code) {
        case error.PERMISSION_DENIED:
          setError(
            'Location access denied. Please enable location permissions.'
          );
          break;
        case error.POSITION_UNAVAILABLE:
          setError('Location information unavailable.');
          break;
        case error.TIMEOUT:
          setError('Location request timed out. Please try again.');
          break;
        default:
          setError('An unknown error occurred getting your location.');
      }
    },
    { timeout: 8000 }
  );
};
```

**Step-by-Step Execution:**

**Step 1: Browser Support Check (Line 44)**

```javascript
if (!navigator.geolocation)
```

- **navigator.geolocation:** Browser API for location
- **Result:** true (most modern browsers support it)
- **If FALSE:** Show error and exit

**Step 2: Show Loading State (Line 48)**

```javascript
setLocating(true);
```

- **State Update:** locating = true
- **UI Effect:** Button shows spinner instead of pin icon
- **Line 112-114:**
  ```javascript
  {
    locating ? (
      <span
        className="spinner"
        style={{ width: 18, height: 18, borderWidth: 2 }}
      />
    ) : (
      <FiMapPin />
    );
  }
  ```
- **Result:** Spinner animation

**Step 3: Request Location (Line 49)**

```javascript
navigator.geolocation.getCurrentPosition(
  successCallback,
  errorCallback,
  options
);
```

**Browser API Call:**

- **Function:** getCurrentPosition (native browser API)
- **Purpose:** Get user's current geographic coordinates
- **Async:** Takes time to determine location

**Success Callback (Line 50-52):**

```javascript
async ({ coords }) => {
  await loadWeatherByCoords(coords.latitude, coords.longitude);
  setLocating(false);
};
```

**Execution if Location Found:**

1. **Destructuring:** `{ coords }`
   - **coords.latitude:** User's latitude (e.g., 40.7128)
   - **coords.longitude:** User's longitude (e.g., -74.0060)

2. **Line 51:** Load Weather by Coordinates

   ```javascript
   await loadWeatherByCoords(coords.latitude, coords.longitude);
   ```

   - **Function:** From WeatherContext
   - **Parameters:** (40.7128, -74.0060)

**loadWeatherByCoords Execution (WeatherContext.jsx Line 66-82):**

```javascript
const loadWeatherByCoords = useCallback(
  async (lat, lon) => {
    setLoading(true);
    setError(null);
    try {
      const [cur, fore] = await Promise.all([
        fetchCurrentWeatherByCoords(lat, lon, units),
        fetchForecastByCoords(lat, lon, units),
      ]);
      setCurrent(cur);
      setForecast(fore);
      setCity(cur.name);
    } catch {
      setError('Could not fetch weather for your location.');
    } finally {
      setLoading(false);
    }
  },
  [units]
);
```

**Step-by-Step:**

1. **Line 67:** `setLoading(true)`
   - **UI Effect:** Shows loading overlay

2. **Line 68:** `setError(null)`
   - **Purpose:** Clear previous errors

3. **Line 70-73:** Parallel API Calls
   ```javascript
   const [cur, fore] = await Promise.all([
     fetchCurrentWeatherByCoords(40.7128, -74.006, 'metric'),
     fetchForecastByCoords(40.7128, -74.006, 'metric'),
   ]);
   ```

**fetchCurrentWeatherByCoords Execution (weatherApi.js Line 26-34):**

```javascript
export const fetchCurrentWeatherByCoords = async (
  lat,
  lon,
  units = 'metric'
) => {
  if (!API_KEY) {
    throw new Error('API key is not configured...');
  }
  const response = await api.get('/data/2.5/weather', {
    params: { lat, lon, appid: API_KEY, units },
  });
  return response.data;
};
```

**API Request:**

- **URL:** https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.0060&appid=XXX&units=metric
- **Method:** GET
- **Parameters:**
  - lat: 40.7128 (latitude)
  - lon: -74.0060 (longitude)
  - appid: API_KEY
  - units: 'metric'

**API Response:**

```json
{
  "id": 5128581,
  "name": "New York",
  "sys": { "country": "US", "timezone": -18000 },
  "main": { "temp": 15.5, "feels_like": 14.2 },
  "weather": [{ "main": "Clear", "icon": "01d" }],
  "timezone": -18000
}
```

**fetchForecastByCoords Execution (weatherApi.js Line 46-54):**

```javascript
export const fetchForecastByCoords = async (lat, lon, units = 'metric') => {
  if (!API_KEY) {
    throw new Error('API key is not configured...');
  }
  const response = await api.get('/data/2.5/forecast', {
    params: { lat, lon, appid: API_KEY, units, cnt: 40 },
  });
  return response.data;
};
```

**API Request:**

- **URL:** https://api.openweathermap.org/data/2.5/forecast?lat=40.7128&lon=-74.0060&appid=XXX&units=metric&cnt=40

**Response:** 40 forecast items

4. **Line 74-76:** Update State

   ```javascript
   setCurrent(cur);
   setForecast(fore);
   setCity(cur.name);
   ```

   - **cur.name:** 'New York' (determined from coordinates)
   - **Effect:** Weather loads for user's location

5. **Line 80:** `setLoading(false)`
   - **UI Effect:** Hides loading overlay

6. **Line 52 (SearchBar.jsx):** `setLocating(false)`
   - **UI Effect:** Location button shows pin icon again

**Error Callback (Line 54-68):**

```javascript
(error) => {
  setLocating(false);
  switch (error.code) {
    case error.PERMISSION_DENIED:
      setError('Location access denied. Please enable location permissions.');
      break;
    case error.POSITION_UNAVAILABLE:
      setError('Location information unavailable.');
      break;
    case error.TIMEOUT:
      setError('Location request timed out. Please try again.');
      break;
    default:
      setError('An unknown error occurred getting your location.');
  }
};
```

**Error Scenarios:**

**Scenario 1: Permission Denied**

- **User Action:** Clicks "Block" on location permission prompt
- **Error Code:** error.PERMISSION_DENIED (1)
- **Result:** setError('Location access denied...')
- **UI:** Error banner shows in Home.jsx

**Scenario 2: Position Unavailable**

- **Cause:** GPS unavailable, network issues
- **Error Code:** error.POSITION_UNAVAILABLE (2)
- **Result:** setError('Location information unavailable.')

**Scenario 3: Timeout**

- **Cause:** Location request takes too long
- **Error Code:** error.TIMEOUT (3)
- **Result:** setError('Location request timed out...')

**Options (Line 70):**

```javascript
{
  timeout: 8000;
}
```

- **timeout:** 8000 milliseconds (8 seconds)
- **Purpose:** Give up if location not found within 8 seconds

---

## Workflow 4: Unit Toggle (Metric/Imperial)

### User Action: User clicks "°C → °F" button

#### Phase 1: Button Click

**Location:** Header.jsx (App.jsx Line 15-17)

```javascript
<button className="unit-toggle" onClick={toggleUnits}>
  {units === 'metric' ? '°C → °F' : '°F → °C'}
</button>
```

**Button State:**

- **Current units:** 'metric'
- **Button Text:** '°C → °F'
- **onClick:** toggleUnits function

---

#### Phase 2: toggleUnits Execution

**Location:** WeatherContext.jsx (Line 84-93)

```javascript
const toggleUnits = useCallback(() => {
  const next = units === 'metric' ? 'imperial' : 'metric';
  setUnits(next);
  try {
    localStorage.setItem('units', next);
  } catch {
    // Silently fail if localStorage is unavailable
  }
  if (city) loadWeather(city, next);
}, [units, city, loadWeather]);
```

**Step-by-Step Execution:**

**Step 1: Calculate Next Unit (Line 85)**

```javascript
const next = units === 'metric' ? 'imperial' : 'metric';
```

- **Current units:** 'metric'
- **Ternary:** 'metric' === 'metric' → TRUE
- **Result:** next = 'imperial'

**Step 2: Update Units State (Line 86)**

```javascript
setUnits(next);
```

- **State Change:** units: 'metric' → 'imperial'
- **Effect:** All components re-render with new units

**Step 3: Save to localStorage (Line 87-91)**

```javascript
try {
  localStorage.setItem('units', next);
} catch {
  // Silently fail if localStorage is unavailable
}
```

- **Key:** 'units'
- **Value:** 'imperial'
- **Purpose:** Remember user preference
- **Persistence:** Available on next app load

**Step 4: Reload Weather (Line 92)**

```javascript
if (city) loadWeather(city, next);
```

- **Condition:** city exists (true, current city is 'New York')
- **Function Call:** loadWeather('New York', 'imperial')
- **Purpose:** Fetch weather data with imperial units

**Why Reload Weather?**

- OpenWeatherMap API returns data in requested units
- **metric:** Celsius, m/s, hPa
- **imperial:** Fahrenheit, mph, hPa
- Need to re-fetch to get converted values

---

#### Phase 3: loadWeather Execution with Imperial Units

**Location:** WeatherContext.jsx (Line 39-64)

**Function Call:**

```javascript
loadWeather('New York', 'imperial');
```

**Parameters:**

- **cityName:** 'New York'
- **unitPref:** 'imperial'

**Execution:**

**Line 40:** `setLoading(true)`

- **UI Effect:** Shows loading spinner

**Line 43-46:** API Calls

```javascript
const [cur, fore] = await Promise.all([
  fetchCurrentWeather('New York', 'imperial'),
  fetchForecast('New York', 'imperial'),
]);
```

**API Request URLs:**

- **Current Weather:** https://api.openweathermap.org/data/2.5/weather?q=New%20York&appid=XXX&units=imperial
- **Forecast:** https://api.openweathermap.org/data/2.5/forecast?q=New%20York&appid=XXX&units=imperial&cnt=40

**API Response (Imperial Units):**

```json
{
  "name": "New York",
  "main": {
    "temp": 59.9, // Fahrenheit (was 15.5 Celsius)
    "feels_like": 57.6, // Fahrenheit (was 14.2 Celsius)
    "temp_min": 55.4,
    "temp_max": 62.6
  },
  "wind": {
    "speed": 7.8 // mph (was 3.5 m/s)
  },
  "visibility": 10000 // meters (same in both)
}
```

**Line 47-48:** Update State

```javascript
setCurrent(cur);
setForecast(fore);
```

- **Current Data:** Now in imperial units
- **Forecast Data:** Now in imperial units

**Line 62:** `setLoading(false)`

- **UI Effect:** Hides loading spinner

---

#### Phase 4: Component Re-rendering

All components re-render with new data:

**WeatherCard.jsx:**

- **Line 29:** `const unit = units === 'metric' ? '°C' : '°F'`
- **Result:** '°F'
- **Line 49:** `{Math.round(current.main?.temp)}{unit}`
- **Calculation:** Math.round(59.9) + '°F'
- **Rendered:** '60°F'

**WeatherDetails.jsx:**

- **Line 33:** `const speedUnit = units === 'metric' ? 'm/s' : 'mph'`
- **Result:** 'mph'
- **Line 36:** Wind: `{Math.round(current.wind?.speed)} ${speedUnit}`
- **Calculation:** Math.round(7.8) + ' mph'
- **Rendered:** '8 mph'

**Header.jsx:**

- **Button Text:** `{units === 'metric' ? '°C → °F' : '°F → °C'}`
- **Current units:** 'imperial'
- **Rendered:** '°F → °C'

**User Experience:**

- Click button
- Loading spinner briefly (0.5-1 second)
- All temperatures update to Fahrenheit
- Wind speed updates to mph
- Button text flips to show reverse direction

---

## Workflow 5: Theme Toggle

### User Action: User clicks sun/moon button

#### Phase 1: ThemeToggle Component

**Location:** src/components/ThemeToggle.jsx

**Line 5-27: Component**

```javascript
const ThemeToggle = () => {
  const { theme, toggleTheme } = useWeatherContext();

  return (
    <motion.button
      className="icon-btn"
      onClick={toggleTheme}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-label="Toggle theme"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? <FiSun /> : <FiMoon />}
      </motion.span>
    </motion.button>
  );
};
```

**Component Rendering:**

**Line 6:** `const { theme, toggleTheme } = useWeatherContext()`

- **theme:** Current theme value ('dark' or 'light')
- **toggleTheme:** Function to switch themes
- **Current State:** theme = 'dark'

**Line 9-11:** Button Properties

```javascript
<motion.button
    className="icon-btn"
    onClick={toggleTheme}
    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
```

- **title:** 'Switch to light mode' (tooltip text)
- **onClick:** toggleTheme function

**Line 17-24:** Icon Animation

```javascript
<motion.span
    key={theme}
    initial={{ rotate: -90, opacity: 0 }}
    animate={{ rotate: 0, opacity: 1 }}
    transition={{ duration: 0.3 }}
>
```

- **key={theme}:** Important for AnimatePresence
  - When theme changes, key changes
  - React unmounts old span, mounts new one
  - Animation runs on each theme switch
- **initial:** Start rotated -90°, invisible
- **animate:** Rotate to 0°, fade in
- **transition:** 300ms duration

**Line 23:** Icon Selection

```javascript
{
  theme === 'dark' ? <FiSun /> : <FiMoon />;
}
```

- **Current theme:** 'dark'
- **Rendered:** <FiSun /> (sun icon)
- **Purpose:** Show opposite theme icon (click to get light mode)

---

#### Phase 2: toggleTheme Execution

**Location:** WeatherContext.jsx (Line 95-105)

```javascript
const toggleTheme = useCallback(() => {
  setTheme((prev) => {
    const next = prev === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem('theme', next);
    } catch {
      // Silently fail if localStorage is unavailable
    }
    return next;
  });
}, []);
```

**Step-by-Step Execution:**

**Step 1: Functional setState (Line 96)**

```javascript
setTheme((prev) => {
```

- **Purpose:** Update theme based on previous value
- **prev:** Current theme value ('dark')
- **Functional Form:** Ensures we get the latest state

**Step 2: Calculate Next Theme (Line 97)**

```javascript
const next = prev === 'dark' ? 'light' : 'dark';
```

- **prev:** 'dark'
- **Comparison:** 'dark' === 'dark' → TRUE
- **Result:** next = 'light'

**Step 3: Save to localStorage (Line 98-101)**

```javascript
try {
  localStorage.setItem('theme', next);
} catch {
  // Silently fail if localStorage is unavailable
}
```

- **Key:** 'theme'
- **Value:** 'light'
- **Purpose:** Persist user's theme preference
- **Next App Load:** Theme will be 'light'

**Step 4: Return New Theme (Line 103)**

```javascript
return next;
```

- **Returns:** 'light'
- **Effect:** Theme state updates to 'light'

---

#### Phase 3: Theme Application

**Location:** WeatherContext.jsx (Line 111-113)

```javascript
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

**Execution:**

**Trigger:** theme state changed ('dark' → 'light')

**Line 112:** `document.documentElement.setAttribute('data-theme', theme)`

- **document.documentElement:** <html> element
- **setAttribute:** Sets attribute on HTML element
- **Attribute:** 'data-theme'
- **Value:** 'light'

**Before:**

```html
<html data-theme="dark"></html>
```

**After:**

```html
<html data-theme="light"></html>
```

---

#### Phase 4: CSS Variable Update

**CSS Mechanism:**

```css
:root {
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --bg-primary: #0f0f1e;
  --bg-secondary: #1a1a2e;
}

[data-theme='light'] {
  --text-primary: #1a1a2e;
  --text-secondary: #4a4a5e;
  --bg-primary: #f5f5f7;
  --bg-secondary: #ffffff;
}
```

**CSS Cascade:**

1. **Root variables defined:** Default dark theme values
2. **data-theme="light" attribute added:** HTML element
3. **Selector matches:** `[data-theme="light"]`
4. **Variables overridden:** Light theme values apply
5. **All CSS variables update:** Instantly changes all colors

**React Re-render Chain:**

1. **WeatherContext**
   - theme state changes
   - Context consumers notified

2. **Header.jsx**
   - Reads theme from context
   - Re-renders (though no visual change)

3. **ThemeToggle.jsx**
   - Reads theme from context
   - Icon updates: <FiSun /> → <FiMoon />
   - Animation runs (key changes)

4. **All Components**
   - CSS variables changed
   - Background colors update
   - Text colors update
   - No component re-renders needed for CSS!

**Visual Transition:**

- Background: Dark (#0f0f1e) → Light (#f5f5f7)
- Text: White (#ffffff) → Dark (#1a1a2e)
- Cards: Dark glass → Light glass
- Transition: Instant (CSS variable change)
- Animation: Icon rotates and fades (300ms)

---

## Workflow 6: Recent City Selection

### User Action: User clicks "🕐 London" chip

#### Phase 1: Recent Cities Rendering

**Location:** Home.jsx (Line 56-71)

```javascript
{
  recentCities.length > 1 && !loading && (
    <div>
      <div className="section-title" style={{ marginTop: 8 }}>
        Recent Searches
      </div>
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
  );
}
```

**Conditional Rendering:**

- **Condition 1:** `recentCities.length > 1`
  - **Purpose:** Only show if there are previous searches
  - **Why > 1:** Index 0 is current city, skip it
  - **Current State:** ['New York', 'London', 'Tokyo'] (length 3)
  - **Result:** TRUE

- **Condition 2:** `!loading`
  - **Purpose:** Don't show during loading
  - **Result:** TRUE (not loading)

**Rendering Logic:**

**Line 60:** `recentCities.slice(1)`

- **Original:** ['New York', 'London', 'Tokyo']
- **slice(1):** Removes first element
- **Result:** ['London', 'Tokyo']
- **Purpose:** Show only history, not current city

**Line 60:** `.map((city) => ...)`

- **Iteration 1:** city = 'London'
- **Iteration 2:** city = 'Tokyo'

**Button for London:**

```javascript
<button
  key="London"
  className="recent-chip"
  onClick={() => loadWeather('London')}
>
  🕐 London
</button>
```

---

#### Phase 2: User Clicks London Chip

**Event Trigger:** onClick handler fires

**Line 64:** `onClick={() => loadWeather(city)}`

- **city:** 'London'
- **Function:** loadWeather from context
- **Result:** loadWeather('London') called

---

#### Phase 3: loadWeather Execution

**Same as Workflow 1, Phase 6:**

1. **Line 40:** `setLoading(true)`
   - Loading spinner appears

2. **Line 41:** `setError(null)`
   - Clears previous errors

3. **Line 43-46:** API Calls

   ```javascript
   const [cur, fore] = await Promise.all([
     fetchCurrentWeather('London', 'metric'),
     fetchForecast('London', 'metric'),
   ]);
   ```

4. **API Requests:**
   - **Current Weather:** https://api.openweathermap.org/data/2.5/weather?q=London&appid=XXX&units=metric
   - **Forecast:** https://api.openweathermap.org/data/2.5/forecast?q=London&appid=XXX&units=metric&cnt=40

5. **API Response:**

   ```json
   {
     "name": "London",
     "sys": { "country": "GB", "timezone": 0 },
     "main": { "temp": 12.5, "feels_like": 11.2 },
     "weather": [{ "main": "Clouds", "icon": "03d" }]
   }
   ```

6. **Line 47-49:** Update State

   ```javascript
   setCurrent(cur);
   setForecast(fore);
   setCity('London');
   ```

7. **Line 50-58:** Update Recent Cities

   ```javascript
   setRecentCities((prev) => {
     const next = [
       'London',
       ...prev.filter((c) => c.toLowerCase() !== 'London'.toLowerCase()),
     ].slice(0, 5);
     // Result: ['London', 'New York', 'Tokyo']
     localStorage.setItem('recentCities', JSON.stringify(next));
     return next;
   });
   ```

   - **London** moves to front (now most recent)
   - **New York** stays in history
   - **Tokyo** stays in history

8. **Line 62:** `setLoading(false)`
   - Loading spinner disappears

---

#### Phase 4: Component Updates

**All components re-render with London data:**

1. **WeatherCard:**
   - City: "London"
   - Temperature: 13°C
   - Icon: Clouds (03d)
   - Background: Cloudy gradient

2. **WeatherDetails:**
   - Humidity, Wind, Pressure for London
   - Sunrise/Sunset in London timezone

3. **HourlyForecast:**
   - Next 9 hours for London

4. **ForecastSection:**
   - 5-day forecast for London

5. **Recent Cities:**
   - Updates to: ['London', 'New York', 'Tokyo']
   - Shows: 🕐 New York, 🕐 Tokyo (London is current, not shown)

**User Experience:**

- Click chip
- Quick loading (0.5-1 sec)
- London weather displays
- Recent chips update (London removed from list, now current)

---

## Component Data Flow Diagram

### Visual Representation

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     main.jsx                                 │
│  createRoot(document.getElementById('root')).render(<App />) │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      App.jsx                                 │
│  <WeatherProvider>                                          │
│    <AppInner>                                               │
│      <Header />  ────────────┐                             │
│      <Home />    ────────────┼──► Display Weather Data      │
│    </AppInner>                │                             │
│  </WeatherProvider>           │                             │
└───────────────────────────────┼─────────────────────────────┘
                                │
                                ▼
        ┌───────────────────────────────────────┐
        │      WeatherContext Provider          │
        │  ┌─────────────────────────────────┐  │
        │  │         STATE                   │  │
        │  │  • city: 'London'               │  │
        │  │  • units: 'metric'              │  │
        │  │  • theme: 'dark'                │  │
        │  │  • current: {weather data}      │  │
        │  │  • forecast: {forecast data}    │  │
        │  │  • loading: false               │  │
        │  │  • error: null                  │  │
        │  │  • recentCities: [...]          │  │
        │  │  ┌───────────────────────────┐  │  │
        │  │  │      METHODS              │  │  │
        │  │  │  • loadWeather()          │  │  │
        │  │  │  • loadWeatherByCoords()  │  │  │
        │  │  │  • toggleUnits()          │  │  │
        │  │  │  • toggleTheme()          │  │  │
        │  │  └───────────────────────────┘  │  │
        │  └─────────────────────────────────┘  │
        └───────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌─────────┐    ┌─────────┐    ┌──────────┐
    │ Search  │    │  Home   │    │  Header  │
    │  Bar    │    │         │    │          │
    └─────────┘    └─────────┘    └──────────┘
         │               │
         ▼               ▼
    ┌─────────┐    ┌──────────────────────────────┐
    │ Weather │    │  Display Components           │
    │  API    │    │  • WeatherCard               │
    └─────────┘    │  • WeatherDetails            │
         │         │  • HourlyForecast            │
         │         │  • ForecastSection           │
         ▼         └──────────────────────────────┘
    ┌────────────────────────────────┐
    │   OpenWeatherMap API Server    │
    │  • Current Weather Endpoint    │
    │  • Forecast Endpoint           │
    │  • Geocoding Endpoint          │
    └────────────────────────────────┘
```

---

## State Management Deep Dive

### React Hooks Used

#### 1. useState

**Purpose:** Manage component state

**Example (WeatherContext.jsx Line 12):**

```javascript
const [city, setCity] = useState('Kolkata');
```

**Breakdown:**

- **city:** State variable (current value)
- **setCity:** Setter function (updates state)
- **'Kolkata':** Initial value
- **Returns:** Array with [value, setter]

**When State Updates:**

1. setCity('London') called
2. React schedules re-render
3. Component re-executes
4. city now equals 'London'
5. All child components re-render

#### 2. useEffect

**Purpose:** Side effects (API calls, DOM manipulation)

**Example (WeatherContext.jsx Line 107):**

```javascript
useEffect(() => {
  loadWeather(city);
}, []);
```

**Dependency Array:** `[]`

- **Empty:** Runs once on mount
- **Has values:** Runs when values change
- **Omitted:** Runs on every render

**Effect Lifecycle:**

1. Component renders
2. React checks if dependencies changed
3. If yes, run effect
4. Cleanup function runs (if returned) before next effect

#### 3. useCallback

**Purpose:** Memoize functions (prevent recreation)

**Example (WeatherContext.jsx Line 39):**

```javascript
const loadWeather = useCallback(
  async (cityName, unitPref = units) => {
    // ...
  },
  [units]
);
```

**Why Use It:**

- **Without useCallback:** Function recreated on every render
- **With useCallback:** Function recreated only when units changes
- **Benefit:** Child components don't re-render unnecessarily

**Dependency Array:** `[units]`

- Function only re-created if units changes
- Prevents infinite loops in useEffect

#### 4. useContext

**Purpose:** Access context value

**Example (Home.jsx Line 9):**

```javascript
const { loading, error, current, recentCities, loadWeather } =
  useWeatherContext();
```

**How It Works:**

1. WeatherProvider creates context
2. useContext() finds nearest provider
3. Returns current context value
4. Component re-renders when context changes

#### 5. useRef

**Purpose:** Persist values across renders (no re-render)

**Example (SearchBar.jsx Line 12):**

```javascript
const debounceRef = useRef(null);
```

**Properties:**

- **.current:** Mutable property
- **No Re-render:** Changing .current doesn't cause re-render
- **Persists:** Value stays across renders

**Use Case:** Storing setTimeout ID for clearing

---

### Context API Architecture

**Provider Pattern:**

```javascript
// 1. Create Context
const WeatherContext = createContext();

// 2. Create Provider Component
export const WeatherProvider = ({ children }) => {
  const [state, setState] = useState(initialValue);

  // 3. Provide state to consumers
  return (
    <WeatherContext.Provider value={{ state, setState }}>
      {children}
    </WeatherContext.Provider>
  );
};

// 4. Consume Context
export const useWeatherContext = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeatherContext must be used within WeatherProvider');
  }
  return context;
};
```

**Benefits:**

- **Prop Drilling Eliminated:** No need to pass props through every level
- **Centralized State:** All weather data in one place
- **Easy Access:** Any component can access state with hook
- **Reactive:** Components auto-update when state changes

---

### Performance Optimizations

#### 1. Lazy Initialization

**Example (WeatherContext.jsx Line 13):**

```javascript
const [units, setUnits] = useState(() => {
  try {
    return localStorage.getItem('units') || 'metric';
  } catch {
    return 'metric';
  }
});
```

**Benefit:**

- Function runs once on mount
- Not re-run on re-renders
- Expensive operations (localStorage) only done once

#### 2. Debouncing

**Example (SearchBar.jsx Line 20):**

```javascript
debounceRef.current = setTimeout(async () => {
  const results = await searchCities(val);
  setSuggestions(results);
}, 350);
```

**Benefit:**

- Waits for user to stop typing
- Reduces API calls from 100 to 1-2 per search
- Faster user experience

#### 3. Parallel API Calls

**Example (WeatherContext.jsx Line 43):**

```javascript
const [cur, fore] = await Promise.all([
  fetchCurrentWeather(cityName, unitPref),
  fetchForecast(cityName, unitPref),
]);
```

**Benefit:**

- Both requests run simultaneously
- Total time = max(request1, request2)
- Sequential would be request1 + request2

#### 4. Functional setState

**Example (WeatherContext.jsx Line 50):**

```javascript
setRecentCities((prev) => {
    const next = [cityName, ...prev.filter(...)].slice(0, 5);
    return next;
});
```

**Benefit:**

- Always gets latest state
- Prevents stale state bugs
- No race conditions

---

## Error Handling Strategy

### 1. API Errors

**Try-Catch Blocks:**

```javascript
try {
  const data = await fetchWeather(city);
  setCurrent(data);
} catch (err) {
  setError(err.response?.data?.message || 'City not found');
} finally {
  setLoading(false);
}
```

**Error Sources:**

- Network timeout
- Invalid city name
- API rate limit
- Server error

### 2. localStorage Errors

**Try-Catch with Silent Fail:**

```javascript
try {
  localStorage.setItem('key', value);
} catch {
  // Silently fail
}
```

**Error Sources:**

- Storage quota exceeded
- Privacy mode
- Corrupted storage

### 3. Null Safety

**Optional Chaining:**

```javascript
current.weather?.[0]?.main;
```

**Prevents:**

- "Cannot read property 'main' of undefined"
- App crashes from missing data

---

## Async/Await Flow

### Promise.all Pattern

**Before (Sequential):**

```javascript
const cur = await fetchCurrentWeather(city); // 500ms
const fore = await fetchForecast(city); // 600ms
// Total: 1100ms
```

**After (Parallel):**

```javascript
const [cur, fore] = await Promise.all([
  fetchCurrentWeather(city), // 500ms
  fetchForecast(city), // 600ms
]);
// Total: 600ms (max of both)
```

**Error Handling:**

- If ANY promise rejects, Promise.all rejects
- Both requests must succeed
- If one fails, catch block handles error

---

## Summary

### Key Takeaways

1. **Unidirectional Data Flow:** User Input → State Update → Component Re-render
2. **Context API:** Centralized state management
3. **Hooks:** useState, useEffect, useCallback, useContext, useRef
4. **API Integration:** Axios for HTTP requests
5. **Error Handling:** Try-catch, optional chaining, user feedback
6. **Performance:** Debouncing, lazy initialization, parallel requests
7. **Persistence:** localStorage for user preferences
8. **Responsive UI:** Loading states, error messages, animations

### Data Flow Summary

```
Input → Handler → Context Method → API Call → State Update → Re-render → UI Update
```

### Component Hierarchy

```
App
├── WeatherProvider (Context)
│   ├── State Management
│   └── API Integration
│
└── AppInner
    ├── Header
    │   ├── SearchBar (Input)
    │   ├── UnitToggle
    │   └── ThemeToggle
    │
    └── Home
        ├── Loading/Error/Success States
        ├── WeatherCard
        ├── WeatherDetails
        ├── HourlyForecast
        ├── ForecastSection
        └── RecentCities
```

---

**End of Detailed Workflow Documentation**

This document provides a complete line-by-line analysis of how data flows through the weather application from user input to display. Use this as a reference for understanding the application's architecture and behavior.
