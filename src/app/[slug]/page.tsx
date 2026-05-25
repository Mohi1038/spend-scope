import React from "react";
import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import AuditReportClient from "@/components/AuditReportClient";
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

  const auditResults = {
    totalSpend: audit.total_monthly_spend,
    potentialMonthlySavings: audit.potential_monthly_savings,
    potentialAnnualSavings: audit.potential_annual_savings,
    recommendations: audit.audit_recommendations || [],
    isOptimal: audit.potential_monthly_savings === 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <AuditReportClient
        auditSlug={params.slug}
        auditResults={auditResults}
        configuredTools={audit.stack_data || []}
        teamSize={audit.team_size}
        primaryUseCase={audit.primary_use_case}
      />
    </div>
  );
}
