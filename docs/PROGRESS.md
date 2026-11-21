# PROGRESS.md — read this first

Handoff log for the next Claude session or developer. Rules are in `CLAUDE.md`. Record commit messages, not hashes (git log has the hashes).

## Current state

- Phase: 0 of 8 (not started)
- Last commit: none
- App runs: no (nothing built yet)
- Next step: Phase 1 Foundation (monorepo, Docker Postgres, schema + seed, shared Zod schemas)

## Phase checklist

- [ ] 1 Foundation (commits 1–3)
- [ ] 2 API (4–6)
- [ ] 3 API tests (13)
- [ ] 4 Web shell + listings (7–8)
- [ ] 5 Detail + inquiry form (9)
- [ ] 6 Admin (10–12)
- [ ] 7 Polish + npm audit
- [ ] 8 README + AI_USAGE.md (14)

## Decisions (append-only, newest at bottom)

| #   | Date   | Decision                                                                                                                                                                                                                                                                                         | Why                                                                                          | Alternatives rejected                     |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------------------------------------- |
| D1  | 21 Nov | Express on Node                                                                                                                                                                                                                                                                                  | Minimal, readable, matches the brief's Node option                                           | NestJS (too much structure for this size) |
| D2  | 21 Nov | pg + plain SQL migrations, no ORM                                                                                                                                                                                                                                                                | Schema is readable SQL (a named deliverable); no ORM install issues                          | Prisma, Knex                              |
| D3  | 21 Nov | npm workspaces monorepo: apps/web, apps/api, packages/shared                                                                                                                                                                                                                                     | Shared Zod schemas, one clone, one install                                                   | Separate repos, Turborepo/Nx              |
| D4  | 21 Nov | Price stored as BIGINT rupees, formatted to ₹ Cr in UI                                                                                                                                                                                                                                           | No float rounding errors                                                                     | NUMERIC, float                            |
| D5  | 21 Nov | Image URL field, no uploads                                                                                                                                                                                                                                                                      | Uploads need storage and cleanup; out of time box                                            | S3/Cloudinary upload                      |
| D6  | 21 Nov | No auth on admin (brief doesn't require it)                                                                                                                                                                                                                                                      | Scope; documented as trade-off                                                               | Basic auth, ADMIN_KEY (stretch)           |
| D7  | 21 Nov | No deployment                                                                                                                                                                                                                                                                                    | Optional bonus; core quality first                                                           | Hetzner, Render                           |
| D8  | 21 Nov | Theme from whitelotusgroup.in: navy #282D3C, champagne #FAE1C8, gold #B98A39, DM Serif Text + Open Sans                                                                                                                                                                                          | Matches client brand                                                                         | Generic palette                           |
| D9  | 21 Nov | Current stable versions: Node 22 LTS, React 19, Router v7, Express 5, Tailwind v4 (`@theme` in CSS)                                                                                                                                                                                              | Node 20 is end-of-life; a fresh install gets Tailwind v4                                     | Pinning older versions                    |
| D10 | 21 Nov | Locations endpoint at `/api/locations`                                                                                                                                                                                                                                                           | Avoids collision with `/api/properties/:id`                                                  | `/api/properties/locations`               |
| D11 | 21 Nov | Own migrate/seed scripts (`tsx`), `schema_migrations` table, seed safe to re-run                                                                                                                                                                                                                 | No ORM, so something has to run the SQL files                                                | node-pg-migrate (extra dependency)        |
| D12 | 21 Nov | Separate `white_lotus_test` DB for tests                                                                                                                                                                                                                                                         | Tests must not wipe dev data                                                                 | Shared dev DB                             |
| D13 | 21 Nov | Shared package consumed as TS source, no build step                                                                                                                                                                                                                                              | Avoids build and module-resolution friction                                                  | Building shared to JS                     |
| D14 | 21 Nov | Minimal admin key (`x-admin-key`, timing-safe) on writes and inquiries; no real login                                                                                                                                                                                                            | Inquiries hold personal data; JD lists "security and data protection"; login is out of scope | Fully open admin; JWT login               |
| D15 | 21 Nov | Dependency allowlist in PLAN section 1                                                                                                                                                                                                                                                           | Agent can add packages without stopping to ask each time                                     | Ask per package                           |
| D16 | 21 Nov | Whole build on Opus 5.5, high effort                                                                                                                                                                                                                                                             | Consistency over token savings                                                               | Mixed medium/high                         |
| D17 | 21 Nov | Strict TS + basic ESLint (recommended, not type-checked) + Prettier                                                                                                                                                                                                                              | Serves "clean, readable code" without rule-fighting                                          | Type-checked lint, zero-warning gate      |
| D18 | 21 Nov | Scope locked to the brief plus graded areas. Kept: validation, loading/empty/error states, sensible API design (helmet, rate limits, `.strict()`, pg error mapping, admin key on writes and inquiries), API tests + planted-bug checks. Cut: CI, deployment, frontend tests, entrance animations | Brief: "a smaller feature set done well beats a large feature set done sloppily"             | Building every nice-to-have               |

## Failures & fixes (append-only)

| #   | Date | What broke | Root cause | Fix | Commit message |
| --- | ---- | ---------- | ---------- | --- | -------------- |

## Planted-bug checks (Phase 3)

| #   | Rule | Bug planted | Test that failed | Restored + green |
| --- | ---- | ----------- | ---------------- | ---------------- |

## Deviations from PLAN.md

- none yet

## Known issues / TODO

- none yet

## AI usage notes (feeds AI_USAGE.md)

| Phase | AI generated                                                                                                     | Human changed / rejected                                                                                                       | Why              |
| ----- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| 0     | Plan, CLAUDE.md and PROGRESS drafted with Claude (chat); client site styles and screenshots captured via browser | Set stack, scope cuts, phase order, design direction; moved working rules into CLAUDE.md after comparing with a previous build | Plan before code |

## Session log (one line per session or phase)

| Date   | Start | End | Phase      | Done                                                                                                                                          | What took longer than expected |
| ------ | ----- | --- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 21 Nov | —     | —   | 0 planning | BRIEF, PLAN, PROGRESS, CLAUDE.md, references prepared; pre-launch spec review fixed versions, routes, migrations, test DB, security. No code. | —                              |
