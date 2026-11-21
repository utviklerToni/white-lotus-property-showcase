# PLAN.md — White Lotus: Property Showcase & Inquiry Manager

Build to this plan. Keep scope tight: a working core done well beats extra features.

---

Working rules (session start, phases, self-checks, hard rules) are in `CLAUDE.md`. The assignment text is in `docs/BRIEF.md`; if this plan conflicts with it, the brief wins.

---

## 1. Stack

| Layer         | Choice                                               | Why                                                                                    |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Frontend      | React 19 + Vite + TypeScript + Tailwind v4           | Their listed stack, fast dev loop                                                      |
| Routing       | React Router v7 (library mode)                       | Public pages + `/admin` pages                                                          |
| Data fetching | TanStack Query                                       | Built-in loading / error / refetch states, cache invalidation after mutations          |
| Forms         | React Hook Form + Zod                                | Same Zod schemas as the API, so validation rules exist in one place                    |
| Backend       | Node 22 LTS + Express 5 + TypeScript, run with `tsx` | Minimal and easy to read, no build step in dev                                         |
| DB            | PostgreSQL 16                                        | Relational data (inquiry → property)                                                   |
| DB access     | `pg` + plain SQL migration files                     | The schema is readable SQL, which is a named deliverable. No ORM magic to defend       |
| Validation    | Zod (shared package)                                 | One source of truth for front and back                                                 |
| Local infra   | Docker Compose (Postgres only, host port 5433)       | `docker compose up -d` and the DB is ready; 5433 avoids clashing with a local Postgres |

Use current stable versions of everything. Tailwind v4 has **no `tailwind.config.js`**: theme tokens go in `apps/web/src/index.css` with `@theme` (see section 6).

**Dependency allowlist.** Anything not listed here needs approval first.

- api: `express`, `pg`, `zod`, `cors`, `helmet`, `express-rate-limit`, `tsx`
- web: `react`, `react-dom`, `react-router`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `lucide-react`, `sonner` (toasts), `tailwindcss`, `@tailwindcss/vite`
- shared: `zod`
- dev: `typescript`, `vitest`, `supertest`, `concurrently`, `@types/*`, `eslint`, `@eslint/js`, `typescript-eslint`, `eslint-plugin-react-hooks`, `globals`, `prettier`, `eslint-config-prettier`

**Shared package.** `packages/shared` is consumed as TypeScript source with no build step: its `package.json` has `"exports": { ".": "./src/index.ts" }`. Vite and `tsx` both read TS directly.

**Dev proxy.** Vite proxies `/api` to the API (port 4000), so the browser calls same-origin `/api/...` in development.

---

## 2. Repo structure (npm workspaces monorepo)

```
white-lotus/
├── apps/
│   ├── web/                  # React + Vite + Tailwind
│   │   ├── src/
│   │   │   ├── api/          # fetch client + query hooks
│   │   │   ├── components/   # PropertyCard, Filters, StatusBadge, EmptyState, Spinner, ...
│   │   │   ├── pages/
│   │   │   │   ├── PropertiesPage.tsx
│   │   │   │   ├── PropertyDetailPage.tsx
│   │   │   │   └── admin/
│   │   │   │       ├── AdminPropertiesPage.tsx
│   │   │   │       ├── PropertyFormPage.tsx   # add + edit share one form
│   │   │   │       └── AdminInquiriesPage.tsx
│   │   │   ├── lib/format.ts # ₹ Cr / Lakh formatting, sq ft
│   │   │   ├── index.css     # Tailwind v4 import + @theme tokens
│   │   │   └── main.tsx
│   │   └── vite.config.ts    # tailwind plugin + /api proxy
│   └── api/                  # Express
│       ├── src/
│       │   ├── routes/       # properties.ts, inquiries.ts
│       │   ├── db/           # pool.ts, queries
│       │   ├── middleware/   # validate.ts, errorHandler.ts, requireAdmin.ts
│       │   ├── app.ts        # builds the Express app (imported by tests)
│       │   └── index.ts      # starts the server
│       ├── scripts/
│       │   ├── migrate.ts    # runs migrations/*.sql in order, tracks them in schema_migrations
│       │   └── seed.ts       # truncates and reinserts seed data (safe to re-run)
│       ├── migrations/
│       │   └── 001_init.sql
│       ├── seed/seed.sql
│       └── tests/
├── packages/
│   └── shared/               # Zod schemas + inferred TS types
├── docs/
│   ├── BRIEF.md              # assignment text, verbatim
│   ├── PLAN.md               # this file
│   ├── PROGRESS.md           # handoff log (see CLAUDE.md)
│   └── reference/            # screenshots of whitelotusgroup.in
├── docker/
│   └── init-test-db.sql      # creates the white_lotus_test database
├── docker-compose.yml
├── .env.example
├── eslint.config.js          # flat config for the whole monorepo
├── .prettierrc
├── tsconfig.base.json        # strict settings shared by all workspaces
├── CLAUDE.md                 # AI working rules
├── AGENTS.md                 # pointer to CLAUDE.md
├── README.md
├── AI_USAGE.md
└── package.json              # workspaces + root scripts
```

Root scripts: `npm run db:migrate`, `npm run db:migrate:test` (same migrations against `DATABASE_URL_TEST`), `npm run db:seed`, `npm run dev` (api + web via `concurrently`), `npm test`, `npm run lint`, `npm run format`, `npm run format:check`, `npm run typecheck`, and `npm run check` (lint + typecheck + test).

### Code quality (supports "clean, readable code")

- **TypeScript strict** in `tsconfig.base.json` (`"strict": true`). No `any` unless commented why.
- **ESLint** flat config, basic: `@eslint/js` recommended, `typescript-eslint` recommended (not type-checked), `react-hooks`, `eslint-config-prettier` last. Errors fail `npm run lint`; warnings are allowed.
- **Prettier** owns formatting. Run `npm run format` before each commit.
- No CI workflow (not in the brief). Listed under "What I'd do next".

---

## 3. Database schema (`migrations/001_init.sql`)

```sql
CREATE TYPE property_status AS ENUM ('available', 'under_construction', 'sold');

CREATE TABLE properties (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL CHECK (length(trim(name)) > 0),
  location     TEXT NOT NULL CHECK (length(trim(location)) > 0),
  price        BIGINT NOT NULL CHECK (price > 0),          -- in rupees
  size_sqft    INTEGER NOT NULL CHECK (size_sqft > 0),
  bedrooms     SMALLINT NOT NULL CHECK (bedrooms BETWEEN 1 AND 20),
  description  TEXT NOT NULL,                              -- short, used on cards
  details      TEXT,                                       -- fuller copy, detail page
  image_url    TEXT NOT NULL,
  status       property_status NOT NULL DEFAULT 'available',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE inquiries (
  id           SERIAL PRIMARY KEY,
  property_id  INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT NOT NULL,
  phone        TEXT NOT NULL,
  message      TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_properties_location ON properties (location);
CREATE INDEX idx_properties_bedrooms ON properties (bedrooms);
CREATE INDEX idx_inquiries_property  ON inquiries (property_id);
CREATE INDEX idx_inquiries_created   ON inquiries (created_at DESC);
```

Decisions to be able to defend:

- **Price as BIGINT rupees**, not float. Avoids rounding errors. Formatting to "₹6.5 Cr" happens in the UI only.
- **DB CHECK constraints + Zod**: Zod gives friendly messages, and the DB is the last line of defence.
- **ON DELETE CASCADE** on inquiries: deleting a listing removes its inquiries. Trade-off: you could soft-delete instead. Mention it in the README.
- **image_url only, no uploads**: uploads mean storage, size limits and cleanup. Out of scope for the time box.
- **status** borrowed from their site (Completed / Under Construction badges).
- **updated_at** is set explicitly in the UPDATE query (`updated_at = now()`). No trigger.

Seed: 6–8 properties across Bengaluru locations (Devanahalli, Whitefield, Sarjapur, Indiranagar, Hebbal, Koramangala), 3–6 bedrooms, ₹4–15 Cr, Unsplash image URLs, plus a few inquiries so the admin table isn't empty on first run.

---

## 4. API (REST, JSON, prefix `/api`)

| Method | Path                            | Purpose                                                                                                     |
| ------ | ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GET    | `/api/properties`               | List. Query: `location`, `minBedrooms`, `status`, `sort` (`price_asc`, `price_desc`, `newest`, `size_desc`) |
| GET    | `/api/properties/:id`           | One property                                                                                                |
| POST   | `/api/properties`               | Create (admin key)                                                                                          |
| PUT    | `/api/properties/:id`           | Update (admin key)                                                                                          |
| DELETE | `/api/properties/:id`           | Delete (admin key)                                                                                          |
| GET    | `/api/locations`                | Distinct locations for the filter dropdown (own path, so it can't collide with `/properties/:id`)           |
| POST   | `/api/properties/:id/inquiries` | Submit inquiry (public)                                                                                     |
| GET    | `/api/inquiries`                | Inquiries joined with property name, newest first, `LIMIT 200` (admin key; contains personal data)          |
| GET    | `/api/health`                   | Health check                                                                                                |

Rules:

- **Sort is whitelisted** (map of allowed values → SQL `ORDER BY`), never interpolated. All values go through parameterised queries.
- **Status codes**: 200 / 201 / 204, 400 with field errors, 401 missing or wrong admin key, 404 unknown id, 413 body over 100kb, 429 rate limited, 503 health check when the DB is down, 500 generic.
- **Error shape** (one format everywhere):
  ```json
  {
    "error": "ValidationError",
    "fields": { "price": "Price must be a positive number" }
  }
  ```
- `validate(schema)` middleware runs Zod on `body` / `query` / `params`. `:id` is `z.coerce.number().int().positive()`.
- One central `errorHandler`. No stack traces in responses. Postgres errors are mapped:
  `22P02` and `23514` → 400, `23503` → 404, anything else → generic 500. Full error logged on the server only.
- **Security middleware:** `helmet()`; CORS limited to the web origin from env; `express.json({ limit: '100kb' })`;
  a general `/api` rate limit (300 requests / 15 min) and a stricter one on inquiry POST (5 / 15 min per IP).
- **Logging:** method, path, status, duration. Never request bodies (they contain personal data).

---

## 5. Validation (`packages/shared`)

**Property**

- name, location, description: required, trimmed, non-empty, max lengths (name 120, location 120, description 300, details 5000)
- price: integer, > 0
- size_sqft: integer, > 0
- bedrooms: integer, 1–20
- image_url: valid http(s) URL
- status: enum

**Inquiry**

- name: required, 2–100 chars
- email: valid email
- phone: required, digits/spaces/+/-, 10–15 digits (allows +91)
- message: required, 10–2000 chars

All body schemas use `.strict()`: unknown keys (e.g. `id`, `created_at`) are rejected with 400. Only whitelisted columns go into INSERT / UPDATE.

The form shows errors inline under each field, and the submit button is disabled while sending.

---

## 6. Frontend pages

### Public

**`/` — Properties**

- Navy header (gold logo mark, champagne links). Short serif hero line.
- Filter bar: location (dropdown from `/api/locations`), min bedrooms (Any / 3+ / 4+ / 5+), status, sort.
- **Filters stored in the URL query string**, so results can be shared and survive refresh.
- Responsive grid: 1 col mobile, 2 tablet, 3 desktop.
- Card: image, status badge, serif name, location, `₹6.5 Cr`, `4 BHK · 5,200 sq ft`, short description.
- States: skeleton cards while loading; empty state ("No residences match these filters" + Clear filters); error state with Retry.

**`/properties/:id` — Detail**

- Large image, name, facts row in their style: `4 BHK | ₹8.5 Cr | Devanahalli`, size, status, full details.
- Inquiry form beside it (desktop) or below it (mobile).
- Success message after submit, form resets. Server errors show without losing what the user typed.
- 404 state for an unknown id.

### Admin (`/admin`, plainer styling)

On first visit to any admin page, a small form asks for the admin key. It's kept in `sessionStorage` and sent as `x-admin-key`. A 401 clears it and asks again.

**`/admin/properties`**: table with name, location, price, beds, status and Edit / Delete actions. "Add property" button. Delete opens a confirm modal built in React (no `window.confirm`). Empty state.

**`/admin/properties/new`** and **`/admin/properties/:id/edit`**: one shared form component. Image URL preview. Client-side Zod validation, and server field errors mapped back onto the inputs.

**`/admin/inquiries`**: table with date, property (links to detail), name, email (`mailto:`), phone (`tel:`), message (truncated, expandable). Optional property filter. Empty state.

Toasts for create / update / delete success and failure.

### Theme (from whitelotusgroup.in), Tailwind v4 in `apps/web/src/index.css`

```css
@import 'tailwindcss';

@theme {
  --color-navy: #282d3c;
  --color-navy-deep: #161926;
  --color-champagne: #fae1c8;
  --color-gold: #b98a39;
  --color-gold-dark: #aa7720;
  --color-slate: #454b4f;
  --font-serif: 'DM Serif Text', serif;
  --font-sans: 'Open Sans', sans-serif;
}
```

This gives classes like `bg-navy`, `text-champagne`, `font-serif`. Fonts load from Google Fonts in `index.html`.
Pill buttons (`rounded-full`, navy fill, champagne text). Gold only for accents. Lots of white space.

---

## 6b. Design direction (match their brand, then improve on it)

**Reference screenshots of whitelotusgroup.in are in `docs/reference/`. Look at them before building any UI.**

### Reference: whitelotusgroup.in (scanned 21 Nov 2026)

- Quiet, spiritual luxury. Copy is poetic ("Bengaluru's soul has found a sanctuary",
  "Crafting Personal Sanctuaries Since 2014"). Headings read like sentences, not labels.
- Slim dark-navy top bar (#282D3C), gold "W" logo mark (#B98A39), champagne links (#FAE1C8).
- Full-width photo hero fading to a dark gradient at the bottom, with one facts row:
  `4 BHK Luxury Terraced Homes | ₹8.5 Cr. Onwards | IVC Road, Devanahalli`.
- DM Serif Text for display (often italic), Open Sans for UI and body.
- Small pill buttons: navy fill, champagne text, rounded-full. Over photos they use an
  **outline pill** instead: transparent fill, thin champagne border, champagne text.
- Status labels on projects: Completed / Under Construction.
- **Champagne (#FAE1C8) is also a section background**: the Tenets panel, the quote banner,
  the description block on project pages and the whole footer. Navy or gold text sits on it.
- Project pages have a **specs row with thin line icons** (e.g. "3 BHK",
  "In the heart of Defence Colony").
- Lots of white space, almost no colour beyond navy, gold and champagne.

### Keep (so it reads as their brand)

- Exact palette and fonts from the theme tokens above.
- Facts-row pattern with `|` separators on cards and the detail hero.
- Prices as ₹ X.X Cr, never raw numbers.
- Pill buttons, gold used sparingly, a poetic serif tagline on the listings hero.

### Improve (where we surpass their site)

- **Opportunities vs the reference site:** image-heavy sections can show blank space while
  images load, price formats vary between banners, and the menu is collapsed even on desktop.
  We address all three: a skeleton or blur placeholder for every image, one formatted price source,
  and visible desktop nav.
- **Cards:** 4:3 image, a navy gradient on the bottom third, the status badge top-left in a
  champagne pill, and the name in DM Serif.
- **Detail page:** full-bleed hero image with gradient and facts row (like their homepage),
  then a two-column layout: content left, inquiry card right (stacks on mobile).
- **Typography scale:** display 48/56 serif, h2 32 serif, body 16 sans with 1.7 line-height,
  small caps with letter-spacing (`tracking-[0.2em] uppercase text-xs`) for labels like
  LOCATION, BEDROOMS.
- **Motion:** none beyond simple 200 ms colour transitions on buttons and inputs. No entrance
  animations (out of scope).
- **Forms:** underline-style inputs on the public inquiry form, standard bordered inputs in
  admin. Gold focus ring.
- **Empty and loading states styled in-brand:** a serif line ("No sanctuaries match these filters
  yet"), never a bare "No data".
- **Champagne sections:** use champagne as a background band for the listings hero tagline,
  the detail-page description block and the footer, with navy text on it.
- **Specs row on the detail page:** thin line icons (lucide-react, stroke 1.25, gold) next to
  bedrooms, size, location and status.
- **Buttons:** filled navy pill on light backgrounds, outline champagne pill over photos.
- **Accessibility they lack:** visible focus states, alt text, 4.5:1 contrast (champagne text
  only on navy; never champagne text on white), and keyboard-usable filters and modals.
- **Admin:** clean and dense, not decorative. White background, navy header, gold only for the
  active nav item.

### Don't

- No bright colours, gradients beyond navy fades, glassmorphism, or emoji.
- No stock "SaaS dashboard" look on public pages.
- No `dangerouslySetInnerHTML` anywhere. Inquiry messages render as plain text.
- Don't copy their logo or copy text verbatim. Use a simple "WL" serif mark and our own
  lines in the same voice.

---

## 7. Admin access (minimal, not a login)

The brief doesn't ask for auth, but `GET /api/inquiries` returns buyers' personal data and the write routes can delete listings. So:

- `ADMIN_KEY` env var. `requireAdmin` middleware compares the `x-admin-key` header with `crypto.timingSafeEqual` (equal-length check first).
- Applied to POST / PUT / DELETE `/api/properties` and GET `/api/inquiries`. Public routes stay open.
- The README states plainly: this is a shared-secret placeholder, not real authentication. Real login with roles is listed under next steps.
- No cookies are used, so there's no CSRF surface.

---

## 8. Commit order (keep history intact, small commits)

1. `chore: init monorepo, workspaces, tsconfig, eslint + prettier, docker-compose for postgres`
2. `feat(db): initial schema migration + seed data`
3. `feat(shared): zod schemas for property and inquiry`
4. `feat(api): express setup, security middleware, error handler, validate, admin key, health`
5. `feat(api): properties CRUD with filters and sort`
6. `feat(api): inquiries create + admin list`
7. `feat(web): vite + tailwind + theme + layout/header`
8. `feat(web): properties grid with filters, loading/empty/error states`
9. `feat(web): property detail + inquiry form`
10. `feat(web): admin properties table + delete confirm`
11. `feat(web): admin add/edit form with validation`
12. `feat(web): admin inquiries table`
13. `test(api): validation + route tests (supertest)`
14. `docs: README + AI_USAGE` (and final PROGRESS.md update)
15. Fix commits as they happen. Don't hide them, they show review.

Read every diff before committing. Fix anything you don't understand or wouldn't defend.

---

## 9. Tests (small but real)

**Test database.** Tests never touch the dev DB. `docker/init-test-db.sql` creates `white_lotus_test`; tests use `DATABASE_URL_TEST`, run the migrations once, and truncate tables before each test file. Tests import the app from `app.ts` (no server started).

- API with Vitest + Supertest:
  - POST property with negative price → 400 and field error
  - POST property with missing name → 400
  - POST property with an unknown field (e.g. `id`) → 400 (`.strict()`)
  - GET with an invalid sort → 400
  - GET `/api/properties/abc` → 400
  - POST inquiry to a missing property → 404
  - POST / PUT / DELETE property without admin key → 401; with wrong key → 401
  - GET `/api/inquiries` without admin key → 401
  - Happy-path create → read → update (check `updated_at` changed) → delete
- Shared: Zod schema unit tests for edge cases (price 0, bad email, short phone).

**Planted-bug checks (do these in Phase 3 and log each in PROGRESS.md):**
for each rule below, break the code on purpose, run the tests, confirm a test fails,
then restore the code and confirm green.

1. Remove the `price > 0` check from the Zod schema → negative-price test must fail.
2. Remove `sort` from the list query schema (so any value passes validation) → invalid-sort test must fail.
3. Skip the property-exists check on inquiry POST **and** remove the `23503` → 404 mapping → the missing-property test must fail (it gets 500). Both are needed: with only the check skipped, the FK error is still mapped to 404, so no test can fail.
4. Remove the required check on `name` → missing-name test must fail.
5. Remove `requireAdmin` from the DELETE route → the no-key DELETE test must fail.
   If a planted bug does not make a test fail, the test is too weak: fix the test.
   Never commit while a planted bug is in the code. Confirm all tests green before any commit.

**Frontend tests: out of scope** (not in the brief). README lists them under "What I'd do next". Don't add them.

---

## 10. README must contain

1. What it is (2 lines) and a screenshot.
2. **Setup**: prerequisites (Node 22+, Docker), then:
   ```
   cp .env.example .env
   docker compose up -d
   npm install
   npm run db:migrate && npm run db:seed
   npm run dev
   ```
   URLs for the web app and the API. Note that `.env.example` contains a dev `ADMIN_KEY` to enter on the admin pages.
3. **Architecture & decisions** (5–10 sentences): monorepo with shared Zod schemas, plain SQL over an ORM, price as integer rupees, filters in the URL, TanStack Query for server state, image URLs instead of uploads, no auth (by brief), cascade delete.
4. **Trade-offs given the time limit**, including: no frontend tests yet, no deployment.
5. **Security**: what's done (parameterised SQL, validation with `.strict()`, helmet, rate limits, admin key on writes and personal data, error mapping, no bodies in logs, `npm audit`) and what isn't (real login and roles, HTTPS, audit log, deployment hardening).
6. **What I'd do next**: real login + roles for the sales team, image uploads to S3/Cloudinary, pagination, inquiry status (new/contacted/closed) + notes, email notification on new inquiry, soft delete, frontend tests (Testing Library + Playwright), CI pipeline, deployment.

## 11. AI_USAGE.md

The brief asks for "which tools you used and roughly how". Open the file with the list of tools:

- **Claude (chat):** planning, spec review, scanning the client site for colours, fonts and layout.
- **Claude Code (Opus 5.5, high effort):** building phase by phase from `CLAUDE.md` and `docs/PLAN.md`, with every diff reviewed before commit.
- Any other tool actually used.

Then be honest and specific: what Claude Code generated, what you changed and why. Examples worth recording: tightened validation, replaced an unsafe sort interpolation, fixed a missing loading state, simplified an over-engineered piece. Build it from the AI usage notes table in `docs/PROGRESS.md`, which is filled in phase by phase, so this file stays accurate and takes minutes to write.

---

## 12. Out of scope (say so in README)

Real login / user accounts / roles, image upload, pagination, multiple images per property, deployment, CI, frontend tests, animations, i18n.
