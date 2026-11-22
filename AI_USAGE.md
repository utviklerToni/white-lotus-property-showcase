# AI usage

## Tools

- **Claude (chat):** planning (stack, scope, schema, API, phase order), design research on the client's site (palette, type, layout patterns, captured as reference screenshots), and review of plans and code during the build.
- **Claude Code (Opus 5.5, high effort):** the build, one phase at a time, from `CLAUDE.md` (working rules), `docs/PLAN.md` (what to build) and `docs/PROGRESS.md` (state and log, updated as work happened).

## How I worked with it

- Claude Code wrote most of the code. Each phase started with a file list I approved, ended with checks I ran in the browser, and every commit was staged for me to review (`git diff --staged`) before I replied "approved". I ran the dev servers myself.
- Every decision, failure, deviation and correction was logged in `docs/PROGRESS.md` as it happened. This file is built from that log.
- Tests were checked by planting five bugs on purpose (e.g. removing `price > 0`, removing `requireAdmin` from DELETE). Each one had to make a test fail before the code was restored.

## Corrections and rejections that mattered

| Area          | What the AI did                                                                     | What I changed and why                                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Design        | First UI plan copied the client site's look (fonts, pills, bands, logo mark)        | Rejected: keep only the palette, use our own design brief and mocks. Not a copy of the client's site.                                                               |
| Git           | Proposed committing after a verbal OK                                               | Set the stage → review staged diff → "approved" → commit workflow. I own what enters history.                                                                       |
| Dependencies  | Installed the newest majors (`@tanstack/react-table` v9, `@hookform/resolvers` v7)  | Pinned v8 and v5. Both new majors were weeks old and their main benefit didn't apply. Rule added: prefer a major released 6+ months ago.                            |
| HTTP client   | Advised keeping `fetch` over axios                                                  | Chose axios. Its interceptors give one place to attach the admin key and handle a 401.                                                                              |
| Not-found     | Verified the 404 page only by typecheck and build                                   | In the browser every unknown URL said "Something went wrong" (`useRouteError()` returns `null`). Fixed, and now every state is checked in a browser.                |
| Scroll        | Scroll restoration for the listing ↔ detail round trip                              | I found the page jumping on filter changes, twice. It took two rounds and a specified fix (router state with the scroll position, `preventScrollReset` on filters). |
| Validation    | An empty phone field showed the "digits only" message                               | Fixed the check order in the shared schema (`abort` on empty) and added a test.                                                                                     |
| Visual review | Borderless selects, a pale status badge, a flat navy hero overlay                   | Seen on real photos: selects got a gold underline, the badge a champagne fill, the hero a warm soft overlay. The AI measured contrast for each option first.        |
| Admin UX      | Small image preview under the URL field; no way to sign out                         | Two-column form with a larger sticky 4:3 preview; Sign out in the admin nav.                                                                                        |
| Dev servers   | Started and killed dev servers itself; its `pkill` patterns killed its own commands | I run the servers. The AI only runs checks against them.                                                                                                            |

## Where the AI caught things

- A contradiction in my plan: one planted-bug check could never fail, because the API maps FK errors to 404 anyway. The AI proposed rewording the check.
- Claude chat's suggested hero-scrim values and its bright-gold borders failed contrast. The agent measured each option and the numbers settled it.
- The design brief's own focus colour (gold on stone, 2.89:1) failed its 3:1 rule. Switched to a darker gold for text and focus on light backgrounds.
- A chat review suggested moving the request logger, based on a summary. The agent tested it and showed the logger was already correct. Lesson: review the code, not the summary.
