"use client";

import Link from "next/link";
import { PlusCircle, Sparkles, Activity, Cpu, HardDrive } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 px-6 bg-[#0a0f1d]/90 backdrop-blur border-b border-slate-800/80 flex items-center justify-between z-10 shrink-0">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-2">
          <span>Incident Memory</span>
          <span className="text-slate-600 font-mono">/</span>
          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
            Autonomous SRE Operational Intelligence
          </span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Status badges */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono">
          {/* Environment */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <span className="text-slate-400">ENV:</span>
            <span className="text-emerald-400 font-semibold">PRODUCTION</span>
          </div>

          {/* AI */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">AI:</span>
            <span className="text-cyan-300 font-semibold">CONNECTED</span>
          </div>

          {/* Memory */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
            <HardDrive className="w-3 h-3 text-purple-400" />
            <span className="text-slate-400">MEMORY:</span>
            <span className="text-purple-300 font-semibold">HINDSIGHT</span>
          </div>
        </div>

        {/* Action Buttons */}
        <Link
          href="/demo"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Demo</span>
        </Link>

        <Link
          href="/incidents/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-all shadow-sm shadow-cyan-900"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Investigate Incident</span>
        </Link>
      </div>
    </header>
  );
}
