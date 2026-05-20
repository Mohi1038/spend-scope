import React from "react";
import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { PRICING_DATA } from "@/lib/pricingData";

export const dynamic = "force-dynamic";
import { Sparkles, TrendingDown, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface SharePageProps {
  params: {
    slug: string;
  };
}

// Generate dynamic SEO and Open Graph tags for share previews (Twitter/Slack cards)
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
          url: `/og-image.png`, // Generic clean dynamic image or route
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      
      {/* Back CTA to run own audit */}
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Public Audit Report</span>
        <Link 
          href="/" 
          className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 text-sm font-semibold transition-all"
        >
          Run Your Free Audit
        </Link>
      </div>

      {/* Hero Savings Callout */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-neutral-900/50 via-neutral-900/10 to-neutral-900/50 border border-white/10 shadow-lg">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <span>STACK OPTIMIZATION SUMMARY</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight">
              {monthlySavings > 0 ? (
                <>
                  Found <span className="text-cyan-400">${monthlySavings.toLocaleString()}</span> in Monthly AI Spend Savings
                </>
              ) : (
                "Verified Optimal AI Stack!"
              )}
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">
              Workspace size: <strong>{audit.team_size} users</strong> &bull; Core focus: <strong>{audit.primary_use_case}</strong>
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end justify-center min-w-[200px]">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Annual Savings</p>
            <div className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mt-1">
              ${annualSavings.toLocaleString()}
            </div>
            <p className="text-purple-400 text-xs font-semibold tracking-wider uppercase mt-1">potential annual cut</p>
          </div>
        </div>
      </div>

      {/* Stack Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel rounded-xl p-5 space-y-1">
          <span className="text-xs text-gray-500 font-bold uppercase">Total Retail Spend</span>
          <p className="text-2xl font-bold text-white">${totalSpend.toLocaleString()}/mo</p>
        </div>
        
        <div className="glass-panel rounded-xl p-5 space-y-1">
          <span className="text-xs text-gray-500 font-bold uppercase">Potential Monthly Cost</span>
          <p className="text-2xl font-bold text-cyan-400">${(totalSpend - monthlySavings).toLocaleString()}/mo</p>
        </div>

        <div className="glass-panel rounded-xl p-5 space-y-1">
          <span className="text-xs text-gray-500 font-bold uppercase">Optimization Rate</span>
          <p className="text-2xl font-bold text-purple-400">
            {totalSpend > 0 ? Math.round((monthlySavings / totalSpend) * 100) : 0}% Savings
          </p>
        </div>
      </div>

      {/* Itemized Stack Breakdown */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white">Itemized Recommendation Strategy</h3>

        {recommendations.length === 0 ? (
          <div className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] text-center text-gray-500">
            This workspace AI stack is already highly optimized for their requirements.
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec: any, i: number) => {
              const isCredex = rec.toolId === "credex";
              return (
                <div 
                  key={i}
                  className={`p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                    isCredex 
                      ? "border-purple-500/30 bg-purple-950/10 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                      : "border-white/5 bg-white/[0.02]"
                  }`}
                >
                  <div className="space-y-2 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        isCredex ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-neutral-800 text-gray-300"
                      }`}>
                        {rec.toolName}
                      </span>
                      <span className="text-xs text-gray-500">Plan: {rec.currentPlan}</span>
                    </div>
                    <h4 className="font-bold text-white text-lg">{rec.recommendedAction}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center min-w-[120px] pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                    <span className="text-xs text-gray-500 font-bold uppercase">Monthly Savings</span>
                    <span className="text-2xl font-black text-cyan-400 mt-0.5">-${rec.monthlySavings}/mo</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Credex CTA Promo */}
      <div className="glass-panel rounded-2xl p-8 border border-purple-500/20 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-tr from-purple-950/20 to-cyan-950/20">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="text-2xl font-bold text-white">How much could your team save on AI?</h3>
          <p className="text-gray-400 text-sm max-w-xl">
            SaaS vendors charge high retail rates. Credex sources pre-paid AI infrastructure credits to slash your API and licensing costs by 20% to 40%.
          </p>
        </div>
        <Link 
          href="/" 
          className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-sm rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
        >
          <span>Run A Free Stack Audit</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
