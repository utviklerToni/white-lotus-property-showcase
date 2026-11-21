# PROGRESS.md — read this first

Handoff log for the next Claude session or developer. Rules are in `docs/PLAN.md` section 0.

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
- [ ] 7 Polish
- [ ] 8 README + AI_USAGE.md (14)

## Decisions (append-only, newest at bottom)

| #   | Date   | Decision                                                                                                | Why                                                                 | Alternatives rejected                     |
| --- | ------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| D1  | 21 Nov | Express on Node                                                                                         | Minimal, readable, matches the brief's Node option                  | NestJS (too much structure for this size) |
| D2  | 21 Nov | pg + plain SQL migrations, no ORM                                                                       | Schema is readable SQL (a named deliverable); no ORM install issues | Prisma, Knex                              |
| D3  | 21 Nov | npm workspaces monorepo: apps/web, apps/api, packages/shared                                            | Shared Zod schemas, one clone, one install                          | Separate repos, Turborepo/Nx              |
| D4  | 21 Nov | Price stored as BIGINT rupees, formatted to ₹ Cr in UI                                                  | No float rounding errors                                            | NUMERIC, float                            |
| D5  | 21 Nov | Image URL field, no uploads                                                                             | Uploads need storage and cleanup; out of time box                   | S3/Cloudinary upload                      |
| D6  | 21 Nov | No auth on admin (brief doesn't require it)                                                             | Scope; documented as trade-off                                      | Basic auth, ADMIN_KEY (stretch)           |
| D7  | 21 Nov | No deployment                                                                                           | Optional bonus; core quality first                                  | Hetzner, Render                           |
| D8  | 21 Nov | Theme from whitelotusgroup.in: navy #282D3C, champagne #FAE1C8, gold #B98A39, DM Serif Text + Open Sans | Matches client brand                                                | Generic palette                           |

## Failures & fixes (append-only)

| #   | Date | What broke | Root cause | Fix | Commit |
| --- | ---- | ---------- | ---------- | --- | ------ |

## Deviations from PLAN.md

- none yet

## Known issues / TODO

- none yet

## AI usage notes (feeds AI_USAGE.md)

| Phase | AI generated                                                     | Human changed / rejected                             | Why              |
| ----- | ---------------------------------------------------------------- | ---------------------------------------------------- | ---------------- |
| 0     | Plan drafted with Claude (chat), site styles scanned via browser | Set stack, scope cuts, phase order, design direction | Plan before code |

## Session log (one line per session)

- 21 Nov, planning: PLAN.md, PROGRESS.md and reference screenshots prepared. No code yet.
