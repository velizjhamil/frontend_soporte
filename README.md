# MANACO Inventory Frontend

React and Tailwind CSS web app for the MANACO inventory API. The frontend consumes the existing FastAPI service; it does not connect to PostgreSQL directly.

## Run locally

1. Start the backend using its README instructions (default: `http://127.0.0.1:8000`).
2. Copy `.env.example` to `.env.local`. The default `/api` base uses Vite's development proxy to forward API requests to `http://127.0.0.1:8000`, whether Vite starts on port 5173 or 5174. The proxy removes only the `/api` prefix, so `/api/salud` is forwarded as `/salud`.
3. For local development, the browser talks to the same frontend origin and does not need backend CORS configuration. For production, set `VITE_API_BASE_URL` to the deployed API origin at build time.
4. Install and start the frontend:

   ```sh
   npm install
   npm run dev
   ```

5. Sign in with an account created by a MANACO administrator. There is no public registration.

The Vite development server listens on `0.0.0.0`, so it can be opened from another device on the local network. The proxy target is the backend on the computer running Vite; change `server.proxy['/api'].target` in `vite.config.js` if the backend runs elsewhere. Use a deployed API origin through `VITE_API_BASE_URL` for production builds.

## Source structure

- `src/App.jsx` — session, page routing, data refresh, and API-backed actions.
- `src/components/layout/` — authenticated app shell and accessible navigation drawer.
- `src/components/shared/` — reusable page heading, data states, and action forms.
- `src/features/` — focused screens grouped by home, inventory, catalog, operations, administration, authentication, and recognition.
- `src/services/api.js` — authenticated HTTP client and `/api` base URL.
- `src/shared/inventory.js` — shared inventory formatting, IDs, and API payload normalization.

Catalog, inventory, stock movements, transfers, adjustments, users, branches, and minimum-stock changes are submitted to the existing backend API. The browser stores only the authenticated session; successful mutations refresh the affected screen from the API.

## Features

- Role-aware dashboard, inventory, catalog, movements, transfers, adjustments, branches, users, and recognition status.
- Administrator actions for catalog and user management, stock minimums, branch creation, and adjustment review.
- Authenticated API requests use the bearer token from login. A 401 clears the local session and returns to sign-in.
- API errors (including field validation details) are surfaced in the interface.
- Product photos use `url_foto`; this API version does not support file uploads.
- Visual recognition is shown as pending because the backend has no trained model or prediction route yet.

Build a production bundle with `npm run build`; serve the generated `dist/` folder with a static web server. Set the API URL at build time through `VITE_API_BASE_URL`.
