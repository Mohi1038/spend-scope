# Developer Log (DEVLOG)

This log tracks the progression of **SpendScope** across 7 distinct calendar days.

---

## Day 1 — 2026-05-20
**Hours worked:** 2
**What I did:**
- Initialized Next.js 14 project scaffold with TypeScript and TailwindCSS.
- Configured framework architecture and dark-mode neon glass styling.
- Defined baseline database schema in `db/001_create_tables.sql` for Postgres.
- Recorded initial pricing data sources for AI tools in `PRICING_DATA.md`.
- Set up GitHub Actions CI for automated linting and tests.
**What I learned:**
- Starting with a strict pricing data manifest is essential before writing the calculation engine to prevent logic drift.
**Blockers / what I'm stuck on:**
- Deciding between global state and URL-based state for audit parameters.
**Plan for tomorrow:**
- Build the core audit engine and implement API rate limiting.

---

## Day 2 — 2026-05-21
**Hours worked:** 3
**What I did:**
- Implemented `auditEngine.ts` with deterministic math logic.
- Added Upstash Redis rate limiting to API routes to prevent abuse.
- Integrated Radix UI primitives for accessible components (Dialog, Select).
- Added Framer Motion for smooth audit result transitions.
**What I learned:**
- Rate limiting at the edge is significantly more effective than at the application level for serverless routes.
**Blockers / what I'm stuck on:**
- Configuring Redis connection persistence across Vercel serverless cold starts.
**Plan for tomorrow:**
- Refine the global layout and build the audit visualization components.

---

## Day 3 — 2026-05-22
**Hours worked:** 3
**What I did:**
- Updated global styles with root layout refinements.
- Built the `AuditReportClient` component for real-time visualization.
- Refactored the core audit flow on the home page for better UX.
- Improved UI primitives (buttons, inputs) for the glassmorphic theme.
**What I learned:**
- Layout shifts during dynamic calculations can be mitigated with skeletal loaders and Framer Motion's `layout` prop.
**Blockers / what I'm stuck on:**
- Hydration mismatches with local storage sync on initial load.
**Plan for tomorrow:**
- Add marketing sections (FAQ, Hero, Pricing) and polish the visual chart accents.

---

## Day 4 — 2026-05-23
**Hours worked:** 3
**What I did:**
- Added metallic chrome-green accents to savings metrics and charts for better visual "profit" signaling.
- Conducted internal design review of the results page.
**What I learned:**
- Color psychology (green vs. red) significantly impacts how users perceive "potential savings" as a positive gain.
**Blockers / what I'm stuck on:**
- None.
**Plan for tomorrow:**
- Complete the landing page marketing sections and clean up dev scripts.

---

## Day 5 — 2026-05-24
**Hours worked:** 4
**What I did:**
- Added `HeroToolLogos`, `FaqSection`, and `PricingRatesSection` to the landing page.
- Cleaned up development scripts and added autoprefixer for CSS compatibility.
- Fixed a bug where tool logos were not scaling correctly on mobile.
**What I learned:**
- SVGs are superior for tool logos in this design, but require containment to avoid overflow in grid layouts.
**Blockers / what I'm stuck on:**
- Matching the brand colors across different SVG asset sources.
**Plan for tomorrow:**
- Implement dynamic routing for shareable reports and integrate Gemini AI.

---

## Day 6 — 2026-05-25
**Hours worked:** 3
**What I did:**
- Implemented dynamic routing (`/[slug]`) for persistent, shareable audit reports.
- Integrated Gemini 1.5 Flash via `gemini.ts` for narrative audit summaries.
- Set up Supabase client infrastructure and environment variables for production.
- Built the Lead Capture API to sync data with the database.
- Refined global styling for final production look.
**What I learned:**
- Summarizing JSON data for an LLM requires structured keys to ensure the model picks up on tool redundancies.
**Blockers / what I'm stuck on:**
- Supabase RLS policies were initially too restrictive, blocking public anonymous reads of shared reports.
**Plan for tomorrow:**
- Final documentation, final test runs, and project submission.

---

## Day 7 — 2026-05-26
**Hours worked:** 2
**What I did:**
- Completed `REFLECTION.md`, `GTM.md`, and `ECONOMICS.md`.
- Refined `PROMPTS.md` and `PRICING_DATA.md` for clarity and professional tone.
- Verified that all five unit tests in `auditEngine.test.ts` pass consistently.
- Final UI polish on the "SpendScore" branding and responsiveness.
**What I learned:**
- Writing the reflection and economics documentation reveals gaps in the business logic that were missed during pure coding.
**Blockers / what I'm stuck on:**
- None. Project is ready for evaluation.
**Plan for tomorrow:**
- Submit project.


## Day 7 — 2026-05-20
**Hours worked:** 3
**What I did:**
- Debugged Next.js production compiler lints (unescaped quotes check).
- Configured `export const dynamic = "force-dynamic"` on dynamic pages to resolve build-time pre-render network errors.
- Completed all project documentation write-ups: `REFLECTION.md`, `GTM.md`, `ECONOMICS.md`, `METRICS.md`, `USER_INTERVIEWS.md`, and `LANDING_COPY.md`.
- Verified that the Vitest test runner runs green on commits.
**What I learned:**
- Next.js pre-compiles routes at build time. Dynamic pages that interact with external data sources need fallback placeholders or dynamic flags to prevent compilation failures.
**Blockers / what I'm stuck on:**
- Resolved build-time Supabase connection initialization failures by configuring fallback placeholder parameters in the client setup.
**Plan for tomorrow:**
- Submit the project repository and live URL.
