"use client";

import React, { useState } from "react";
import { Service } from "@/lib/types";
import { Server, ArrowRight, Database, ShieldAlert, Brain, Layers } from "lucide-react";

interface DependencyGraphProps {
  services: Service[];
  onSelectService?: (service: Service) => void;
}

export function DependencyGraph({ services, onSelectService }: DependencyGraphProps) {
  const [selectedId, setSelectedId] = useState<string>("payment-api");

  const selectedService = services.find((s) => s.id === selectedId) || services[0];

  const handleSelect = (s: Service) => {
    setSelectedId(s.id);
    if (onSelectService) onSelectService(s);
  };

  return (
    <div className="space-y-6">
      {/* Graph Visual Canvas */}
      <div className="p-6 rounded-xl bg-[#0b101d] border border-slate-800 relative overflow-hidden">
        <div className="text-xs font-mono text-slate-400 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>TOPOLOGY DEPENDENCY FLOW</span>
          </div>
          <span className="text-[10px] text-slate-500">Click a node to inspect operational memory profile</span>
        </div>

        {/* Nodes and Flow */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 py-4 overflow-x-auto">
          {/* Node 1: auth-service */}
          <div
            onClick={() => {
              const s = services.find((x) => x.id === "auth-service");
              if (s) handleSelect(s);
            }}
            className={`cursor-pointer p-4 rounded-lg border text-center transition-all min-w-[160px] ${
              selectedId === "auth-service"
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <Server className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <div className="font-mono text-xs font-bold">auth-service</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Tier-1 Identity</div>
          </div>

          <div className="text-slate-600">
            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
          </div>

          {/* Node 2: order-service */}
          <div
            onClick={() => {
              const s = services.find((x) => x.id === "order-service");
              if (s) handleSelect(s);
            }}
            className={`cursor-pointer p-4 rounded-lg border text-center transition-all min-w-[160px] ${
              selectedId === "order-service"
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <Server className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <div className="font-mono text-xs font-bold">order-service</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Tier-1 Orders</div>
          </div>

          <div className="text-slate-600">
            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
          </div>

          {/* Node 3: payment-api */}
          <div
            onClick={() => {
              const s = services.find((x) => x.id === "payment-api");
              if (s) handleSelect(s);
            }}
            className={`cursor-pointer p-4 rounded-lg border text-center transition-all min-w-[160px] ${
              selectedId === "payment-api"
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
          >
            <Server className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
            <div className="font-mono text-xs font-bold">payment-api</div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Tier-1 Gateway</div>
          </div>

          <div className="text-slate-600">
            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
          </div>

          {/* Node 4: database */}
          <div className="p-4 rounded-lg border border-purple-800/40 bg-purple-950/20 text-purple-300 text-center min-w-[160px]">
            <Database className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <div className="font-mono text-xs font-bold">PostgreSQL</div>
            <div className="text-[10px] text-purple-400 font-mono mt-0.5">Primary Cluster</div>
          </div>
        </div>

        {/* Downstream notification-service */}
        <div className="mt-4 flex justify-center">
          <div
            onClick={() => {
              const s = services.find((x) => x.id === "notification-service");
              if (s) handleSelect(s);
            }}
            className={`cursor-pointer p-3 rounded-lg border text-center transition-all min-w-[180px] ${
              selectedId === "notification-service"
                ? "bg-cyan-950/40 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950"
                : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-[10px] text-slate-500 font-mono">Async Downstream:</div>
            <div className="font-mono text-xs font-bold text-slate-200">notification-service (Tier-2)</div>
          </div>
        </div>
      </div>

      {/* Selected Service Detailed Inspector */}
      {selectedService && (
        <div className="p-5 rounded-xl bg-[#0e1424] border border-slate-800/90 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold text-cyan-300">
                  {selectedService.name}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-xs font-mono border border-slate-800">
                  {selectedService.tier}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 text-xs font-mono border border-emerald-800/40">
                  {selectedService.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedService.description}</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="text-center p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-slate-500 text-[10px] block">INCIDENTS</span>
                <span className="text-slate-200 font-bold">{selectedService.incident_count}</span>
              </div>
              <div className="text-center p-2 rounded bg-purple-950/40 border border-purple-800/40">
                <span className="text-purple-400 text-[10px] block">MEMORIES</span>
                <span className="text-purple-300 font-bold">{selectedService.memory_count}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Dependencies */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="font-mono text-[11px] font-bold text-slate-300 uppercase block mb-2">
                Declared Dependencies
              </span>
              <div className="flex flex-wrap gap-2">
                {selectedService.dependencies && selectedService.dependencies.length > 0 ? (
                  selectedService.dependencies.map((dep, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800"
                    >
                      → {dep}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No external dependencies</span>
                )}
              </div>
            </div>

            {/* Recurring Root Causes */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="font-mono text-[11px] font-bold text-purple-400 uppercase block mb-2 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" /> Recurring Root Causes in Memory
              </span>
              <ul className="space-y-1.5 text-slate-300 text-[11px]">
                {selectedService.recurring_causes && selectedService.recurring_causes.length > 0 ? (
                  selectedService.recurring_causes.map((cause, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{cause}</span>
                    </li>
                  ))
                ) : (
                  <span className="text-slate-500 italic">No recurring root causes registered</span>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
