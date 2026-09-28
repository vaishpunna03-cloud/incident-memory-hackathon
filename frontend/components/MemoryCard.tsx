import React from "react";
import { MemoryRecord } from "@/lib/types";
import { Brain, CheckCircle2, XCircle, BookOpen, Clock, Tag } from "lucide-react";

interface MemoryCardProps {
  memory: MemoryRecord;
}

export function MemoryCard({ memory }: MemoryCardProps) {
  return (
    <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90 shadow-sm space-y-3 hover:border-slate-700 transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-purple-500/20 text-purple-400">
            <Brain className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-purple-300">
            {memory.incident_id}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
            {memory.service_id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
          <Clock className="w-3 h-3" />
          <span>{new Date(memory.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="text-xs">
        <div className="text-slate-400 text-[11px] mb-1">
          Error: <span className="font-mono text-slate-200">"{memory.original_error}"</span>
        </div>
        {memory.deployment_context && (
          <div className="text-slate-500 text-[10px] font-mono mb-2">
            Context: {memory.deployment_context}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
        <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800">
          <span className="text-[10px] font-mono text-purple-400 uppercase font-semibold block mb-0.5">
            Root Cause
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">{memory.root_cause}</p>
        </div>

        <div className="p-2.5 rounded bg-emerald-950/20 border border-emerald-800/30">
          <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1.5 mb-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> What Worked
          </span>
          <p className="text-emerald-200 text-[11px] leading-relaxed">{memory.successful_fix}</p>
        </div>
      </div>

      {memory.failed_attempt && (
        <div className="p-2 rounded bg-rose-950/20 border border-rose-800/30 text-xs">
          <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold flex items-center gap-1.5 mb-0.5">
            <XCircle className="w-3.5 h-3.5" /> What Failed
          </span>
          <p className="text-rose-200 text-[11px]">{memory.failed_attempt}</p>
        </div>
      )}

      <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
        <span className="font-semibold text-slate-200 block mb-0.5">💡 Lesson Learned:</span>
        {memory.lesson_learned}
      </div>

      {memory.runbook_step && (
        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="truncate">Runbook: {memory.runbook_step}</span>
        </div>
      )}

      {memory.tags && memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {memory.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
