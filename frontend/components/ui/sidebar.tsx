"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, BarChart3, Clock, Lightbulb, Settings, LogOut,
  ChevronLeft, ChevronRight, Menu, X, Search, Zap, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { API, clearAuth, getUser } from "@/lib/api";

const NAV = [
  { href: "/dashboard", icon: Home,     label: "Dashboard"  },
  { href: "/analytics", icon: BarChart3,label: "Analytics"  },
  { href: "/timeline",  icon: Clock,    label: "Timeline"   },
  { href: "/insights",  icon: Lightbulb,label: "Insights"   },
  { href: "/settings",  icon: Settings, label: "Settings"   },
];

interface SidebarProps { className?: string; }

export function Sidebar({ className = "" }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState("—");
  const [sessions, setSessions]     = useState(0);
  const [tracking, setTracking]     = useState(false);
  const user = getUser();
  const initial = (user.displayName || user.username || "U").charAt(0).toUpperCase();

  useEffect(() => {
    const update = async () => {
      try {
        const d = await API.status();
        setCurrentApp(d.currentApp || "—");
        setSessions(d.sessions || 0);
        setTracking(d.tracking || false);
      } catch {}
    };
    update();
    const t = setInterval(update, 8000);
    return () => clearInterval(t);
  }, []);

  const handleLogout = async () => {
    try { await API.logout(); } catch {}
    clearAuth();
    router.push("/login");
  };

  const SidebarContent = () => (
    <div className={cn("flex flex-col h-full bg-[hsl(222,47%,7%)] border-r border-border transition-all duration-300", collapsed ? "w-[72px]" : "w-[240px]", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-[hsl(222,47%,9%)]">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-500/30">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-none">FlowMind OS</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">AI Productivity</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto shadow-sm shadow-indigo-500/30">
            <Zap className="h-4 w-4 text-white" />
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="px-3 py-2.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search…" className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-md text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring text-foreground" />
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-1 overflow-y-auto space-y-0.5">
        {!collapsed && <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Navigation</p>}
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}
              className={cn("flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative group",
                active ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                collapsed && "justify-center px-2"
              )}>
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />}
              <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-indigo-400" : "text-muted-foreground group-hover:text-foreground")} />
              {!collapsed && <span>{label}</span>}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-border shadow-lg">
                  {label}
                </div>
              )}
            </Link>
          );
        })}

        {!collapsed && (
          <>
            <div className="border-t border-border my-2" />
            <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Live Tracking</p>
            <div className="mx-2 p-3 bg-secondary rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-2 h-2 rounded-full", tracking ? "bg-emerald-400 animate-pulse" : "bg-rose-400")} />
                <span className="text-[11px] font-semibold text-muted-foreground">{tracking ? "Tracker Active" : "Tracker Off"}</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{currentApp}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{sessions} sessions today</p>
            </div>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-border">
        {!collapsed ? (
          <div className="p-3">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-secondary">
              <div className="w-7 h-7 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-indigo-400">{initial}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{user.displayName || user.username}</p>
                <p className="text-[10px] text-muted-foreground">FlowMind User</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <button onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors">
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="p-2 flex flex-col items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-400">{initial}</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-card border border-border shadow-md md:hidden">
        <Menu className="h-5 w-5 text-foreground" />
      </button>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-50 h-full w-[240px]">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-md bg-secondary text-muted-foreground">
              <X className="h-4 w-4" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
      <div className="hidden md:flex h-full">
        <SidebarContent />
      </div>
    </>
  );
}
