"use client";
import { useEffect, useState, useCallback } from "react";
import { API } from "@/lib/api";
import { fmtMs, fmtMins } from "@/lib/utils";
import { InteractiveLogs } from "@/components/ui/interactive-logs";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);

  const load = useCallback(async () => {
    try { const d = await API.analytics(); setData(d); } catch {}
    try { const l = await API.logs(); setLogs(l); } catch {}
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 12000); return () => clearInterval(t); }, [load]);

  const score = data?.productivityScore ?? 0;
  const scoreColor = score > 70 ? "text-emerald-400" : score > 40 ? "text-amber-400" : "text-rose-400";
  const barColor   = score > 70 ? "from-emerald-600 to-emerald-400" : score > 40 ? "from-amber-600 to-amber-400" : "from-rose-600 to-rose-400";

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">📊 Analytics</h1>
        <p className="text-muted-foreground mt-1 text-sm">Detailed productivity metrics from real tracking data.</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Productivity Score", value: `${score.toFixed(1)}%`, sub: score>70?"🔥 Excellent":score>40?"✅ Good":"💡 Needs Work", color: scoreColor, bar: barColor, pct: score },
          { label: "Productive Time",   value: fmtMins(data?.productiveMs??0), sub: "Working effectively", color: "text-emerald-400", bar:"from-emerald-600 to-emerald-400", pct: data?.totalActiveMs ? data.productiveMs/data.totalActiveMs*100 : 0 },
          { label: "Unproductive Time", value: fmtMins(data?.unproductiveMs??0), sub: "Distractions today", color: "text-rose-400", bar:"from-rose-600 to-rose-400", pct: data?.totalActiveMs ? data.unproductiveMs/data.totalActiveMs*100 : 0 },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-5">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">{c.label}</p>
            <p className={`text-4xl font-bold font-mono ${c.color}`}>{c.value}</p>
            <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all duration-700`} style={{ width: `${Math.min(c.pct, 100)}%` }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* App usage + Frequency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold text-foreground mb-4">App Usage Distribution</h2>
          {data?.appUsageMs && Object.keys(data.appUsageMs).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.appUsageMs as Record<string,number>).map(([app, ms]) => {
                const max = Math.max(...Object.values(data.appUsageMs as Record<string,number>));
                return (
                  <div key={app} className="flex items-center gap-3">
                    <span className="text-xs font-semibold w-20 truncate text-foreground">{app}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600" style={{ width: `${(ms/max*100).toFixed(0)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-14 text-right">{fmtMs(ms as number)}</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground py-4 text-center">No data yet — start tracker.py</p>}
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold text-foreground mb-4">App Switch Frequency</h2>
          {data?.appFrequency && Object.keys(data.appFrequency).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(data.appFrequency as Record<string,number>).sort(([,a],[,b])=>b-a).map(([app,cnt]) => {
                const max = Math.max(...Object.values(data.appFrequency as Record<string,number>));
                return (
                  <div key={app} className="flex items-center gap-3">
                    <span className="text-xs font-semibold w-20 truncate text-foreground">{app}</span>
                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-pink-600" style={{ width: `${(cnt/max*100).toFixed(0)}%` }} />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground w-8 text-right">{cnt}×</span>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-sm text-muted-foreground py-4 text-center">No frequency data yet</p>}
        </div>
      </div>

      {/* Prediction + Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-card to-indigo-500/5 p-5">
          <h2 className="font-bold text-foreground mb-4">🔮 Prediction Engine</h2>
          <p className="text-xs text-muted-foreground font-mono">From: {data?.prediction?.currentApp ?? "—"}</p>
          <p className="text-3xl text-indigo-400 my-2">↓</p>
          <p className="text-2xl font-bold text-indigo-300">{data?.prediction?.predictedNextApp ?? "—"}</p>
          <p className="text-xs font-mono text-muted-foreground mt-1">Confidence: {data?.prediction?.probability ?? 0}%</p>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed border-t border-border pt-3">{data?.prediction?.explanation ?? "Need more data."}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold text-foreground mb-4">💡 AI Suggestions</h2>
          {data?.suggestions?.length ? (
            <div className="space-y-2">
              {data.suggestions.map((s: string, i: number) => (
                <div key={i} className="p-3 rounded-lg border-l-2 border-indigo-500 bg-secondary text-sm text-foreground/80">{s}</div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">No suggestions yet.</p>}
        </div>
      </div>

      {/* Logs */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <h2 className="font-bold text-foreground">System Logs</h2>
          <button onClick={load} className="text-xs text-muted-foreground hover:text-foreground">↻ Refresh</button>
        </div>
        <div className="h-80"><InteractiveLogs logs={logs} /></div>
      </div>
    </div>
  );
}
