"use client";

import React from "react";
import Link from "next/link";
import { Incident } from "@/lib/types";
import { SeverityBadge, StatusBadge } from "@/components/Badges";
import { Brain, ArrowRight, Clock } from "lucide-react";

interface IncidentTableProps {
  incidents: Incident[];
  loading?: boolean;
}

export function IncidentTable({ incidents, loading }: IncidentTableProps) {
  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-500 font-mono">
        Loading incident records...
      </div>
    );
  }

  if (!incidents || incidents.length === 0) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 rounded-lg bg-slate-900/30 border border-slate-800">
        No incidents match the active filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-800/90 bg-[#0c1220]">
      <table className="w-full text-left text-xs text-slate-300">
        <thead className="bg-[#0f172a] text-[11px] font-mono text-slate-400 uppercase tracking-wider border-b border-slate-800">
          <tr>
            <th className="py-3 px-4">Incident ID</th>
            <th className="py-3 px-4">Service</th>
            <th className="py-3 px-4">Title & Error</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Created</th>
            <th className="py-3 px-4 text-center">Historical Matches</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
          {incidents.map((inc) => (
            <tr
              key={inc.id}
              className="hover:bg-slate-900/50 transition-colors group cursor-pointer"
            >
              <td className="py-3 px-4 font-bold text-cyan-400">
                <Link href={`/incidents/${inc.id}`} className="hover:underline">
                  {inc.id}
                </Link>
              </td>
              <td className="py-3 px-4 text-slate-300">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                  {inc.service_id}
                </span>
              </td>
              <td className="py-3 px-4 max-w-xs font-sans text-xs">
                <div className="font-semibold text-slate-200 truncate">{inc.title}</div>
                <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                  {inc.error_message}
                </div>
              </td>
              <td className="py-3 px-4">
                <SeverityBadge severity={inc.severity} />
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={inc.status} />
              </td>
              <td className="py-3 px-4 text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(inc.created_at).toLocaleDateString()}</span>
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                {inc.historical_match_count > 0 ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800 text-purple-300 font-bold">
                    <Brain className="w-3 h-3 text-purple-400" />
                    {inc.historical_match_count}
                  </span>
                ) : (
                  <span className="text-slate-600">—</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <Link
                  href={`/incidents/${inc.id}`}
                  className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-sans text-xs font-medium"
                >
                  <span>Investigate</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
