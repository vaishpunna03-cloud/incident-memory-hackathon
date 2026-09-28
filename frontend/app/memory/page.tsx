"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { MemoryStats, MemoryRecord, HistoricalMatch } from "@/lib/types";
import { MemoryCard } from "@/components/MemoryCard";
import {
  Brain,
  Search,
  Sparkles,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from "lucide-react";

export function MemoryTimelineVisualization() {
  const steps = [
    { id: "INC-001", action: "Outage detected & resolved", status: "Root cause retained" },
    { id: "INC-012", action: "Crypto key rotation skew", status: "Dual-key grace period retained" },
    { id: "INC-071", action: "Pool exhaustion post v1.8.2", status: "Config fix & restart failure retained" },
    { id: "INC-104", action: "Similar pool timeout occurs", status: "Historical memory recalled & avoided restart" },
    { id: "NEXT", action: "Autonomous learning loop", status: "New prevention steps retained" },
  ];

  return (
    <div className="p-5 rounded-xl bg-[#0b101e] border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
            Operational Knowledge Lifecycle
          </h3>
        </div>
        <span className="text-[10px] text-purple-400 font-mono">CONTINUOUS RETENTION</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 text-xs pt-1">
        {steps.map((st, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-purple-400 font-bold">{st.id}</span>
              {idx < steps.length - 1 && (
                <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />
              )}
            </div>
            <div className="font-semibold text-slate-200 text-[11px]">{st.action}</div>
            <div className="text-[10px] text-emerald-400/90 font-mono">✓ {st.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MemoryPage() {
  const [stats, setStats] = useState<MemoryStats | null>(null);
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<HistoricalMatch[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadMemoryData();
  }, []);

  const loadMemoryData = async () => {
    setLoading(true);
    try {
      const [statsData, listData] = await Promise.all([
        api.getMemoryStats(),
        api.listMemories()
      ]);
      setStats(statsData);
      setMemories(listData);
    } catch (err) {
      console.error("Failed to load memories", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const matches = await api.searchMemory(searchQuery);
      setSearchResults(matches);
    } catch (err) {
      console.error("Failed search memory", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <span>Hindsight Operational Memory</span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
              CONNECTED
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Long-term organizational memory engine capturing root causes, successful fixes, and learned troubleshooting avoidances.
          </p>
        </div>

        <button
          onClick={loadMemoryData}
          className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Refresh memory store"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Memory Statistics (Section 14) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Memories
          </span>
          <div className="text-2xl font-bold font-mono text-purple-300">
            {stats?.total_memories ?? "—"}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Retained in store</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Incidents Remembered
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {stats?.incidents_remembered ?? "—"}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Distinct outages</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Protected Services
          </span>
          <div className="text-2xl font-bold font-mono text-cyan-300">
            {stats?.services_count ?? "—"}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Tier-1 & Tier-2 services</span>
        </div>

        <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Memory Engine
          </span>
          <div className="text-sm font-bold font-mono text-emerald-400 mt-1">
            {stats?.provider_name || "Hindsight"}
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Active semantic index</span>
        </div>
      </div>

      {/* Memory Timeline Visualization */}
      <MemoryTimelineVisualization />

      {/* Semantic Memory Search (Section 14) */}
      <div className="p-5 rounded-xl bg-[#0c1220] border border-slate-800/90 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Semantic Memory Search
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Explains WHY each memory was retrieved
          </span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search historical memory (e.g. 'connection pool exhausted', 'jwt verification error', 'deadlock')..."
              className="w-full pl-9 pr-3 py-2 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-100 font-mono focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold font-mono transition-all"
          >
            {searching ? "Searching..." : "Search Memory"}
          </button>
        </form>

        {/* Search Results Display */}
        {searchResults && (
          <div className="pt-2 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>{searchResults.length} historical memories matched query</span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-purple-400 hover:underline text-[11px]"
              >
                Clear Search
              </button>
            </div>

            <div className="space-y-3">
              {searchResults.map((match) => (
                <div key={match.incident_id} className="p-4 rounded-lg bg-slate-950/80 border border-purple-800/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-purple-300 font-bold">{match.incident_id}</span>
                      <span className="text-slate-400">({match.service_id})</span>
                    </div>
                    <span className="text-xs font-bold font-mono text-purple-400">
                      Relevance: {match.relevance_score}%
                    </span>
                  </div>

                  <div className="p-2 rounded bg-purple-950/30 border border-purple-900/30 text-[11px] text-purple-200">
                    <span className="font-bold">WHY THIS MEMORY WAS RETRIEVED: </span>
                    {match.retrieval_reason}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                    <div>
                      <span className="text-slate-400">Root cause:</span> {match.root_cause}
                    </div>
                    <div>
                      <span className="text-emerald-300">Fix applied:</span> {match.successful_fix}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Memory Records List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Retained Memory Store ({memories.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Ordered by newest retention
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((m) => (
            <MemoryCard key={m.id} memory={m} />
          ))}
        </div>
      </div>
    </div>
  );
}
