"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API, getUser, clearAuth } from "@/lib/api";
import { cn } from "@/lib/utils";

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={cn("relative w-11 h-6 rounded-full transition-all duration-200 flex-shrink-0", on ? "bg-indigo-600" : "bg-secondary border border-border")}>
      <div className={cn("absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export default function SettingsPage() {
  const router  = useRouter();
  const user    = getUser();
  const token   = typeof window !== "undefined" ? localStorage.getItem("fm_token") || "" : "";
  const [tracking, setTracking]   = useState(true);
  const [notifPerm, setNotifPerm] = useState("default");

  useEffect(() => {
    API.status().then(d => setTracking(d.tracking)).catch(() => {});
    if ("Notification" in window) setNotifPerm(Notification.permission);
  }, []);

  const toggleTracking = async () => {
    const next = !tracking; setTracking(next);
    try { await API.setTracking(next); } catch {}
  };

  const requestNotif = async () => {
    if (!("Notification" in window)) return;
    const r = await Notification.requestPermission();
    setNotifPerm(r);
    if (r === "granted") new Notification("FlowMind OS", { body: "Notifications enabled!" });
  };

  const logout = async () => {
    try { await API.logout(); } catch {}
    clearAuth(); router.push("/login");
  };

  const SettingRow = ({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-4 border-b border-border last:border-0">
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl border border-border bg-card p-5 mb-5">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground font-mono mb-4">{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">⚙ Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage FlowMind OS configuration and preferences.</p>
      </div>

      <Section title="Account">
        <SettingRow title="Display Name" desc="Your visible name"><span className="text-sm font-mono text-muted-foreground">{user.displayName}</span></SettingRow>
        <SettingRow title="Username"><span className="text-sm font-mono text-indigo-400">{user.username}</span></SettingRow>
        <SettingRow title="Session Token" desc="Used for API authentication">
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">{token.substring(0,16)}…</span>
        </SettingRow>
      </Section>

      <Section title="Activity Tracking">
        <SettingRow title="Enable Tracking" desc="Allow backend to receive Python tracker data"><Toggle on={tracking} onToggle={toggleTracking} /></SettingRow>
        <SettingRow title="Tracker Setup" desc="How to start the Python tracker">
          <code className="text-xs font-mono bg-secondary px-3 py-1.5 rounded-lg border border-border text-indigo-400">
            python tracker.py {user.username} [password]
          </code>
        </SettingRow>
        <SettingRow title="Poll Interval"><span className="text-sm font-mono text-muted-foreground">5 seconds</span></SettingRow>
      </Section>

      <Section title="Notifications">
        <SettingRow title="Browser Notifications" desc={`Permission: ${notifPerm}`}>
          <button onClick={requestNotif}
            className={cn("px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all",
              notifPerm==="granted" ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" :
              notifPerm==="denied"  ? "border-rose-500/30 bg-rose-500/10 text-rose-400 cursor-not-allowed" :
              "border-border bg-secondary text-muted-foreground hover:text-foreground")}>
            {notifPerm==="granted"?"✓ Enabled":notifPerm==="denied"?"✗ Blocked":"Enable"}
          </button>
        </SettingRow>
      </Section>

      <Section title="Productivity Classification">
        <div className="space-y-3">
          {[
            { label:"Productive", color:"emerald", apps:["VS Code","GitHub","Classroom","Terminal","IntelliJ","Jupyter","Notion"] },
            { label:"Unproductive", color:"rose",   apps:["YouTube","Netflix","Instagram","TikTok","Twitter/X","Reddit"] },
            { label:"Neutral",   color:"slate",   apps:["Chrome","Firefox","Edge","Others"] },
          ].map(({ label, color, apps }) => (
            <div key={label}>
              <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 text-${color}-400`}>{label}</p>
              <div className="flex flex-wrap gap-1.5">
                {apps.map(a => <span key={a} className={`text-xs px-2 py-0.5 rounded-full border border-${color}-500/20 bg-${color}-500/10 text-${color}-400`}>{a}</span>)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="About">
        <div className="text-sm text-muted-foreground leading-8 font-mono text-xs">
          <p><strong className="text-foreground">FlowMind OS v3.0</strong> — AI Productivity & Workflow Intelligence</p>
          <p>Backend: Spring Boot 3.2 (Java 17)</p>
          <p>Tracker: Python 3 (psutil, requests)</p>
          <p>Frontend: Next.js 14 + TypeScript + Tailwind CSS</p>
          <p>AI: Anthropic Claude API (claude-opus-4-5)</p>
          <p>ML Engine: Markov Chain Prediction</p>
          <p>Patterns: Singleton + Strategy (GoF)</p>
        </div>
      </Section>

      <button onClick={logout} className="w-full py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-rose-400 hover:bg-rose-500/10 transition-all font-semibold text-sm">
        Sign Out
      </button>
    </div>
  );
}
