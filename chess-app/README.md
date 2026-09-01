# Endgame — a full-stack chess app

A complete, self-hosted two-player chess app: full legal chess rules, a
premium, distinctive UI with dark/light theming and vibrant piece color
schemes, Google sign-in, and an admin panel to manage players and saved
games. Ships with **zero seed data** — every list is empty until real people
sign in and play.

```
chess-app/
├── backend/     Node + Express + TypeScript API (SQLite, Google OAuth, admin API)
└── frontend/    React + TypeScript + Vite + Tailwind app (chess.js, Framer Motion)
```

## 1. Prerequisites

- Node.js 18+ and npm
- A Google Cloud project (only needed for Google sign-in — the app runs fine
  without it, you just won't be able to sign in or reach the admin panel)

## 2. Set up Google OAuth credentials

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth client ID** of type **Web application**.
3. Add an authorized redirect URI: `http://localhost:4000/api/auth/google/callback`
4. Add an authorized JavaScript origin: `http://localhost:5173`
5. Copy the generated **Client ID** and **Client secret**.

## 3. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from step 2
- `SESSION_SECRET` — any long random string
- `ADMIN_EMAILS` — comma-separated emails that should be admins immediately
  on first sign-in (optional — **the very first person to ever sign in is
  always made an admin automatically**, so you can leave this blank and just
  sign in first)

Run it:

```bash
npm run dev
```

The API starts on `http://localhost:4000` and creates `backend/data/chess.db`
(a SQLite file) on first run — with empty `users` and `games` tables, no
placeholder rows.

## 4. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env   # only needed if your API isn't on localhost:4000
npm run dev
```

Open `http://localhost:5173`.

## 5. Using the app

- **Play immediately** — no sign-in required for local two-player play.
- **Sign in with Google** (top right) to save finished games to your history
  and, if you're an admin, to reach `/admin`.
- **Admin panel** (`/admin`, admins only):
  - **Overview** — player count, admin count, saved/finished/in-progress games
  - **Users** — promote/demote roles, delete accounts
  - **Games** — browse every saved game across all players, delete any of them
  - **Reset all data** — wipes every saved game and every non-admin account,
    returning the app to a completely clean slate in one click

## 6. Theme system

- **Dark / Light** — a toggle in the header flips a `dark` class on
  `<html>`. Every color in the app (board squares, panels, text, shadows) is
  a CSS custom property defined once per mode in `frontend/src/index.css`, so
  the switch is instant with no flash and no layout shift, and the choice
  persists in `localStorage`.
- **Piece colors** — six coordinated, high-contrast palettes (Classic,
  Gold & Silver, Vibrant Neon, Forest, Ocean, Ruby & Sapphire) defined in
  `frontend/src/lib/pieceThemes.ts`. White and Black pieces can be set to
  *different* palettes independently from the "Piece colors" panel; each
  choice is also persisted to `localStorage`. Pieces are original SVG
  silhouettes (not a trace of any existing piece set) that pick up the active
  palette via an SVG gradient, so every combination looks intentional.

## 7. Design notes

- Palette and type system are grounded in the subject matter — a wood-and-
  brass chess set rather than a generic SaaS look: warm walnut/parchment
  surfaces, brass/felt/garnet accents, a serif display face (Fraunces) paired
  with Inter for UI text.
- The board is a single `aspect-square` CSS grid so it always stays a
  perfect square at any viewport; the side panel stacks below the board on
  narrow screens and becomes a sticky sidebar at `lg` breakpoints.
- All interactive elements have visible focus rings (`:focus-visible`) and
  respect `prefers-reduced-motion`.
- Legal-move highlighting, last-move highlighting, and check highlighting are
  all distinct visual treatments so board state is always unambiguous.

## 8. Production notes

- `backend`: `npm run build && npm start` (compiles to `dist/`). Set
  `cookie.secure = true` in `src/server.ts` once you're behind HTTPS, and set
  `GOOGLE_CALLBACK_URL` / `CLIENT_URL` to your real domains.
- `frontend`: `npm run build` outputs static files to `frontend/dist`,
  deployable to any static host — just point `VITE_API_URL` at your deployed
  backend.
