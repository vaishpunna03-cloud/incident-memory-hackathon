"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Postmortem } from "@/lib/types";
import { PostmortemModal } from "@/components/PostmortemModal";
import { FileText, ArrowRight, Clock, ShieldCheck, Download, RefreshCw } from "lucide-react";

export default function PostmortemsPage() {
  const [postmortems, setPostmortems] = useState<Postmortem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPostmortem, setSelectedPostmortem] = useState<Postmortem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    loadPostmortems();
  }, []);

  const loadPostmortems = async () => {
    setLoading(true);
    try {
      const data = await api.getPostmortems();
      setPostmortems(data);
    } catch (err) {
      console.error("Failed to load postmortems", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (pm: Postmortem) => {
    setSelectedPostmortem(pm);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Published Incident Postmortems
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated blameless postmortems documenting timelines, root causes, what failed, and prevention recommendations.
          </p>
        </div>

        <button
          onClick={loadPostmortems}
          className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-slate-500">
          Loading published postmortems...
        </div>
      ) : postmortems.length === 0 ? (
        <div className="p-12 text-center text-slate-500 rounded-lg bg-slate-900/30 border border-slate-800 text-xs">
          No published postmortems yet. Resolve an incident to generate one automatically.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {postmortems.map((pm) => (
            <div
              key={pm.id}
              onClick={() => handleOpen(pm)}
              className="p-5 rounded-xl bg-[#0c1220] border border-slate-800/90 shadow-sm hover:border-slate-700 transition-all cursor-pointer space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {pm.incident_id}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                  {pm.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {pm.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {pm.summary}
                </p>
              </div>

              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[11px] font-mono text-purple-300">
                <span className="text-slate-500">Root Cause: </span>
                {pm.root_cause}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(pm.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-cyan-400 font-sans font-medium text-xs">
                  <span>View Postmortem</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <PostmortemModal
        postmortem={selectedPostmortem}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
