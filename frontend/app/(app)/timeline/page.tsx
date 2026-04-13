"use client";
import { useEffect, useState, useCallback } from "react";
import { API } from "@/lib/api";
import { fmtMs } from "@/lib/utils";
import { cn } from "@/lib/utils";

type FilterType = "ALL" | "PRODUCTIVE" | "UNPRODUCTIVE" | "NEUTRAL";
const FILTERS: FilterType[] = ["ALL","PRODUCTIVE","UNPRODUCTIVE","NEUTRAL"];
const catColors: Record<string,string> = {
  PRODUCTIVE:   "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  UNPRODUCTIVE: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  NEUTRAL:      "border-border bg-secondary text-muted-foreground",
};

export default function TimelinePage() {
  const [entries, setEntries]   = useState<any[]>([]);
  const [filter, setFilter]     = useState<FilterType>("ALL");
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try { const d = await API.timeline(); setEntries(d); } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 15000); return () => clearInterval(t); }, [load]);

  const shown   = filter === "ALL" ? entries : entries.filter(e => e.category === filter);
  const prodCnt = entries.filter(e => e.category === "PRODUCTIVE").length;
  const unpCnt  = entries.filter(e => e.category === "UNPRODUCTIVE").length;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">📋 Activity Timeline</h1>
        <p className="text-muted-foreground mt-1 text-sm">Every session tracked by the Python tracker — in real time.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:"Total Sessions",   value: entries.length,   color:"text-foreground" },
          { label:"Productive",        value: prodCnt,          color:"text-emerald-400" },
          { label:"Unproductive",      value: unpCnt,           color:"text-rose-400" },
        ].map(c => (
          <div key={c.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className={`text-3xl font-bold font-mono ${c.color}`}>{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all border",
              filter === f ? "bg-indigo-600 text-white border-indigo-600 shadow-sm" : "border-border bg-secondary text-muted-foreground hover:text-foreground")}>
            {f === "ALL" ? `All (${entries.length})` : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
        <button onClick={load} className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors">↻ Refresh</button>
      </div>

      {/* Timeline */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" /></div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <p className="text-4xl">📋</p>
          <p className="text-sm">No activity yet. Start the Python tracker:</p>
          <code className="text-xs bg-secondary px-3 py-1.5 rounded-lg border border-border text-indigo-400 font-mono">python tracker.py [username] [password]</code>
        </div>
      ) : (
        <div className="space-y-2">
          {shown.map((e: any, i: number) => (
            <div key={i} className="grid grid-cols-[80px_1fr_auto] gap-4 items-center p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-all">
              <div>
                <p className="text-xs font-mono text-muted-foreground">{e.startFormatted}</p>
                <p className="text-[10px] font-mono text-muted-foreground/50">→ {e.endFormatted}</p>
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{e.appName}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-xs">{e.windowTitle}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-xs font-mono text-muted-foreground">{fmtMs(e.durationMs)}</p>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase", catColors[e.category] || catColors.NEUTRAL)}>
                  {e.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
