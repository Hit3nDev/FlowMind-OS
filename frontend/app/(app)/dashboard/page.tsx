"use client";
import { useEffect, useState, useCallback } from "react";
import { TrendingUp, Clock, Zap, Monitor, AlertTriangle, CheckCircle, Activity, BarChart3 } from "lucide-react";
import { BentoGrid, type BentoItem } from "@/components/ui/bento-grid";
import { InteractiveLogs } from "@/components/ui/interactive-logs";
import { API, getUser } from "@/lib/api";
import { fmtMs, fmtMins } from "@/lib/utils";

function QuickAction({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex flex-col items-start gap-2 p-4 rounded-xl border border-border bg-card hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all text-left w-full">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [status, setStatus]       = useState<any>(null);
  const [logs, setLogs]           = useState<any[]>([]);
  const [toast, setToast]         = useState("");
  const user = getUser();
  const h    = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  const refresh = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([API.analytics(), API.status()]);
      setAnalytics(a); setStatus(s);
    } catch {}
  }, []);

  const pollLogs = useCallback(async () => {
    try { const l = await API.logs(); setLogs(l); } catch {}
  }, []);

  useEffect(() => {
    refresh(); pollLogs();
    const t1 = setInterval(refresh, 8000);
    const t2 = setInterval(pollLogs, 5000);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, [refresh, pollLogs]);

  const runAction = async (action: string, label: string) => {
    setToast(`⚡ Running: ${label}…`);
    try {
      const d = await API.automate(action);
      setToast("✅ " + d.result);
    } catch { setToast("✗ Action failed"); }
    setTimeout(() => setToast(""), 3000);
  };

  const score = analytics?.productivityScore ?? 0;
  const bentoItems: BentoItem[] = [
    { title: "Productivity Score", description: score > 70 ? "Excellent focus today!" : score > 40 ? "Good progress" : "Needs improvement", icon: <TrendingUp className="w-4 h-4 text-indigo-400" />, value: `${score.toFixed(1)}%`, status: score > 70 ? "Excellent" : score > 40 ? "Good" : "Low", tags: ["Score","Today"], colSpan: 2, hasPersistentHover: true },
    { title: "Sessions Today", description: "App switches tracked by Python tracker", icon: <Activity className="w-4 h-4 text-violet-400" />, value: analytics?.sessionCount ?? 0, status: status?.tracking ? "Tracking" : "Paused", tags: ["Real data"] },
    { title: "Focus Time", description: "Time spent on productive applications", icon: <Clock className="w-4 h-4 text-emerald-400" />, value: fmtMins(analytics?.productiveMs ?? 0), status: "Productive", tags: ["VS Code","GitHub","Classroom"] },
    { title: "Active App", description: status?.currentApp === "—" ? "Start tracker.py to begin" : "Currently being tracked", icon: <Monitor className="w-4 h-4 text-cyan-400" />, value: status?.currentApp ?? "—", status: status?.currentApp && status.currentApp !== "—" ? "Live" : "Offline", tags: ["Tracker"] },
    { title: "Anomaly Status", description: analytics?.focusTip ?? "Analyzing your patterns…", icon: analytics?.anomalyStatus === "ANOMALY" ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <CheckCircle className="w-4 h-4 text-emerald-400" />, value: analytics?.anomalyStatus ?? "NORMAL", status: `Score: ${analytics?.anomalyScore ?? 0}`, tags: ["ML","Detection"] },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{greeting}, {user.displayName || user.username}! 👋</h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's your real-time workflow intelligence overview.</p>
      </div>

      {/* No data banner */}
      {analytics && !analytics.hasRealData && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-2xl">🐍</span>
          <div>
            <p className="font-bold text-sm text-foreground">Python Tracker Not Running</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Start it: <code className="font-mono bg-black/30 px-2 py-0.5 rounded text-amber-400">python tracker.py {user.username} [password]</code>
            </p>
          </div>
        </div>
      )}

      {/* Bento grid */}
      <div className="mb-8"><BentoGrid items={bentoItems} /></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* App usage */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground">App Usage Today</h2>
            <span className={`text-[11px] px-2 py-0.5 rounded-full border font-mono ${analytics?.hasRealData ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-amber-500/20 bg-amber-500/10 text-amber-400"}`}>
              {analytics?.hasRealData ? "real tracker data" : "no data yet"}
            </span>
          </div>
          {analytics?.appUsageMs && Object.keys(analytics.appUsageMs).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.appUsageMs as Record<string,number>).map(([app, ms]) => {
                const max = Math.max(...Object.values(analytics.appUsageMs as Record<string,number>));
                const pct = ((ms as number) / max * 100).toFixed(0);
                return (
                  <div key={app} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-foreground w-20 truncate">{app}</span>
                    <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-12 text-right">{fmtMs(ms as number)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground gap-2">
              <BarChart3 className="h-8 w-8 opacity-30" />
              <p className="text-xs">Start tracker.py to see real app usage</p>
            </div>
          )}
        </div>

        {/* Prediction */}
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-card to-indigo-500/5 p-5">
          <h2 className="font-bold text-foreground mb-4">🔮 Next Prediction</h2>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono">From: {analytics?.prediction?.currentApp ?? "—"}</p>
            <div className="text-4xl text-indigo-400">↓</div>
            <p className="text-xl font-bold text-indigo-300">{analytics?.prediction?.predictedNextApp ?? "—"}</p>
            <p className="text-xs font-mono text-muted-foreground">Confidence: {analytics?.prediction?.probability ?? 0}%</p>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground leading-relaxed">{analytics?.prediction?.explanation ?? "Need more data"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border border-border bg-card p-5 mb-8">
        <h2 className="font-bold text-foreground mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickAction icon="🎓" title="Study Session" desc="Classroom + VS Code" onClick={() => runAction("study-session","Study Session")} />
          <QuickAction icon="💻" title="Coding Setup" desc="VS Code + GitHub + Terminal" onClick={() => runAction("coding-setup","Coding Setup")} />
          <QuickAction icon="📱" title="Social Apps" desc="WhatsApp + Discord" onClick={() => runAction("social-apps","Social Apps")} />
          <QuickAction icon="🌐" title="Chrome" desc="Open browser" onClick={() => runAction("open-chrome","Chrome")} />
          <QuickAction icon="🐙" title="GitHub" desc="Open repository" onClick={() => runAction("open-github","GitHub")} />
          <QuickAction icon="📚" title="Classroom" desc="Google Classroom" onClick={() => runAction("open-classroom","Classroom")} />
        </div>
      </div>

      {/* AI Suggestions + Live Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold text-foreground mb-4">💡 AI Suggestions</h2>
          {analytics?.suggestions?.length > 0 ? (
            <div className="space-y-2">
              {analytics.suggestions.map((s: string, i: number) => (
                <div key={i} className="p-3 rounded-lg bg-secondary border-l-2 border-indigo-500 text-sm text-foreground/80">{s}</div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Start tracking to get personalized suggestions.</p>}
        </div>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-bold text-foreground text-sm">📟 Live System Logs</h2>
            <button onClick={pollLogs} className="text-xs text-muted-foreground hover:text-foreground transition-colors">↻ Refresh</button>
          </div>
          <div className="h-64"><InteractiveLogs logs={logs} /></div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-xl px-5 py-3 text-sm font-medium shadow-xl text-foreground animate-in slide-in-from-bottom-2">
          {toast}
        </div>
      )}
    </div>
  );
}
