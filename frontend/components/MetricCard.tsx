import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: "cyan" | "rose" | "emerald" | "amber" | "purple" | "default";
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: MetricCardProps) {
  const variantStyles = {
    cyan: "text-cyan-400 bg-cyan-950/20 border-cyan-800/40",
    rose: "text-rose-400 bg-rose-950/20 border-rose-800/40",
    emerald: "text-emerald-400 bg-emerald-950/20 border-emerald-800/40",
    amber: "text-amber-400 bg-amber-950/20 border-amber-800/40",
    purple: "text-purple-400 bg-purple-950/20 border-purple-800/40",
    default: "text-slate-400 bg-slate-900/50 border-slate-800",
  };

  return (
    <div className="p-4 rounded-lg bg-[#0e1424] border border-slate-800/90 shadow-sm relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-bold font-mono text-slate-100 tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg border ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2.5">
          {subtitle && <span>{subtitle}</span>}
          {trend && (
            <span className="font-mono text-cyan-400 font-semibold">{trend}</span>
          )}
        </div>
      )}
    </div>
  );
}
