# Frontend System Design Essentials

This is the starter project for the **Frontend System Design Essentials** course.
We’ll use this as a baseline and add features on top to demonstrate core ideas in frontend system design:

* Pagination
* Optimistic updates
* Query (request control, debounce, throttle, etc.)
* Data normalisation
* Code splitting
* Lazy loading
* Preload & prefetch
* Mocking
* Frontend testing
* HTTP caching

---

## Prerequisites

* **Node.js ≥ 20** (LTS recommended, I'm using `20.19.4`).
  Optional: use `nvm` to manage versions:
  
  ```bash
  nvm install 20.19.4
  nvm use 20.19.4
  ```
* A package manager: **npm** (built‑in), or **pnpm**/**yarn** if you prefer.
* Git

> This repo assumes you can run a Vite + React app locally. If you’re new to Node setup, see the quick links in `SETUP.md` (optional).

---

## Quick Start

```bash
# 1) Clone
git clone https://github.com/abruzzi/frontend-system-design-essentials-starter.git
cd frontend-system-design-essentials-starter

# 2) Install dependencies
npm install
# (or: pnpm install / yarn)

# 3) Run the mock API (separate terminal)
npm run dev:api
# Express mock API on http://localhost:4000

# 4) Run the Vite dev server
npm run dev
# Vite on http://localhost:5173 (proxies /api to :4000)

# 5) Open the app
http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev          # Vite dev server (client)
npm run dev:api      # Express mock API on :4000
npm run build        # Production build (client + SSR + server)
npm run start:prod   # Run production server locally
npm test             # Unit tests (Vitest)
npm run test:smoke   # Playwright smoke tests (local)
npm run preview      # Preview Vite production build (static only)
```

---

## Mock API

Local development uses the **Express mock API** in `server/`. Vite proxies `/api/*` to `http://localhost:4000`.

Start it with:

```bash
npm run dev:api
```

### MSW (for unit tests)

**MSW v2** handlers live in `src/mocks/handlers.ts` and are used in **Vitest** tests. The browser worker file is at `public/mockServiceWorker.js`. MSW is **not** started automatically in the Vite dev server — dev uses the Express API instead.

If the worker file is missing:

```bash
npx msw init public --save
```

### Endpoints implemented

* `GET /api/users` — paginated user search
* `GET /api/board/:id?q=<text>` — board with optional search/filter
* `GET /api/cards/:id` — single card lookup
* `PATCH /api/cards/:id` — update card (includes intentional `TICKET-1` failure)
* `POST /api/cards` — create card
* `GET /api/board/:id/events` — SSE live updates

> Server mock data: `server/mocks/`. MSW handlers mirror the same API for tests: `src/mocks/handlers.ts`.

---

## Data Shape

**Board payload**

```ts
type UserLite = { id: number; name: string; avatar_url: string };
type Card = { id: string; title: string; assignee?: UserLite };
type Column = { id: string; title: string; cards: Card[] };
type BoardPayload = { columns: Column[] };
```

**Users**

```ts
type User = { id: number; name: string; description: string; avatar_url: string };
```

---

## Project Structure (high level)

```
src/
  board-page/         # Board app UI (active)
  your-work/          # Home / board list
  settings/           # Settings page
  mocks/
    handlers.ts       # MSW handlers (unit tests)
    browser.ts        # MSW worker setup
  entry-client.tsx    # Client entry (dev + prod)
server/
  index.ts            # Express SSR + mock API
  mocks/              # JSON mock data
public/
  mockServiceWorker.js
  offlineServiceWorker.js
```

---

## Troubleshooting

**Error: unsupported MIME type 'text/html' for mockServiceWorker.js**

* Cause: The worker file is missing; dev server returns `index.html`.
* Fix:
  
  ```bash
  npx msw init public --save
  # then hard refresh the page, or clear site data
  ```
* Confirm by visiting `http://localhost:5173/mockServiceWorker.js` — you should see JS, not HTML.

**404s for /api/* in dev**

* Start the mock API: `npm run dev:api`
* Confirm `http://localhost:4000/health` returns `{ "ok": true }`

**Port conflicts**

* Vite defaults to **5173**. If occupied, Vite may choose another port; check terminal output.

---

## What’s Next (Course Flow)

Module 1 gives us a **baseline** with intentional rough edges (*bad smells*).
From here we’ll iterate on:

* Search & request control (debounce/throttle)
* Pagination & infinite lists
* Data normalization & cache strategies
* Split points (code splitting, lazy load)
* Preload & prefetch patterns
* Test strategy (unit/integration with MSW)
* Optimistic updates and rollback
* HTTP caching & freshness

You’ll **work along** locally—this isn’t a watch‑only course.