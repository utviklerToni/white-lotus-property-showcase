# White Lotus — Property Showcase & Inquiry Manager

An internal tool for a luxury residences sales team: a public listing with filters, a detail page with an inquiry form, and an admin area to add, edit and delete properties and read inquiries.
React 19 + Vite + Tailwind v4, Express + TypeScript, PostgreSQL via `pg` and plain SQL.

## Setup

Prerequisites: Node 22+, Docker.

```sh
cp .env.example .env
docker compose up -d          # Postgres 16 on host port 5433 (dev + test databases)
npm install
npm run db:migrate && npm run db:seed
npm run dev                   # API + web together
```

- Web: http://localhost:5173 (Vite proxies `/api` to the API)
- API: http://localhost:4000/api (health check: `/api/health`)
- Admin: http://localhost:5173/admin. Enter the `ADMIN_KEY` from `.env` (the dev value from `.env.example`).

The test database `white_lotus_test` is created by `docker/init-test-db.sql` on the container's first start. If you already had the `pgdata` volume, run `docker compose down -v` once, then start again.

| Command                                         | What it does                                                       |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| `npm test`                                      | API + shared tests (Vitest + Supertest) against `white_lotus_test` |
| `npm run check`                                 | lint + typecheck + tests                                           |
| `npm run lint` / `npm run typecheck` / `format` | individually                                                       |
| `npm run db:migrate:test`                       | migrations against the test DB (tests also run them on start)      |

## Architecture & trade-offs

The app is an npm workspaces monorepo (`apps/web`, `apps/api`, `packages/shared`), and the shared package's Zod schemas validate both the forms and the API, with DB `CHECK` constraints as the last line of defence. The API uses plain SQL through `pg` and `.sql` migrations instead of an ORM: with two tables the queries stay short, readable and parameterised. Price is integer rupees in a `BIGINT` column, never a float, and is formatted only for display (`₹6.5 Cr`). Listing filters live in the URL, so a filtered view can be shared and survives a refresh. TanStack Query holds all server state, so an admin edit also refreshes the public pages. The brief doesn't require auth, but inquiries hold buyers' personal data, so the admin routes sit behind a shared-secret key header; it is a placeholder, not a login. Deleting a property cascades to its inquiries (`ON DELETE CASCADE`), and the confirm dialog says how many will go. Given the time limit there are no frontend tests, no CI and no deployment, and images are URLs rather than uploads. To scale, the web app is already feature-based (`features/<name>` plus generic `components/ui`), and the API would move from type layers (`routes/`, `db/`, `middleware/`) to `modules/<resource>/` as resources grow.

**More detail**

- `sort` maps through a whitelist to an `ORDER BY`; user input never becomes SQL.
- All TanStack Query keys live in one file (`apps/web/src/lib/queryKeys.ts`), shared by the public and admin features.
- `components/ui` never imports a feature (an ESLint rule); thin `pages/` join features together.
- Images are sized Unsplash URLs with `srcset`, so no storage service is needed.
- The admin tables sort, filter and paginate in the browser over the newest 200 inquiries the API returns.

## Security

**Done**

- Parameterised SQL everywhere, and `sort` through a whitelist.
- Every body is validated with Zod `.strict()` (unknown keys → 400), and only whitelisted columns reach SQL. Image URLs must be http(s).
- `helmet`, CORS limited to the web origin, a 100 kB JSON limit.
- Rate limits: 300 requests per 15 min on `/api`, and 5 per 15 min per IP on inquiry POST.
- An admin key (`x-admin-key`, compared with `timingSafeEqual`) protects property writes and `GET /api/inquiries`. The web app sends it only on admin calls, keeps it in `sessionStorage`, drops it on a 401, and has Sign out.
- One central error handler: Postgres errors are mapped to 400/404, there's one `{ error, fields? }` shape, and responses never include stack traces. Logs record method, path, status and duration, never bodies.
- No `dangerouslySetInnerHTML`. No cookies, so there's no CSRF surface.
- `npm audit` (22 Nov 2026): 0 vulnerabilities, including with `--omit=dev`.

**Not done**

- Real login with roles.
- HTTPS (dev only).
- An audit log of admin changes.
- Key rotation.
- Deployment hardening: secrets manager, DB TLS, rate limits aware of a reverse proxy.

## Known issues

- **Polish not done yet:**
  - No Lighthouse mobile run or keyboard-only pass yet (targets: Performance ≥ 90, Accessibility ≥ 95).
  - On desktop the detail page's left column is much shorter than the inquiry panel, so the sticky panel never engages.
  - The hero scrim needs tuning against real photos.
- **Bundle size:** the main JS chunk is 594 kB (189 kB gzip), and the build warns about it. Admin code is split out (lazy routes), but the main chunk hasn't been analysed yet.
- **Refresh scroll:** refreshing a scrolled listing page doesn't keep the scroll position, because the results load after the browser restores scroll. The back link and browser Back do restore it.
- **Dev only:** every request goes through the Vite proxy (one IP), so the per-IP rate limits act as one shared limit.
- Filter dropdowns use the native `<select>` list, which can't be styled.
- `npm run lint` shows two warnings: the React Compiler lint skips the two `useReactTable` components (an incompatible library).

## What I'd do next

- Real login and roles for the sales team.
- Image uploads (S3 / Cloudinary) and multiple images per property.
- Server-side pagination for listings and inquiries.
- Inquiry status (new / contacted / closed) and notes, plus an email notification on a new inquiry.
- Soft delete.
- Frontend tests (Testing Library + Playwright).
- A CI pipeline and a deployment.
- The polish items above.

**Out of scope (my scope decisions for the time box):** real accounts, image upload, multiple images, deployment, CI, frontend tests, entrance animations, i18n.

See [`AI_USAGE.md`](AI_USAGE.md) for how AI tools were used. `docs/PROGRESS.md` has the full decision, failure and session log.
