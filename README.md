# Weather App

A modern weather application built with React + Vite.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Framer Motion** - Animation library
- **Axios** - HTTP client
- **React Icons** - Icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── api/           # API calls
├── components/    # React components
├── context/       # React Context for state management
├── pages/         # Page components
└── styles/        # CSS styles
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_WEATHER_API_KEY=your_api_key_here
VITE_WEATHER_BASE_URL=https://api.openweathermap.org
```

See `.env.example` for reference.

## Code Quality

This project includes:
- ESLint for code linting
- Prettier for code formatting
- Husky for git hooks
- lint-staged for pre-commit checks
- commitlint for commit message validation

See [CODE_REVIEW_SETUP.md](./CODE_REVIEW_SETUP.md) for more details.

## License

MIT
