"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Service } from "@/lib/types";
import { DependencyGraph } from "@/components/DependencyGraph";
import { Network, Server, RefreshCw } from "lucide-react";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const data = await api.getServices();
      setServices(data);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Service Topology & Memory Graph
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Inter-service dependencies correlated with long-term incident memory and recurring failure signatures.
          </p>
        </div>

        <button
          onClick={loadServices}
          className="p-2 rounded-md bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          title="Refresh topology"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs font-mono text-slate-500">
          Loading service topology...
        </div>
      ) : (
        <DependencyGraph services={services} />
      )}
    </div>
  );
}
