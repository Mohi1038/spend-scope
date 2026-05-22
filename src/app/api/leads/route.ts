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
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000000; color: #E5E7EB; padding: 40px 20px; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.02em;">SpendScope</h2>
          <p style="color: #71717A; font-size: 13px; margin: 5px 0 0 0;">Powered by Credex</p>
        </div>
        
        <div style="background-color: #0A0A0C; border: 1px solid #1F1F22; padding: 30px; border-radius: 12px;">
          <h3 style="margin-top: 0; color: #ffffff; font-size: 18px; font-weight: 700;">Audit Summary</h3>
          <p style="line-height: 1.6; color: #A1A1AA; font-size: 14px;">We have compiled the financial audit and optimization strategy for your AI stack:</p>
          
          <div style="margin: 25px 0; padding: 25px 20px; border-radius: 8px; background-color: #000000; border: 1px solid #1F1F22; text-align: center;">
            <p style="margin: 0; color: #71717A; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Estimated Monthly Savings</p>
            <h1 style="margin: 8px 0; font-size: 44px; font-weight: 800; color: #ffffff; letter-spacing: -0.03em;">$${savings}<span style="font-size: 20px; color: #71717A; font-weight: 400;">/mo</span></h1>
            <p style="margin: 0; color: #A1A1AA; font-weight: 500; font-size: 14px;">$${annualSavings.toLocaleString()} / year reduction potential</p>
          </div>

          ${isHighSavings ? `
            <div style="margin-bottom: 25px; padding: 15px; border-radius: 8px; background-color: #000000; border: 1px solid #1F1F22;">
              <h4 style="margin: 0 0 5px 0; color: #ffffff; font-size: 14px; font-weight: 600;">⚡ High Volume Account Discount Eligibility</h4>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #A1A1AA;">Based on your team size and monthly run rate, you qualify for <strong>Credex Bulk Licenses</strong>. A technical credits specialist will follow up with you to apply direct B2B pricing discounts to your stack.</p>
            </div>
          ` : ""}

          <p style="line-height: 1.6; color: #A1A1AA; font-size: 14px; margin-bottom: 20px;">You can view and interact with your full stack delta chart, seat utilization controls, and detailed logic reasoning using this secure link:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${publicUrl}" style="background-color: #ffffff; color: #000000; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);">View Interactive Audit online</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #1F1F22; margin: 30px 0;" />
          <p style="font-size: 12px; color: #71717A; line-height: 1.6; margin: 0;">This report is sourced by Credex. Credex pools group purchasing capacity and sources pre-paid AI infrastructure credits to offer startups direct, non-dilutive discounts on major models and editors.</p>
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
