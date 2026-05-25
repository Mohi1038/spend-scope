const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const MODEL_CANDIDATES = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-1.5-flash",
].filter((m): m is string => Boolean(m));

export function isGeminiConfigured(): boolean {
  return Boolean(GEMINI_API_KEY);
}

type GeminiResult =
  | { ok: true; text: string; model: string }
  | { ok: false; reason: string };

export async function generateGeminiText(
  promptText: string,
  systemText: string
): Promise<GeminiResult> {
  if (!GEMINI_API_KEY) {
    return { ok: false, reason: "missing_api_key" };
  }

  let lastReason = "unknown_error";

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemText }],
            },
            contents: [
              {
                role: "user",
                parts: [{ text: promptText }],
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
        const errBody = await response.text();
        lastReason = `${model}:${response.status}`;
        console.error(`Gemini ${model} failed:`, response.status, errBody.slice(0, 300));
        // Try next model on quota / not found / unavailable
        if ([404, 429, 503].includes(response.status)) {
          continue;
        }
        continue;
      }

      const payload = await response.json();
      const text =
        payload?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("")
          .trim() || "";

      if (text) {
        return { ok: true, text, model };
      }

      lastReason = `${model}:empty_response`;
    } catch (err) {
      lastReason = `${model}:network_error`;
      console.error(`Gemini ${model} network error:`, err);
    }
  }

  return { ok: false, reason: lastReason };
}
