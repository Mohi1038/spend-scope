import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseClient";
import { checkRateLimit } from "@/lib/rateLimit";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY || "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
  try {
    const rateLimit = await checkRateLimit("leads", request);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many lead submissions. Please try again shortly." },
        { status: 429, headers: rateLimit.headers }
      );
    }

    const body = await request.json();
    const { email, companyName, role, newsletterOptIn, auditSlug, websiteVerify } = body;

    // 1. Honeypot check (Abuse protection)
    if (websiteVerify) {
      console.warn("Honeypot triggered by suspected bot.");
      return NextResponse.json({
        success: true,
        message: "Request successfully processed.", // Return success so bot doesn't retry
      }, { headers: rateLimit.headers });
    }

    if (!email || !auditSlug) {
      return NextResponse.json(
        { error: "Email and auditSlug are required." },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();

    // 2. Fetch the corresponding audit record
    const { data: audit, error: fetchError } = await db
      .from("audits")
      .select("id, total_monthly_spend, potential_monthly_savings, potential_annual_savings")
      .eq("slug", auditSlug)
      .single();

    if (fetchError || !audit) {
      console.error("Audit fetch error:", fetchError);
      return NextResponse.json(
        { error: "Invalid audit slug or audit not found." },
        { status: 404 }
      );
    }

    // 3. Save lead to Supabase
    const { error: leadInsertError } = await db
      .from("leads")
      .insert({
        audit_id: audit.id,
        email,
        company_name: companyName || null,
        role: role || null,
        newsletter_opt_in: !!newsletterOptIn,
        status: "new",
      });

    if (leadInsertError) {
      console.error("Lead insert error:", leadInsertError);
      return NextResponse.json(
        { error: "Failed to store lead details." },
        { status: 500 }
      );
    }

    // 4. Send transactional email via Resend
    let emailSent = false;
    const savings = audit.potential_monthly_savings;
    const annualSavings = audit.potential_annual_savings;
    const isHighSavings = savings >= 500;

    const emailSubject = savings > 0 
      ? `Your SpendScope AI Spend Audit: Potential Savings of $${annualSavings.toLocaleString()}/year!`
      : `Your SpendScope AI Spend Audit: Stack Verified!`;

    const publicUrl = `${request.headers.get("origin") || "https://spendscope.rocks"}/${auditSlug}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; background-color: #0c0c0e; color: #f3f4f6; padding: 40px 20px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #a855f7; font-size: 28px; margin: 0;">SpendScope</h2>
          <p style="color: #9ca3af; font-size: 14px;">Powered by Credex</p>
        </div>
        
        <div style="background-color: #111216; border: 1px solid #1f2937; padding: 30px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #ffffff;">Hey there,</h3>
          <p style="line-height: 1.6; color: #d1d5db;">Thank you for auditing your AI software spend. We have calculated your potential optimization strategy:</p>
          
          <div style="margin: 25px 0; padding: 20px; border-radius: 6px; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%); border-left: 4px solid #a855f7; text-align: center;">
            <p style="margin: 0; color: #9ca3af; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Estimated Potential Savings</p>
            <h1 style="margin: 5px 0 0 0; font-size: 40px; color: #06b6d4;">$${savings}/mo</h1>
            <p style="margin: 5px 0 0 0; color: #a855f7; font-weight: bold; font-size: 16px;">$${annualSavings.toLocaleString()} / year</p>
          </div>

          ${isHighSavings ? `
            <div style="margin-bottom: 25px; padding: 15px; border-radius: 6px; background-color: rgba(236, 72, 153, 0.1); border: 1px solid rgba(236, 72, 153, 0.3);">
              <h4 style="margin: 0 0 5px 0; color: #ec4899;">⚡ High Savings Detected</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #e5e7eb;">Based on your stack and volume, you qualify for <strong>Credex Discounted Credits</strong>. A Credex advisor will reach out to you within 24 hours to transition your retail licenses to our discounted rates.</p>
            </div>
          ` : ""}

          <p style="line-height: 1.6; color: #d1d5db;">You can view and share your detailed audit breakdown anytime using this secure link:</p>
          <p style="text-align: center; margin: 25px 0;">
            <a href="${publicUrl}" style="background-color: #a855f7; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View Full Audit Online</a>
          </p>

          <hr style="border: 0; border-top: 1px solid #1f2937; margin: 30px 0;" />
          <p style="font-size: 12px; color: #6b7280; line-height: 1.5;">This audit is provided by Credex. Credex sources pre-paid unused AI credits from pivots and over-forecasted accounts, selling them to growing startups at massive discounts.</p>
        </div>
      </div>
    `;

    if (resend) {
      try {
        await resend.emails.send({
          from: "SpendScope Audit <onboarding@resend.dev>", // Or custom domain
          to: email,
          subject: emailSubject,
          html: emailHtml,
        });
        emailSent = true;
      } catch (emailErr) {
        console.error("Resend API error:", emailErr);
      }
    } else {
      console.warn("Resend API key missing. Mocking email delivery to console:");
      console.log(`[MOCK EMAIL TO ${email}] SUBJECT: ${emailSubject}`);
    }

    return NextResponse.json(
      {
        success: true,
        emailSent,
        message: "Lead recorded successfully.",
      },
      { headers: rateLimit.headers }
    );
  } catch (error) {
    console.error("Leads API internal error:", error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
