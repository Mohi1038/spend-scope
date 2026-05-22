import React from "react";
import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { PRICING_DATA } from "@/lib/pricingData";
import { Sparkles, TrendingDown, ArrowRight, Zap, Check, AlertTriangle, Layers } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface SharePageProps {
  params: {
    slug: string;
  };
}

// Generate dynamic SEO and Open Graph tags for share previews
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const db = getSupabaseAdmin();
  const { data: audit } = await db
    .from("audits")
    .select("total_monthly_spend, potential_monthly_savings, potential_annual_savings, team_size, primary_use_case")
    .eq("slug", params.slug)
    .single();

  if (!audit) {
    return {
      title: "Audit Not Found | SpendScope",
    };
  }

  const annualSavings = audit.potential_annual_savings;
  const monthlySavings = audit.potential_monthly_savings;

  return {
    title: `SpendScope Audit: Save $${annualSavings.toLocaleString()}/yr!`,
    description: `Audit breakdown for a team of ${audit.team_size} focusing on ${audit.primary_use_case}. Discover plan downgrades and savings recommendations.`,
    openGraph: {
      title: `AI Spend Audit: Save $${annualSavings.toLocaleString()}/year`,
      description: `We analyzed an AI stack spending $${audit.total_monthly_spend}/mo and identified $${monthlySavings}/mo in potential savings. Run your own free audit now.`,
      type: "website",
      url: `https://spendscope.rocks/${params.slug}`,
      images: [
        {
          url: `/og-image.png`,
          width: 1200,
          height: 630,
          alt: "SpendScope Spend Audit Results",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `AI Spend Audit: Save $${annualSavings.toLocaleString()}/year`,
      description: `Identify redundancies and claim discounted infrastructure credits with Credex.`,
      images: [`/og-image.png`],
    },
  };
}

export default async function SharedAuditPage({ params }: SharePageProps) {
  const db = getSupabaseAdmin();

  // Fetch from DB
  const { data: audit, error } = await db
    .from("audits")
    .select("*")
    .eq("slug", params.slug)
    .single();

  if (error || !audit) {
    return notFound();
  }

  const stack = audit.stack_data || [];
  const recommendations = audit.audit_recommendations || [];
  const totalSpend = audit.total_monthly_spend;
  const monthlySavings = audit.potential_monthly_savings;
  const annualSavings = audit.potential_annual_savings;
  const optimizedSpend = Math.max(0, totalSpend - monthlySavings);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">

      {/* Back CTA to run own audit */}
      <div className="flex justify-between items-center pb-4 border-b border-[#1F1F22]">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold font-mono">Public Audit Report</span>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl bg-white hover:bg-gray-100 text-black text-xs font-bold transition-all"
        >
          Run Your Free Audit
        </Link>
      </div>

      {/* Hero Savings Callout (Clear + Calm) */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-[10px] font-semibold font-mono tracking-widest text-gray-400 uppercase px-3 py-1 rounded-full bg-white/5 border border-white/10">
          Identified Spend Redundancies
        </span>
        <h1 className="text-4xl sm:text-6xl font-display font-black tracking-tight text-white leading-none">
          {monthlySavings > 0 ? "Potential Stack Savings" : "Optimal Stack Verified"}
        </h1>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 font-mono font-black text-white text-6xl sm:text-7xl tabular-nums">
          <span>${monthlySavings.toLocaleString()}</span>
          <span className="text-gray-600 text-2xl font-display font-light">/ month</span>
        </div>
        <p className="text-gray-500 font-mono text-sm tracking-wide">
          Annual opportunity: <span className="text-gray-200 font-semibold">${annualSavings.toLocaleString()}</span>
        </p>
        <p className="text-gray-500 text-xs font-light">
          Workspace parameters: <strong className="text-gray-300 font-normal">{audit.team_size} users</strong> &bull; Core workflow focus: <strong className="text-gray-300 font-normal capitalize">{audit.primary_use_case}</strong>
        </p>
      </div>

      {/* Stack Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-[#1F1F22] space-y-1">
          <span className="text-xs text-gray-500 font-bold uppercase font-mono tracking-wider">Unoptimized Stack Cost</span>
          <p className="text-xl font-bold font-mono text-white tabular-nums">${totalSpend.toLocaleString()}/mo</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-[#1F1F22] space-y-1">
          <span className="text-xs text-gray-500 font-bold uppercase font-mono tracking-wider">Optimized Target Spend</span>
          <p className="text-xl font-bold font-mono text-white tabular-nums">${optimizedSpend.toLocaleString()}/mo</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-[#1F1F22] space-y-1">
          <span className="text-xs text-gray-500 font-bold uppercase font-mono tracking-wider">Audit efficiency gain</span>
          <p className="text-xl font-bold font-mono text-white">
            {totalSpend > 0 ? Math.round((monthlySavings / totalSpend) * 100) : 0}% Savings
          </p>
        </div>
      </div>

      {/* Itemized Stack Breakdown */}
      <div className="space-y-6">
        <h3 className="text-lg font-display font-bold text-white pb-3 border-b border-[#1F1F22]">Itemized Recommendation Strategy</h3>

        {recommendations.length === 0 ? (
          <div className="p-8 rounded-2xl border border-[#1F1F22] bg-[#0A0A0C] text-center text-gray-500 text-sm">
            This workspace AI stack is already operating at maximum financial efficiency.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((rec: any, i: number) => {
              const isCredex = rec.toolId === "credex";
              return (
                <div
                  key={i}
                  className={`p-6 rounded-xl border transition-all duration-150 space-y-5 ${
                    isCredex
                      ? "border-white/10 bg-[#0A0A0C] shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                      : "border-[#1F1F22] bg-[#0A0A0C] hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between pb-4 border-b border-[#1F1F22]">
                    <div>
                      <h4 className="font-display font-bold text-base text-white">{rec.toolName}</h4>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">Current Plan: {rec.currentPlan}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10">
                      {isCredex ? "Volume Partner" : "Optimization"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-semibold">Why inefficient</p>
                    <div className="bg-white/[0.02] border border-[#1F1F22] p-3.5 rounded-lg text-sm text-gray-300 leading-relaxed font-light">
                      {rec.reason}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-semibold">Optimization strategy</p>
                    <div className="bg-white/[0.02] border border-[#1F1F22] p-3.5 rounded-lg text-sm text-gray-200 font-medium leading-relaxed">
                      {rec.recommendedAction}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-sm border-t border-white/[0.02]">
                    <span className="text-gray-500 font-mono">Estimated Savings:</span>
                    <span className="font-mono text-white font-bold text-sm">-${rec.monthlySavings}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credex CTA Promo */}
      <div className="border border-[#1F1F22] bg-[#0A0A0C] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 text-xs font-bold uppercase tracking-wider font-mono">
            <Zap className="w-3 h-3 text-white" />
            Credex AI Credits
          </div>
          <h3 className="text-xl font-display font-bold text-white">How much could your team save on AI?</h3>
          <p className="text-gray-400 text-sm max-w-xl font-light leading-relaxed">
            AI vendors charge high retail rates. Credex sources pre-paid AI infrastructure credits to slash your API and licensing costs by up to 25% instantly.
          </p>
        </div>
        <Link
          href="/"
          className="px-5 py-3.5 bg-white hover:bg-gray-100 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap self-stretch md:self-center justify-center"
        >
          <span>Run A Free Stack Audit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
