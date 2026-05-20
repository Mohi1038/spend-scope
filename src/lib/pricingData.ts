export interface PlanDetails {
  name: string;
  pricePerUserMonth: number;
  minUsers?: number;
  isApiDirect?: boolean;
}

export interface ToolPricing {
  displayName: string;
  plans: Record<string, PlanDetails>;
  officialUrl: string;
}

export const PRICING_DATA: Record<string, ToolPricing> = {
  cursor: {
    displayName: "Cursor",
    officialUrl: "https://cursor.com/pricing",
    plans: {
      hobby: { name: "Hobby", pricePerUserMonth: 0 },
      pro: { name: "Pro", pricePerUserMonth: 20 },
      business: { name: "Business", pricePerUserMonth: 40 },
      enterprise: { name: "Enterprise", pricePerUserMonth: 100 }, // Estimated/Enterprise mock
    },
  },
  copilot: {
    displayName: "GitHub Copilot",
    officialUrl: "https://github.com/features/copilot/plans",
    plans: {
      individual: { name: "Individual", pricePerUserMonth: 10 },
      business: { name: "Business", pricePerUserMonth: 19 },
      enterprise: { name: "Enterprise", pricePerUserMonth: 39 },
    },
  },
  claude: {
    displayName: "Claude",
    officialUrl: "https://www.anthropic.com/claude/pricing",
    plans: {
      free: { name: "Free", pricePerUserMonth: 0 },
      pro: { name: "Pro", pricePerUserMonth: 20 },
      team: { name: "Team", pricePerUserMonth: 30, minUsers: 5 },
      enterprise: { name: "Enterprise", pricePerUserMonth: 75 }, // Estimated/Enterprise mock
      api: { name: "API Direct", pricePerUserMonth: 0, isApiDirect: true },
    },
  },
  chatgpt: {
    displayName: "ChatGPT",
    officialUrl: "https://openai.com/chatgpt/pricing",
    plans: {
      plus: { name: "Plus", pricePerUserMonth: 20 },
      team: { name: "Team", pricePerUserMonth: 30, minUsers: 2 },
      enterprise: { name: "Enterprise", pricePerUserMonth: 60 }, // Estimated/Enterprise mock
      api: { name: "API Direct", pricePerUserMonth: 0, isApiDirect: true },
    },
  },
  anthropic_api: {
    displayName: "Anthropic API Direct",
    officialUrl: "https://www.anthropic.com/api",
    plans: {
      payg: { name: "Pay-As-You-Go", pricePerUserMonth: 0, isApiDirect: true },
    },
  },
  openai_api: {
    displayName: "OpenAI API Direct",
    officialUrl: "https://openai.com/api/pricing",
    plans: {
      payg: { name: "Pay-As-You-Go", pricePerUserMonth: 0, isApiDirect: true },
    },
  },
  gemini: {
    displayName: "Gemini",
    officialUrl: "https://gemini.google.com/advanced",
    plans: {
      pro: { name: "Pro (Free Workspace)", pricePerUserMonth: 0 },
      ultra: { name: "Advanced / Ultra", pricePerUserMonth: 20 },
      api: { name: "API Direct", pricePerUserMonth: 0, isApiDirect: true },
    },
  },
  windsurf: {
    displayName: "Windsurf",
    officialUrl: "https://codeium.com/windsurf/pricing",
    plans: {
      pro: { name: "Pro", pricePerUserMonth: 15 },
      team: { name: "Team", pricePerUserMonth: 30 },
    },
  },
};
