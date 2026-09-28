"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";
import {
  Sparkles,
  Brain,
  CheckCircle2,
  XCircle,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  Server,
  Terminal,
  Activity,
  Check,
  Loader2
} from "lucide-react";
import { EvidenceComparison } from "@/components/EvidenceComparison";
import { EvidenceChain } from "@/components/EvidenceChain";

export default function DemoPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [step1Resolved, setStep1Resolved] = useState(false);
  const [step2Investigating, setStep2Investigating] = useState(false);
  const [step2Investigation, setStep2Investigation] = useState<any>(null);

  // Before vs After side-by-side states
  const [beforeData, setBeforeData] = useState<any>(null);
  const [afterData, setAfterData] = useState<any>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const handleResolveAndRemember = async () => {
    setStep1Resolved(true);
  };

  const handleInvestigateStep2 = async () => {
    setStep2Investigating(true);
    try {
      const data = await api.getDemoAfter();
      setStep2Investigation(data.investigation);
      setStep(2);
    } catch (err: any) {
      alert("Error investigating step 2: " + err.message);
    } finally {
      setStep2Investigating(false);
    }
  };

  const loadSideBySide = async () => {
    setLoadingComparison(true);
    try {
      const [before, after] = await Promise.all([
        api.getDemoBefore(),
        api.getDemoAfter()
      ]);
      setBeforeData(before);
      setAfterData(after);
    } catch (err: any) {
      alert("Failed loading comparison: " + err.message);
    } finally {
      setLoadingComparison(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Title & Hackathon Judge Hero */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-purple-950/40 via-[#0e1424] to-cyan-950/40 border border-purple-800/40 shadow-xl space-y-3 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>JUDGE INTERACTIVE DEMONSTRATION</span>
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
              3-MINUTE STORY
            </span>
          </div>

          <button
            onClick={() => {
              setStep(1);
              setStep1Resolved(false);
              setStep2Investigation(null);
            }}
            className="flex items-center gap-1 text-xs font-mono text-slate-400 hover:text-slate-200"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo State</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-100">
          MEMORY CHANGES THE INVESTIGATION
        </h1>
        <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Watch how Hindsight memory transforms the agent's behavior between repeated incidents.
          Without memory, engineers repeat failed pod restarts and waste 45 minutes on trial-and-error.
          With Hindsight memory, the agent recalls past mistakes and targets configuration diffs in seconds.
        </p>
      </div>

      {/* STAGES STEPPER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div
          className={`p-4 rounded-lg border transition-all ${
            step === 1
              ? "bg-[#0f172a] border-purple-500/60 shadow-lg shadow-purple-950/40"
              : "bg-slate-900/40 border-slate-800 opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-purple-400 text-sm">STAGE 1: FIRST INCIDENT</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
              INC-071
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            New failure mode in payment-api. Team troubleshoots, discovers configuration root cause, and resolves.
          </p>
        </div>

        <div
          className={`p-4 rounded-lg border transition-all ${
            step === 2
              ? "bg-[#0f172a] border-cyan-500/60 shadow-lg shadow-cyan-950/40"
              : "bg-slate-900/40 border-slate-800 opacity-80"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-cyan-400 text-sm">STAGE 2: SECOND SIMILAR INCIDENT</span>
            <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] border border-slate-800">
              INC-104
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Weeks later, similar connection failure recurs. Agent recalls INC-071 memory and alters investigation.
          </p>
        </div>
      </div>

      {/* STAGE 1 CONTENT: INC-071 */}
      {step === 1 && (
        <div className="p-6 rounded-xl bg-[#0c1220] border border-slate-800 space-y-5 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-sm">
                <span className="font-bold text-purple-400">INC-071</span>
                <span className="text-slate-400">• payment-api</span>
                <span className="px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[10px] border border-rose-800/40">
                  Critical
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-1">
                Database connection pool exhausted
              </h3>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Deployment: <span className="text-cyan-300">v1.8.2</span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs space-y-2 font-mono text-[11px]">
            <div className="text-slate-400 font-bold uppercase text-[10px]">
              Initial Investigation Findings (First Time Incident):
            </div>
            <div className="text-slate-300">
              • Database connections saturated immediately after deployment v1.8.2 rollout.
            </div>
            <div className="text-rose-300 flex items-start gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>
                <strong>What Failed:</strong> On-call restarted the service pods alone. Exhaustion recurred in 3 minutes because root cause was configuration.
              </span>
            </div>
            <div className="text-emerald-300 flex items-start gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>What Worked:</strong> Reverted idle pool configuration parameters and deployed corrected settings.
              </span>
            </div>
          </div>

          {!step1Resolved ? (
            <div className="flex justify-end pt-2">
              <button
                onClick={handleResolveAndRemember}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-950 transition-all cursor-pointer"
              >
                <Brain className="w-4 h-4" />
                <span>RESOLVE & RETAIN IN HINDSIGHT</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-1 text-xs">
                <div className="font-bold flex items-center gap-2 text-sm text-emerald-300 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>KNOWLEDGE EXTRACTED & HINDSIGHT MEMORY RETAINED</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-[11px] font-mono text-emerald-200/90">
                  <div>✓ Root Cause: Connection-pool config change</div>
                  <div>✓ Successful Fix: Reverted configuration</div>
                  <div>✓ What Failed: Pod restart alone</div>
                  <div>✓ Lesson: Check config diff before scaling</div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs text-slate-400">
                  Ready to test how the agent handles a similar incident weeks later?
                </span>
                <button
                  onClick={handleInvestigateStep2}
                  disabled={step2Investigating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950 transition-all cursor-pointer"
                >
                  {step2Investigating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>STEP 2: TRIGGER INC-104 (SIMILAR INCIDENT)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STAGE 2 CONTENT: INC-104 WITH MEMORY */}
      {step === 2 && step2Investigation && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-6 rounded-xl bg-[#0c1220] border border-cyan-800/40 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-900/40 pb-3">
              <div>
                <div className="flex items-center gap-2 font-mono text-sm">
                  <span className="font-bold text-cyan-400">INC-104</span>
                  <span className="text-slate-400">• payment-api</span>
                  <span className="px-2 py-0.5 rounded bg-orange-950/60 text-orange-300 text-[10px] border border-orange-800/40">
                    High
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-100 mt-1">
                  Database connection timeout in payment gateway
                </h3>
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                Deployment: <span className="text-cyan-300">v2.1.0</span> (Commit a4f89d1)
              </div>
            </div>

            {/* Recalled Memory Highlight Banner */}
            <div className="p-4 rounded-lg bg-purple-950/30 border border-purple-800/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-xs font-bold text-purple-300">
                  <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
                  <span>HINDSIGHT OPERATIONAL PRECEDENT RECALLED: INC-071</span>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">
                  87.0% Historical Relevance
                </span>
              </div>
              <p className="text-xs text-purple-200/90 leading-relaxed">
                "Historical evidence suggests a connection configuration mismatch following deployment v2.1.0, resembling INC-071. Avoid restarting the service alone as INC-071 confirmed recurrence within minutes."
              </p>
            </div>

            {/* Evidence Comparison */}
            <EvidenceComparison
              currentEvidence={step2Investigation.current_evidence}
              historicalMatches={step2Investigation.historical_matches}
              memoryUsed={true}
            />

            {/* Evidence Chain */}
            <EvidenceChain
              steps={step2Investigation.evidence_chain}
              whyFactors={step2Investigation.why_factors}
            />
          </div>
        </div>
      )}

      {/* SECTION 22: THE MEMORY DIFFERENCE (BEFORE VS AFTER SIDE-BY-SIDE) */}
      <div className="p-6 rounded-xl bg-[#0a0f1d] border border-slate-800 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider block">
              THE CENTERPIECE OF THE SYSTEM
            </span>
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              THE MEMORY DIFFERENCE
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Side-by-side contrast of incident investigation with and without Hindsight memory.
            </p>
          </div>

          <button
            onClick={loadSideBySide}
            disabled={loadingComparison}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-cyan-300 border border-cyan-800/40 transition-all cursor-pointer"
          >
            {loadingComparison ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>Refresh Before / After Matrix</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* COLUMN 1: WITHOUT MEMORY */}
          <div className="p-5 rounded-xl bg-rose-950/10 border border-rose-900/30 space-y-4">
            <div className="flex items-center justify-between border-b border-rose-900/40 pb-3">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase font-mono block">
                  WITHOUT MEMORY
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Generic Isolated Triage</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 text-[10px] font-mono border border-rose-800">
                MTTR ~ 45-60 MIN
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">
                  Behavior & Approach
                </span>
                <p className="text-slate-300">
                  Agent analyzes only raw telemetry string with zero memory of previous deployment defects.
                </p>
              </div>

              <div className="p-3 rounded bg-rose-950/20 border border-rose-800/30 space-y-1">
                <span className="text-rose-400 text-[10px] uppercase font-mono font-bold flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" /> High-Risk Mistake Repeated
                </span>
                <p className="text-rose-200">
                  Runbook suggests restarting the application pod. Connections clear temporarily, giving false confidence before saturating again.
                </p>
              </div>

              <div className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-mono font-bold block">
                  Root Cause Discovery
                </span>
                <p className="text-slate-300">
                  Relies on manual DBA escalation and ad-hoc log digging to discover pool configuration errors.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMN 2: WITH HINDSIGHT MEMORY */}
          <div className="p-5 rounded-xl bg-purple-950/10 border border-cyan-800/40 space-y-4 shadow-lg shadow-cyan-950/20">
            <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase font-mono block">
                  WITH HINDSIGHT MEMORY
                </span>
                <span className="text-[10px] text-purple-300 font-mono">Contextual SRE Intelligence</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] font-mono border border-cyan-800">
                MTTR ~ 5-10 MIN
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded bg-purple-950/20 border border-purple-800/40 space-y-1">
                <span className="text-purple-300 text-[10px] uppercase font-mono font-bold block">
                  Historical Incident Recalled
                </span>
                <p className="text-purple-100">
                  Correlates error with INC-071 (87% relevance) and highlights identical connection exhaustion pattern.
                </p>
              </div>

              <div className="p-3 rounded bg-emerald-950/20 border border-emerald-800/40 space-y-1">
                <span className="text-emerald-400 text-[10px] uppercase font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Previous Failed Attempt Avoided
                </span>
                <p className="text-emerald-100">
                  Explicitly warns: <em>"Do not restart service alone—INC-071 proved exhaustion recurs in 3 minutes."</em>
                </p>
              </div>

              <div className="p-3 rounded bg-cyan-950/20 border border-cyan-800/40 space-y-1">
                <span className="text-cyan-400 text-[10px] uppercase font-mono font-bold block">
                  Targeted Root Cause Remediation
                </span>
                <p className="text-cyan-100">
                  Directs on-call straight to configuration diff in deployment v2.1.0 and provides verification queries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
