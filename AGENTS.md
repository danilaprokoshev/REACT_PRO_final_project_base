# AGENTS.md

## Project Overview

React + TypeScript e-commerce product catalog with authentication. Uses Feature-Sliced Design (FSD) architecture.

## Quick Start

```bash
npm i
npm start          # Dev server on http://localhost:8080
npm run build      # Production build to ./dist
```

## Key Commands

| Command                 | Purpose                                            |
| ----------------------- | -------------------------------------------------- |
| `npm start`             | Start dev server (webpack serve)                   |
| `npm run build`         | Production build (Webpack)                         |
| `npm run build:esbuild` | Production build (esbuild - educational)           |
| `npm test`              | Run **all** linters: stylelint → eslint → prettier |
| `npm run lint`          | ESLint fix                                         |
| `npm run stylelint:fix` | Stylelint fix                                      |
| `npm run format`        | Prettier write                                     |
| `npm run commit`        | Run tests + commitizen prompt                      |

**Pre-commit hook runs:** `lint-staged` (stylelint + eslint + prettier on staged files)

## Architecture (FSD)

```
src/
├── app/           # App entry, global styles, providers
├── pages/         # Route pages: HomePage, ProductPage, SignInPage, etc.
├── widgets/       # Composable blocks: Header, Footer, CardList, ReviewList
├── features/      # User interactions: auth/SignInForm, auth/SignUpForm
└── shared/        # Reusable code
    ├── api/       # ApiServise.ts - REST client
    ├── store/     # Redux store, RTK Query APIs
    ├── providers/ # Router, Redux Provider
    ├── types/     # Global TypeScript types
    ├── ui/        # Shared UI components (MUI wrappers)
    ├── hooks/     # Custom React hooks
    └── utils/     # Helper utilities
```

### Shared/UI Components (MUI Wrappers)

Components in `shared/ui/` are **wrappers around MUI** that encapsulate the external dependency:

| Component | MUI Base                   | Notes                                        |
| --------- | -------------------------- | -------------------------------------------- |
| `Button`  | `Button` / `LoadingButton` | Shows loader when `loading` prop passed      |
| `Input`   | `TextField`                | Compatible with react-hook-form `Controller` |
| `Loader`  | `Spinner`                  | Re-export for naming consistency             |

**Rule:** `shared/ui` components are **presentational only** — no business logic, no store, no API calls.

### Features Layer

Features contain business logic and user interactions:

- `features/auth/SignInForm/` — authentication form with validation
- `features/auth/SignUpForm/` — registration form

Features can import from `shared/`, but not vice versa.

## Tech Stack

- **Build:** Webpack 5 + TypeScript (ts-loader) + esbuild (educational comparison)
- **State:** Redux Toolkit + RTK Query
- **Routing:** React Router v6 (`createBrowserRouter`)
- **UI:** Material UI (MUI) v5 + CSS Modules
- **Modal:** React.Portal with focus management (trap, return to trigger)
- **Forms:** react-hook-form + yup
- **Linting:** ESLint + Prettier + Stylelint

## API Configuration

- **Base URL:** `https://api.v2.react-learning.ru` (hardcoded in `src/shared/api/ApiServise.ts`)
- **Auth Token:** Hardcoded JWT in `ApiServise.ts` (student project)
- `.env` file has `API_URL` but code uses hardcoded config

## Important Files

| File                           | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `src/index.tsx`                | App entry point - renders RouterProvider + Redux Provider |
| `src/shared/store/store.ts`    | Redux store configuration with RTK middleware             |
| `src/shared/api/ApiServise.ts` | REST API client (class-based, fetch wrapper)              |
| `src/shared/providers/router/` | React Router v6 routes config                             |
| `src/shared/types/global.d.ts` | Global TypeScript types (Product, User, Review, etc.)     |
| `public/index.html`            | Contains `<div id="modal-root"></div>` for React.Portal   |
| `esbuild.config.mjs`           | Alternative esbuild config for educational comparison     |

## Code Style

- **Tabs** for indentation (not spaces)
- **Single quotes** everywhere (JSX too)
- **Semicolons** required
- **CSS Modules** with pattern: `*.module.css`
- **BEM naming** enforced by stylelint for CSS classes

## Common Patterns

### CSS Modules

```typescript
import styles from './Component.module.css';
// Use: className={styles.container}
```

### RTK Query

API slices in `src/shared/store/api/`. Add middleware to store.

### Form Validation

```typescript
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
```

## Gotchas

1. **Hardcoded API token** - No refresh logic; token may expire
2. **No test runner** - `npm test` runs linters, not jest/vitest
3. **Husky pre-commit** - Will block commits with lint errors
4. **Commitizen** - Use `npm run commit` instead of `git commit` for conventional commits
5. **React 19 upgrade planned** - `useOptimistic` will be applied to `LikeButton` for optimistic UI updates
