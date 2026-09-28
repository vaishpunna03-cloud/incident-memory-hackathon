"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LoadingChecklist } from "@/components/LoadingChecklist";
import { Sparkles, Brain, ArrowRight, ShieldAlert, Cpu } from "lucide-react";

export default function NewIncidentPage() {
  const router = useRouter();

  const [serviceId, setServiceId] = useState("payment-api");
  const [title, setTitle] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [description, setDescription] = useState("");
  const [environment, setEnvironment] = useState("Production");
  const [severity, setSeverity] = useState("High");
  const [deploymentVersion, setDeploymentVersion] = useState("v2.1.0");
  const [deploymentCommit, setDeploymentCommit] = useState("a4f89d1");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdIncidentId, setCreatedIncidentId] = useState<string | null>(null);

  // Quick Demo Pre-fills
  const loadDemoIncident1 = () => {
    setServiceId("payment-api");
    setTitle("Database connection pool exhausted");
    setErrorMessage("database connection pool exhausted (max pool size reached: 20/20)");
    setDescription("Payment checkout requests failing with 500 status codes. Occurred immediately following deployment of v1.8.2.");
    setEnvironment("Production");
    setSeverity("Critical");
    setDeploymentVersion("v1.8.2");
    setDeploymentCommit("89acb42");
  };

  const loadDemoIncident2 = () => {
    setServiceId("payment-api");
    setTitle("Database connection timeout in checkout API");
    setErrorMessage("database connection timeout in pool");
    setDescription("Checkout API experiencing 504 Gateway Timeouts. Active database connection pool saturated shortly after v2.1.0 deployment.");
    setEnvironment("Production");
    setSeverity("High");
    setDeploymentVersion("v2.1.0");
    setDeploymentCommit("a4f89d1");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Create incident in backend
      const inc = await api.createIncident({
        service_id: serviceId,
        title,
        error_message: errorMessage,
        description,
        environment,
        severity,
        deployment_version: deploymentVersion,
        deployment_commit: deploymentCommit
      });

      setCreatedIncidentId(inc.id);

      // 2. Trigger investigation
      await api.investigateIncident(inc.id, true);

      // LoadingChecklist will handle smooth animated progression
      setTimeout(() => {
        router.push(`/incidents/${inc.id}`);
      }, 3000);
    } catch (err: any) {
      alert("Error initiating incident investigation: " + err.message);
      setIsSubmitting(false);
    }
  };

  if (isSubmitting) {
    return (
      <div className="py-16">
        <LoadingChecklist />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            Investigate New Incident
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Submit telemetry & deployment metadata to trigger the autonomous SRE Root-Cause Agent.
          </p>
        </div>

        {/* Quick Demo Pre-fill buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDemoIncident1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-mono text-purple-300 border border-purple-800/40 transition-all"
          >
            <Brain className="w-3 h-3 text-purple-400" />
            <span>Load Demo 1 (INC-071)</span>
          </button>
          <button
            type="button"
            onClick={loadDemoIncident2}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-[11px] font-mono text-cyan-300 border border-cyan-500/40 transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Load Demo 2 (Similar INC-104)</span>
          </button>
        </div>
      </div>

      {/* Incident Input Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-xl bg-[#0c1220] border border-slate-800/90 shadow-md space-y-5 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              AFFECTED SERVICE *
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="payment-api">payment-api (Tier-1 Gateway)</option>
              <option value="auth-service">auth-service (Tier-1 Identity)</option>
              <option value="order-service">order-service (Tier-1 Orders)</option>
              <option value="notification-service">notification-service (Tier-2 Dispatcher)</option>
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              SEVERITY LEVEL *
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="Critical">Critical (P0 - Service Down)</option>
              <option value="High">High (P1 - Core Flow Degraded)</option>
              <option value="Medium">Medium (P2 - Partial Outage)</option>
              <option value="Low">Low (P3 - Minor Telemetry Bug)</option>
            </select>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-slate-400 font-mono text-[11px] mb-1">
            INCIDENT TITLE *
          </label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Database connection timeout in payment gateway"
            className="w-full rounded-md bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Error Message */}
        <div>
          <label className="block text-slate-400 font-mono text-[11px] mb-1">
            EXACT ERROR MESSAGE / LOG TELEMETRY *
          </label>
          <textarea
            required
            rows={2}
            value={errorMessage}
            onChange={(e) => setErrorMessage(e.target.value)}
            placeholder="e.g. database connection timeout in pool (max pool size reached)"
            className="w-full rounded-md bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-slate-400 font-mono text-[11px] mb-1">
            OBSERVED SYMPTOMS & CONTEXT
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe customer impact, latency spikes, or failed user flows..."
            className="w-full rounded-md bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Deployment Context */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              ENVIRONMENT
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="Production">Production</option>
              <option value="Staging">Staging</option>
              <option value="Canary">Canary</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              DEPLOYMENT VERSION
            </label>
            <input
              type="text"
              value={deploymentVersion}
              onChange={(e) => setDeploymentVersion(e.target.value)}
              placeholder="e.g. v2.1.0"
              className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 font-mono text-[11px] mb-1">
              COMMIT HASH
            </label>
            <input
              type="text"
              value={deploymentCommit}
              onChange={(e) => setDeploymentCommit(e.target.value)}
              placeholder="e.g. a4f89d1"
              className="w-full rounded-md bg-slate-950 border border-slate-800 p-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-950 transition-all cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>INVESTIGATE INCIDENT</span>
          </button>
        </div>
      </form>
    </div>
  );
}
