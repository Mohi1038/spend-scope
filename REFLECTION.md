# Reflections

### 1. The hardest bug you hit this week, and how you debugged it
The most challenging issue was a persistent "hydration mismatch" error when loading the audit form state from `localStorage` in Next.js. Because `localStorage` is only available on the client-side window, the server-side render (SSR) would default the form state to empty, while the client would immediately populate it with saved data, causing React to throw errors about mismatched HTML trees.

**Hypothesis:** The mismatch occurred because the state was being initialized directly from `localStorage` during the component execution phase.
**Attempted Fixes:** I tried using `suppressHydrationWarning`, but that only hid the symptom. I then tried initializing state with a `typeof window !== 'undefined'` check, but the first render still mismatched.
**Successful Solution:** I implemented a custom `useLocalStorage` hook that initializes with a default value and performs the sync inside a `useEffect` block. This ensures that the initial SSR and the first client-side pass match exactly (both are empty), and only then does the "hydration effect" kick in to load the saved state.

### 2. A decision you reversed mid-week, and what made you reverse it
Mid-week, I initially planned to use a standard SQL schema where audit data and user lead info were in the same table. I reversed this decision and split them into two tables: `audits` (anonymous parameters) and `leads` (contact info linked by UUID).

**Reasoning:** I realized that if a user wanted to share their audit via a public link (the `/[slug]` route), I would have to fetch that data from the database. If the PII (Name and Email) lived in the same table, a malicious user could potentially increment IDs or guess slugs to harvest emails. By decoupling them and link-referencing them, I ensured that the public shareable route only ever touches the anonymous `audits` table, keeping user data safe by design.

### 3. What you would build in week 2 if you had it
In week 2, I would focused on "Real-time SaaS Integration" and "Benchmarking."
- **Integrations:** Build OAuth connectors for GitHub Enterprise and Google Workspace. Instead of users manually typing "15 seats," the tool would use the GitHub API to see exactly how many active Copilot licenses are being paid for but not used.
- **Benchmarking:** Create an aggregate "Efficiency Score" by comparing a user's spend against the average spend of other companies of the same size and use case. This adds a competitive/social element ("Your AI spend is 20% higher than similar Series A startups"), which is a powerful psychological trigger for lead conversion.

### 4. How you used AI tools
I used **GitHub Copilot** and **v0** throughout the week. 
- **Tasks:** Copilot was used for boilerplate generation (especially the complex `auditEngine.ts` conditions) and for writing the repetitive parts of the `FaqSection.tsx`. I used **v0** to rapidly prototype the "glassmorphic" UI components.
- **Trust:** I didn't trust the AI with the actual pricing data or the math logic for tiered plans (e.g., Cursor's business pricing vs. individual).
- **Wrong AI moment:** At one point, Copilot suggested a `map` function to calculate savings that completely ignored the "seat minimum" constraints for Claude Team plans (5-seat min). It assumed cost was purely `seats * price`. I caught this because I had already documented the constraints in `PRICING_DATA.md` and had my unit tests fail. I had to manually override the logic to handle the floor-limit.

### 5. Self-rating (1–10)
- **Discipline: 9/10** — I stuck to the 7-day plan and completed all engineering files on schedule.
- **Code Quality: 8/10** — The code is modular and typed, though some UI components could be further decomposed.
- **Design Sense: 8/10** — The neon-on-midnight aesthetic is consistent and professional, though responsive tweaks were needed.
- **Problem Solving: 9/10** — I successfully pivoted from LLM-math to a deterministic engine when I identified the precision risk.
- **Entrepreneurial Thinking: 10/10** — I focused heavily on the "Value-First" funnel, ensuring the user gets a result before being asked for an email.

