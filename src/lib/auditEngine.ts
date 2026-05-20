import { PRICING_DATA } from "./pricingData";

export interface InputToolState {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number;
}

export interface AuditRecommendation {
  toolId: string;
  toolName: string;
  currentPlan: string;
  recommendedAction: string;
  monthlySavings: number;
  reason: string;
}

export interface AuditResult {
  totalSpend: number;
  potentialMonthlySavings: number;
  potentialAnnualSavings: number;
  recommendations: AuditRecommendation[];
  isOptimal: boolean;
}

export function runAudit(
  tools: InputToolState[],
  teamSize: number,
  primaryUseCase: string
): AuditResult {
  const recommendations: AuditRecommendation[] = [];
  let totalSpend = 0;

  // Track active tools for cross-tool checks
  const activeTools = new Map<string, InputToolState>();
  
  for (const tool of tools) {
    totalSpend += tool.monthlySpend;
    activeTools.set(tool.toolId, tool);
  }

  // 1. Single tool checks (plan matching & under-seat optimization)
  for (const tool of tools) {
    const pricing = PRICING_DATA[tool.toolId];
    if (!pricing) continue;

    const plan = pricing.plans[tool.planId];
    if (!plan) continue;

    // Check for standard SaaS seat-based plan mismatches
    if (!plan.isApiDirect) {
      const pricePerUser = plan.pricePerUserMonth;
      
      // Calculate expected cost based on retail pricing
      let expectedRetailCost = pricePerUser * tool.seats;

      // Handle Claude Team plan minimum (min 5 seats)
      if (tool.toolId === "claude" && tool.planId === "team") {
        const minSeats = plan.minUsers || 5;
        if (tool.seats < minSeats) {
          // If they have fewer than 5 seats but are paying for Claude Team, they must pay for at least 5 seats.
          // Minimum Team cost = 5 * $30 = $150
          const teamCost = Math.max(tool.seats, minSeats) * pricePerUser;
          const proCost = tool.seats * 20; // Pro is $20
          const savings = Math.max(0, tool.monthlySpend - proCost);

          if (savings > 0) {
            recommendations.push({
              toolId: tool.toolId,
              toolName: pricing.displayName,
              currentPlan: "Team",
              recommendedAction: "Downgrade to Claude Pro",
              monthlySavings: savings,
              reason: `You have ${tool.seats} users but Claude Team requires a 5-seat minimum ($150/mo). Downgrade to Claude Pro to save $20/mo per seat and eliminate empty seat fees.`,
            });
            continue; // Skip further checks for this tool
          }
        }
      }

      // Handle ChatGPT Team plan minimum (min 2 seats)
      if (tool.toolId === "chatgpt" && tool.planId === "team") {
        const minSeats = plan.minUsers || 2;
        if (tool.seats < minSeats) {
          const proCost = tool.seats * 20; // Plus is $20
          const savings = Math.max(0, tool.monthlySpend - proCost);
          if (savings > 0) {
            recommendations.push({
              toolId: tool.toolId,
              toolName: pricing.displayName,
              currentPlan: "Team",
              recommendedAction: "Downgrade to ChatGPT Plus",
              monthlySavings: savings,
              reason: `ChatGPT Team requires a 2-seat minimum. Downgrading to ChatGPT Plus for ${tool.seats} user saves you $10/mo.`,
            });
            continue;
          }
        }
      }

      // Single-user Enterprise / Business plan overkill
      if (tool.seats === 1 && (tool.planId === "business" || tool.planId === "enterprise" || tool.planId === "team")) {
        let proPlanId = "pro";
        if (tool.toolId === "copilot") proPlanId = "individual";
        if (tool.toolId === "chatgpt") proPlanId = "plus";
        if (tool.toolId === "claude") proPlanId = "pro";

        const proPlan = pricing.plans[proPlanId];
        if (proPlan) {
          const savings = Math.max(0, tool.monthlySpend - proPlan.pricePerUserMonth);
          if (savings > 0) {
            recommendations.push({
              toolId: tool.toolId,
              toolName: pricing.displayName,
              currentPlan: plan.name,
              recommendedAction: `Downgrade to ${proPlan.name}`,
              monthlySavings: savings,
              reason: `For 1 seat, the team features of the ${plan.name} plan are unnecessary. Downgrading to ${proPlan.name} retains standard functionality while cutting costs.`,
            });
            continue;
          }
        }
      }
    } else {
      // API Direct optimization
      // If monthly spend on Anthropic or OpenAI API is substantial (> $100)
      if (tool.monthlySpend >= 100) {
        // Recommend prompt caching (typical 30% savings for development/chat workloads)
        const cacheSavings = Math.round(tool.monthlySpend * 0.3);
        recommendations.push({
          toolId: tool.toolId,
          toolName: pricing.displayName,
          currentPlan: plan.name,
          recommendedAction: "Implement API Prompt Caching",
          monthlySavings: cacheSavings,
          reason: `Your monthly API spend is $${tool.monthlySpend}. Implementing Claude Prompt Caching or OpenAI Assistants caching can reduce token costs by up to 30%.`,
        });
      }
    }
  }

  // 2. Cross-tool redundancies (e.g. Editor redundancies)
  // Cursor + Copilot redundancy
  if (activeTools.has("cursor") && activeTools.has("copilot")) {
    const copilot = activeTools.get("copilot")!;
    const cursor = activeTools.get("cursor")!;
    
    // Suggest canceling Copilot as Cursor has built-in auto-completions and inline chat
    const copilotSavings = copilot.monthlySpend;
    if (copilotSavings > 0) {
      recommendations.push({
        toolId: "copilot",
        toolName: "GitHub Copilot",
        currentPlan: PRICING_DATA.copilot.plans[copilot.planId]?.name || copilot.planId,
        recommendedAction: "Consolidate into Cursor",
        monthlySavings: copilotSavings,
        reason: `Both Cursor and GitHub Copilot are active. Cursor has fully native completions; running separate Copilot subscriptions is redundant and wastes $${copilotSavings}/mo.`,
      });
    }
  }

  // Windsurf + Copilot redundancy
  if (activeTools.has("windsurf") && activeTools.has("copilot")) {
    const copilot = activeTools.get("copilot")!;
    const copilotSavings = copilot.monthlySpend;
    if (copilotSavings > 0 && !recommendations.some(r => r.toolId === "copilot")) {
      recommendations.push({
        toolId: "copilot",
        toolName: "GitHub Copilot",
        currentPlan: PRICING_DATA.copilot.plans[copilot.planId]?.name || copilot.planId,
        recommendedAction: "Consolidate into Windsurf",
        monthlySavings: copilotSavings,
        reason: `Windsurf has native agentic autocompletes. Canceling redundant Copilot subscriptions saves $${copilotSavings}/mo.`,
      });
    }
  }

  // ChatGPT Plus + Claude Pro redundancy for small teams/users
  if (activeTools.has("chatgpt") && activeTools.has("claude")) {
    const chatgpt = activeTools.get("chatgpt")!;
    const claude = activeTools.get("claude")!;
    
    // Only suggest consolidating if they are not on mixed use-case (e.g., coding-only teams don't need both)
    if (primaryUseCase === "coding" || primaryUseCase === "writing") {
      const redundantSeats = Math.min(chatgpt.seats, claude.seats);
      const savings = redundantSeats * 20; // Assumed $20 Pro plan savings
      if (savings > 0 && chatgpt.planId === "plus" && claude.planId === "pro") {
        recommendations.push({
          toolId: "chatgpt",
          toolName: "ChatGPT Plus & Claude Pro Dual-Use",
          currentPlan: "Pro Subscriptions",
          recommendedAction: "Consolidate LLM Provider",
          monthlySavings: savings,
          reason: `Your team size is ${teamSize} with primary focus on '${primaryUseCase}'. Subscribing to both ChatGPT Plus and Claude Pro is likely redundant. Consolidating saves $20/user/mo.`,
        });
      }
    }
  }

  // 3. Credex specific credits promo for high spends (> $500/mo)
  const potentialMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const remainingSpend = totalSpend - potentialMonthlySavings;

  if (remainingSpend >= 500) {
    // Credex discounted credits can shave off 25% of retail direct spend
    const credexSavings = Math.round(remainingSpend * 0.25);
    recommendations.push({
      toolId: "credex",
      toolName: "Credex Infrastructure Credits",
      currentPlan: "Retail Billing",
      recommendedAction: "Switch to Credex Credits",
      monthlySavings: credexSavings,
      reason: `Your remaining AI stack spend of $${remainingSpend}/mo qualifies for Credex pre-purchased credits. Access discounted Claude/OpenAI/Cursor licenses to save 25% instantly.`,
    });
  }

  // Recalculate monthly savings to include Credex promo if added
  const finalPotentialMonthlySavings = recommendations.reduce((sum, r) => sum + r.monthlySavings, 0);
  const potentialAnnualSavings = finalPotentialMonthlySavings * 12;

  return {
    totalSpend,
    potentialMonthlySavings: finalPotentialMonthlySavings,
    potentialAnnualSavings,
    recommendations,
    isOptimal: finalPotentialMonthlySavings === 0,
  };
}
