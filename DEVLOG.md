# Developer Log (DEVLOG)

This log tracks the progression of **SpendScope** across 7 distinct calendar days.

---

## Day 1 — 2026-05-14
**Hours worked:** 3
**What I did:**
- Analyzed the intern assignment document and drafted the initial system architecture flow.
- Created the project roadmap outlining the milestones from setup to launch.
- Researched AI tool pricing metrics (Cursor, Copilot, ChatGPT, Claude) to map out optimization rules.
- Set up the local Git repository and created a baseline directory structure.
**What I learned:**
- LLM calculations are too slow and creative for core financial rules. The pricing math must be built into a deterministic TypeScript engine, reserving the LLM for descriptive summary text.
**Blockers / what I'm stuck on:**
- No blockers. Determining the correct schema to link anonymous audits to lead identities without leaking PII.
**Plan for tomorrow:**
- Initialize the Next.js framework, configure Tailwind dark mode theme tokens, and write the core calculations math.

---

## Day 2 — 2026-05-15
**Hours worked:** 4
**What I did:**
- Initialized Next.js 14 with TypeScript, TailwindCSS, and the App Router.
- Wrote the static pricing schema mapping and verification links in `PRICING_DATA.md`.
- Programmed the core logic engine `src/lib/auditEngine.ts` to identify cross-tool redundancies (Cursor + Copilot) and plan-downscaling limits.
- Set up Vitest and wrote 6 automated unit tests validating calculations.
**What I learned:**
- SaaS companies frequently use minimum-seat triggers (like Claude Team's 5-seat minimum) which catch users off guard. Accounting for these minimums is crucial for an accurate audit.
**Blockers / what I'm stuck on:**
- Configured Vitest to run natively inside our ESModule compiler environment.
**Plan for tomorrow:**
- Develop the high-fidelity input form UI, design custom select dropdowns, and implement local storage syncing.

---

## Day 3 — 2026-05-16
**Hours worked:** 5
**What I did:**
- Built the main page landing framework with custom typography (Outfit font).
- Created the grid of active/inactive tool cards, allowing users to build their current software stack.
- Wired local storage sync so that refresh or exit retains their configuration.
- Standardized UI spacing, active gradients, and responsive sizing.
**What I learned:**
- Forms with dozens of separate number inputs overwhelm users. Pre-populating default prices and seats when a tool is selected lowers friction.
**Blockers / what I'm stuck on:**
- Syncing state properly on initial client render without triggering Next.js server-vs-client hydration mismatches. Resolved by utilizing `useEffect` hooks for local storage loading.
**Plan for tomorrow:**
- Code the dynamic results panel, integrate counting calculators for potential savings, and design the lead capture modal.

---

## Day 4 — 2026-05-17
**Hours worked:** 4
**What I did:**
- Developed the results view detailing itemized savings suggestions and potential annual reductions.
- Added a conditional booking widget displaying an calendar integration for workspaces showing >$500/mo in savings.
- Programmed the honeypot field, email validations, and submission logic.
**What I learned:**
- Visual hierarchy dictates user trust. Showing the total annual savings in huge text makes the calculations look significant and drives lead conversions.
**Blockers / what I'm stuck on:**
- Building responsive custom layout grids that wrap nicely on smaller mobile screens without clipping the sidebar summary stats.
**Plan for tomorrow:**
- Setup the Supabase database schema, code the backend REST tables, and write the transactional email dispatch routes.

---

## Day 5 — 2026-05-18
**Hours worked:** 5
**What I did:**
- Configured the PostgreSQL database in Supabase and wrote RLS (Row Level Security) schemas.
- Programmed the standard and service role client connections inside `src/lib/supabaseClient.ts`.
- Coded `/api/audit` and `/api/leads` endpoints to securely store data.
- Configured Resend and tested transactional HTML email delivery.
**What I learned:**
- Exposing DB insert queries directly to client browsers is unsafe. Keeping db writes strictly inside serverless API routes (`/api/leads`) keeps the main table credentials secure.
**Blockers / what I'm stuck on:**
- Handling database insert errors when a generated random slug conflicts. Added a recursive slug unique retry routine in the API.
**Plan for tomorrow:**
- Integrate the Anthropic Claude API for dynamic summaries, create the public shareable routes, and set up metadata tags.

---

## Day 6 — 2026-05-19
**Hours worked:** 4
**What I did:**
- Integrated the `@anthropic-ai/sdk` client and programmed the `/api/summary` endpoint.
- Structured the CFO system prompt and user context template.
- Built the dynamic routing layout `src/app/[slug]/page.tsx` for clean sharing, rendering audit results with all PII deleted.
- Set up custom Meta/Open Graph parameters for Twitter cards.
**What I learned:**
- Claude 3.5 Sonnet needs very specific format instructions to avoid outputting extra headers or markdown symbols that throw off the visual cards.
**Blockers / what I'm stuck on:**
- Resolving API timeout exceptions from Anthropic Sonnet when cold-starting serverless functions. Fixed by compiling a dynamic template fallback that returns instantly if the SDK errors.
**Plan for tomorrow:**
- Conduct production build checks, fix compilation lint warnings, write tests documentation, and complete the write-ups.

---

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
