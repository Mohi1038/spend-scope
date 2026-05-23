import { ExternalLink } from "lucide-react";
import { PRICING_DATA, PlanDetails } from "@/lib/pricingData";

function formatPlanPrice(plan: PlanDetails): string {
  if (plan.isApiDirect) return "Pay-as-you-go";
  if (plan.pricePerUserMonth === 0) return "Free";
  return `$${plan.pricePerUserMonth}/seat/mo`;
}

export function PricingRatesSection() {
  const tools = Object.entries(PRICING_DATA);

  return (
    <section
      id="pricing-rates"
      className="mt-20 pt-16 border-t border-[#1A1A1D] scroll-mt-24"
      aria-labelledby="pricing-rates-heading"
    >
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <span className="text-xs font-semibold font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-metallic-green-badge">
          Rate tables
        </span>
        <h2
          id="pricing-rates-heading"
          className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight"
        >
          Retail pricing reference
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Per-seat monthly rates used by the audit engine. Same data as the grid above—updated weekly from vendor pages.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
        {tools.map(([toolId, tool]) => (
          <article
            key={toolId}
            className="glass-panel rounded-xl border border-[#1F1F22] p-5 flex flex-col chart-panel-money"
          >
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#1F1F22] mb-4">
              <h3 className="text-base font-display font-bold text-white">
                {tool.displayName}
              </h3>
              <a
                href={tool.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-gray-500 hover:text-money-accent flex items-center gap-1 shrink-0 transition-colors"
              >
                Official
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="overflow-x-auto flex-grow">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-mono">
                    <th className="pb-2 pr-2 font-normal">Plan</th>
                    <th className="pb-2 text-right font-normal">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F22]">
                  {Object.entries(tool.plans).map(([planKey, plan]) => (
                    <tr key={planKey} className="align-middle">
                      <td className="py-2.5 pr-2">
                        <span className="text-gray-200 font-medium">{plan.name}</span>
                        {plan.minUsers != null && plan.minUsers > 1 && (
                          <span className="block text-[10px] font-mono text-amber-400/90 mt-0.5">
                            {plan.minUsers}-seat minimum
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 text-right font-mono text-sm tabular-nums whitespace-nowrap">
                        <span
                          className={
                            !plan.isApiDirect && plan.pricePerUserMonth > 0
                              ? "text-money-accent"
                              : "text-gray-400"
                          }
                        >
                          {formatPlanPrice(plan)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        ))}
      </div>

      <p className="text-center text-xs text-gray-600 font-mono mt-8 max-w-xl mx-auto leading-relaxed">
        Enterprise tiers may vary by contract. API tools are usage-based—enter your monthly spend in the audit grid.
      </p>
    </section>
  );
}
