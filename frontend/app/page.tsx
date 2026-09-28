"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Brain,
  Server,
  ShieldAlert,
  Activity,
  ArrowRight,
  Sparkles,
  PlusCircle,
  Database,
  Cpu,
  Layers
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import { MetricCard } from "@/components/MetricCard";
import { IncidentTable } from "@/components/IncidentTable";
import { HealthIndicator } from "@/components/Badges";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero statement (Section 5) */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-[#0c1424] via-[#0f172a] to-[#0c1424] border border-cyan-800/30 relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px]">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>OPERATIONAL MEMORY ACTIVATED (HINDSIGHT)</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
            "Production incidents repeat. Your team's knowledge shouldn't be forgotten."
          </h2>
          <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
            Remember what failed. Learn what worked. Investigate the next incident with long-term operational context.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href="/incidents/new"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md shadow-cyan-950 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>INVESTIGATE NEW INCIDENT</span>
          </Link>
          <Link
            href="/demo"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Run Judge Demo (Before vs After)</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards (Section 7) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <MetricCard
          title="Total Incidents"
          value={stats?.total_incidents ?? "—"}
          icon={AlertTriangle}
          variant="default"
        />
        <MetricCard
          title="Active"
          value={stats?.active_incidents ?? "—"}
          icon={ShieldAlert}
          variant="rose"
        />
        <MetricCard
          title="Resolved"
          value={stats?.resolved_incidents ?? "—"}
          icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Memories"
          value={stats?.historical_memories ?? "—"}
          icon={Brain}
          variant="purple"
          trend="Hindsight"
        />
        <MetricCard
          title="Services"
          value={stats?.services_count ?? "—"}
          icon={Server}
          variant="cyan"
        />
        <MetricCard
          title="High Severity"
          value={stats?.high_severity_incidents ?? "—"}
          icon={Activity}
          variant="amber"
        />
      </div>

      {/* Memory Impact Visualization (Section 7) */}
      <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              The Memory Impact Flow
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            HOW HINDSIGHT ACCELERATES MTTR
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase block">
              1. Historical Incidents
            </span>
            <div className="font-semibold text-slate-200 text-xs">Past Outages Occur</div>
            <p className="text-[11px] text-slate-400">
              Teams identify root causes and discover what worked & what failed during resolution.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-purple-950/20 border border-purple-800/40 space-y-1">
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase block">
              2. Retained Knowledge
            </span>
            <div className="font-semibold text-purple-200 text-xs">Hindsight Memory Storage</div>
            <p className="text-[11px] text-slate-400">
              Fixes, config diffs, avoided mistakes, and runbooks are retained in long-term memory.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block">
              3. New Similar Incidents
            </span>
            <div className="font-semibold text-slate-200 text-xs">Telemetry Corroboration</div>
            <p className="text-[11px] text-slate-400">
              Live telemetry is extracted while the agent automatically queries historical precedent.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1">
            <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">
              4. Contextual Investigation
            </span>
            <div className="font-semibold text-emerald-200 text-xs">Zero Trial-and-Error</div>
            <p className="text-[11px] text-slate-400">
              Avoids ineffective pod restarts, highlights likely root causes, and recommends targeted fixes.
            </p>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Incidents & System Health (Section 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Recent Incidents
              </h3>
            </div>
            <Link
              href="/incidents"
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View all incidents</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <IncidentTable incidents={stats?.recent_incidents || []} loading={loading} />
        </div>

        {/* System Health (1 col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                System Health
              </h3>
            </div>
            <Link
              href="/health"
              className="text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Details
            </Link>
          </div>

          <div className="p-4 rounded-lg bg-[#0c1220] border border-slate-800/90 space-y-2.5">
            <HealthIndicator
              label="Backend API"
              status={stats?.system_health.backend.status || "Healthy"}
              details="FastAPI 0.115"
            />
            <HealthIndicator
              label="Database Storage"
              status={stats?.system_health.database.status || "Connected"}
              details="PostgreSQL / SQLite"
            />
            <HealthIndicator
              label="Hindsight Memory"
              status={stats?.system_health.hindsight.status || "Connected (Demo)"}
              details="Operational Store"
            />
            <HealthIndicator
              label="AI Reasoning Agent"
              status={stats?.system_health.llm.status || "Connected (Demo)"}
              details="SRE Investigator"
            />

            <div className="pt-2 text-[10px] text-slate-500 font-mono text-center">
              Health check synced {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
