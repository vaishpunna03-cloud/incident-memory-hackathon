import React from "react";

export function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    Critical: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    High: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    Low: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  const currentStyle = styles[severity] || styles["Medium"];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${currentStyle}`}
    >
      {severity.toUpperCase()}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; dot: string; text: string }> = {
    active: {
      bg: "bg-rose-950/40 text-rose-300 border-rose-500/30",
      dot: "bg-rose-400 animate-ping",
      text: "ACTIVE",
    },
    investigating: {
      bg: "bg-amber-950/40 text-amber-300 border-amber-500/30",
      dot: "bg-amber-400 animate-pulse",
      text: "INVESTIGATING",
    },
    resolved: {
      bg: "bg-emerald-950/40 text-emerald-300 border-emerald-500/30",
      dot: "bg-emerald-400",
      text: "RESOLVED",
    },
  };

  const s = styles[status] || styles["active"];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${s.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.text}
    </span>
  );
}

export function HealthIndicator({
  status,
  label,
  details
}: {
  status: string;
  label: string;
  details?: string;
}) {
  const isHealthy = status === "Healthy" || status === "Connected";
  const isDemo = status.includes("Demo");

  let color = "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
  let dotColor = "bg-emerald-400";

  if (isDemo) {
    color = "text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    dotColor = "bg-cyan-400";
  } else if (!isHealthy) {
    color = "text-rose-400 border-rose-500/30 bg-rose-500/10";
    dotColor = "bg-rose-400";
  }

  return (
    <div className="flex items-center justify-between p-2.5 rounded-md bg-slate-900/60 border border-slate-800 text-xs">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-slate-300 font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {details && <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">{details}</span>}
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border ${color}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
