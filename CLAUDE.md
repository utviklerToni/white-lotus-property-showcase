# CLAUDE.md — working rules

Property Showcase & Inquiry Manager (take-home). React + Vite + TS + Tailwind, Express + TS, PostgreSQL via `pg` and plain SQL.

## Source files

| File               | Role                                                                               |
| ------------------ | ---------------------------------------------------------------------------------- |
| `docs/BRIEF.md`    | Assignment text. **Source of truth.** Wins over everything else.                   |
| `docs/PLAN.md`     | What to build: stack, schema, API, pages, design, commit order, tests.             |
| `docs/PROGRESS.md` | Where we are: state, decisions, failures, deviations, AI usage notes, session log. |
| `docs/reference/`  | Screenshots of the client site. View them before any UI work.                      |

If PLAN conflicts with BRIEF, stop and ask. Never resolve it silently.

## Session start (every session, including after /clear)

1. Read `docs/PROGRESS.md`.
2. Read only the PLAN.md sections for the current phase.
3. Reply in two lines: current phase, next step.
4. Wait for my OK.

## Phases

Build one phase at a time, in this order. Never start the next phase without my OK.

| #   | Phase                          | PLAN commits |
| --- | ------------------------------ | ------------ |
| 1   | Foundation                     | 1–3          |
| 2   | API                            | 4–6          |
| 3   | API tests + planted-bug checks | 13           |
| 4   | Web shell + listings           | 7–8          |
| 5   | Detail + inquiry form          | 9            |
| 6   | Admin                          | 10–12        |
| 7   | Polish + `npm audit`           | fixes        |
| 8   | README + AI_USAGE.md           | 14           |

The whole build runs on Opus 5.5, high effort. Keep token use sensible: read only the files a phase needs, don't re-read the repo, don't restate the plan.

### Per phase

1. **Phase start:** name the phase, list the files you'll create or change and why. Wait for OK.
2. **Build** only that phase.
3. **Verify:** tell me exactly how to check it (commands, URLs, what I should see). Stop.
4. **Commit** after I confirm: update PROGRESS.md, then commit code + PROGRESS.md together with the message from PLAN.md section 8.
5. **Phase-end self-check**, reported as a checklist:
   - `npm run check` passes (lint errors, typecheck, tests) and `npm run format` was run
   - `git log --oneline -5` shows the planned commit(s) with the planned messages
   - nothing built outside this phase
   - no dependency added outside the plan without my approval
   - no secrets, `.env` or `node_modules` staged
   - PROGRESS.md updated: Current state, checklist, session log row with start/end time and what took longer
   - token use for the phase: low / as expected / high
     If any item fails, say so plainly and propose the fix.

## Slipping rules — stop and tell me immediately if you are about to:

- do work that belongs to another phase
- add a dependency not in the PLAN section 1 allowlist, or any tool or service not in the plan
- retry the same failing fix a third time
- commit with a message not from PLAN.md or not approved by me
- touch git history (amend after push, rebase, squash, force-push) or run `git push`
- guess where the plan or brief is unclear

Record the outcome under Deviations or Failures in PROGRESS.md.

## Hard rules

- No ORM (no Prisma, Drizzle, Knex, TypeORM). `pg` + `.sql` migrations only.
- Money is integer rupees (`BIGINT`). No floats for price, anywhere.
- SQL is parameterised. Never build SQL from user input; `sort` goes through a whitelist map.
- Admin key (`requireAdmin`) on property POST / PUT / DELETE and GET inquiries. Never log request bodies.
- Body schemas use `.strict()`. Only whitelisted columns go into SQL.
- No `dangerouslySetInnerHTML`.
- Tests run against `white_lotus_test` only, never the dev database.
- Never commit while a planted bug is in the code. All tests green before every commit.
- TypeScript strict. No `any` and no `eslint-disable` without a same-line comment explaining why.
- Build only what the brief asks for plus what PLAN.md lists. No CI, no deployment, no frontend tests, no animations, no real login.
- Validation lives in `packages/shared` (Zod) and is used by both web and api. DB CHECK constraints stay as the last line of defence.
- One error response shape everywhere: `{ error, fields? }`. No stack traces in responses.
- No `window.alert` / `window.confirm` / `window.prompt`. Use React modals and toasts.
- Every list view has loading, empty and error states.
- Don't copy the client's logo or copy text verbatim.
- Never commit secrets, `.env` or `node_modules`. `.env.example` only.
- Never run `git push`. Never squash or rewrite history.
- Paid services, API keys and cloud accounts are out of scope.

## Logging (into `docs/PROGRESS.md`, as it happens, not at the end)

- **Decision** with a real alternative → Decisions table.
- **Failure** (build error, failing test, redone approach) → Failures & fixes, with root cause.
- **Deviation** from PLAN → Deviations, and update PLAN.md in the same commit.
- **Anything I rejected or changed** in your output → AI usage notes.
- **Planted-bug check** → Planted-bug checks table (Phase 3).
- Record commit messages, not hashes.
- Decisions, Failures and Session log are append-only. Correct with a new row, never edit old ones.

## Code style

- Small, readable files. Explain non-obvious code with a short comment, not a paragraph.
- I must be able to explain every line in a review. If something is clever, make it simpler.

## Commands

Fill in as they're created in Phase 1:

- `docker compose up -d` — start Postgres
- `npm run db:migrate` / `npm run db:seed`
- `npm run dev` — api + web
- `npm test`
- `npm run lint` / `npm run format` / `npm run typecheck`
- `npm run check` — lint + typecheck + tests; must pass before every commit
