"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Incident, Investigation, Postmortem } from "@/lib/types";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { EvidenceComparison } from "@/components/EvidenceComparison";
import { EvidenceChain } from "@/components/EvidenceChain";
import { HistoricalMatchCard } from "@/components/HistoricalMatchCard";
import { Timeline } from "@/components/Timeline";
import { ResolveModal } from "@/components/ResolveModal";
import { PostmortemModal } from "@/components/PostmortemModal";
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Server,
  GitCommit,
  CheckCircle,
  Clock,
  Sparkles,
  FileText,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Cpu,
  Layers
} from "lucide-react";

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const incidentId = params.id as string;

  const [incident, setIncident] = useState<Incident | null>(null);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [reInvestigating, setReInvestigating] = useState(false);

  // Modals
  const [resolveOpen, setResolveOpen] = useState(false);
  const [postmortemOpen, setPostmortemOpen] = useState(false);
  const [activePostmortem, setActivePostmortem] = useState<Postmortem | null>(null);

  useEffect(() => {
    loadIncident();
  }, [incidentId]);

  const loadIncident = async () => {
    setLoading(true);
    try {
      const data = await api.getIncident(incidentId);
      setIncident(data);

      if (data.latest_investigation) {
        setInvestigation(data.latest_investigation);
      } else {
        // Trigger investigation automatically if none exists yet
        const inv = await api.investigateIncident(incidentId, true);
        setInvestigation(inv);
      }
    } catch (err) {
      console.error("Failed to load incident detail", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReInvestigate = async (useMemory: boolean) => {
    setReInvestigating(true);
    try {
      const inv = await api.investigateIncident(incidentId, useMemory);
      setInvestigation(inv);
      // Reload incident to get new timeline events
      const updated = await api.getIncident(incidentId);
      setIncident(updated);
    } catch (err: any) {
      alert("Failed re-investigating: " + err.message);
    } finally {
      setReInvestigating(false);
    }
  };

  const handleGeneratePostmortem = async () => {
    try {
      const pm = await api.generatePostmortem(incidentId, "SRE Lead Investigator");
      setActivePostmortem(pm);
      setPostmortemOpen(true);
    } catch (err: any) {
      alert("Failed generating postmortem: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3 font-mono text-xs text-slate-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
        <div>Connecting to SRE telemetry streams & Hindsight memory...</div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="py-16 text-center text-slate-400 text-xs">
        Incident not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. CURRENT INCIDENT HEADER CONSOLE (Section 9) */}
      <div className="p-5 rounded-xl bg-[#0c1220] border border-slate-800/90 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-lg font-bold text-cyan-400">
              {incident.id}
            </span>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
          </div>

          <div className="flex items-center gap-2">
            {/* Re-investigate toggles */}
            <button
              onClick={() => handleReInvestigate(true)}
              disabled={reInvestigating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 text-xs font-mono transition-all"
            >
              <Brain className={`w-3.5 h-3.5 ${reInvestigating ? "animate-spin" : ""}`} />
              <span>Investigate (With Memory)</span>
            </button>

            <button
              onClick={() => handleReInvestigate(false)}
              disabled={reInvestigating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-mono border border-slate-800 transition-all"
            >
              <span>Investigate (Without Memory)</span>
            </button>

            {/* Resolve button */}
            {incident.status !== "resolved" ? (
              <button
                onClick={() => setResolveOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>RESOLVE INCIDENT</span>
              </button>
            ) : (
              <button
                onClick={handleGeneratePostmortem}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>VIEW POSTMORTEM</span>
              </button>
            )}
          </div>
        </div>

        {/* Incident Summary Metadata */}
        <div>
          <h2 className="text-base font-bold text-slate-100">{incident.title}</h2>
          <div className="mt-1 p-2.5 rounded bg-slate-950/80 border border-slate-800 font-mono text-xs text-rose-300">
            Error: {incident.error_message}
          </div>
          {incident.description && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">{incident.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/60 font-mono text-[11px] text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px]">SERVICE</span>
            <span className="text-slate-200">{incident.service_id}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ENVIRONMENT</span>
            <span className="text-slate-200">{incident.environment}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">DEPLOYMENT</span>
            <span className="text-cyan-300">{incident.deployment_version || "N/A"} ({incident.deployment_commit || "HEAD"})</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">TIMESTAMP</span>
            <span className="text-slate-200">{new Date(incident.created_at).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 2. CURRENT EVIDENCE VS HISTORICAL MEMORY (Section 11 Mandatory Feature) */}
      {investigation && (
        <EvidenceComparison
          currentEvidence={investigation.current_evidence}
          historicalMatches={investigation.historical_matches}
          memoryUsed={investigation.memory_used}
        />
      )}

      {/* 3. ROOT CAUSE EVIDENCE CHAIN (Section 10) */}
      {investigation && investigation.evidence_chain && (
        <EvidenceChain
          steps={investigation.evidence_chain}
          whyFactors={investigation.why_factors}
        />
      )}

      {/* 4. AI INVESTIGATION SYNTHESIS CARD (Section 9) */}
      {investigation && (
        <div className="p-5 rounded-xl bg-[#0c1220] border border-cyan-800/40 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-900/40 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-cyan-300">
                AI Investigation & Synthesis
              </h3>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-slate-400">Confidence:</span>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 font-bold">
                {investigation.confidence}
              </span>
              {investigation.memory_used && (
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40 font-bold">
                  HINDSIGHT MEMORY ASSISTED
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block">
              Incident Summary
            </span>
            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded border border-slate-800/80">
              {investigation.summary}
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold text-amber-400 block">
              Likely Root Cause
            </span>
            <p className="text-xs text-amber-100 font-medium leading-relaxed">
              {investigation.likely_root_cause}
            </p>
          </div>

          {/* Action Recommendations: What to do & What to avoid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
            {/* Recommended Steps */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-cyan-400 block">
                Recommended Remediation Steps
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {investigation.recommended_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">→</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Verification Steps */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 block">
                Verification Steps
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {investigation.verification_steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Risks & Unknowns */}
          {investigation.risk_unknowns && investigation.risk_unknowns.length > 0 && (
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/30 text-xs">
              <span className="text-[10px] uppercase font-mono font-bold text-rose-400 flex items-center gap-1.5 mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> Operational Risks & Unknowns
              </span>
              <ul className="space-y-1 text-rose-200 text-[11px]">
                {investigation.risk_unknowns.map((risk, idx) => (
                  <li key={idx}>• {risk}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Prevention Recommendations (Section 19) */}
          <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-800/30 space-y-2">
            <span className="text-[10px] uppercase font-mono font-bold text-blue-400 block">
              How Can We Prevent This Again? (Future Hardening)
            </span>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              {investigation.prevention_recommendations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">#</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 5. HISTORICAL MEMORY RECALLED CARDS (Section 12 & 13) */}
      {investigation && investigation.historical_matches && investigation.historical_matches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span>Correlated Historical Memories ({investigation.historical_matches.length})</span>
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">
              Recalled via semantic & multi-factor similarity
            </span>
          </div>

          <div className="space-y-3">
            {investigation.historical_matches.map((match) => (
              <HistoricalMatchCard key={match.incident_id} match={match} />
            ))}
          </div>
        </div>
      )}

      {/* 6. AUDIT TIMELINE (Section 16) */}
      <div className="p-5 rounded-xl bg-[#0c1220] border border-slate-800/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Incident Audit Timeline
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            {incident.events?.length || 0} events recorded
          </span>
        </div>

        <Timeline events={incident.events || []} />
      </div>

      {/* Modals */}
      <ResolveModal
        incidentId={incident.id}
        serviceId={incident.service_id}
        defaultRootCause={investigation?.likely_root_cause || ""}
        defaultFix={investigation?.what_worked_before?.[0] || ""}
        isOpen={resolveOpen}
        onClose={() => setResolveOpen(false)}
        onSuccess={() => {
          setResolveOpen(false);
          loadIncident();
        }}
      />

      <PostmortemModal
        postmortem={activePostmortem}
        isOpen={postmortemOpen}
        onClose={() => setPostmortemOpen(false)}
      />
    </div>
  );
}
