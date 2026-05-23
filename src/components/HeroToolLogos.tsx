import { PRICING_DATA } from "@/lib/pricingData";
import {
  getBrandIconUrl,
  HERO_LOGO_PLACEMENTS,
  type HeroLogoPlacement,
} from "@/lib/heroToolLogos";

function LogoTile({ placement }: { placement: HeroLogoPlacement }) {
  const iconUrl = getBrandIconUrl(placement.toolId);
  if (!iconUrl) return null;

  const label = PRICING_DATA[placement.toolId]?.displayName ?? placement.toolId;

  const offset = `min(${placement.fromCenter}px, 38vw)`;
  const horizontalStyle =
    placement.side === "left"
      ? {
          left: `calc(50% - ${offset})`,
          transform: `translateX(-100%) rotate(${placement.rotate}deg)`,
        }
      : {
          left: `calc(50% + ${offset})`,
          transform: `rotate(${placement.rotate}deg)`,
        };

  return (
    <div
      className="absolute"
      style={{
        top: placement.top,
        ...horizontalStyle,
      }}
    >
      <div
        className="flex items-center justify-center rounded-2xl bg-white"
        style={{
          width: placement.cardSize,
          height: placement.cardSize,
          boxShadow:
            "0 10px 32px rgba(0, 0, 0, 0.22), 0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl}
          alt=""
          width={placement.logoSize}
          height={placement.logoSize}
          className="block object-contain"
          draggable={false}
          loading="lazy"
        />
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function HeroToolLogos() {
  return (
    <div
      className="pointer-events-none absolute -top-14 left-0 right-0 bottom-0 hidden md:block overflow-visible"
      aria-hidden
    >
      {HERO_LOGO_PLACEMENTS.map((placement) => (
        <LogoTile key={`${placement.toolId}-${placement.side}`} placement={placement} />
      ))}
    </div>
  );
}
