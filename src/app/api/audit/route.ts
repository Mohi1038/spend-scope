import { NextResponse } from "next/server";
import { runAudit } from "@/lib/auditEngine";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseClient";
import { checkRateLimit } from "@/lib/rateLimit";

// Helper to generate a random 8-character slug
function generateShortSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit("audit", request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many audit requests. Please try again shortly." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const body = await request.json();
    const { tools, teamSize, primaryUseCase } = body;

    if (!Array.isArray(tools) || typeof teamSize !== "number" || !primaryUseCase) {
      return NextResponse.json(
        { error: "Invalid request payload. Ensure 'tools', 'teamSize', and 'primaryUseCase' are provided." },
        { status: 400 }
      ) ;
    }

    // Run the audit math engine
    const auditResult = runAudit(tools, teamSize, primaryUseCase);

    if (!isSupabaseConfigured()) {
      console.error("Supabase is not configured — cannot persist audit slug.");
      return NextResponse.json(
        {
          error:
            "Database is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
          auditResult,
        },
        { status: 503 }
      );
    }

    // Save to Supabase
    const db = getSupabaseAdmin();
    let slug = generateShortSlug();
    let isUnique = false;
    let retries = 0;

    // Ensure slug uniqueness
    while (!isUnique && retries < 5) {
      const { data } = await db
        .from("audits")
        .select("id")
        .eq("slug", slug)
        .single();
      
      if (!data) {
        isUnique = true;
      } else {
        slug = generateShortSlug();
        retries++;
      }
    }

    const { data: insertedAudit, error: insertError } = await db
      .from("audits")
      .insert({
        slug,
        stack_data: tools,
        total_monthly_spend: auditResult.totalSpend,
        potential_monthly_savings: auditResult.potentialMonthlySavings,
        potential_annual_savings: auditResult.potentialAnnualSavings,
        audit_recommendations: auditResult.recommendations,
        team_size: teamSize,
        primary_use_case: primaryUseCase,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Database insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to store audit results. Database error." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        slug,
        auditResult,
      },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("API error in audit creation:", error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
