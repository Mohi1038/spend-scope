import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { generateGeminiText, isGeminiConfigured } from "@/lib/gemini";
import { generateFallbackSummary } from "@/lib/auditSummary";

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit("summary", request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many summary requests. Please try again shortly." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const body = await request.json();
    const { auditResult, teamSize, primaryUseCase } = body;

    if (!auditResult || typeof teamSize !== "number" || !primaryUseCase) {
      return NextResponse.json(
        { error: "Required fields 'auditResult', 'teamSize', and 'primaryUseCase' missing." },
        { status: 400 }
      );
    }

    const { totalSpend, potentialMonthlySavings, recommendations, isOptimal } = auditResult;

    const fallbackSummary = generateFallbackSummary(
      totalSpend,
      potentialMonthlySavings,
      teamSize,
      primaryUseCase,
      recommendations || []
    );

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        {
          summary: fallbackSummary,
          source: "fallback_template",
        },
        { headers: rateLimit.headers }
      );
    }

    const promptText = `You are a professional SaaS finance expert. Analyze this AI software spend audit:
- Team Size: ${teamSize}
- Primary Use Case: ${primaryUseCase}
- Total Monthly Spend: $${totalSpend}
- Potential Monthly Savings: $${potentialMonthlySavings}
- Is Stack Already Optimal: ${isOptimal ? "Yes" : "No"}
- Recommendations: ${JSON.stringify(recommendations)}

Write a personalized audit summary paragraph for the user.
Guidelines:
1. Keep it under 100 words.
2. Sound professional, objective, and action-oriented. Do not praise the user or use generic filler.
3. Specifically mention their primary use case '${primaryUseCase}' and team size of ${teamSize}.
4. Highlight the major savings actions they can take (e.g. downgrades or redundancies).
5. Mention Credex credits if their savings or spend is significant (savings > $100/mo or spend > $300/mo).
6. Return ONLY the paragraph text. Do not wrap in markdown quotes or code blocks.`;

    const gemini = await generateGeminiText(
      promptText,
      "You are an expert SaaS CFO. Write a concise, personalized, objective audit summary. Do not output anything other than the summary paragraph."
    );

    if (gemini.ok) {
      return NextResponse.json(
        {
          summary: gemini.text,
          source: "gemini",
          model: gemini.model,
        },
        { headers: rateLimit.headers }
      );
    }

    return NextResponse.json(
      {
        summary: fallbackSummary,
        source: "fallback_error_recovery",
        geminiReason: gemini.reason,
      },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("Summary API critical error:", error);
    return NextResponse.json({ error: "Internal Server Error." }, { status: 500 });
  }
}
