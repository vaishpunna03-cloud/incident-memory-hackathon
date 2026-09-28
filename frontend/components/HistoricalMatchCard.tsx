"use client";

import React, { useState } from "react";
import { HistoricalMatch } from "@/lib/types";
import { Brain, CheckCircle, XCircle, ChevronDown, ChevronUp, BookOpen, Clock } from "lucide-react";

interface HistoricalMatchCardProps {
  match: HistoricalMatch;
}

export function HistoricalMatchCard({ match }: HistoricalMatchCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-[#0e1322] border border-purple-800/40 p-4 space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-900/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-purple-500/20 text-purple-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-purple-300">
                {match.incident_id}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {match.service_id}
              </span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {match.date}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Original Error: <span className="font-mono text-slate-300">"{match.original_error}"</span>
            </div>
          </div>
        </div>

        {/* Historical Relevance Badge */}
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">Historical relevance:</span>
            <span className="font-mono text-base font-bold text-purple-400">
              {match.relevance_score}%
            </span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono block">
            Advisory pattern (Not certainty)
          </span>
        </div>
      </div>

      {/* Similarity Factors Breakdown (Section 12) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px]">Service Match</div>
          <div className="text-slate-200 font-bold mt-0.5">{match.factors.service_match}%</div>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px]">Error Similarity</div>
          <div className="text-purple-300 font-bold mt-0.5">{match.factors.error_similarity}%</div>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px]">Deployment Context</div>
          <div className="text-slate-200 font-bold mt-0.5">{match.factors.deployment_context}%</div>
        </div>
        <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
          <div className="text-slate-400 text-[10px]">Failure Pattern</div>
          <div className="text-cyan-300 font-bold mt-0.5">{match.factors.failure_pattern}%</div>
        </div>
      </div>

      {/* Retrieval Reason */}
      <div className="text-[11px] text-slate-400 italic bg-purple-950/20 p-2 rounded border border-purple-900/30">
        {match.retrieval_reason}
      </div>

      {/* Root Cause & Fix Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
        <div className="p-3 rounded bg-slate-950/40 border border-slate-800 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-purple-400 font-semibold block">
            Previous Root Cause
          </span>
          <p className="text-slate-200 text-[11px] leading-relaxed">{match.root_cause}</p>
        </div>

        <div className="p-3 rounded bg-emerald-950/20 border border-emerald-800/30 space-y-1">
          <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" /> What Worked Before
          </span>
          <p className="text-emerald-200 text-[11px] leading-relaxed">{match.successful_fix}</p>
        </div>
      </div>

      {/* Expandable Details: Failed attempts, lessons learned, runbook */}
      {expanded ? (
        <div className="pt-2 space-y-2 border-t border-slate-800/60 text-xs animate-in fade-in">
          {match.failed_attempt && (
            <div className="p-2.5 rounded bg-rose-950/20 border border-rose-800/30">
              <span className="text-[10px] uppercase font-mono text-rose-400 font-semibold flex items-center gap-1.5 mb-0.5">
                <XCircle className="w-3.5 h-3.5" /> What Failed (Learned Avoidance)
              </span>
              <p className="text-rose-200 text-[11px]">{match.failed_attempt}</p>
            </div>
          )}

          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
            <span className="font-semibold text-slate-200 block mb-0.5">💡 Lesson Learned:</span>
            {match.lesson_learned}
          </div>

          {match.runbook_step && (
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Runbook verification: {match.runbook_step}</span>
            </div>
          )}
        </div>
      ) : null}

      <div className="flex justify-end pt-1">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all"
        >
          {expanded ? "Show less historical context" : "Show full postmortem context & runbook"}
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>
    </div>
  );
}
