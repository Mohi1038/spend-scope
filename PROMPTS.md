# AI Prompts Documentation

This file documents the prompts used for the AI-generated audit summary feature in the **SpendScope** auditor.

## Prompt Architecture

We use a combination of a **System Prompt** (defining the persona and constraints) and a **User Prompt** (injecting the dynamic audit data).

### 1. System Prompt
- **Role:** `You are an expert SaaS CFO.`
- **Goal:** `Write a concise, personalized, objective audit summary. Do not output anything other than the summary paragraph.`

### 2. User Prompt
```text
You are a professional SaaS finance expert. Analyze this AI software spend audit:
- Team Size: {{teamSize}}
- Primary Use Case: {{primaryUseCase}}
- Total Monthly Spend: ${{totalSpend}}
- Potential Monthly Savings: ${{potentialMonthlySavings}}
- Is Stack Already Optimal: {{isOptimal}}
- Recommendations: {{recommendationsJSON}}

Write a personalized audit summary paragraph for the user. 
Guidelines:
1. Keep it under 100 words.
2. Sound professional, objective, and action-oriented. Do not praise the user or use generic filler.
3. Specifically mention their primary use case '{{primaryUseCase}}' and team size of {{teamSize}}.
4. Highlight the major savings actions they can take (e.g. downgrades or redundancies).
5. Mention Credex credits if their savings or spend is significant (savings > $100/mo or spend > $300/mo).
6. Return ONLY the paragraph text. Do not wrap in markdown quotes or code blocks.
```

---

## Design Decisions & Rationale

- **Structured System Persona:** Restricting Gemini to a "SaaS CFO" prevents it from writing overly verbose, conversational, or sycophantic intros (like *"Congratulations on using AI tools! Here is a summary..."*). Financial reports need to be direct and quantitative.
- **Strict Length Cap:** Startup founders are busy. A summary over 100 words decreases readability.
- **Dynamic Token Injection:** Passing the raw list of recommendations as JSON gives the LLM the exact context of what the engine did, permitting it to write personalized sentences like *"Consolidating your Cursor and Copilot licensing is the primary step to reducing your coding spend."*

---

## What Didn't Work (Iterative Refinement)

1. **Attempting Math in LLM:**
   - *Failure:* Originally, we tried feeding the raw list of tools and seat prices into the LLM and asking it to calculate the savings.
   - *Why it failed:* LLMs are notoriously unreliable for arithmetic on edge-cases (like Claude Team's 5-seat minimum). It frequently hallucinated calculations and suggested incorrect plan rates.
   - *Resolution:* We shifted all mathematical calculations to a deterministic TypeScript engine (`src/lib/auditEngine.ts`), and used the LLM *exclusively* for editorial summarization. Knowing when **not** to use AI is a critical engineering decision.
   
2. **Generic Role Prompts:**
   - *Failure:* Using a generic prompt resulted in summaries that included conversational pleasantries, bulleted lists, and markdown headers.
   - *Why it failed:* This broke the visual layout on the results screen, where we reserved a specific glassmorphic card for a single-paragraph summary block.
   - *Resolution:* Added strict guidelines (`Return ONLY the paragraph text. Do not wrap in markdown quotes...`) and fixed temperature at `0.3` to minimize creative formatting.
