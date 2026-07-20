# RungtaStudentXchange — Frontend

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and point it at your running backend:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```
3. `npm run dev`

Make sure the backend's `CLIENT_URL` / `SOCKET_CORS_ORIGIN` env vars match
this app's dev origin (`http://localhost:5173` by default), or CORS will
block requests.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router DOM
- Axios
- Zustand (with `persist` for auth state)
- React Hook Form
- React Hot Toast
- Framer Motion (installed, not yet used)
- Lucide React

## Folder structure

```
src/
  api/            Axios instance (per-module API files added as each module is built)
  assets/         Static assets (images, icons, fonts)
  components/
    common/        Shared, reusable UI components (buttons, inputs, etc.)
    layout/         Header, footer, page shells
  constants/       CATEGORIES/CONDITIONS/etc. + API endpoint paths, kept in sync with backend
  context/         React context providers (if/when needed alongside zustand)
  hooks/           Shared custom hooks
  pages/           Route-level page components
  routes/          Router config, ProtectedRoute, AdminRoute
  store/           Zustand stores (auth, ui, ...)
  styles/          Global CSS (Tailwind entry point)
  utils/           Helpers (formatting, validation, etc.)
```

## Design system

See `DESIGN_SYSTEM.md` for the full token reference (colors, type scale,
spacing, shadows, z-index, motion, breakpoints) and the theme system
(light/dark, persisted, no-reload).

## Notes on backend integration

- All API responses follow `{ success, message, data }`. Errors follow
  `{ success: false, message, stack? }` (stack only in dev).
- Auth is a **short-lived access token only** (15 min, no refresh flow).
  The Axios response interceptor logs the user out automatically on a
  401 (expired/invalid token) — expect to prompt re-login somewhat
  often until the backend adds a refresh flow.
- In-app chat has been removed; buyers contact sellers directly via
  WhatsApp using the number the seller provided at listing time.
