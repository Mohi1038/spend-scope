"use client";

import React, { useState, useEffect } from "react";
import { PRICING_DATA } from "@/lib/pricingData";
import { runAudit, InputToolState, AuditRecommendation } from "@/lib/auditEngine";
import AOS from "aos";
import "aos/dist/aos.css";
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Calendar, 
  Share2, 
  Check, 
  ArrowRight, 
  Loader2, 
  HelpCircle,
  TrendingDown,
  Mail,
  Building,
  Briefcase
} from "lucide-react";

export default function SpendAuditorPage() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  // --- Form State ---
  const [teamSize, setTeamSize] = useState<number>(5);
  const [primaryUseCase, setPrimaryUseCase] = useState<string>("coding");
  
  // Array of tools currently configured in the user's stack
  const [configuredTools, setConfiguredTools] = useState<InputToolState[]>([
    { toolId: "cursor", planId: "pro", seats: 5, monthlySpend: 100 },
    { toolId: "copilot", planId: "business", seats: 5, monthlySpend: 95 },
  ]);

  // UI state for adding new tools
  const [availableToolsToAdd, setAvailableToolsToAdd] = useState<string[]>([]);

  // --- UI Flow & Loading States ---
  const [isAudited, setIsAudited] = useState<boolean>(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [leadCaptured, setLeadCaptured] = useState<boolean>(false);
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(false);
  const [auditSlug, setAuditSlug] = useState<string>("");
  const [shareUrl, setShareUrl] = useState<string>("");
  
  // --- API Outputs ---
  const [aiSummary, setAiSummary] = useState<string>("");
  const [auditResults, setAuditResults] = useState<any>(null);

  // --- Lead Form State ---
  const [email, setEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(true);
  const [websiteVerify, setWebsiteVerify] = useState<string>(""); // Honeypot

  // Load state from LocalStorage on mount
  useEffect(() => {
    try {
      const savedTeamSize = localStorage.getItem("spendscope_teamSize");
      const savedUseCase = localStorage.getItem("spendscope_useCase");
      const savedTools = localStorage.getItem("spendscope_tools");

      if (savedTeamSize) setTeamSize(parseInt(savedTeamSize, 10));
      if (savedUseCase) setPrimaryUseCase(savedUseCase);
      if (savedTools) setConfiguredTools(JSON.parse(savedTools));
    } catch (e) {
      console.error("Failed to load saved state from localStorage:", e);
    }
  }, []);

  // Save state to LocalStorage when inputs change
  useEffect(() => {
    try {
      localStorage.setItem("spendscope_teamSize", teamSize.toString());
      localStorage.setItem("spendscope_useCase", primaryUseCase);
      localStorage.setItem("spendscope_tools", JSON.stringify(configuredTools));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }

    // Recalculate available tools to add
    const activeIds = configuredTools.map((t) => t.toolId);
    const available = Object.keys(PRICING_DATA).filter((id) => !activeIds.includes(id));
    setAvailableToolsToAdd(available);
  }, [configuredTools, teamSize, primaryUseCase]);

  // --- Operations ---
  const handleAddTool = (toolId: string) => {
    const pricing = PRICING_DATA[toolId];
    if (!pricing) return;

    // Grab first non-free plan as a default
    const planKeys = Object.keys(pricing.plans);
    const defaultPlanKey = planKeys.find(k => k !== "free" && k !== "hobby") || planKeys[0];
    const plan = pricing.plans[defaultPlanKey];

    // Estimate initial spend
    const defaultSpend = plan.isApiDirect ? 100 : plan.pricePerUserMonth * teamSize;

    setConfiguredTools([
      ...configuredTools,
      {
        toolId,
        planId: defaultPlanKey,
        seats: plan.isApiDirect ? 1 : teamSize,
        monthlySpend: defaultSpend,
      },
    ]);
  };

  const handleRemoveTool = (index: number) => {
    const updated = [...configuredTools];
    updated.splice(index, 1);
    setConfiguredTools(updated);
  };

  const handleUpdateTool = (index: number, fields: Partial<InputToolState>) => {
    const updated = [...configuredTools];
    const current = updated[index];
    const newToolState = { ...current, ...fields };

    // If plan changes, recalculate default price
    if (fields.planId) {
      const pricing = PRICING_DATA[current.toolId];
      const plan = pricing.plans[fields.planId];
      if (plan && !plan.isApiDirect) {
        newToolState.monthlySpend = plan.pricePerUserMonth * newToolState.seats;
      }
    }
    
    // If seats change, recalculate price (except API)
    if (fields.seats !== undefined) {
      const pricing = PRICING_DATA[current.toolId];
      const plan = pricing.plans[newToolState.planId];
      if (plan && !plan.isApiDirect) {
        newToolState.monthlySpend = plan.pricePerUserMonth * fields.seats;
      }
    }

    updated[index] = newToolState;
    setConfiguredTools(updated);
  };

  // Submit stack to API and retrieve slug
  const handleCalculateAudit = async () => {
    setIsAudited(true);
    setGeneratingSummary(true);
    setLeadCaptured(false);
    setAuditSlug("");

    // Calculate local values instantly
    const localResult = runAudit(configuredTools, teamSize, primaryUseCase);
    setAuditResults(localResult);

    try {
      // 1. Save audit to db and get slug
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tools: configuredTools,
          teamSize,
          primaryUseCase,
        }),
      });

      const auditData = await res.json();
      if (auditData.slug) {
        setAuditSlug(auditData.slug);
        const host = typeof window !== "undefined" ? window.location.origin : "";
        setShareUrl(`${host}/${auditData.slug}`);

        // 2. Fetch AI-generated summary
        const summaryRes = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditResult: auditData.auditResult,
            teamSize,
            primaryUseCase,
          }),
        });
        const summaryData = await summaryRes.json();
        setAiSummary(summaryData.summary);
      }
    } catch (err) {
      console.error("Failed to run full audit API pipeline:", err);
      // Fallback
      setAiSummary("Unable to connect to Claude. Using static results.");
    } finally {
      setGeneratingSummary(false);
    }
  };

  // Lead submit handler
  const handleCaptureLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmittingLead(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName,
          role,
          newsletterOptIn,
          auditSlug,
          websiteVerify,
        }),
      });

      if (res.ok) {
        setLeadCaptured(true);
      } else {
        console.error("Lead capture returned non-OK status");
      }
    } catch (err) {
      console.error("Failed to capture lead:", err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col justify-start">
      
      {/* Hero Header Section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>INSTANT AI SOFTWARE BUDGET AUDITING</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Audit Your AI Spend.<br />
          <span className="bg-gradient-to-r from-purple-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Stop Overpaying Retail.
          </span>
        </h1>
        <p className="text-gray-400 text-lg sm:text-xl font-normal leading-relaxed">
          Input your AI tools. Discover plan downgrades, seat mismatches, and redundant licensing. We find the savings, and Credex helps you capture them.
        </p>
      </div>

      {/* Main Grid: Form Left, Quick Math Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16" data-aos="fade-up">
        
        {/* Form Inputs Component */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-purple-400">01.</span> Your Workspace Context
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Team Size (Active Developers/Managers)</label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Primary AI Use Case</label>
                <select
                  value={primaryUseCase}
                  onChange={(e) => setPrimaryUseCase(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white font-medium"
                >
                  <option value="coding" className="bg-neutral-900">Software Development & Coding</option>
                  <option value="writing" className="bg-neutral-900">Content Writing & Marketing</option>
                  <option value="data" className="bg-neutral-900">Data Analysis & Modeling</option>
                  <option value="research" className="bg-neutral-900">Research & Knowledge Work</option>
                  <option value="mixed" className="bg-neutral-900">General/Mixed Team Purposes</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-purple-400">02.</span> AI Tool Subscriptions
              </h2>
              
              {/* Add Tool dropdown */}
              {availableToolsToAdd.length > 0 && (
                <div className="relative">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTool(e.target.value);
                        e.target.value = "";
                      }
                    }}
                    className="px-4 py-2.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 hover:bg-purple-500/20 text-sm font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <option value="" disabled className="bg-neutral-900 text-purple-300">Add AI Tool...</option>
                    {availableToolsToAdd.map((id) => (
                      <option key={id} value={id} className="bg-neutral-900 text-white">
                        + {PRICING_DATA[id].displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {configuredTools.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-xl">
                <p className="text-gray-500">No tools added yet. Add a tool to start the audit calculations.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {configuredTools.map((tool, index) => {
                  const pricing = PRICING_DATA[tool.toolId];
                  if (!pricing) return null;
                  
                  return (
                    <div 
                      key={tool.toolId}
                      className="p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-purple-500/20 transition-all"
                    >
                      <div className="space-y-1 min-w-[150px]">
                        <h4 className="font-bold text-white text-lg">{pricing.displayName}</h4>
                        <a 
                          href={pricing.officialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-gray-500 hover:underline"
                        >
                          View Official Rates
                        </a>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-grow">
                        {/* Select Plan */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Plan</label>
                          <select
                            value={tool.planId}
                            onChange={(e) => handleUpdateTool(index, { planId: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-sm"
                          >
                            {Object.keys(pricing.plans).map((pKey) => (
                              <option key={pKey} value={pKey}>
                                {pricing.plans[pKey].name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Seats Input */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Seats</label>
                          <input
                            type="number"
                            min={1}
                            value={tool.seats}
                            onChange={(e) => handleUpdateTool(index, { seats: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-sm"
                          />
                        </div>

                        {/* Monthly Spend */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Monthly Spend ($)</label>
                          <input
                            type="number"
                            min={0}
                            value={tool.monthlySpend}
                            onChange={(e) => handleUpdateTool(index, { monthlySpend: Math.max(0, parseFloat(e.target.value) || 0) })}
                            className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white text-sm"
                          />
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveTool(index)}
                        className="p-2.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-400 hover:bg-red-500/5 transition-colors self-end md:self-center"
                        title="Remove tool"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Calculate Button */}
            <div className="pt-4">
              <button
                onClick={handleCalculateAudit}
                disabled={configuredTools.length === 0}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white font-extrabold text-lg flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(168,85,247,0.25)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.35)] disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
              >
                <span>Run Instant Spend Audit</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Math Summary Sidebar */}
        <div className="lg:col-span-4 space-y-6" data-aos="fade-left">
          <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
            {/* Ambient glowing background orb */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
            
            <h3 className="text-lg font-bold text-gray-300 uppercase tracking-widest mb-6">Retail Estimate</h3>
            
            {/* Spend Stats */}
            <div className="space-y-6">
              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Total Stack Cost</p>
                <div className="text-3xl font-black text-white mt-1">
                  ${configuredTools.reduce((acc, t) => acc + t.monthlySpend, 0).toLocaleString()}/mo
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-sm font-semibold uppercase">Calculated Savings</p>
                <div className="text-3xl font-black text-cyan-400 mt-1 flex items-center gap-2">
                  ${runAudit(configuredTools, teamSize, primaryUseCase).potentialMonthlySavings.toLocaleString()}/mo
                  <TrendingDown className="w-6 h-6 text-cyan-400" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase">Annual Savings Opportunity</p>
                  <p className="text-xl font-bold text-purple-400 mt-0.5">
                    ${(runAudit(configuredTools, teamSize, primaryUseCase).potentialMonthlySavings * 12).toLocaleString()}/yr
                  </p>
                </div>
                
                <div className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-bold text-xs">
                  {configuredTools.reduce((acc, t) => acc + t.monthlySpend, 0) > 0 
                    ? Math.round((runAudit(configuredTools, teamSize, primaryUseCase).potentialMonthlySavings / configuredTools.reduce((acc, t) => acc + t.monthlySpend, 0)) * 100)
                    : 0}% Off
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- Audit Results Section --- */}
      {isAudited && auditResults && (
        <div id="results" className="space-y-8 scroll-mt-24">
          <hr className="border-white/5 my-12" />

          {/* Hero Banner Savings */}
          <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden bg-gradient-to-br from-neutral-900/50 via-neutral-900/10 to-neutral-900/50 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8 relative">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
                  <span>AUDIT SUMMARY CALCULATED</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  {auditResults.potentialMonthlySavings > 0 ? (
                    <>
                      You are wasting <span className="text-cyan-400">${auditResults.potentialMonthlySavings.toLocaleString()}</span> monthly on retail licenses.
                    </>
                  ) : (
                    "Your AI stack spend is clean. Nice work!"
                  )}
                </h2>
                <p className="text-gray-400 text-base sm:text-lg">
                  Below is the plan-by-plan consolidation roadmap built by our Spend Engine.
                </p>
              </div>

              <div className="flex flex-col items-start md:items-end justify-center min-w-[200px]">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Total Savings</p>
                <div className="text-5xl sm:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 mt-1">
                  ${auditResults.potentialAnnualSavings.toLocaleString()}
                </div>
                <p className="text-purple-400 text-sm font-semibold tracking-wider uppercase mt-1">potential annual cut</p>
              </div>
            </div>
          </div>

          {/* AI-Generated Personalized Summary */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-purple-500/10 shadow-[0_4px_30px_rgba(168,85,247,0.03)] space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <h3 className="font-extrabold text-white text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Spend Strategy Review
              </h3>
              <span className="text-xs uppercase tracking-widest text-gray-500 font-bold">Claude 3.5 Sonnet</span>
            </div>

            {generatingSummary ? (
              <div className="flex items-center gap-3 py-6 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                <span className="text-sm">Analyzing subscription metrics...</span>
              </div>
            ) : (
              <p className="text-gray-300 text-base leading-relaxed italic">
                &ldquo;{aiSummary || "Review complete. Details loaded below."}&rdquo;
              </p>
            )}
          </div>

          {/* Per-Tool breakdown list */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Itemized Audit & Recommendations</h3>
            
            {auditResults.recommendations.length === 0 ? (
              <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] text-center text-gray-500">
                🚀 No optimization opportunities identified. Your subscriptions align with your seat counts and use cases.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {auditResults.recommendations.map((rec: AuditRecommendation, i: number) => {
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
                        <span className="text-xs text-gray-500 font-bold uppercase">Monthly Cut</span>
                        <span className="text-2xl font-black text-cyan-400 mt-0.5">-${rec.monthlySavings}/mo</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Lead Capture or Consultation Widget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6">
            
            {/* Lead Capture Gate */}
            <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-purple-400" />
                  Save & Export Audit
                </h3>
                <p className="text-gray-400 text-sm">
                  Lock in this report and receive a PDF copy via email. We will also monitor prices and notify you when new savings apply.
                </p>
              </div>

              {leadCaptured ? (
                <div className="p-6 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto text-cyan-400">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-lg">Audit Successfully Saved!</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    A confirmation email has been dispatched with your PDF download. You can share this report with your team using the link below:
                  </p>
                  
                  {shareUrl && (
                    <div className="pt-2">
                      <div className="flex items-center gap-2 bg-neutral-900 border border-white/10 rounded-lg p-2.5">
                        <input 
                          type="text" 
                          readOnly 
                          value={shareUrl} 
                          className="bg-transparent border-0 flex-grow text-xs text-purple-300 font-mono outline-none focus:ring-0 focus:shadow-none p-0"
                        />
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                            alert("Copied to clipboard!");
                          }}
                          className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded text-xs font-semibold cursor-pointer"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleCaptureLead} className="space-y-4">
                  {/* Honeypot field (hidden) */}
                  <input
                    type="text"
                    name="website_verify"
                    style={{ display: "none" }}
                    tabIndex={-1}
                    value={websiteVerify}
                    onChange={(e) => setWebsiteVerify(e.target.value)}
                    placeholder="Leave empty"
                  />

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company Name</label>
                      <input
                        type="text"
                        placeholder="Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</label>
                      <input
                        type="text"
                        placeholder="CTO / Engineering Lead"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-neutral-900 border border-white/10 text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="opt-in"
                      checked={newsletterOptIn}
                      onChange={(e) => setNewsletterOptIn(e.target.checked)}
                      className="mt-1 rounded border-white/10 bg-neutral-900 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="opt-in" className="text-xs text-gray-500 leading-normal">
                      Notify me of new developer/LLM optimizations and discounts.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(168,85,247,0.2)] disabled:opacity-50 disabled:shadow-none transition-all cursor-pointer"
                  >
                    {isSubmittingLead ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Exporting Audit Report...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Report via Email</span>
                        <Share2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Book consultation Widget for high-savings audits ( >$500 savings ) */}
            {auditResults.potentialMonthlySavings >= 500 ? (
              <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.06)] space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
                    ⚡ High Savings Eligible
                  </div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Book Credex Consultation
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Because your potential savings exceed <strong>$500/month</strong>, you qualify to purchase direct API credits at up to <strong>30% off retail</strong> via Credex. Select a time below to secure your discount.
                  </p>
                </div>

                 {/* Real Calendly Embed */}
                 <div className="border border-white/10 rounded-xl overflow-hidden bg-neutral-950/60 p-4" data-aos="fade-up">
                   <div className="w-full h-[630px]">
                     <iframe src="https://calendly.com/credex/15min" width="100%" height="100%" frameBorder="0"></iframe>
                   </div>
                 </div>
                 {/* Calendly script */}
                 <script src="https://assets.calendly.com/assets/external/widget.js" async></script>
              </div>
            ) : (
              // Spent well / minimal savings widget
              <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    Secure Your Credits Portfolio
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Even if your current stack is optimal, SaaS pricing shifts. Lock in access to Credex credits today. When your team scales or you pivots to API volumes, buy your tokens with our real, pre-negotiated discount.
                  </p>
                </div>
                
                <a 
                  href="https://credex.rocks" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-3.5 rounded-xl border border-white/10 hover:border-purple-500/30 hover:bg-purple-500/5 text-gray-200 hover:text-white font-bold text-base flex items-center justify-center gap-2 transition-all"
                >
                  <span>Explore Credex Inventory</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}
