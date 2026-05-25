"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PRICING_DATA } from "@/lib/pricingData";
import { runAudit, InputToolState, AuditRecommendation, AuditResult } from "@/lib/auditEngine";
import { AuditReportSection } from "@/components/AuditReportClient";
import { FaqSection } from "@/components/FaqSection";
import { PricingRatesSection } from "@/components/PricingRatesSection";
import { HeroToolLogos } from "@/components/HeroToolLogos";
import { Button } from "@/components/ui/button";
import { AnimatePresence, animate, motion } from "framer-motion";
import {
  Plus,
  Trash2,
  Sparkles,
  Check,
  ArrowRight,
  Loader2,
  TrendingDown,
  Briefcase,
  AlertTriangle,
  HelpCircle,
  Activity,
  Layers,
  Percent,
  CheckCircle2
} from "lucide-react";

// Inline metadata for Plan Awareness
const PLAN_INFO: Record<string, Record<string, { desc: string; bestFor: string; warning?: string }>> = {
  cursor: {
    hobby: { desc: "Basic code completions and limited chat.", bestFor: "Hobbyists trying out Cursor." },
    pro: { desc: "Unlimited fast completions, index search, and advanced model requests.", bestFor: "Professional developers.", warning: "If seats > 5, consider Business tier for centralized admin control." },
    business: { desc: "Centralized billing, usage dashboards, and custom security controls.", bestFor: "Growing startup engineering teams." },
    enterprise: { desc: "Custom SLA, SSO, data retention, and custom contracts.", bestFor: "Enterprise security compliance." }
  },
  copilot: {
    individual: { desc: "Standard autocompletions & chat inside mainstream IDEs.", bestFor: "Individual freelancers.", warning: "Individual plans cannot be managed under corporate centralized accounts." },
    business: { desc: "Organization policies, seat management, and IP protection rules.", bestFor: "Commercial dev groups." },
    enterprise: { desc: "Custom knowledge index, repository-focused chat answers, and security controls.", bestFor: "Large scaled engineering teams." }
  },
  claude: {
    free: { desc: "Access to standard web model with base rate limits.", bestFor: "Casual text and research." },
    pro: { desc: "5x usage relative to free, early access to new versions.", bestFor: "Heavy LLM users." },
    team: { desc: "Collaborative canvas, high message limits, admin dashboards.", bestFor: "Business workspaces.", warning: "Requires minimum of 5 seats ($150/mo minimum commitment)." },
    enterprise: { desc: "SSO, higher context windows, admin compliance controls.", bestFor: "Large enterprise operations." },
    api: { desc: "Developer API keys on pay-as-you-go consumption rates.", bestFor: "App builders and automation scripts." }
  },
  chatgpt: {
    plus: { desc: "Full access to GPT-4o, custom GPT builders, and beta features.", bestFor: "Power users." },
    team: { desc: "Central workspace, admin console, no training on workspace data.", bestFor: "SMB workspaces.", warning: "Requires minimum of 2 seats ($60/mo minimum commitment)." },
    enterprise: { desc: "SSO, unlimited fast GPT-4o, administrative tools, API discounts.", bestFor: "Enterprise security groups." },
    api: { desc: "Direct pay-as-you-go developer tokens.", bestFor: "Custom scripts and backend services." }
  },
  openai_api: {
    payg: { desc: "Pay-as-you-go access to GPT models. Fully usage-based pricing.", bestFor: "Custom automation pipelines and high volume scripts." }
  },
  anthropic_api: {
    payg: { desc: "Pay-as-you-go access to Claude models. Fully usage-based pricing.", bestFor: "Custom integrations requiring advanced reasoning." }
  },
  gemini: {
    pro: { desc: "Free workspace tier access with standard limits.", bestFor: "Testing and casual tasks." },
    ultra: { desc: "Advanced Ultra capabilities with high limits and Google One bundle.", bestFor: "Power users wanting Google workspace integration." },
    api: { desc: "Developer console tokens with free tier limits available.", bestFor: "App builders scaling with Gemini API." }
  },
  windsurf: {
    pro: { desc: "Native Agentic completions, IDE commands, and Codeium search.", bestFor: "Professional developers using Windsurf IDE." },
    team: { desc: "Shared policies, centralized organization management.", bestFor: "Collaborative developer teams." }
  }
};

function AnimatedCurrency({
  value,
  className,
  suffix = "",
}: {
  value: number;
  className?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const latestValue = React.useRef(value);

  useEffect(() => {
    const controls = animate(latestValue.current, value, {
      duration: 0.6,
      ease: "easeOut",
      onUpdate: (latest) => {
        latestValue.current = latest;
        setDisplayValue(latest);
      },
    });

    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      ${Math.round(displayValue).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function SpendAuditorPage() {
  const router = useRouter();
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
  const [selectedAddId, setSelectedAddId] = useState<string>("");

  // Expand plan info inline index
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // --- UI Flow & Loading States ---
  const [isAudited, setIsAudited] = useState<boolean>(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);
  const [leadCaptured, setLeadCaptured] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
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
  const [leadError, setLeadError] = useState<string>("");
  const [leadNotice, setLeadNotice] = useState<string>("");

  // --- Progressive Auditing Checklist State ---
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const simulationChecklist = [
    "Analyzing workspace team context and workflow profiles",
    "Checking seat utilization thresholds per license",
    "Validating pricing plans against retail rate tables",
    "Evaluating cross-tool redundant licenses (Cursor/Copilot)",
    "Running Credex volume discount eligibility checks",
    "Formatting financial optimization recommendation matrix"
  ];

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
    if (!toolId) return;
    const pricing = PRICING_DATA[toolId];
    if (!pricing) return;

    const planKeys = Object.keys(pricing.plans);
    const defaultPlanKey = planKeys.find(k => k !== "free" && k !== "hobby") || planKeys[0];
    const plan = pricing.plans[defaultPlanKey];

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
    setSelectedAddId("");
  };

  const handleRemoveTool = (index: number) => {
    const updated = [...configuredTools];
    updated.splice(index, 1);
    setConfiguredTools(updated);
    if (expandedRow === index) {
      setExpandedRow(null);
    } else if (expandedRow !== null && expandedRow > index) {
      setExpandedRow(expandedRow - 1);
    }
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
  const handleCalculateAudit = () => {
    setIsSimulating(true);
    setSimulationStep(0);
    setIsAudited(false);
    setLeadCaptured(false);
    setAuditSlug("");

    // Simulate checklist progression
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimulationStep(step);
      if (step >= simulationChecklist.length) {
        clearInterval(interval);
        triggerAuditAPI();
      }
    }, 350);
  };

  const fetchAiSummary = async (result: AuditResult) => {
    try {
      const summaryRes = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditResult: result,
          teamSize,
          primaryUseCase,
        }),
      });
      const summaryData = await summaryRes.json();
      if (summaryData.summary) {
        setAiSummary(summaryData.summary);
      }
    } catch (err) {
      console.error("Failed to generate AI summary:", err);
    }
  };

  const triggerAuditAPI = async () => {
    // Keep the loading overlay active until we have a redirect slug
    setLeadError("");
    setLeadNotice("");

    try {
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

      if (res.ok && auditData.slug) {
        // SUCCESS: Redirect instantly to the dedicated results page
        router.push(`/${auditData.slug}`);
        // The router.push transition will handle clearing the home page state
      } else {
        // DB SAVE FAILED: Fallback to showing results on the home page
        setIsSimulating(false);
        setIsAudited(true);
        setGeneratingSummary(true);
        
        if (auditData.auditResult) {
          setAuditResults(auditData.auditResult);
          await fetchAiSummary(auditData.auditResult);
        } else {
          const localResult = runAudit(configuredTools, teamSize, primaryUseCase);
          setAuditResults(localResult);
          await fetchAiSummary(localResult);
        }
        
        setLeadError(
          auditData.error ||
            "Could not save your shareable audit link. Results shown are local-only."
        );
        setGeneratingSummary(false);
      }
    } catch (err) {
      console.error("Failed to run full audit API pipeline:", err);
      setIsSimulating(false);
      setIsAudited(true);
      setGeneratingSummary(true);
      
      const localResult = runAudit(configuredTools, teamSize, primaryUseCase);
      setAuditResults(localResult);
      await fetchAiSummary(localResult);
      
      setLeadError("Network error while saving audit. Results are shown locally.");
      setGeneratingSummary(false);
    }
  };

  // Lead submit handler
  const handleCaptureLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!auditSlug) {
      setLeadError("No saved audit link yet. Run the audit again, then try exporting.");
      return;
    }

    setIsSubmittingLead(true);
    setLeadError("");
    setLeadNotice("");

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

      const data = await res.json();

      if (!res.ok) {
        setLeadError(data.error || "Could not save your report. Please try again.");
        return;
      }

      setLeadCaptured(true);
      setExportDialogOpen(false);

      if (data.shareUrl) {
        setShareUrl(data.shareUrl);
      }

      if (data.emailSent) {
        setLeadNotice("Report emailed. Opening print dialog so you can save a PDF copy.");
        window.setTimeout(() => window.print(), 400);
      } else {
        setLeadNotice(
          data.message ||
            "Report saved. Email could not be sent — copy the share link below or use Print to save a PDF."
        );
        window.setTimeout(() => window.print(), 600);
      }
    } catch (err) {
      console.error("Failed to capture lead:", err);
      setLeadError("Network error while sending report. Check your connection and try again.");
    } finally {
      setIsSubmittingLead(false);
    }
  };

  // Live real-time stats before auditing
  const totalSpend = configuredTools.reduce((acc, t) => acc + t.monthlySpend, 0);
  const liveAudit = runAudit(configuredTools, teamSize, primaryUseCase);
  const potentialSavings = liveAudit.potentialMonthlySavings;
  const annualSavings = liveAudit.potentialAnnualSavings;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow flex flex-col justify-start">
      
      {/* Hero — logos scattered left/right + metallic copy */}
      <div className="no-print relative mb-16 pt-14 md:pt-16 min-h-[320px] md:min-h-[380px] lg:min-h-[400px] w-full overflow-visible">
        <HeroToolLogos />

        <motion.div
          className="relative z-10 text-center max-w-3xl mx-auto space-y-6 px-8 md:px-20 lg:px-28"
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/15 text-metallic-silver-body text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gray-300" />
            <span>AI Budget Explanation Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight leading-tight">
            <span className="text-metallic-silver block">Audit Your AI Spend.</span>
            <span className="text-metallic-silver-muted block mt-1 sm:mt-2">
              Uncover Hidden Logic &amp; Savings.
            </span>
          </h1>

          <p className="text-metallic-silver-body text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            SaaS vendors rely on over-provisioned seats and redundant integrations to boost their margins. Drop your stack details below to model immediate downgrades and secure pre-negotiated credits.
          </p>
        </motion.div>
      </div>

      {/* Main Form Dashboard */}
      <div className="no-print grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* Left Column: Form Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Workspace context card */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                <span className="text-xs font-bold text-gray-400 font-mono">01</span>
              </div>
              <h2 className="text-xl font-display font-bold text-white">Workspace Profile</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Team Size (Active Licenses)
                </label>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-3 rounded-lg border border-[#1F1F22] bg-[#0A0A0C] text-white text-sm font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">
                  Primary Stack Focus
                </label>
                <select
                  value={primaryUseCase}
                  onChange={(e) => setPrimaryUseCase(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-[#1F1F22] bg-[#0A0A0C] text-white text-sm font-medium"
                >
                  <option value="coding">Software Development & Engineering</option>
                  <option value="writing">Marketing & Copywriting</option>
                  <option value="data">Data Analysis & Statistics</option>
                  <option value="research">Academic & Business Research</option>
                  <option value="mixed">Mixed/General Team Operations</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subscriptions spreadsheet grid */}
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="text-xs font-bold text-gray-400 font-mono">02</span>
                </div>
                <h2 className="text-xl font-display font-bold text-white">AI Subscriptions Grid</h2>
              </div>

              {/* Add Tool Dropdown */}
              {availableToolsToAdd.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedAddId}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddTool(e.target.value);
                      }
                    }}
                    className="pl-4 pr-10 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 text-sm font-medium transition-all cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='%239CA3AF' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px center",
                    }}
                  >
                    <option value="" disabled className="bg-[#0B0B0C]">Add software tool...</option>
                    {availableToolsToAdd.map((id) => (
                      <option key={id} value={id} className="bg-[#111113] text-white">
                        + {PRICING_DATA[id].displayName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Structured Financial Input Rows */}
            {configuredTools.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[#1A1A1D] rounded-xl bg-white/[0.01]">
                <p className="text-gray-500 text-sm">Add active AI products to inspect pricing redundancies.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-[#1A1A1D] rounded-xl bg-white/[0.01]">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#1A1A1D] text-xs font-bold text-gray-500 uppercase tracking-widest bg-white/[0.01]">
                      <th className="py-4 px-4">Tool</th>
                      <th className="py-4 px-3">Plan Tier</th>
                      <th className="py-4 px-3 text-center">Seats</th>
                      <th className="py-4 px-3 text-right">Rate/Seat</th>
                      <th className="py-4 px-3 text-right">Total Cost</th>
                      <th className="py-4 px-4 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {configuredTools.map((tool, index) => {
                      const pricing = PRICING_DATA[tool.toolId];
                      if (!pricing) return null;
                      const plan = pricing.plans[tool.planId];
                      const isApi = plan?.isApiDirect || false;

                      const isExpanded = expandedRow === index;
                      const info = PLAN_INFO[tool.toolId]?.[tool.planId];

                      // Warn users about Claude Team (min 5 seats) or ChatGPT Team (min 2 seats)
                      let inlineWarning = "";
                      if (tool.toolId === "claude" && tool.planId === "team" && tool.seats < 5) {
                        inlineWarning = `Claude Team plan requires a 5-seat minimum ($150/mo minimum). Paying for empty seats.`;
                      } else if (tool.toolId === "chatgpt" && tool.planId === "team" && tool.seats < 2) {
                        inlineWarning = `ChatGPT Team requires a 2-seat minimum ($60/mo minimum). Paying for empty seats.`;
                      }

                      return (
                        <React.Fragment key={tool.toolId}>
                          {/* Main spreadsheet row */}
                          <tr className="financial-row transition-all align-middle group">
                            <td className="py-4 px-4 font-semibold text-white">
                              <div className="flex flex-col">
                                <span className="text-sm font-display">{pricing.displayName}</span>
                                <a
                                  href={pricing.officialUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-xs text-gray-500 hover:text-gray-300 underline mt-0.5"
                                >
                                  Official Rates &rarr;
                                </a>
                              </div>
                            </td>

                            <td className="py-4 px-3">
                              <select
                                value={tool.planId}
                                onChange={(e) => handleUpdateTool(index, { planId: e.target.value })}
                                className="px-2 py-1.5 rounded-lg border border-[#1F1F22] bg-[#0A0A0C] text-sm font-medium focus:ring-1 focus:ring-white/20 max-w-[140px] truncate"
                              >
                                {Object.keys(pricing.plans).map((pKey) => (
                                  <option key={pKey} value={pKey}>
                                    {pricing.plans[pKey].name}
                                  </option>
                                ))}
                              </select>
                            </td>

                            <td className="py-4 px-3 text-center">
                              <input
                                type="number"
                                min={1}
                                value={tool.seats}
                                disabled={isApi}
                                onChange={(e) => handleUpdateTool(index, { seats: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                                className="w-16 px-2 py-1 rounded-lg border border-white/5 bg-[#111113] text-xs text-center font-mono disabled:opacity-30"
                              />
                            </td>

                            <td className="py-4 px-3 text-right font-mono text-xs text-gray-400 tabular-nums">
                              {isApi ? "PAYG" : `$${plan?.pricePerUserMonth}`}
                            </td>

                            <td className="py-4 px-3 text-right font-mono text-sm font-semibold text-white tabular-nums">
                              ${tool.monthlySpend.toLocaleString()}
                            </td>

                            <td className="py-4 px-4 text-center">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setExpandedRow(isExpanded ? null : index)}
                                  className="p-1 rounded bg-[#0A0A0C] border border-[#1F1F22] hover:border-white/20 text-gray-400 hover:text-white text-xs uppercase font-mono px-2"
                                  title="Explain plan parameters"
                                >
                                  {isExpanded ? "Hide" : "Info"}
                                </button>
                                <button
                                  onClick={() => handleRemoveTool(index)}
                                  className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-400 hover:bg-red-500/5 transition-all"
                                  title="Remove tool"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Plan Info & Intelligent Awareness panel */}
                          {(isExpanded || inlineWarning) && (
                            <tr className="bg-white/[0.01]">
                              <td colSpan={6} className="py-3 px-4 border-b border-[#1A1A1D]">
                                <div className="space-y-2 text-xs">
                                  {inlineWarning && (
                                    <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-red-400">
                                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                      <p>{inlineWarning}</p>
                                    </div>
                                  )}
                                  {info && isExpanded && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-[#1F1F22] rounded-lg">
                                      <div className="space-y-1.5">
                                        <p className="text-sm font-semibold text-gray-200">Tier Features:</p>
                                        <p className="text-sm text-gray-400 font-light leading-relaxed">{info.desc}</p>
                                      </div>
                                      <div className="space-y-1.5">
                                        <p className="text-sm font-semibold text-gray-200">Target Segment:</p>
                                        <p className="text-sm text-gray-400 font-light">{info.bestFor}</p>
                                        {info.warning && (
                                          <p className="text-sm text-amber-400/90 font-medium mt-1">⚠ {info.warning}</p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Calculate Trigger button */}
            <div className="pt-2">
              <Button
                onClick={handleCalculateAudit}
                disabled={configuredTools.length === 0}
                className="w-full text-sm font-semibold bg-white hover:bg-gray-100 text-black py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Compile Audit Engine Breakdown</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Insight Engine (Reactive Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-[#1F1F22] relative overflow-hidden insight-panel-money">

            <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F1F22]">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 icon-metallic-green" />
                Live Insight Engine
              </h3>
              <span className="h-2.5 w-2.5 rounded-full dot-metallic-green animate-pulse"></span>
            </div>

            {/* Live Financial Metrics */}
            <div className="space-y-6">
              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Unoptimized Stack Cost</p>
                <div className="text-3xl font-display font-black text-gray-200 mt-1 tabular-nums">
                  ${totalSpend.toLocaleString()}/mo
                </div>
              </div>

              <div>
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Identified Redundancies</p>
                <div className="text-3xl font-display font-black mt-1 flex items-center gap-2 tabular-nums">
                  <AnimatedCurrency value={potentialSavings} suffix="/mo" className="text-metallic-green" />
                  <TrendingDown className="w-5 h-5 icon-metallic-green" />
                </div>
              </div>

              <div className="pt-6 border-t border-[#1F1F22] flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Annual Cut Potential</p>
                  <p className="text-lg font-bold mt-0.5 tabular-nums">
                    <AnimatedCurrency value={annualSavings} suffix="/yr" className="text-money-accent" />
                  </p>
                </div>

                <div className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/25 text-amber-200/90 font-mono text-xs font-semibold">
                  {totalSpend > 0 ? Math.round((potentialSavings / totalSpend) * 100) : 0}% Waste
                </div>
              </div>
            </div>            {/* Live Redundant Detections */}
            <div className="mt-8 space-y-3 pt-6 border-t border-[#1F1F22]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Logic Warnings</p>
              
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {configuredTools.length === 0 ? (
                  <p className="text-gray-600 text-sm font-light">Stack is empty. Waiting for inputs...</p>
                ) : (
                  <>
                    {/* Check copilot + cursor redundancy */}
                    {configuredTools.some(t => t.toolId === "cursor") && configuredTools.some(t => t.toolId === "copilot") && (
                      <div className="border border-[#1F1F22] bg-white/[0.02] p-3 rounded-lg text-gray-300 text-sm flex gap-2.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">Editor Redundancy Found</p>
                          <p className="text-sm text-gray-400 mt-0.5 font-light">Running both Cursor & Copilot subscriptions. Consolidate to Cursor to save ${configuredTools.find(t => t.toolId === "copilot")?.monthlySpend || 0}/mo.</p>
                        </div>
                      </div>
                    )}

                    {/* Check ChatGPT + Claude redundancy */}
                    {configuredTools.some(t => t.toolId === "chatgpt") && configuredTools.some(t => t.toolId === "claude") && (primaryUseCase === "coding" || primaryUseCase === "writing") && (
                      <div className="border border-[#1F1F22] bg-white/[0.02] p-3 rounded-lg text-gray-300 text-sm flex gap-2.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">Dual LLM Subscriptions</p>
                          <p className="text-sm text-gray-400 mt-0.5 font-light">ChatGPT Plus and Claude Pro active. Consolidate providers based on team focus.</p>
                        </div>
                      </div>
                    )}

                    {/* Check Claude Team minimum seats */}
                    {configuredTools.some(t => t.toolId === "claude" && t.planId === "team" && t.seats < 5) && (
                      <div className="border border-[#1F1F22] bg-white/[0.02] p-3 rounded-lg text-gray-300 text-sm flex gap-2.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">Claude Team Seat Minimum</p>
                          <p className="text-sm text-gray-400 mt-0.5 font-light">Billed for minimum 5 seats. Downgrade to Pro to eliminate fees.</p>
                        </div>
                      </div>
                    )}

                    {/* Check ChatGPT Team minimum seats */}
                    {configuredTools.some(t => t.toolId === "chatgpt" && t.planId === "team" && t.seats < 2) && (
                      <div className="border border-[#1F1F22] bg-white/[0.02] p-3 rounded-lg text-gray-300 text-sm flex gap-2.5">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                        <div>
                          <p className="font-semibold text-white">ChatGPT Team Seat Minimum</p>
                          <p className="text-sm text-gray-400 mt-0.5 font-light">Billed for minimum 2 seats. Downgrade to Plus.</p>
                        </div>
                      </div>
                    )}

                    {/* API credits prompt caching promotion */}
                    {configuredTools.some(t => (t.toolId === "openai_api" || t.toolId === "anthropic_api") && t.monthlySpend >= 100) && (
                      <div className="border border-[#1F1F22] bg-white/[0.02] p-3 rounded-lg text-gray-300 text-sm flex gap-2.5">
                        <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-white">Prompt Caching Available</p>
                          <p className="text-sm text-gray-400 mt-0.5 font-light">API spend qualifies for prompt caching, cutting token costs by 30%.</p>
                        </div>
                      </div>
                    )}

                    {/* Default state when tools exist but no redundancies */}
                    {!configuredTools.some(t => t.toolId === "cursor" && configuredTools.some(t => t.toolId === "copilot")) &&
                     !configuredTools.some(t => t.toolId === "chatgpt" && configuredTools.some(t => t.toolId === "claude") && (primaryUseCase === "coding" || primaryUseCase === "writing")) &&
                     !configuredTools.some(t => t.toolId === "claude" && t.planId === "team" && t.seats < 5) &&
                     !configuredTools.some(t => t.toolId === "chatgpt" && t.planId === "team" && t.seats < 2) && (
                      <div className="border border-[#1F1F22] bg-white/[0.02] p-3 rounded-lg text-sm flex gap-2.5">
                        <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                        <p className="text-gray-300 font-light">No configuration conflicts detected yet.</p>
                      </div>
                     )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* --- Simulated Auditing Checklist / Loading State --- */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-panel max-w-lg w-full rounded-2xl p-6 sm:p-8 space-y-6 border border-[#1F1F22]">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <h3 className="text-lg font-display font-bold text-white">Running Financial Audit...</h3>
              </div>

              <div className="space-y-3">
                {simulationChecklist.map((logText, idx) => {
                  const isActive = simulationStep === idx;
                  const isDone = simulationStep > idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 transition-opacity duration-200 ${
                        isDone ? "opacity-100" : isActive ? "opacity-100" : "opacity-25"
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0" />
                      ) : isActive ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-700 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-mono ${
                        isActive ? "text-white font-medium" : isDone ? "text-gray-400" : "text-gray-700"
                      }`}>
                        {logText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Audit Results Section --- */}
      <AnimatePresence>
        {isAudited && auditResults && (
          <AuditReportSection
            auditResults={auditResults}
            configuredTools={configuredTools}
            teamSize={teamSize}
            primaryUseCase={primaryUseCase}
            aiSummary={aiSummary}
            generatingSummary={generatingSummary}
            leadCaptured={leadCaptured}
            shareUrl={shareUrl}
            exportDialogOpen={exportDialogOpen}
            setExportDialogOpen={setExportDialogOpen}
            handleCaptureLead={handleCaptureLead}
            isSubmittingLead={isSubmittingLead}
            email={email}
            setEmail={setEmail}
            companyName={companyName}
            setCompanyName={setCompanyName}
            role={role}
            setRole={setRole}
            newsletterOptIn={newsletterOptIn}
            setNewsletterOptIn={setNewsletterOptIn}
            websiteVerify={websiteVerify}
            setWebsiteVerify={setWebsiteVerify}
            leadError={leadError}
            leadNotice={leadNotice}
          />
        )}
      </AnimatePresence>

      <div className="no-print">
        <PricingRatesSection />
        <FaqSection />
      </div>

    </div>
  );
}
