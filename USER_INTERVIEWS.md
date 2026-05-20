# User Interviews Report

This document notes the feedback gathered from three user interviews conducted with technical leaders and startup founders regarding their AI tool subscriptions and spend management.

---

## Interview 1: A.K. — CTO, DevTooling Startup (Seed, 5 devs)

### Discussion Notes:
A.K. manages a team of 5 software engineers. They moved from VS Code to Cursor three months ago but maintained their existing GitHub Copilot licenses.

### Direct Quotes:
1. *"I didn't even realize Cursor had its own autocompletion engine built-in. We just kept our Copilot licenses active out of habit because we were afraid of losing code suggestions."*
2. *"SaaS billing is the last thing on my mind during a product sprint. We only check our card statement when we need to update our accounting records."*
3. *"If you show me how much we are losing on dual-licensing, I'll cancel Copilot today. But I need a clean summary I can slack to my co-founder first."*

### Most Surprising Moment:
A.K. assumed that Cursor required a running GitHub Copilot license to perform autocomplete completions, which is why they were paying twice.

### Design Action:
We designed a specific **Editor Redundancy Rule** in the Audit Engine. If both Cursor and GitHub Copilot are present in the stack, we flag a clear warning recommending they cancel Copilot and save $19/user/month.

---

## Interview 2: M.R. — Engineering Manager, EdTech Company (Series A, 18 devs)

### Discussion Notes:
M.R. runs team infrastructure budgets. They use Anthropic APIs heavily for data processing and maintain a Claude Team subscription.

### Direct Quotes:
1. *"We upgraded to Claude Team because we wanted shared workspace folders, but the 5-seat minimum means we pay for two empty seats since we only have three active users on it."*
2. *"I want to implement API prompt caching to cut token costs, but I haven't had the time to calculate if the engineering effort is worth the savings."*
3. *"If a tool asks for my email before showing me the calculations, I close the tab instantly. Show me the numbers first, then I'll give you my details."*

### Most Surprising Moment:
M.R. was aware they were overpaying for Claude Team's 5-seat minimum but didn't know that downgrading to Claude Pro would save them $110/month while retaining key capabilities.

### Design Action:
1. Coded the seat-minimum rules directly into the TypeScript calculations engine.
2. Formulated a strict **"Value First, Capture Second"** UI flow: the audit results display instantly, and the email gate is only shown if the user wants to export the PDF or book a consultation.

---

## Interview 3: S.L. — Founder, Bootstrapped Agency (3 staff)

### Discussion Notes:
S.L. runs a creative marketing agency. The team uses ChatGPT Plus, Claude Pro, and Gemini Advanced interchangeably.

### Direct Quotes:
1. *"We subscribe to ChatGPT, Claude, and Gemini Pro at the same time. Different team members prefer different tools, but we probably only need one primary platform."*
2. *"Our team expenses their subscriptions on individual cards, so we don't have a single billing dashboard showing our total AI software spend."*
3. *"If you can show me how to migrate to discounted credit pools, I'd book a consultation call immediately to cut our billing."*

### Most Surprising Moment:
S.L.'s team spent over $120/month on redundant consumer subscriptions because they lacked a centralized billing manager, expensing individual cards instead.

### Design Action:
1. Implemented a **Cross-LLM Consolidation Strategy** suggestion that alerts teams when they are running multiple redundant Pro subscriptions.
2. Integrated an **Inline Booking Calendar** for high-spend users (spend >$500/mo) to schedule a consultation with Credex.
