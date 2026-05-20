import { describe, test, expect } from "vitest";
import { runAudit, InputToolState } from "../auditEngine";

describe("Spend Audit Engine Core Calculations", () => {
  
  test("Test Case 1: Redundant Editor Subscriptions (Cursor + Copilot)", () => {
    const tools: InputToolState[] = [
      { toolId: "cursor", planId: "pro", seats: 3, monthlySpend: 60 },
      { toolId: "copilot", planId: "business", seats: 3, monthlySpend: 57 },
    ];
    
    const result = runAudit(tools, 3, "coding");
    
    // It should identify Copilot as redundant and suggest consolidating into Cursor
    const copilotRec = result.recommendations.find(r => r.toolId === "copilot");
    expect(copilotRec).toBeDefined();
    expect(copilotRec?.recommendedAction).toBe("Consolidate into Cursor");
    expect(copilotRec?.monthlySavings).toBe(57);
  });

  test("Test Case 2: Claude Team Seat Minimum Overpay", () => {
    const tools: InputToolState[] = [
      { toolId: "claude", planId: "team", seats: 2, monthlySpend: 150 }, // Paid $150 due to 5-seat minimum
    ];

    const result = runAudit(tools, 2, "coding");

    // It should suggest downgrading to Claude Pro for 2 seats (saving $150 - 2 * $20 = $110)
    const claudeRec = result.recommendations.find(r => r.toolId === "claude");
    expect(claudeRec).toBeDefined();
    expect(claudeRec?.recommendedAction).toBe("Downgrade to Claude Pro");
    expect(claudeRec?.monthlySavings).toBe(110);
  });

  test("Test Case 3: Single Seat Plan Overkill (Cursor Business -> Pro)", () => {
    const tools: InputToolState[] = [
      { toolId: "cursor", planId: "business", seats: 1, monthlySpend: 40 },
    ];

    const result = runAudit(tools, 1, "coding");

    // Cursor Business for 1 seat should suggest downgrade to Cursor Pro ($20), saving $20/mo
    const cursorRec = result.recommendations.find(r => r.toolId === "cursor");
    expect(cursorRec).toBeDefined();
    expect(cursorRec?.recommendedAction).toBe("Downgrade to Pro");
    expect(cursorRec?.monthlySavings).toBe(20);
  });

  test("Test Case 4: API Direct Prompt Caching Savings", () => {
    const tools: InputToolState[] = [
      { toolId: "anthropic_api", planId: "payg", seats: 1, monthlySpend: 300 },
    ];

    const result = runAudit(tools, 1, "mixed");

    const apiRec = result.recommendations.find(r => r.toolId === "anthropic_api");
    expect(apiRec).toBeDefined();
    expect(apiRec?.recommendedAction).toBe("Implement API Prompt Caching");
    expect(apiRec?.monthlySavings).toBe(90); // 30% of $300 is $90
  });

  test("Test Case 5: Already Optimal Stack (Honest spent-well message)", () => {
    const tools: InputToolState[] = [
      { toolId: "cursor", planId: "pro", seats: 1, monthlySpend: 20 },
    ];

    const result = runAudit(tools, 1, "coding");

    expect(result.potentialMonthlySavings).toBe(0);
    expect(result.isOptimal).toBe(true);
    expect(result.recommendations.length).toBe(0);
  });

  test("Test Case 6: Credex Infrastructure Credits Qualification", () => {
    const tools: InputToolState[] = [
      { toolId: "openai_api", planId: "payg", seats: 1, monthlySpend: 800 },
    ];

    const result = runAudit(tools, 5, "coding");

    // Spend > $500 triggers Credex infrastructure credit recommendation
    const credexRec = result.recommendations.find(r => r.toolId === "credex");
    expect(credexRec).toBeDefined();
    expect(credexRec?.recommendedAction).toBe("Switch to Credex Credits");
    // $800 spent. API Caching saves $240 (30%). Remaining spend is $560.
    // Credex saves 25% of $560 = $140.
    expect(credexRec?.monthlySavings).toBe(140);
  });
});
