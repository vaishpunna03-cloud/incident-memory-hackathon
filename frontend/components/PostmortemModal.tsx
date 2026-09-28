"use client";

import React, { useState } from "react";
import { Postmortem } from "@/lib/types";
import { FileText, Copy, Check, Download, X, Share2 } from "lucide-react";

interface PostmortemModalProps {
  postmortem: Postmortem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PostmortemModal({ postmortem, isOpen, onClose }: PostmortemModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !postmortem) return null;

  const handleCopy = () => {
    const markdown = `# ${postmortem.title}
**Status:** ${postmortem.status} | **Author:** ${postmortem.author} | **Incident:** ${postmortem.incident_id}

## Executive Summary
${postmortem.summary}

## Incident Impact
${postmortem.impact}

## Root Cause
${postmortem.root_cause}

## What Worked
${postmortem.what_worked.map((w) => `- ${w}`).join("\n")}

## What Failed (Troubleshooting Blindspots)
${postmortem.what_failed.map((f) => `- ${f}`).join("\n")}

## Resolution
${postmortem.resolution}

## Lessons Learned
${postmortem.lessons_learned.map((l) => `- ${l}`).join("\n")}

## Prevention Recommendations
${postmortem.prevention_recommendations.map((p) => `- ${p}`).join("\n")}
`;
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(postmortem, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `postmortem-${postmortem.incident_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl my-8 rounded-xl bg-[#0d1322] border border-slate-700/80 shadow-2xl p-6 text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-md bg-cyan-500/20 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide font-mono text-cyan-300">
                {postmortem.title}
              </h2>
              <div className="text-[11px] text-slate-400 font-mono">
                Incident ID: {postmortem.incident_id} • Status: {postmortem.status}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Markdown"}</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Postmortem Content */}
        <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
          {/* Executive Summary */}
          <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <h3 className="font-mono text-[11px] font-bold uppercase text-cyan-400 mb-1">
              Executive Summary
            </h3>
            <p className="text-slate-300 leading-relaxed">{postmortem.summary}</p>
          </div>

          {/* Impact & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <h3 className="font-mono text-[11px] font-bold uppercase text-amber-400 mb-1">
                Impact
              </h3>
              <p className="text-slate-300 leading-relaxed">{postmortem.impact}</p>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <h3 className="font-mono text-[11px] font-bold uppercase text-purple-400 mb-1">
                Root Cause
              </h3>
              <p className="text-slate-300 leading-relaxed">{postmortem.root_cause}</p>
            </div>
          </div>

          {/* What Worked & What Failed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
              <h3 className="font-mono text-[11px] font-bold uppercase text-emerald-400 mb-2">
                What Worked
              </h3>
              <ul className="space-y-1 text-slate-300">
                {postmortem.what_worked.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-800/30">
              <h3 className="font-mono text-[11px] font-bold uppercase text-rose-400 mb-2">
                What Failed (Learned Avoidance)
              </h3>
              <ul className="space-y-1 text-slate-300">
                {postmortem.what_failed.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400">✗</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Lessons Learned */}
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <h3 className="font-mono text-[11px] font-bold uppercase text-cyan-400 mb-2">
              Lessons Learned
            </h3>
            <ul className="space-y-1 text-slate-300">
              {postmortem.lessons_learned.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prevention Recommendations */}
          <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-800/30">
            <h3 className="font-mono text-[11px] font-bold uppercase text-blue-400 mb-2">
              Prevention Recommendations
            </h3>
            <ul className="space-y-1 text-slate-300">
              {postmortem.prevention_recommendations.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
          >
            Close Postmortem
          </button>
        </div>
      </div>
    </div>
  );
}
