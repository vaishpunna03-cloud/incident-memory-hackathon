"use client";

import React, { useState } from "react";
import { CheckCircle2, X, Brain, Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface ResolveModalProps {
  incidentId: string;
  serviceId: string;
  defaultRootCause?: string;
  defaultFix?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ResolveModal({
  incidentId,
  serviceId,
  defaultRootCause = "",
  defaultFix = "",
  isOpen,
  onClose,
  onSuccess
}: ResolveModalProps) {
  const [rootCause, setRootCause] = useState(defaultRootCause);
  const [fixApplied, setFixApplied] = useState(defaultFix);
  const [result, setResult] = useState("Successfully Resolved");
  const [lessonsLearned, setLessonsLearned] = useState("");
  const [failedAttempts, setFailedAttempts] = useState("");
  const [loading, setLoading] = useState(false);
  const [retainedData, setRetainedData] = useState<any>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.resolveIncident(incidentId, {
        root_cause: rootCause,
        fix_applied: fixApplied,
        result: result,
        lessons_learned: lessonsLearned || "Always verify configuration diff before scaling or restarting pods.",
        failed_attempts: failedAttempts || "Restarting the service alone without changing configuration."
      });

      // Show Retained Memory preview
      setRetainedData({
        rootCause,
        fixApplied,
        failedAttempts: failedAttempts || "Restarting service alone",
        lessonsLearned: lessonsLearned || "Verify configuration changes before restarts.",
        serviceId
      });

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      alert("Error resolving incident: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl bg-[#0d1322] border border-slate-700/80 shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold tracking-wide">
              Resolve Incident & Retain Memory
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {retainedData ? (
          <div className="py-6 space-y-4 animate-in fade-in">
            <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 text-center space-y-1">
              <Sparkles className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
              <div className="font-bold text-sm">INCIDENT RESOLVED & KNOWLEDGE RETAINED</div>
              <p className="text-xs text-emerald-300/90">
                Operational lesson successfully written into Hindsight long-term memory!
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="font-mono text-[11px] font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> MEMORY RETAINED IN HINDSIGHT
              </div>
              <div className="space-y-1 font-mono text-[11px] text-slate-300">
                <div>✓ <strong>Root Cause:</strong> {retainedData.rootCause}</div>
                <div>✓ <strong>Successful Fix:</strong> {retainedData.fixApplied}</div>
                <div>✓ <strong>Failed Attempt:</strong> {retainedData.failedAttempts}</div>
                <div>✓ <strong>Operational Lesson:</strong> {retainedData.lessonsLearned}</div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                CONFIRMED ROOT CAUSE *
              </label>
              <textarea
                required
                rows={2}
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="e.g. Connection pool max_connections misconfigured in deployment v2.1.0..."
                className="w-full rounded-md bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                FIX APPLIED *
              </label>
              <input
                required
                type="text"
                value={fixApplied}
                onChange={(e) => setFixApplied(e.target.value)}
                placeholder="e.g. Reverted database connection configuration and restarted worker pods."
                className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                FAILED ATTEMPTS (What to avoid next time)
              </label>
              <input
                type="text"
                value={failedAttempts}
                onChange={(e) => setFailedAttempts(e.target.value)}
                placeholder="e.g. Restarting the pod alone without updating config caused recurrence in 3 mins."
                className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-mono text-[11px] mb-1">
                OPERATIONAL LESSON LEARNED *
              </label>
              <textarea
                required
                rows={2}
                value={lessonsLearned}
                onChange={(e) => setLessonsLearned(e.target.value)}
                placeholder="e.g. Always check configuration parameters before increasing pool size..."
                className="w-full rounded-md bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                <span>Resolve & Retain in Hindsight</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
