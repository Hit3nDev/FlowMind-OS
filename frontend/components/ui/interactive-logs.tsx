"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface LogEntry {
  level: string; message: string; formattedTime: string; timestamp: number; username: string;
}

const levelColors: Record<string,string> = {
  INFO:    "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SUCCESS: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  DEBUG:   "bg-slate-500/10 text-slate-400 border-slate-500/20",
  WARN:    "bg-amber-500/10 text-amber-400 border-amber-500/20",
  ERROR:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
  ANOMALY: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

function LogRow({ log, expanded, onToggle }: { log: LogEntry; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <motion.button onClick={onToggle}
        className="w-full p-3 text-left hover:bg-secondary/50 transition-colors border-b border-border last:border-0">
        <div className="flex items-center gap-3">
          <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.div>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide flex-shrink-0", levelColors[log.level] || levelColors.DEBUG)}>
            {log.level}
          </span>
          <time className="font-mono text-[11px] text-muted-foreground flex-shrink-0 w-16">{log.formattedTime}</time>
          <p className="flex-1 text-xs text-foreground/80 truncate">{log.message}</p>
        </div>
      </motion.button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div key="detail"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-b border-border bg-secondary/30">
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Message</p>
              <p className="bg-background rounded-md p-3 font-mono text-xs text-foreground">{log.message}</p>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div><p className="text-muted-foreground uppercase text-[10px] mb-1">Level</p><p className="font-mono text-foreground">{log.level}</p></div>
                <div><p className="text-muted-foreground uppercase text-[10px] mb-1">User</p><p className="font-mono text-foreground">{log.username}</p></div>
                <div><p className="text-muted-foreground uppercase text-[10px] mb-1">Time</p><p className="font-mono text-foreground">{log.formattedTime}</p></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function InteractiveLogs({ logs }: { logs: LogEntry[] }) {
  const [search, setSearch]     = useState("");
  const [expandedId, setExpanded] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState<string[]>([]);

  const levels = Array.from(new Set(logs.map(l => l.level)));
  const filtered = useMemo(() => logs.filter(l =>
    (!search || l.message.toLowerCase().includes(search.toLowerCase())) &&
    (levelFilter.length === 0 || levelFilter.includes(l.level))
  ), [logs, search, levelFilter]);

  const toggleLevel = (lv: string) => setLevelFilter(f => f.includes(lv) ? f.filter(x => x !== lv) : [...f, lv]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs…"
              className="w-full pl-8 pr-3 py-1.5 bg-secondary border border-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-ring text-foreground placeholder:text-muted-foreground" />
          </div>
          <button onClick={() => setShowFilters(f => !f)}
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors",
              showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border text-muted-foreground hover:text-foreground")}>
            <Filter className="h-3.5 w-3.5" />
            {levelFilter.length > 0 && <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center">{levelFilter.length}</span>}
          </button>
        </div>
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex gap-1.5 flex-wrap pt-1">
                {levels.map(lv => (
                  <button key={lv} onClick={() => toggleLevel(lv)}
                    className={cn("flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors",
                      levelFilter.includes(lv) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-border/60")}>
                    {levelFilter.includes(lv) && <Check className="h-3 w-3" />}
                    {lv}
                  </button>
                ))}
                {levelFilter.length > 0 && (
                  <button onClick={() => setLevelFilter([])} className="px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground">Clear</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <p className="text-[11px] text-muted-foreground">{filtered.length} of {logs.length} entries</p>
      </div>
      <div className="flex-1 overflow-y-auto divide-y divide-border">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0
            ? <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2 p-8"><p className="text-sm">No logs match your filters</p></div>
            : filtered.map((log, i) => (
                <motion.div key={log.timestamp + i} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, delay: i * 0.01 }}>
                  <LogRow log={log} expanded={expandedId === i} onToggle={() => setExpanded(expandedId === i ? null : i)} />
                </motion.div>
              ))
          }
        </AnimatePresence>
      </div>
    </div>
  );
}
