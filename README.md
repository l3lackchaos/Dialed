# ☕ Dialed — Pour-Over Coffee Notebook

A premium, dark-themed web app for the specialty-coffee obsessed: catalogue your
beans, build precise pour-over recipes (with a full pour schedule), and log how
every brew tastes so you can *dial it in* cup after cup.

Built to feel like a barista's notebook — not a template. Espresso-dark
background, gold accents, cream type, and a six-axis tasting radar.

![stack](https://img.shields.io/badge/React-18-149ECA) ![ts](https://img.shields.io/badge/TypeScript-5-3178C6) ![supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E) ![tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8)

---

## Features

### 1 · Bean Management — *The Shelf*
Record every bag: **name, origin, process** (Washed, Natural, Honey, Anaerobic,
Semi-CM, Chardonnay, Double Anaerobic), **roast level** (Light, Medium-Light,
Medium, Medium-Dark, Omni, Vienna), **roast date**, **roaster**, and the
**tasting notes** printed on the bag. Cards show a roast-coloured spine and a
freshness ("rested N days") indicator.

### 2 · Recipe Builder
Recipes link to a bean and capture **dripper** (V60, Origami, Kalita Tsubame,
Pegasus, Switch, OREA), **grinder** (C40 Nitro Blade+Starwave, X25 Tigershark,
C2), **click setting, water temperature, dose, water**, an **auto-computed
ratio**, an editable **pour-schedule table** (pour · cumulative g · time · note),
a **target time**, and free-form notes. Pin a recipe to surface it in Quick Log.

### 3 · Brew Log
Log each brew against a recipe: **brew date, actual time**, and a **1–5 slider**
for **Acidity, Body, Sweetness, Bitterness, Clarity, Overall** — with a live
tasting radar. Plus **flavor notes, aroma notes**, and a **next adjustment** field
so you remember what to change next time.

### 4 · Dashboard
At-a-glance home: bean/brew counts, **Quick Log** buttons for pinned recipes, a
**radar chart of each bean's average tasting profile** (toggle beans on/off to
compare), the bean shelf, and your most recent brews.

### 5 · Shared tasting sessions
Every brew log is a shareable **session**. Tap **Share** to push the session
link into **LINE**, copy it, or show a **QR code** to scan in person. Anyone who
opens the link lands on a public session page (`/s/:id`) and can leave their own
opinion — **no login required**. Each comment carries a name, an opinion, and
that person's own 1–5 scores, and the group's average is plotted on a radar.

### 6 · Local quick profile (no login)
A **device-local profile** — just a name and an icon, stored in `localStorage`.
It **pre-fills your name** when you add a tasting comment, so logging is one tap
faster. No accounts, no OAuth, no OIDC: nothing leaves the device until you post.
Anonymous tasting still works for anyone who scans a shared session.

---

## Tech Stack

| Layer     | Choice                                    |
| --------- | ----------------------------------------- |
| Frontend  | React 18 + TypeScript + Vite              |
| Styling   | Tailwind CSS (custom espresso/gold theme) |
| Charts    | Recharts (tasting radar)                  |
| Database  | Supabase (Postgres + RLS)                 |
| Profile   | Local (localStorage) — no auth server     |
| Sharing   | Web Share API · LINE · `qrcode.react`     |
| Icons     | lucide-react                              |
| Fonts     | Fraunces (display) · Inter (body)         |

---

## Database

Four tables linked by foreign keys (`on delete cascade`):

```
beans ──1:N──▶ recipes ──1:N──▶ brew_logs ──1:N──▶ brew_comments
```

Migrations live in [`supabase/migrations/`](supabase/migrations/):
`0001_dialed_coffee_schema.sql` (beans/recipes/brew_logs),
`0002_brew_comments.sql` (multi-taster comments), and
`0003_brewlog_gear_fields.sql` (per-brew clicks + grinder).

RLS is enabled on every table with **permissive policies** — intentional, so the
share-and-comment flow works for anyone who opens a shared session. There is no
auth server; identity is a local on-device profile used only to sign comments.
If you later want real per-user accounts, add Supabase Auth and tighten the
policies to `auth.uid()`.

Until this is configured, the app runs fine anonymously — the Sign in button
just won't complete.

---

## Getting Started

```bash
# 1. Install
npm install

# 2. Configure Supabase (a working project is pre-filled in .env.example)
cp .env.example .env

# 3. Run
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

### Environment variables

| Variable                 | Description                                   |
| ------------------------ | --------------------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL                     |
| `VITE_SUPABASE_ANON_KEY` | Supabase publishable/anon key (safe in browser) |

> These are **public** client keys — they're meant to ship in the browser bundle.
> Access is governed by Row Level Security, not by hiding the key.

### Using your own Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Run the SQL in `supabase/migrations/0001_dialed_coffee_schema.sql`
   (SQL Editor, or `supabase db push` with the CLI).
3. Put your project URL and anon key in `.env`.

---

## Scripts

| Command           | What it does                          |
| ----------------- | ------------------------------------- |
| `npm run dev`     | Start the Vite dev server             |
| `npm run build`   | Type-check and build for production   |
| `npm run preview` | Preview the production build          |
| `npm run lint`    | Type-check only (`tsc --noEmit`)      |

---

## Deployment

Any static host works (the app is a Vite SPA). For **Vercel**:

1. Import the repo.
2. Framework preset: **Vite** — build `npm run build`, output `dist`.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.

Add a rewrite so client-side routes resolve — create `vercel.json`:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

---

## Project Structure

```
src/
├── components/      # Toast, Modal, forms (Bean/Recipe/BrewLog), TasteRadar, ui primitives
├── hooks/           # useQuery (tiny fetch hook)
├── lib/             # supabase client, queries, types, constants, formatters
├── pages/           # Dashboard, Beans, Recipes, BrewLogs
├── App.tsx          # layout + bottom-nav routing
└── main.tsx         # entry
supabase/migrations/ # database schema
```

---

Made for chasing the perfect cup. ☕
