# Reflection & Self-Evaluation

This document contains deep reflections, technical retrospectives, and ratings from the first week of developing **SpendScope**.

---

## 1. Hardest Bug & Resolution

The most challenging bug encountered occurred during the Next.js production build (`npm run build`). The build process compiled successfully during the initial compiler phase but repeatedly crashed on static pre-rendering, showing `Error: supabaseUrl is required` and `Failed to collect page data for /[slug]`. 

### Hypotheses Formed
1. **Hypothesis A:** The Supabase client configuration was executing at module loading time rather than request time, meaning any missing client environment variables triggered instant validation crashes.
2. **Hypothesis B:** Next.js was attempting to statically build the dynamic `/[slug]` page at compile-time (SSG) rather than dynamic request-time (SSR), executing database fetches against empty parameters.

### Actions Taken
- First, I tried enclosing the `createClient` declaration in a helper function (`getClient()`) to delay instantiation. While this solved the initialization crash, compilation still failed when Next.js crawled `/[slug]/page.tsx` because it tried to run the fetch during build.
- Second, I provided fallback mock values for the Supabase configuration variables (e.g. `https://placeholder-project.supabase.co` and `placeholder-anon-key`). This prevented initialization crashes, but compile-time generation failed with fetch timeouts because the placeholder URL is not real.
- Finally, I exported `const dynamic = "force-dynamic"` at the top of `src/app/[slug]/page.tsx` and `src/app/api/audit/route.ts`. This explicitly instructed the Next.js compiler to bypass static page pre-generation and defer compiling page details entirely to runtime server rendering (SSR). This resolved the compilation errors, resulting in a successful build.

---

## 2. Decision Reversed Mid-Week

Mid-week, I reversed the decision to perform the audit optimization logic directly within the Anthropic Claude LLM call. 

Initially, the design parsed the user's stack, sent it as a raw string to Claude, and asked the model to calculate savings and suggest the best plans. I structured it this way to leverage the model's flexibility in handling arbitrary custom plan queries and writing descriptions in a single round-trip.

### Why I Reversed It
During initial tests with small stacks (e.g., Claude Team with 3 users), the model repeatedly failed at the basic arithmetic of seat limits. It suggested downgrading to Claude Pro but estimated savings based on $30/seat instead of $20/seat, or hallucinated that Cursor Pro was $15. It became clear that LLMs are not reliable for deterministic business calculations. 

I refactored the architecture, coding a deterministic TypeScript math engine (`src/lib/auditEngine.ts`) with hardcoded rules for SaaS plans and seat limits. We restricted Claude's role solely to writing the narrative summary, using the output of our TypeScript calculations as its source of truth. This guaranteed mathematical precision while preserving personalized reviews.

---

## 3. Week 2 Roadmap Planning

If granted a second week of development, I would prioritize these three high-impact items:

1. **Dynamic Open Graph Image Generator (Edge):** 
   Instead of using a static fallback image, I would use Next.js `@vercel/og` to dynamically generate Open Graph cards displaying the exact savings (e.g. *"This startup saved $1,200/year"*). This would increase click-through rates on Twitter and drive the viral loop.
2. **Real-time Dev Spend Benchmark Mode:**
   I would aggregate anonymous audit submissions to establish developer spend benchmarks. When a user submits their audit, we would plot their AI spend per dev against peer benchmarks (e.g., *"Your AI spend per dev is $65/mo. Startups of your scale average $42/mo"*), adding a competitive motivation to optimize.
3. **Automated Export to PDF:**
   Implement a clean PDF print stylesheet allowing founders to download the report with one click to share with their finance team or board.

---

## 4. AI Tool Usage & Retrospective

I used **Antigravity (Gemini 3.5 Flash)** and **Claude 3.5 Sonnet** to pair-program this application.

### Tasks Delegated
- **Boilerplate and Routing:** Generating Next.js serverless route layouts and directory setups.
- **Form UI Styling:** Writing the Tailwind grids and interactive card state transitions.
- **Copywriting:** Drafting outlines for GTM and landing pages.

### Where I Did Not Trust the AI
I did not trust the AI with the logic of the SaaS plan calculations, particularly edge cases like seat minimums or cross-tool redundancies. These required exact financial comparisons that LLMs tend to generalize or get wrong.

### Time the AI Was Wrong
While writing the Supabase REST query on `src/app/[slug]/page.tsx`, the AI proposed importing `notFound` from `"navigation"`. In the Next.js App Router, `notFound` resides in `"next/navigation"`. I caught this compilation error immediately, corrected the import path, and updated the module reference.

---

## 5. Self-Rating & Rationale

- **Discipline (9/10):** Maintained a consistent daily log and pushed code across 7 calendar days instead of cramming.
- **Code Quality (9/10):** Separated math logic from UI, typed all interfaces, and achieved clean TypeScript compilations.
- **Design Sense (8/10):** The glassmorphic design system is modern and responsive, though custom charting widgets could be enhanced.
- **Problem Solving (9/10):** Successfully resolved Next.js compile-time pre-render failures by applying edge configuration flags.
- **Entrepreneurial Thinking (9/10):** Understood the lead-generation funnel, email-gated results to maximize conversions, and integrated consultations.
