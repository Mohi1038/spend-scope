"use client";

import React, { useState, useEffect } from "react";
import { PRICING_DATA } from "@/lib/pricingData";
import { InputToolState, AuditRecommendation, AuditResult } from "@/lib/auditEngine";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AnimatePresence, motion } from "framer-motion";
import {
  TrendingDown,
  Sparkles,
  Check,
  Share2,
  Loader2,
  AlertTriangle,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  UserCheck
} from "lucide-react";

// --- Layer 3: Interactive Cost Frontier (Efficiency Curve) ---
function CostFrontierGraph({
  teamSize,
  totalSpend,
  optimizedSpend,
  credexSpend
}: {
  teamSize: number;
  totalSpend: number;
  optimizedSpend: number;
  credexSpend: number;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  const maxVal = Math.max(totalSpend, 150) * 1.15;
  const padding = 40;
  const height = 240;
  const width = 450;

  // Map financial values to SVG Y-coordinates (inverted)
  const getY = (val: number) => {
    const scale = (height - padding * 2) / maxVal;
    return height - padding - val * scale;
  };

  const currentY = getY(totalSpend);
  const optimizedY = getY(optimizedSpend);
  const credexY = getY(credexSpend);
  const centerX = width / 2;

  return (
    <div className="relative border border-[#1F1F22] rounded-xl bg-[#0A0A0C] p-5 chart-panel-money">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">Cost Efficiency Frontier</h4>
          <p className="text-xs text-gray-600 mt-0.5">Your stack vs. the optimal AI spend curve</p>
        </div>
        <span className="text-[10px] font-mono bg-metallic-green-badge px-2 py-0.5 rounded">Economics Model</span>
      </div>

      <div className="relative h-[240px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="metallicGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdfa" />
              <stop offset="12%" stopColor="#ccfbf1" />
              <stop offset="28%" stopColor="#5eead4" />
              <stop offset="48%" stopColor="#14b8a6" />
              <stop offset="68%" stopColor="#0d9488" />
              <stop offset="88%" stopColor="#064e3b" />
              <stop offset="100%" stopColor="#022c22" />
            </linearGradient>
            <linearGradient id="tealOptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="22%" stopColor="#99f6e4" />
              <stop offset="55%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <filter id="metalPointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Grid lines */}
          <line x1={padding} y1={getY(maxVal * 0.75)} x2={width - padding} y2={getY(maxVal * 0.75)} stroke="#1F1F22" strokeDasharray="3 3" />
          <line x1={padding} y1={getY(maxVal * 0.5)} x2={width - padding} y2={getY(maxVal * 0.5)} stroke="#1F1F22" strokeDasharray="3 3" />
          <line x1={padding} y1={getY(maxVal * 0.25)} x2={width - padding} y2={getY(maxVal * 0.25)} stroke="#1F1F22" strokeDasharray="3 3" />

          {/* Axes */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#2A2A2D" strokeWidth={1.5} />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#2A2A2D" strokeWidth={1.5} />

          {/* Cost Frontier Curve */}
          <path
            d={`M ${padding} ${getY(0)} Q ${centerX} ${getY(optimizedSpend * 0.7)} ${width - padding} ${getY(optimizedSpend * 1.5)}`}
            fill="none"
            stroke="url(#metallicGreenGrad)"
            strokeOpacity={0.55}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />

          {/* Axis Labels */}
          <text x={width - padding} y={height - padding + 15} fill="#4B5563" fontSize={10} textAnchor="end">Team size ({teamSize})</text>
          <text x={padding - 10} y={padding - 10} fill="#4B5563" fontSize={10} textAnchor="start">Spend/mo</text>

          {/* Center line */}
          <line x1={centerX} y1={padding} x2={centerX} y2={height - padding} stroke="#1F1F22" strokeWidth={1} strokeDasharray="2 2" />

          {/* Current Stack Point (muted dot) */}
          <g className="cursor-pointer" onMouseEnter={() => setHoveredPoint("current")} onMouseLeave={() => setHoveredPoint(null)}>
            <circle cx={centerX} cy={currentY} r={hoveredPoint === "current" ? 8 : 6} fill="#71717A" className="transition-all" />
          </g>

          {/* Optimized Stack Point (teal dot) */}
          <g className="cursor-pointer" onMouseEnter={() => setHoveredPoint("optimized")} onMouseLeave={() => setHoveredPoint(null)}>
            <circle cx={centerX} cy={optimizedY} r={hoveredPoint === "optimized" ? 8 : 6} fill="url(#tealOptGrad)" filter="url(#metalPointGlow)" stroke="rgba(255,255,255,0.35)" strokeWidth={0.75} className="transition-all" />
          </g>

          {/* Credex Point (metallic green) */}
          <g className="cursor-pointer" onMouseEnter={() => setHoveredPoint("credex")} onMouseLeave={() => setHoveredPoint(null)}>
            <circle cx={centerX} cy={credexY} r={hoveredPoint === "credex" ? 9 : 7} fill="url(#metallicGreenGrad)" filter="url(#metalPointGlow)" stroke="rgba(255,255,255,0.5)" strokeWidth={1} className="transition-all" />
          </g>
        </svg>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredPoint && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute left-1/2 bottom-8 -translate-x-1/2 bg-[#0D0D10] border border-[#1F1F22] rounded-xl p-3.5 shadow-2xl min-w-[210px] text-sm space-y-2"
            >
              {hoveredPoint === "current" && (
                <>
                  <p className="font-semibold text-white">Current AI Stack</p>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Monthly Cost</span>
                    <span className="font-mono text-white">${totalSpend}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Efficiency</span>
                    <span className="font-mono text-gray-300">{Math.round((optimizedSpend/totalSpend)*100)}%</span>
                  </div>
                  <p className="text-xs text-gray-500 border-t border-[#1F1F22] pt-2 mt-1">Overhead from overlapping licenses.</p>
                </>
              )}
              {hoveredPoint === "optimized" && (
                <>
                  <p className="font-semibold text-white">Retail Optimized Stack</p>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Monthly Cost</span>
                    <span className="font-mono text-money-accent">${optimizedSpend}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Efficiency</span>
                    <span className="font-mono text-money-accent">92%</span>
                  </div>
                  <p className="text-xs text-gray-500 border-t border-[#1F1F22] pt-2 mt-1">Seats consolidated, redundancy removed.</p>
                </>
              )}
              {hoveredPoint === "credex" && (
                <>
                  <p className="font-semibold text-white">Credex Credits Position</p>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Monthly Cost</span>
                    <span className="font-mono text-metallic-green">${credexSpend}</span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-xs">
                    <span>Efficiency</span>
                    <span className="font-mono text-money-accent">100%</span>
                  </div>
                  <p className="text-xs text-gray-500 border-t border-[#1F1F22] pt-2 mt-1">Pre-purchased bulk credits applied.</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-center gap-6 mt-3 text-xs text-gray-500 font-mono">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#71717A]" /> Current</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full border border-white/30" style={{ background: "linear-gradient(145deg, #ecfeff, #2dd4bf, #0f766e)" }} /> Optimized</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full dot-metallic-green" /> Credex</span>
      </div>
    </div>
  );
}

// --- Layer 3: Interactive Cost Bridge (Waterfall Chart) ---
function WaterfallGraph({
  totalSpend,
  recommendations,
  optimizedSpend,
  onRecClick
}: {
  totalSpend: number;
  recommendations: AuditRecommendation[];
  optimizedSpend: number;
  onRecClick: (toolId: string) => void;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const hasCredex = recommendations.some(r => r.toolId === "credex");
  const baseRecs = recommendations.filter(r => r.toolId !== "credex");
  const credexRec = recommendations.find(r => r.toolId === "credex");
  const retailOptimized = totalSpend - baseRecs.reduce((sum, r) => sum + r.monthlySavings, 0);

  // Steps configuration
  const steps: { label: string; type: "start" | "change" | "end"; value: number; toolId?: string }[] = [];
  
  steps.push({ label: "Current Spend", type: "start", value: totalSpend });
  
  baseRecs.forEach(r => {
    steps.push({ label: r.toolName, type: "change", value: -r.monthlySavings, toolId: r.toolId });
  });

  steps.push({ label: "Retail Opt.", type: "end", value: retailOptimized });

  if (credexRec) {
    steps.push({ label: "Credex Credits", type: "change", value: -credexRec.monthlySavings, toolId: "credex" });
    steps.push({ label: "Final Spend", type: "end", value: optimizedSpend });
  }

  const maxVal = totalSpend;
  const height = 240;
  const width = 450;
  const padding = 40;

  const getY = (val: number) => {
    const scale = (height - padding * 2) / maxVal;
    return height - padding - val * scale;
  };

  const chartHeight = height - padding * 2;
  const barWidth = Math.min(30, (width - padding * 2) / steps.length - 10);
  const gap = (width - padding * 2 - (barWidth * steps.length)) / (steps.length - 1);

  // Compute heights & coordinates
  let currentAccumulator = totalSpend;

  return (
    <div className="relative border border-[#1F1F22] rounded-xl bg-[#0A0A0C] p-5 chart-panel-money">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider font-mono">Savings Cost Bridge</h4>
          <p className="text-xs text-gray-600 mt-0.5">Step-by-step audit reductions from current to optimized</p>
        </div>
        <span className="text-[10px] font-mono bg-metallic-green-badge px-2 py-0.5 rounded">Financial Audit</span>
      </div>

      <div className="relative h-[240px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          <defs>
            <linearGradient id="waterfallSavingsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0fdfa" />
              <stop offset="18%" stopColor="#5eead4" />
              <stop offset="45%" stopColor="#14b8a6" />
              <stop offset="72%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
            <linearGradient id="waterfallCredexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="20%" stopColor="#ccfbf1" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="waterfallFinalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="25%" stopColor="#a7f3d0" />
              <stop offset="55%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#065f46" />
            </linearGradient>
            <linearGradient id="waterfallRetailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
          </defs>
          {/* Axis */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1A1A1D" strokeWidth={1.5} />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#1A1A1D" strokeWidth={1.5} />

          {/* Render columns */}
          {steps.map((step, idx) => {
            let x = padding + idx * (barWidth + gap);
            let y = 0;
            let barH = 0;
            let color = "";

            if (step.type === "start") {
              y = getY(step.value);
              barH = getY(0) - y;
              color = "#3F3F46"; // zinc-700
            } else if (step.type === "end") {
              y = getY(step.value);
              barH = getY(0) - y;
              color = step.label.includes("Final") ? "url(#waterfallFinalGrad)" : "url(#waterfallRetailGrad)";
            } else {
              // change
              const prevY = getY(currentAccumulator);
              currentAccumulator += step.value;
              const nextY = getY(currentAccumulator);
              
              y = prevY;
              barH = nextY - prevY; // goes down, so nextY is larger than prevY in SVG coordinate scale
              color = step.toolId === "credex" ? "url(#waterfallCredexGrad)" : "url(#waterfallSavingsGrad)";
            }

            const isHovered = hoveredIdx === idx;

            return (
              <g 
                key={idx} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => step.toolId && onRecClick(step.toolId)}
              >
                {/* Connecting lines between steps */}
                {idx < steps.length - 1 && (
                  <line
                    x1={x + barWidth}
                    y1={step.type === "change" ? getY(currentAccumulator) : y}
                    x2={x + barWidth + gap}
                    y2={step.type === "change" ? getY(currentAccumulator) : y}
                    stroke="#374151"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                )}

                {/* Rectangle bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(2, Math.abs(barH))}
                  fill={color}
                  fillOpacity={isHovered ? 0.95 : 0.75}
                  rx={2}
                  className="transition-all duration-150"
                />

                {/* Small labels below */}
                <text
                  x={x + barWidth / 2}
                  y={height - padding + 15}
                  fill="#6B7280"
                  fontSize={8}
                  textAnchor="middle"
                  transform={`rotate(-25 ${x + barWidth / 2} ${height - padding + 15})`}
                  className="font-mono truncate max-w-[40px]"
                >
                  {step.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIdx !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-1/2 bottom-12 -translate-x-1/2 bg-[#0A0A0C] border border-[#1F1F22] rounded-xl p-3.5 shadow-2xl min-w-[220px] text-xs space-y-1.5"
            >
              <p className="font-bold text-gray-300">{steps[hoveredIdx].label}</p>
              <div className="flex justify-between text-gray-400">
                <span>Value impact:</span>
                <span className={`font-mono font-semibold ${steps[hoveredIdx].type === "change" ? "text-metallic-green" : "text-money-accent"}`}>
                  {steps[hoveredIdx].type === "change"
                    ? `-$${Math.abs(steps[hoveredIdx].value)}/mo`
                    : `$${steps[hoveredIdx].value}/mo`}
                </span>
              </div>
              {steps[hoveredIdx].toolId && steps[hoveredIdx].toolId !== "credex" && (
                <p className="text-xs text-zinc-400 border-t border-[#1F1F22] pt-1.5 mt-1.5 font-light">Click to scroll to detailed logic &rarr;</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// --- Layer 3: Seat Utilization Simulator (Industry-standard slim slider) ---
function SeatUtilizationCard({
  configuredTools,
  onUpdateSeatSavings
}: {
  configuredTools: InputToolState[];
  onUpdateSeatSavings: (totalWasted: number) => void;
}) {
  const seatTools = React.useMemo(() => {
    return configuredTools.filter(t => {
      const pricing = PRICING_DATA[t.toolId];
      const plan = pricing?.plans[t.planId];
      return plan && !plan.isApiDirect && plan.pricePerUserMonth > 0;
    });
  }, [configuredTools]);

  const [activeSeats, setActiveSeats] = useState<Record<string, number>>({});

  useEffect(() => {
    const initial: Record<string, number> = {};
    seatTools.forEach(t => {
      initial[t.toolId] = Math.max(1, Math.round(t.seats * 0.6));
    });
    setActiveSeats(initial);
  }, [seatTools]);

  let totalWastedSpend = 0;
  seatTools.forEach(t => {
    const active = activeSeats[t.toolId] || t.seats;
    const pricing = PRICING_DATA[t.toolId];
    const plan = pricing?.plans[t.planId];
    if (plan) {
      const emptySeats = Math.max(0, t.seats - active);
      totalWastedSpend += emptySeats * plan.pricePerUserMonth;
    }
  });

  useEffect(() => {
    onUpdateSeatSavings(totalWastedSpend);
  }, [activeSeats, totalWastedSpend, onUpdateSeatSavings]);

  const handleSliderChange = (toolId: string, val: number) => {
    setActiveSeats(prev => ({ ...prev, [toolId]: val }));
  };

  if (seatTools.length === 0) return null;

  return (
    <div className="border border-[#1F1F22] rounded-xl bg-[#0A0A0C] p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white">Seat Utilization</h4>
          <p className="text-xs text-gray-500 mt-0.5">Adjust active seats to calculate idle licensing waste</p>
        </div>
        {totalWastedSpend > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500">Idle cost</p>
            <p className="text-base font-mono font-bold text-metallic-green">${totalWastedSpend}<span className="text-gray-500 text-xs font-normal">/mo</span></p>
          </div>
        )}
      </div>

      {/* Tool rows */}
      <div className="space-y-6">
        {seatTools.map(t => {
          const pricing = PRICING_DATA[t.toolId];
          const plan = pricing?.plans[t.planId];
          if (!pricing || !plan) return null;

          const active = activeSeats[t.toolId] ?? t.seats;
          const empty = Math.max(0, t.seats - active);
          const wasted = empty * plan.pricePerUserMonth;
          const activePercent = t.seats > 0 ? (active / t.seats) * 100 : 100;

          return (
            <div key={t.toolId} className="space-y-3">
              {/* Top row: tool name + seat counter */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{pricing.displayName}</span>
                  <span className="text-xs text-gray-500 px-1.5 py-0.5 rounded bg-white/5 border border-white/8">{plan.name}</span>
                </div>
                <div className="text-sm font-mono text-gray-300">
                  <span className="text-white font-semibold">{active}</span>
                  <span className="text-gray-500"> / {t.seats} active</span>
                </div>
              </div>

              {/* Slim custom slider track */}
              <div className="relative h-6 flex items-center">
                {/* Background track */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[4px] rounded-full bg-[#1F1F22]" />
                {/* Active fill */}
                <div
                  className="absolute left-0 top-1/2 -translate-y-1/2 h-[4px] rounded-full metallic-track-fill transition-all duration-100"
                  style={{ width: `${activePercent}%` }}
                />
                {/* Range input overlaid transparently */}
                <input
                  type="range"
                  min={1}
                  max={t.seats}
                  value={active}
                  onChange={(e) => handleSliderChange(t.toolId, parseInt(e.target.value, 10))}
                  className="custom-slider absolute inset-0 w-full opacity-100 cursor-pointer z-10"
                />
              </div>

              {/* Bottom row: utilization bar label + waste badge */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{Math.round(activePercent)}% utilization</span>
                {wasted > 0 ? (
                  <span className="text-xs font-mono text-gray-400 bg-white/5 border border-white/8 px-2 py-0.5 rounded">
                    ${wasted}/mo idle
                  </span>
                ) : (
                  <span className="text-xs font-mono text-gray-400">Fully utilized</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      {totalWastedSpend > 0 && (
        <div className="pt-4 border-t border-[#1F1F22] flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-white font-medium">${totalWastedSpend}/mo in idle seats</p>
            <p className="text-xs text-gray-500 mt-0.5">Based on your active seat estimates. Downgrade unused seats to recover this cost.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Main Named Export for Inline usage in page.tsx ---
export function AuditReportSection({
  auditResults,
  configuredTools,
  teamSize,
  primaryUseCase,
  aiSummary,
  generatingSummary,
  leadCaptured,
  shareUrl,
  exportDialogOpen,
  setExportDialogOpen,
  handleCaptureLead,
  isSubmittingLead,
  email,
  setEmail,
  companyName,
  setCompanyName,
  role,
  setRole,
  newsletterOptIn,
  setNewsletterOptIn,
  websiteVerify,
  setWebsiteVerify,
  leadError,
  leadNotice,
}: {
  auditResults: AuditResult;
  configuredTools: InputToolState[];
  teamSize: number;
  primaryUseCase: string;
  aiSummary: string;
  generatingSummary: boolean;
  leadCaptured: boolean;
  shareUrl: string;
  exportDialogOpen: boolean;
  setExportDialogOpen: (open: boolean) => void;
  handleCaptureLead: (e: React.FormEvent) => void;
  isSubmittingLead: boolean;
  email: string;
  setEmail: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  newsletterOptIn: boolean;
  setNewsletterOptIn: (v: boolean) => void;
  websiteVerify: string;
  setWebsiteVerify: (v: string) => void;
  leadError?: string;
  leadNotice?: string;
}) {
  const [interactiveWastedSpend, setInteractiveWastedSpend] = useState<number>(0);
  const totalSpend = auditResults.totalSpend;
  const monthlySavings = auditResults.potentialMonthlySavings;
  const annualSavings = auditResults.potentialAnnualSavings;
  const optimizedSpend = Math.max(0, totalSpend - monthlySavings);
  const credexSpend = Math.round(optimizedSpend * 0.75); // 25% bulk credit savings
  const efficiencyRate = totalSpend > 0 ? Math.round(((totalSpend - monthlySavings) / totalSpend) * 100) : 100;

  const handleScrollToTool = (toolId: string) => {
    const el = document.getElementById(`breakdown-${toolId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-1", "ring-white/30", "bg-white/5");
      setTimeout(() => {
        el.classList.remove("ring-1", "ring-white/30", "bg-white/5");
      }, 1500);
    }
  };

  return (
    <motion.section
      id="results"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="audit-report-print mt-16 space-y-12 border-t border-[#1A1A1D] pt-16"
    >
      {/* Layer 1 — Summary Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <span className="text-xs font-semibold font-mono tracking-widest uppercase px-3 py-1 rounded-full bg-metallic-green-badge">
          Identified Financial Waste
        </span>
        <h2 className="text-5xl sm:text-7xl font-display font-black tracking-tight text-white leading-none">
          You&apos;re overpaying
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 font-mono font-black text-6xl sm:text-8xl tabular-nums">
          <span className="text-metallic-green">${monthlySavings.toLocaleString()}</span>
          <span className="text-gray-500 text-3xl font-display font-light">/ month</span>
        </div>
        <p className="text-gray-500 font-mono text-base tracking-wide">
          Annual opportunity: <span className="text-money-accent font-semibold">${annualSavings.toLocaleString()}</span>
        </p>
      </div>

      {/* Layer 3 — Graphical Auditing proofs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <CostFrontierGraph
          teamSize={teamSize}
          totalSpend={totalSpend}
          optimizedSpend={optimizedSpend}
          credexSpend={credexSpend}
        />

        <WaterfallGraph
          totalSpend={totalSpend}
          recommendations={auditResults.recommendations}
          optimizedSpend={optimizedSpend}
          onRecClick={handleScrollToTool}
        />

        <SeatUtilizationCard
          configuredTools={configuredTools}
          onUpdateSeatSavings={setInteractiveWastedSpend}
        />

        {/* AI Spend Strategy Review */}
        <div className="p-6 rounded-xl border border-[#1F1F22] bg-[#0A0A0C] space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-[#1F1F22] pb-4">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 font-mono">
                <Sparkles className="w-4 h-4 icon-metallic-green" />
                AI Spend Strategy Review
              </h4>
              <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono font-medium">AI summary</span>
            </div>

            {generatingSummary ? (
              <div className="flex items-center gap-3 py-6 text-gray-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span>Analyzing active stack components...</span>
              </div>
            ) : (
              <p className="text-sm font-light leading-relaxed text-gray-300">
                {aiSummary || "Audit synthesis compiled. Review the recommended stack delta charts and options above."}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Layer 2 — Structured Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 pb-4 border-b border-[#1F1F22]">
          <h3 className="text-lg font-semibold text-white">Software Breakdown</h3>
          <span className="text-sm text-gray-500">Itemized inefficiencies & optimizations</span>
        </div>

        {auditResults.recommendations.filter((r: AuditRecommendation) => r.toolId !== "credex").length === 0 ? (
          <div className="p-8 rounded-xl border border-[#1F1F22] bg-[#0A0A0C] text-center text-gray-500 text-sm">
            No configurations require optimizations. Stack is already at optimal retail pricing.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {auditResults.recommendations.filter((r: AuditRecommendation) => r.toolId !== "credex").map((rec: AuditRecommendation, idx: number) => {
              const currentInput = configuredTools.find(t => t.toolId === rec.toolId);
              const pricing = PRICING_DATA[rec.toolId];
              const paidSeats = currentInput?.seats || 0;
              const paidTotal = currentInput?.monthlySpend || 0;
              const savingsPct = paidTotal > 0 ? Math.round((rec.monthlySavings / paidTotal) * 100) : 0;

              return (
                <div
                  key={`${rec.toolId}-${idx}`}
                  id={`breakdown-${rec.toolId}`}
                  className="p-6 rounded-xl border border-[#1F1F22] bg-[#0A0A0C] hover:border-white/10 transition-all duration-200 space-y-5"
                >
                  {/* Tool Header */}
                  <div className="flex items-start justify-between pb-4 border-b border-[#1F1F22]">
                    <div>
                      <h4 className="text-base font-semibold text-white">{pricing?.displayName || rec.toolName}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 font-mono">{rec.currentPlan} · {paidSeats} seats</p>
                    </div>
                    <span className="text-xs font-mono font-semibold bg-metallic-green-badge px-2 py-1 rounded">
                      -{savingsPct}% cost
                    </span>
                  </div>

                  {/* Financial Delta */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Current spend</p>
                      <p className="text-base font-mono font-semibold text-white">${paidTotal}<span className="text-gray-500 text-xs">/mo</span></p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Target spend</p>
                      <p className="text-base font-mono font-semibold text-money-accent">${paidTotal - rec.monthlySavings}<span className="text-gray-500 text-xs">/mo</span></p>
                    </div>
                  </div>

                  {/* Why Inefficient */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Why inefficient</p>
                    <div className="bg-white/[0.02] border border-[#1F1F22] p-3.5 rounded-lg text-sm text-gray-300 leading-relaxed font-light">
                      {rec.reason}
                    </div>
                  </div>

                  {/* Recommended action */}
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Optimization strategy</p>
                    <div className="bg-white/[0.02] border border-[#1F1F22] p-3.5 rounded-lg text-sm text-gray-200 font-medium leading-relaxed">
                      {rec.recommendedAction}
                    </div>
                  </div>

                  {/* Savings footer */}
                  <div className="pt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-500 font-mono">Monthly savings</span>
                    <span className="font-mono text-metallic-green font-semibold text-base">+${rec.monthlySavings}<span className="text-gray-500 text-xs">/mo</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alternative suggestion panel */}
      <div className="p-6 rounded-xl border border-[#1F1F22] bg-[#0A0A0C] space-y-5">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-gray-400" />
          Architecture Suggestions
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-white">Claude Pro vs. ChatGPT Plus</h5>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Running dual LLM subscriptions for similar use cases adds $240/user/year. Consolidate by use case: one model for coding, one for writing.
            </p>
          </div>
          <div className="space-y-2">
            <h5 className="text-sm font-semibold text-white">Implement Prompt Caching</h5>
            <p className="text-sm text-gray-400 font-light leading-relaxed">
              Teams spending $200+/mo on API keys can reduce input token costs by up to 50% by routing calls through prompt-caching middleware.
            </p>
          </div>
        </div>
      </div>

      {/* GTM Save report & Credex CTA (Conversion UI) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-[#1A1A1D]">
        
        {/* Email Capture (Quiet, High trust) */}
        <div className="space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-lg font-display font-bold text-white">Save this optimization board</h3>
            <p className="text-xs text-gray-400 leading-normal">
              Enter your corporate email to receive a detailed breakdown, alternative architectures, and automated pricing alerts.
            </p>
          </div>

          <div>
            {leadError && !leadCaptured && (
              <p className="text-xs text-red-400 mb-2" role="alert">
                {leadError}
              </p>
            )}

            {leadCaptured ? (
              <div className="rounded-xl border border-[#1F1F22] bg-[#0A0A0C] p-4 text-center text-sm space-y-2">
                <Check className="w-5 h-5 text-white mx-auto" />
                <p className="font-bold text-white">Audit report saved.</p>
                {leadNotice && (
                  <p className="text-xs text-gray-400 leading-relaxed">{leadNotice}</p>
                )}
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="text-xs font-semibold text-white underline underline-offset-2 hover:text-gray-300"
                >
                  Print / Save as PDF
                </button>
                <div className="flex gap-2 items-center bg-[#000000] p-2 rounded border border-[#1F1F22] mt-2">
                  <input type="text" readOnly value={shareUrl} className="flex-grow bg-transparent text-xs font-mono text-gray-400 outline-none border-none" />
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(shareUrl);
                      alert("Copied to clipboard!");
                    }}
                    className="text-xs font-bold text-white hover:text-gray-300 px-2 py-1 bg-white/5 border border-white/10 rounded"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCaptureLead} className="space-y-3 no-print">
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
                  <input
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-[#1F1F22] bg-[#0A0A0C] px-4 py-3 text-sm text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full rounded-xl border border-[#1F1F22] bg-[#0A0A0C] px-4 py-3 text-sm text-white"
                  />
                  <input
                    type="text"
                    placeholder="CTO / Tech Lead"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-[#1F1F22] bg-[#0A0A0C] px-4 py-3 text-sm text-white"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1.5">
                  <input
                    type="checkbox"
                    id="opt-in-client"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="mt-0.5"
                  />
                  <label htmlFor="opt-in-client" className="text-xs text-gray-500 leading-normal">
                    Subscribe to quarterly AI spend index reports & discounts.
                  </label>
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmittingLead} 
                  className="w-full bg-white hover:bg-zinc-150 text-black py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 border-none"
                >
                  {isSubmittingLead ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>Saving report...</span>
                    </>
                  ) : (
                    <>
                      <span>Get PDF & public share URL</span>
                      <Share2 className="w-4 h-4 text-black" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Conversion UI (Subtle, professional) */}
        <div className="border border-[#1F1F22] bg-[#0A0A0C] rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 text-[9px] font-bold uppercase tracking-wider font-mono">
              <Zap className="w-3 h-3 text-white" />
              Credex Bulk Licensing
            </div>
            <h4 className="text-lg font-display font-bold text-white">Capture credits discounts directly</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-light">
              For teams spending over $500/mo, Credex sources bulk pre-paid credits to slash API and editor licensing expenses by up to 25%. Tap direct enterprise-grade discounts without changing tools or configuration.
            </p>
          </div>

          <a
            href="https://credex.ai"
            target="_blank"
            rel="noreferrer"
            className="w-full py-3 bg-white hover:bg-gray-100 text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Talk to a Credex AI Expert</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

      </div>
    </motion.section>
  );
}

// --- Default export matching page imports ---
export default function AuditReportClient(props: any) {
  const [aiSummary, setAiSummary] = useState<string>("");
  const [generatingSummary, setGeneratingSummary] = useState<boolean>(true);

  const [leadCaptured, setLeadCaptured] = useState<boolean>(false);
  const [exportDialogOpen, setExportDialogOpen] = useState<boolean>(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(true);
  const [websiteVerify, setWebsiteVerify] = useState<string>("");

  const host = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = `${host}/${props.auditSlug}`;

  useEffect(() => {
    const fetchSummary = async () => {
      setGeneratingSummary(true);
      try {
        const summaryRes = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditResult: props.auditResults,
            teamSize: props.teamSize,
            primaryUseCase: props.primaryUseCase,
          }),
        });
        const summaryData = await summaryRes.json();
        setAiSummary(summaryData.summary);
      } catch (err) {
        console.error("Failed to generate AI summary:", err);
        setAiSummary("Unable to connect to Gemini. Using static results.");
      } finally {
        setGeneratingSummary(false);
      }
    };
    fetchSummary();
  }, [props.auditResults, props.teamSize, props.primaryUseCase]);

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
          auditSlug: props.auditSlug,
          websiteVerify,
        }),
      });

      if (res.ok) {
        setLeadCaptured(true);
        setExportDialogOpen(false);
      }
    } catch (err) {
      console.error("Failed to capture lead:", err);
    } finally {
      setIsSubmittingLead(false);
    }
  };

  return (
    <AuditReportSection
      auditResults={props.auditResults}
      configuredTools={props.configuredTools}
      teamSize={props.teamSize}
      primaryUseCase={props.primaryUseCase}
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
    />
  );
}
