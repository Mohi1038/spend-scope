# Automated Test Report

This file documents the automated test suite written for the **SpendScope** audit engine.

## Test Framework
- **Framework:** [Vitest](https://vitest.dev/)
- **Configuration:** Standalone TypeScript test runner.

## Running the Tests
To install dependencies and execute the test runner locally:

```bash
# Install dependencies
npm install

# Run the test suite (single run)
npm run test

# Run the test suite in watch mode
npx vitest
```

## Test Coverage Summary

All tests are located in [`src/lib/__tests__/auditEngine.test.ts`](file:///Users/mohi1038/Desktop/spend-scope/src/lib/__tests__/auditEngine.test.ts).

| Test Name | Feature Covered | Assertion/Goal | Status |
| :--- | :--- | :--- | :--- |
| **Test Case 1: Redundant Editor Subscriptions** | Editor Redundancies | Asserts that when a user has both Cursor and GitHub Copilot, Copilot is flagged as redundant and recommends consolidation. | **PASSED** |
| **Test Case 2: Claude Team Seat Minimum Overpay** | SaaS plan minimums | Asserts that if a team has fewer than 5 users on Claude Team, it suggests downgrading to Claude Pro to save empty seat overhead. | **PASSED** |
| **Test Case 3: Single Seat Plan Overkill** | Plan level mismatch | Asserts that Cursor Business with 1 seat is flagged to downgrade to Cursor Pro, saving $20/month. | **PASSED** |
| **Test Case 4: API Direct Caching Savings** | API direct spend optimization | Asserts that high API spend (> $100) triggers a recommendation to implement Anthropic or OpenAI prompt caching, cutting costs by 30%. | **PASSED** |
| **Test Case 5: Already Optimal Stack** | Honest Spent-Well response | Asserts that an optimal stack (e.g. Cursor Pro with 1 seat) produces no savings recommendations and marks `isOptimal` as true. | **PASSED** |
| **Test Case 6: Credex Credits Qualification** | B2B lead generation loop | Asserts that if remaining direct tool spend exceeds $500/month, the engine injects a 25% savings offer via Credex infrastructure credits. | **PASSED** |

## Test Run Output (Local Execution)

```bash
> spend-scope@0.1.0 test
> vitest run

 RUN  v4.1.7 /Users/mohi1038/Desktop/spend-scope

 ✓ src/lib/__tests__/auditEngine.test.ts (6 tests) 2ms
   ✓ Spend Audit Engine Core Calculations (6)
     ✓ Test Case 1: Redundant Editor Subscriptions (Cursor + Copilot) 1ms
     ✓ Test Case 2: Claude Team Seat Minimum Overpay 0ms
     ✓ Test Case 3: Single Seat Plan Overkill (Cursor Business -> Pro) 0ms
     ✓ Test Case 4: API Direct Prompt Caching Savings 0ms
     ✓ Test Case 5: Already Optimal Stack (Honest spent-well message) 0ms
     ✓ Test Case 6: Credex Infrastructure Credits Qualification 0ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  20:10:14
   Duration  155ms (transform 23ms, setup 0ms, import 30ms, tests 2ms, environment 0ms)
```
