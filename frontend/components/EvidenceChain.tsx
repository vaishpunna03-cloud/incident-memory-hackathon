"use client";

import React, { useState } from "react";
import { EvidenceChainStep, WhyFactor } from "@/lib/types";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  GitCommit,
  Activity,
  Brain,
  Sliders,
  XCircle,
  CheckCircle,
  ArrowDown
} from "lucide-react";

interface EvidenceChainProps {
  steps: EvidenceChainStep[];
  whyFactors: WhyFactor[];
}

export function EvidenceChain({ steps, whyFactors }: EvidenceChainProps) {
  const [showWhy, setShowWhy] = useState(false);

  const getStepIcon = (iconName?: string, type?: string) => {
    switch (iconName) {
      case "alert-circle":
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case "git-commit":
        return <GitCommit className="w-3.5 h-3.5 text-cyan-400" />;
      case "activity":
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case "brain":
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      case "sliders":
        return <Sliders className="w-3.5 h-3.5 text-blue-400" />;
      case "x-circle":
        return <XCircle className="w-3.5 h-3.5 text-rose-400" />;
      case "check-circle":
        return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "current":
        return "border-cyan-500/30 bg-cyan-950/20 text-cyan-300";
      case "historical":
        return "border-purple-500/30 bg-purple-950/20 text-purple-300";
      case "synthesis":
        return "border-emerald-500/30 bg-emerald-950/20 text-emerald-300";
      case "conclusion":
        return "border-amber-500/30 bg-amber-950/20 text-amber-300";
      default:
        return "border-slate-800 bg-slate-900/50 text-slate-300";
    }
  };

  return (
    <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <span>Root-Cause Evidence Chain</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Step-by-step verifiable synthesis of telemetry metrics with operational memory.
          </p>
        </div>

        <button
          onClick={() => setShowWhy(!showWhy)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Why? (Decision Factors)</span>
          {showWhy ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Why Factors Drawer */}
      {showWhy && (
        <div className="mb-4 p-3.5 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-xs space-y-2 animate-in fade-in duration-200">
          <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Operational Decision Factors (Audited Logic)
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
            {whyFactors && whyFactors.map((wf, idx) => (
              <div key={idx} className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-200">{wf.factor}</span>
                  <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 font-mono text-[9px] border border-cyan-800/40">
                    {wf.weight}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{wf.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Flow Diagram */}
      <div className="space-y-2">
        {steps.map((step, idx) => (
          <div key={step.step_id || idx}>
            <div
              className={`p-3 rounded-md border flex items-start gap-3 transition-all ${getTypeStyle(
                step.evidence_type
              )}`}
            >
              <div className="p-1.5 rounded-md bg-slate-950/60 border border-slate-800 shrink-0 mt-0.5">
                {getStepIcon(step.icon, step.evidence_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold tracking-wide font-mono">
                    {step.step_id}. {step.title}
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800/80 text-slate-400">
                    {step.evidence_type}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1 leading-snug">
                  {step.description}
                </div>
                {step.details && (
                  <div className="text-[11px] text-slate-400 font-mono mt-1 pt-1 border-t border-slate-800/40">
                    ↳ {step.details}
                  </div>
                )}
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex justify-center py-0.5 text-slate-600">
                <ArrowDown className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
