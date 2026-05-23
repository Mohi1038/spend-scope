/** Credex-style hero logo tiles — 3 per side beside centered headline. */
export type HeroLogoPlacement = {
  toolId: string;
  side: "left" | "right";
  /** px from vertical center line (positions tile in side gutter) */
  fromCenter: number;
  top: string;
  cardSize: number;
  logoSize: number;
  rotate: number;
};

type BrandSource =
  | { kind: "simpleicons"; slug: string; color: string }
  | { kind: "jsdelivr"; slug: string; version: string };

export const HERO_TOOL_BRANDS: Record<string, BrandSource> = {
  cursor: { kind: "simpleicons", slug: "cursor", color: "000000" },
  copilot: { kind: "simpleicons", slug: "githubcopilot", color: "000000" },
  claude: { kind: "jsdelivr", slug: "claude", version: "v16" },
  chatgpt: { kind: "jsdelivr", slug: "openai", version: "v15" },
  anthropic_api: { kind: "jsdelivr", slug: "claude", version: "v16" },
  gemini: { kind: "simpleicons", slug: "googlegemini", color: "8E75B2" },
  windsurf: { kind: "simpleicons", slug: "codeium", color: "09B6A2" },
};

/** 3 tiles per side — pushed into gutters so they clear the headline */
export const HERO_LOGO_PLACEMENTS: HeroLogoPlacement[] = [
  { toolId: "gemini", side: "left", fromCenter: 430, top: "6%", cardSize: 52, logoSize: 28, rotate: -14 },
  { toolId: "claude", side: "left", fromCenter: 500, top: "42%", cardSize: 50, logoSize: 26, rotate: 10 },
  { toolId: "cursor", side: "left", fromCenter: 415, top: "72%", cardSize: 52, logoSize: 28, rotate: -9 },
  { toolId: "copilot", side: "right", fromCenter: 420, top: "5%", cardSize: 52, logoSize: 28, rotate: 12 },
  { toolId: "chatgpt", side: "right", fromCenter: 495, top: "40%", cardSize: 52, logoSize: 28, rotate: -11 },
  { toolId: "anthropic_api", side: "right", fromCenter: 410, top: "70%", cardSize: 50, logoSize: 26, rotate: 8 },
];

export function getBrandIconUrl(toolId: string): string | null {
  const brand = HERO_TOOL_BRANDS[toolId];
  if (!brand) return null;

  if (brand.kind === "jsdelivr") {
    return `https://cdn.jsdelivr.net/npm/simple-icons@${brand.version}/icons/${brand.slug}.svg`;
  }

  return `https://cdn.simpleicons.org/${brand.slug}/${brand.color}`;
}
