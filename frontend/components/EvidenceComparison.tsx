"use client";

import React from "react";
import { HistoricalMatch } from "@/lib/types";
import { CheckCircle2, AlertCircle, Brain, Terminal, ShieldAlert } from "lucide-react";

interface EvidenceComparisonProps {
  currentEvidence: string[];
  historicalMatches: HistoricalMatch[];
  memoryUsed: boolean;
}

export function EvidenceComparison({
  currentEvidence,
  historicalMatches,
  memoryUsed
}: EvidenceComparisonProps) {
  const topMatch = historicalMatches && historicalMatches.length > 0 ? historicalMatches[0] : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>Telemetry & Memory Separation</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
          STRICT SRE SAFETY PROTOCOL
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PANEL 1: CURRENT EVIDENCE */}
        <div className="rounded-lg bg-[#0c1220] border border-cyan-800/40 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3 border-b border-cyan-900/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold font-mono text-cyan-300 tracking-wide">
                CURRENT EVIDENCE (LIVE TELEMETRY)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
              ACTIVE TRACES
            </span>
          </div>

          <ul className="space-y-2">
            {currentEvidence && currentEvidence.length > 0 ? (
              currentEvidence.map((ev, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span className="font-mono text-[11px] leading-relaxed">{ev}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-500 italic">No current telemetry stream available</li>
            )}
          </ul>
        </div>

        {/* PANEL 2: HISTORICAL MEMORY (NOT CURRENT EVIDENCE) */}
        <div className="rounded-lg bg-[#110e1e] border border-purple-800/40 p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3 border-b border-purple-900/40 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded bg-purple-500/20 text-purple-400">
                <Brain className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold font-mono text-purple-300 tracking-wide block">
                  HISTORICAL MEMORY
                </span>
                <span className="text-[9px] font-mono text-amber-400 font-semibold uppercase">
                  NOT CURRENT EVIDENCE
                </span>
              </div>
            </div>
            {topMatch && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                RECALL: {topMatch.incident_id}
              </span>
            )}
          </div>

          {topMatch ? (
            <div className="space-y-2.5 text-xs">
              <div className="p-2 rounded bg-purple-950/30 border border-purple-800/30 text-[11px] text-purple-200">
                <span className="font-semibold text-purple-300 block mb-0.5">🧠 Historical Precedent:</span>
                "{topMatch.original_error}"
              </div>

              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex items-start gap-2 text-slate-300">
                  <span className="text-purple-400 font-bold">✓</span>
                  <span><strong>Previous Root Cause:</strong> {topMatch.root_cause}</span>
                </div>
                <div className="flex items-start gap-2 text-emerald-300">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span><strong>What Worked:</strong> {topMatch.successful_fix}</span>
                </div>
                {topMatch.failed_attempt && (
                  <div className="flex items-start gap-2 text-rose-300">
                    <span className="text-rose-400 font-bold">✗</span>
                    <span><strong>What Failed:</strong> {topMatch.failed_attempt}</span>
                  </div>
                )}
              </div>

              {/* Advisory Safety Disclaimer */}
              <div className="mt-3 p-2 rounded bg-amber-950/20 border border-amber-800/30 flex items-start gap-2 text-[10px] text-amber-300/90 leading-tight">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  <strong>Advisory Note:</strong> Historical memory suggests potential recurrence patterns. It does not prove the current root cause. Verify active configuration before applying past fixes.
                </span>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 italic">
              No matching historical precedent retrieved. Operating in isolated triage mode.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
