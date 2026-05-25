export function generateFallbackSummary(
  totalSpend: number,
  savings: number,
  teamSize: number,
  primaryUseCase: string,
  recommendations: { recommendedAction: string }[]
): string {
  if (savings === 0) {
    return `Your AI tool spend is highly optimized! For a team of ${teamSize} focusing on ${primaryUseCase}, you're spending a total of $${totalSpend}/mo with no redundant plans. You are doing a great job managing software overhead. Opt in to our updates so we can alert you when new provider pricing changes or developer discount opportunities become available.`;
  }

  const primaryActions = recommendations
    .slice(0, 2)
    .map((r) => r.recommendedAction.toLowerCase())
    .join(" and ");

  return `We analyzed your AI spend for a team of ${teamSize} developers focusing on ${primaryUseCase}. We identified $${savings}/mo ($${(
    savings * 12
  ).toLocaleString()}/year) in potential savings. The largest opportunities involve ${primaryActions || "optimizing licenses"}. Implementing these changes will lean out your software budget. If you qualify for Credex credits, transitioning off retail rates can save you up to 25% more.`;
}
