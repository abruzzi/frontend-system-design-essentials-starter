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

# 3) Run dev server
npm run dev
# Vite will print a local URL (e.g., http://localhost:5173)

# 4) Open the app in your browser
http://localhost:5173
```

---

## Available Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Production build
npm run preview   # Preview the production build locally
npm test          # Run tests (if present)
```

---

## Mock API (MSW)

This project uses **MSW v2** to mock backend endpoints during development.

* The service worker file **must** exist at (already configured):
  
  ```
  public/mockServiceWorker.js
  ```
  
  If it’s missing, run:
  
  ```bash
  npx msw init public --save
  ```

* Worker is started in dev in `main.tsx` (already configured):
  
  ```ts
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    });
  }
  ```

### Endpoints implemented

* `GET /api/users`
  Returns a static list of users.

* `GET /api/board/:id?q=<text>`
  Returns a **board** payload with columns and cards.
  `q` filters tickets by **title**, **ticket id**, or **assignee name**.
  Empty columns are omitted when searching.

* `GET /api/cards/:id`
  Returns a single card (and which column it’s in).
  `404` when not found.

> Handlers live in `src/mocks/handlers.ts`. Static data is in `src/mocks/users.json` and `src/mocks/board.json`.

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
  components/
    Board.tsx
    BoardColumn.tsx
    BoardControl.tsx
    ListView.tsx
    AssigneeList.tsx
  mocks/
    handlers.ts       # MSW handlers
    browser.ts        # setupWorker
    users.json        # sample users
    board.json        # sample board with assignees
public/
  mockServiceWorker.js
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

**404s for /api/* in dev*\*

* Ensure the worker is started in dev (see `main.tsx`).
* Check your console for MSW startup messages.

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