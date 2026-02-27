# Code Review & PR Review Setup

This project is configured with comprehensive code review and PR review tools.

## Installed Plugins

### Code Review Tools

- **ESLint** - JavaScript/React linting with additional plugins:
  - `eslint-plugin-react-hooks` - React Hooks rules
  - `eslint-plugin-react-refresh` - React Fast Refresh optimization
  - `eslint-plugin-import` - Import/export syntax validation and sorting
  - `eslint-plugin-jsx-a11y` - Accessibility checks for JSX elements

- **Prettier** - Code formatter with consistent styling

### PR Review Tools

- **Husky** - Git hooks for automating code quality checks
- **lint-staged** - Run linters/formatters on staged files only
- **commitlint** - Enforce conventional commit messages

## Available Scripts

```bash
# Run ESLint to check for code issues
npm run lint

# Auto-fix ESLint issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check if files are properly formatted
npm run format:check

# Type check (if TypeScript is added)
npm run type-check
```

## Git Hooks

### Pre-commit Hook

Runs `lint-staged` before each commit:

- Lints and auto-fixes JavaScript/JSX files
- Formats all supported files with Prettier

### Commit Message Hook

Validates commit messages using conventional commits format:

```
feat: add new feature
fix: correct bug
docs: update documentation
style: formatting changes
refactor: code refactoring
perf: performance improvements
test: adding/updating tests
chore: maintenance tasks
```

## Usage

### Initial Setup (when git is initialized)

```bash
# Initialize git repository
git init

# Install Husky hooks
npm run prepare

# Or for Husky v9+
npx husky install
```

### Daily Workflow

1. Make changes to your code
2. Stage files: `git add .`
3. The pre-commit hook will automatically:
   - Check and fix linting issues
   - Format your code
4. Commit with conventional format: `git commit -m "feat: add weather search"`
5. The commit-msg hook validates your message format

### Code Review Checklist

- [ ] All ESLint errors resolved (`npm run lint`)
- [ ] Code formatted with Prettier (`npm run format:check`)
- [ ] No console.log statements in production code
- [ ] Accessibility checks passed (jsx-a11y)
- [ ] Imports are properly sorted
- [ ] Commit message follows conventional format

## Configuration Files

- `.prettierrc` - Prettier formatting rules
- `.prettierignore` - Files to exclude from formatting
- `eslint.config.js` - ESLint rules and plugins
- `commitlint.config.js` - Commit message validation rules
- `.lintstagedrc.json` - File-specific linting rules
- `.husky/pre-commit` - Pre-commit git hook
- `.husky/commit-msg` - Commit message validation hook

## Troubleshooting

### Husky hooks not running

```bash
# Reinstall husky
npm run prepare
```

### Skip hooks (not recommended)

```bash
# Skip pre-commit
git commit --no-verify -m "message"

# Skip commit-msg
git commit --no-verify -m "message"
```

### Format all files

```bash
npm run format
```
