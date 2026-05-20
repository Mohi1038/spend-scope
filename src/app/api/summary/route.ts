import { NextResponse } from "next/server";
const geminiApiKey = process.env.GEMINI_API_KEY || "";
// Prefer the higher-capability 2.5 flash model by default when available
const geminiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// Clean template-based fallback summary when AI generation is unavailable
function generateFallbackSummary(
  totalSpend: number,
  savings: number,
  teamSize: number,
  primaryUseCase: string,
  recommendations: any[]
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

export async function POST(request: Request) {
  try {
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
      recommendations
    );

    // If Gemini is not configured, return the fallback summary instantly
    if (!geminiApiKey) {
      return NextResponse.json({
        summary: fallbackSummary,
        source: "fallback_template",
      });
    }

    // Build LLM Prompt
    const promptText = `
    You are a professional SaaS finance expert. Analyze this AI software spend audit:
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
    6. Return ONLY the paragraph text. Do not wrap in markdown quotes or code blocks.
    `;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: "You are an expert SaaS CFO. Write a concise, personalized, objective audit summary. Do not output anything other than the summary paragraph.",
                },
              ],
            },
            contents: [
              {
                role: "user",
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 400,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();
      const summary =
        payload?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("")
          .trim() || fallbackSummary;

      return NextResponse.json({
        summary,
        source: "gemini",
      });
    } catch (aiError) {
      console.error("Gemini API Error:", aiError);
      // Fail gracefully to the fallback template
      return NextResponse.json({
        summary: fallbackSummary,
        source: "fallback_error_recovery",
      });
    }
  } catch (error) {
    console.error("Summary API critical error:", error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
