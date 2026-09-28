"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  PlusCircle,
  Brain,
  Network,
  Sparkles,
  FileText,
  Activity,
  Terminal,
  ShieldCheck
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Incidents", href: "/incidents", icon: AlertTriangle },
    { name: "New Incident", href: "/incidents/new", icon: PlusCircle },
    { name: "Memory", href: "/memory", icon: Brain },
    { name: "Services", href: "/services", icon: Network },
    { name: "Demo (Judges)", href: "/demo", icon: Sparkles, highlight: true },
    { name: "Postmortems", href: "/postmortems", icon: FileText },
    { name: "System Health", href: "/health", icon: Activity },
  ];

  return (
    <aside className="w-64 bg-[#0a0f1d] border-r border-slate-800/80 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Brand header */}
        <div className="h-16 px-5 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Brain className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-slate-100 text-sm tracking-wide flex items-center gap-1.5">
              INCIDENT MEMORY
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
              Hindsight SRE Agent
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-950/50"
                    : item.highlight
                    ? "text-amber-300 bg-amber-950/20 hover:bg-amber-950/30 border border-amber-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-cyan-400" : item.highlight ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                    LIVE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* SRE Agent footer statement */}
      <div className="p-3 m-3 rounded-lg bg-slate-900/50 border border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Operational Memory</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          "Remember what failed. Learn what worked. Investigate with context."
        </p>
      </div>
    </aside>
  );
}
