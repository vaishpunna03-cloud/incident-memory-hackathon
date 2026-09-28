import React from "react";
import { IncidentEvent } from "@/lib/types";
import { Clock, CheckCircle2, Search, Brain, FileCheck, ShieldAlert, Sparkles, BookOpen } from "lucide-react";

interface TimelineProps {
  events: IncidentEvent[];
}

export function Timeline({ events }: TimelineProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "Incident Created":
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case "Evidence Collected":
        return <Search className="w-3.5 h-3.5 text-cyan-400" />;
      case "Historical Memory Retrieved":
        return <Brain className="w-3.5 h-3.5 text-purple-400" />;
      case "Investigation Generated":
        return <Sparkles className="w-3.5 h-3.5 text-amber-400" />;
      case "Engineer Reviewed":
        return <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />;
      case "Incident Resolved":
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "Knowledge Extracted":
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
      case "Memory Retained":
        return <Brain className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
      {events && events.length > 0 ? (
        events.map((ev, idx) => (
          <div key={ev.id || idx} className="relative flex items-start gap-3">
            <div className="absolute -left-6 mt-1 w-5 h-5 rounded-full bg-[#0a0f1d] border border-slate-700 flex items-center justify-center shrink-0">
              {getEventIcon(ev.event_type)}
            </div>
            <div className="flex-1 p-3 rounded-md bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {ev.event_type}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {ev.description}
              </p>
            </div>
          </div>
        ))
      ) : (
        <div className="text-xs text-slate-500 italic py-2">
          No audit timeline events recorded yet.
        </div>
      )}
    </div>
  );
}
