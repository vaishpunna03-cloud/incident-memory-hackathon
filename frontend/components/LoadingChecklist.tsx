"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Brain } from "lucide-react";

interface LoadingChecklistProps {
  onComplete?: () => void;
}

export function LoadingChecklist({ onComplete }: LoadingChecklistProps) {
  const steps = [
    "Incident received & parsed",
    "Current telemetry evidence extracted",
    "Searching Hindsight operational memory",
    "Similar historical incidents identified",
    "Comparing previous fixes & failed attempts",
    "Generating contextual SRE investigation"
  ];

  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          if (onComplete) onComplete();
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 rounded-xl bg-[#0c1220] border border-cyan-500/30 shadow-xl max-w-lg mx-auto space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <div className="text-sm font-bold font-mono text-cyan-300">
            AI INCIDENT INVESTIGATION IN PROGRESS
          </div>
          <div className="text-[11px] text-slate-400">
            Synthesizing live telemetry with long-term Hindsight memory...
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-2 rounded text-xs font-mono transition-all ${
                isDone
                  ? "text-slate-300 bg-slate-900/40"
                  : isCurrent
                  ? "text-cyan-300 bg-cyan-950/30 border border-cyan-500/30"
                  : "text-slate-600"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
              )}
              <span>{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
