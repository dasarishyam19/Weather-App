# WeatherNow — Project Documentation

A complete reference for every file, folder, and package in this project.

---

## How to Run

```bash
cd /Users/shyamdasari/Developer/weather-app

npm start          # start dev server  (alias → npm run dev)
npm run dev        # start dev server
npm run build      # build for production
npm run preview    # preview production build locally
```

App is accessible at **http://localhost:5173**

---

## Packages Used

### Runtime Dependencies

| Package           | Version  | Purpose                                                                                                                                                                 |
| ----------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **react**         | ^19.2.0  | Core library for building component-based UIs. Manages the virtual DOM and component lifecycle.                                                                         |
| **react-dom**     | ^19.2.0  | Renders React components into the actual browser DOM via `createRoot`.                                                                                                  |
| **axios**         | ^1.13.5  | HTTP client for making API requests to OpenWeatherMap. Provides cleaner syntax than `fetch`, built-in JSON parsing, and easy error handling.                            |
| **framer-motion** | ^12.34.3 | Animation library for React. Used to animate card entrances, icon transitions, and the theme toggle icon. Provides `motion.div`, `AnimatePresence`, and spring physics. |
| **react-icons**   | ^5.5.0   | Comprehensive icon library bundling Font Awesome, Feather, Weather Icons, and more. Used for search, location pin, sun/moon, humidity, wind, etc.                       |

### Dev Dependencies

| Package                         | Version | Purpose                                                                                                                     |
| ------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| **vite**                        | ^7.3.1  | Ultra-fast build tool and dev server. Replaces Create React App. Provides Hot Module Replacement (HMR) and instant startup. |
| **@vitejs/plugin-react**        | ^5.1.1  | Vite plugin that enables React support — JSX transform, Fast Refresh (HMR for React components).                            |
| **eslint**                      | ^9.39.1 | JavaScript linter that catches code quality issues and enforces consistent style.                                           |
| **eslint-plugin-react-hooks**   | ^7.0.1  | ESLint rules for React Hooks (enforces `rules of hooks` — no conditional hooks, exhaustive deps).                           |
| **eslint-plugin-react-refresh** | ^0.4.24 | ESLint plugin ensuring only React components are exported from files to keep HMR working correctly.                         |
| **@eslint/js**                  | ^9.39.1 | Core ESLint JavaScript rule set used by the eslint config.                                                                  |
| **@types/react**                | ^19.2.7 | TypeScript type definitions for React (improves editor autocomplete even in JS projects).                                   |
| **@types/react-dom**            | ^19.2.3 | TypeScript type definitions for React DOM.                                                                                  |
| **globals**                     | ^16.5.0 | Provides lists of global variables (browser, node, etc.) needed by ESLint to understand the environment.                    |

---

## File & Folder Structure

```
weather-app/
├── public/               → Static assets served as-is (favicon etc.)
├── src/
│   ├── api/
│   │   └── weatherApi.js
│   ├── components/
│   │   ├── SearchBar.jsx
│   │   ├── WeatherCard.jsx
│   │   ├── WeatherDetails.jsx
│   │   ├── HourlyForecast.jsx
│   │   ├── ForecastSection.jsx
│   │   └── ThemeToggle.jsx
│   ├── context/
│   │   └── WeatherContext.jsx
│   ├── pages/
│   │   └── Home.jsx
│   ├── styles/
│   │   └── index.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
└── vite.config.js
```

---

## File Descriptions

### Root Files

#### `.env`

Stores environment variables that are **not committed to git**.

- `VITE_WEATHER_API_KEY` — Your OpenWeatherMap API key. Vite exposes this to the app via `import.meta.env`.
- `VITE_WEATHER_BASE_URL` — Base URL for the OpenWeatherMap REST API (`https://api.openweathermap.org`).

#### `index.html`

The single HTML file that serves as the entry point for the entire app.

- Contains the `<div id="root">` where React mounts itself.
- Includes the page `<title>`, meta description, and theme-color for mobile browsers.
- References `/src/main.jsx` as the JavaScript entry point.

#### `package.json`

Defines the project metadata, scripts, and all npm dependencies.

- **scripts**: `start` / `dev` (dev server), `build` (production bundle), `preview` (serve built output), `lint` (run ESLint).
- **dependencies**: Runtime packages bundled with the app.
- **devDependencies**: Tools used only during development/build; not shipped to users.

#### `vite.config.js`

Configuration file for the Vite build tool.

- Registers `@vitejs/plugin-react` to enable JSX and React Fast Refresh.
- Can be extended to define aliases, proxy API calls, or configure the build output directory.

---

### `src/main.jsx`

**The React entry point.**

- Creates the root React tree using `createRoot` (React 18+ API).
- Wraps the app in `<StrictMode>` which highlights potential bugs during development (double-renders hooks in dev mode to spot side-effect issues).
- Mounts `<App />` into the `#root` div in `index.html`.

---

### `src/App.jsx`

**The root application component.**

- Wraps everything in `<WeatherProvider>` so all child components can access the global weather state.
- Renders the `<Header>` (logo + search bar + unit toggle + theme toggle) and the `<Home>` page.
- Imports `index.css` to apply global styles to the entire app.
- The `Header` component consumes `toggleUnits` and `units` from context to render the unit toggle button.

---

### `src/api/weatherApi.js`

**All OpenWeatherMap API calls are centralised here.**

| Function                                       | Endpoint             | Purpose                                                             |
| ---------------------------------------------- | -------------------- | ------------------------------------------------------------------- |
| `fetchCurrentWeather(city, units)`             | `/data/2.5/weather`  | Fetches real-time weather for a city name                           |
| `fetchCurrentWeatherByCoords(lat, lon, units)` | `/data/2.5/weather`  | Same but uses GPS coordinates (for geolocation)                     |
| `fetchForecast(city, units)`                   | `/data/2.5/forecast` | 5-day / 3-hour interval forecast for a city                         |
| `fetchForecastByCoords(lat, lon, units)`       | `/data/2.5/forecast` | Same but uses GPS coordinates                                       |
| `searchCities(query)`                          | `/geo/1.0/direct`    | Geocoding search — returns up to 5 matching cities for autocomplete |

Uses an `axios` instance pre-configured with the base URL so individual functions only specify the path and params.

---

### `src/context/WeatherContext.jsx`

**The global state store for the entire app.**

Manages and exposes:

| State          | Type                       | Purpose                                                 |
| -------------- | -------------------------- | ------------------------------------------------------- |
| `city`         | string                     | Currently displayed city name                           |
| `units`        | `'metric'` \| `'imperial'` | Temperature unit preference (persisted in localStorage) |
| `theme`        | `'dark'` \| `'light'`      | UI theme (persisted in localStorage)                    |
| `current`      | object                     | Current weather API response data                       |
| `forecast`     | object                     | Forecast API response data                              |
| `loading`      | boolean                    | True while API calls are in-flight                      |
| `error`        | string \| null             | Error message if API call fails                         |
| `recentCities` | string[]                   | Last 5 searched cities (persisted in localStorage)      |

Key functions exposed via context:

- `loadWeather(cityName)` — Fetches current + forecast by city name.
- `loadWeatherByCoords(lat, lon)` — Fetches by GPS coords (used by geolocation).
- `toggleUnits()` — Switches metric/imperial and re-fetches data.
- `toggleTheme()` — Switches dark/light and writes to `localStorage`.

Also applies the `data-theme` attribute to `<html>` so CSS variables switch themes globally.

---

### `src/pages/Home.jsx`

**The main page layout component.**

- Orchestrates all the weather section components in order: `WeatherCard` → `WeatherDetails` → `HourlyForecast` → `ForecastSection`.
- Handles the three UI states using `AnimatePresence` from Framer Motion:
  1. **Loading** — Shows a spinner.
  2. **Error** — Shows a red error banner.
  3. **Success** — Shows all weather sections with a fade-in animation.
- Renders **Recent Cities** chips at the bottom when historical searches are available, allowing one-click re-fetch.

---

### `src/components/SearchBar.jsx`

**City search input with autocomplete and geolocation.**

- Controlled input that debounces API calls by **350ms** to avoid spam while typing.
- Calls `searchCities()` from the API layer and shows a dropdown of up to 5 city suggestions with country/state labels.
- **Geolocation button** (📍 pin icon): Uses the browser's `navigator.geolocation` API to get the user's current coordinates, then calls `loadWeatherByCoords`.
- Clicking outside the dropdown (detected via `mousedown` listener) closes it.
- Submitting the form (Enter key or "Search" button) triggers `loadWeather` with the typed city name.

---

### `src/components/WeatherCard.jsx`

**The hero card showing current weather.**

- Displays: city name, country, local date/time (offset by the city's `timezone` from the API), large temperature, feels-like temperature, weather description, and the official OpenWeatherMap weather icon (4x resolution).
- Calculates the `conditionClass` from the weather main description (e.g., `"Clear"` → `"clear"`) and injects it onto the background `<div>` to trigger the matching CSS gradient.
- Uses Framer Motion for a smooth slide-up card entrance and a spring-physics icon scale-in animation. Both re-trigger when the city changes (keyed on `current.id`).

---

### `src/components/WeatherDetails.jsx`

**An 8-card details grid for in-depth weather metrics.**

| Card       | Data Source                                                            |
| ---------- | ---------------------------------------------------------------------- |
| Humidity   | `main.humidity` (%)                                                    |
| Wind       | `wind.speed` (m/s or mph)                                              |
| Pressure   | `main.pressure` (hPa)                                                  |
| Visibility | `visibility` (converted from metres to km)                             |
| Sunrise    | `sys.sunrise` unix timestamp, formatted using the city timezone offset |
| Sunset     | `sys.sunset` unix timestamp, formatted using the city timezone offset  |
| Max Temp   | `main.temp_max`                                                        |
| Min Temp   | `main.temp_min`                                                        |

Each card animates in sequentially using staggered Framer Motion delays.
Uses `react-icons/wi` (Weather Icons) and `react-icons/fi` (Feather Icons) for visual icons.

---

### `src/components/HourlyForecast.jsx`

**A horizontally scrollable strip of hourly forecasts.**

- Takes the first 9 slots from the `/forecast` response (3-hour intervals → covers ~24 hours).
- Displays: local time (formatted using the city's UTC timezone offset), weather icon, temperature, and rain probability (💧 %) if > 0%.
- The first slot is always labelled **"Now"**.
- Cards animate in with a staggered left-slide using Framer Motion.
- Overflows horizontally and scrolls smoothly via CSS.

---

### `src/components/ForecastSection.jsx`

**A 5-day daily forecast grid.**

- Groups the 40 forecast slots (from `/forecast`) by date using `dt_txt`.
- Skips today (index 0) and shows the next **5 days**.
- For each day, picks the noon slot (`12:00`) as the representative entry, with a fallback to the first slot.
- Displays: day name (Mon, Tue…), weather icon, description, high/low temperatures, and rain probability.
- Cards stagger in with Framer Motion.

---

### `src/components/ThemeToggle.jsx`

**Animated dark/light mode toggle button.**

- Reads `theme` and `toggleTheme` from `WeatherContext`.
- Shows a **☀️ sun** icon in dark mode (click to switch to light) and a **🌙 moon** icon in light mode (click to switch to dark).
- Icon rotates in with a Framer Motion animation on every switch (`key={theme}` forces a re-mount).
- `whileTap` and `whileHover` provide tactile micro-interactions.

---

### `src/styles/index.css`

**The complete stylesheet for the entire application.**

Key design systems defined here:

| Section                         | Description                                                                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| CSS Custom Properties (`:root`) | All design tokens — colors, blur, shadows, border-radius, transition timing                                                                        |
| `[data-theme='light']` override | Remaps all tokens to light-mode values. Toggled by adding `data-theme="light"` on `<html>`.                                                        |
| `.glass-card`                   | The reusable glassmorphism card style — translucent background, backdrop blur, border, shadow                                                      |
| `.app-bg-gradient.*`            | Dynamic full-page background gradients per weather condition class (`clear`, `clouds`, `rain`, `storm`, `snow`, `mist`)                            |
| Component styles                | Scoped styles for every component: header, search bar, weather hero, details grid, hourly strip, forecast grid, loading spinner, recent city chips |
| Responsive breakpoints          | Mobile-first `@media` queries for 640px and 400px widths                                                                                           |

---

_Generated for WeatherNow — React.js Weather App_
