# BRIEF.md — assignment text (verbatim, source of truth)

If PLAN.md conflicts with this file, this file wins. Ask before acting on the conflict.

---

White Lotus Group
Senior Software Developer (Full Stack)
Time allotted: 24 hours from receipt AI tools: Fully allowed and encouraged
Context
White Lotus Group builds bespoke luxury residences in Bengaluru. For this assignment, imagine you're building an
internal tool the sales team would use to manage and showcase a portfolio of luxury properties to prospective buyers.

The Task: “Property Showcase & Inquiry Manager”
Build a small full-stack web application with the following features:

1. Property Listings (Frontend + Backend)
   • A page that displays a grid/list of luxury properties, each with: name, location, price, size (sq ft), number of
   bedrooms, a short description, and at least one image (placeholder/stock images are fine).
   • A detail page/view for a single property with fuller information.
   • Ability to filter/sort listings (e.g., by bedrooms, or location).
2. Add/Edit Property (CRUD)
   • A form to add a new property listing from the Admin portal.
   • Ability to edit or delete an existing listing.
   • Basic validation (e.g., price must be a positive number, required fields can't be empty).
3. Inquiry Capture
   • On each property detail page, a form where a prospective buyer can submit an inquiry (name, email, phone,
   message).
   • Inquiries should be stored in the database and viewable by the “admin” (sales team) in a simple dashboard/table
   view, showing which property each inquiry relates to.
4. Database
   • Use any database of your choice (PostgreSQL, MySQL, or MongoDB are preferred, matching our stack) to persist
   properties and inquiries.
   • Include your schema (SQL migration file or a schema/model definition).
5. Deployment (bonus, not mandatory)
   • If time allows, deploy the app (frontend + backend) to any free-tier host (Vercel, Render, Railway, DigitalOcean
   App Platform, etc.) and share the live link. Optional — won't be penalized if skipped, but it's a nice signal.

Tech Stack Requirements
• Frontend: React, Vue, or Angular (your choice) — mobile-responsive, using Tailwind or Bootstrap for styling.
• Backend: Node.js or Python.
• Database: MySQL, PostgreSQL, or MongoDB.
We're evaluating your judgment and craftsmanship more than the specific stack, but please stay within the listed
options since they reflect what we use day-to-day.
On Using AI Tools
You're welcome and encouraged to use AI coding tools (Claude Code, Cursor, Codex, GitHub Copilot, etc.) — this
mirrors how we actually work. To help us evaluate your judgment (not just the AI's output), please:
• Keep your git commit history intact (don't squash into a single commit) so we can see how the solution evolved.
• Add a short AI_USAGE.md file noting which tools you used and roughly how (e.g., “used Claude Code to
scaffold the CRUD API, then hand-edited validation logic”).
• Be ready to walk us through any part of the code in a follow-up conversation — including explaining decisions
you didn't personally type. We care most about whether you understand and can defend what shipped.
Deliverables
• A link to a GitHub (or similar) repository with your full source code.
• A README.md containing:
Setup/run instructions (so we can run it locally without guesswork)
A short note (5–10 sentences) on the architecture/design decisions you made and any trade-offs given the time limit
What you'd do next with more time
• The AI_USAGE.md file described above.
• (Optional) A live deployment link.
What We're Evaluating
Area What we're looking for
Code quality Clean, readable, reasonably organized client/server code
Full-stack competence Sensible API design, working DB layer, functioning frontend-backend integration
Product sense Thoughtful UX choices even under time pressure (validation, empty states, loading

states)

Judgment with AI tools Ability to direct, review, and correct AI-generated code rather than accept it blindly
Communication Clarity of README and ability to explain your own solution
Scope management Prioritizing a working core over an incomplete “everything”

We are not expecting a polished, production-grade product in 24 hours. A smaller feature set done well beats a large
feature set done sloppily.
Submission
Please reply to this email with your repository link (and live link, if applicable) within 48 hours of receiving this
assignment. If you anticipate needing more time, just let us know — we'd rather have a slightly later, well-considered
submission than a rushed one.
Good luck — we're looking forward to seeing how you think.
