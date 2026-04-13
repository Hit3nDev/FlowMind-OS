"use client";
import { useEffect, useState, useCallback } from "react";
import { API } from "@/lib/api";

export default function InsightsPage() {
  const [analytics, setAnalytics]     = useState<any>(null);
  const [transitions, setTransitions] = useState<any>({});

  const load = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([API.analytics(), API.transitions()]);
      setAnalytics(a); setTransitions(t);
    } catch {}
  }, []);

  useEffect(() => { load(); const t = setInterval(load, 20000); return () => clearInterval(t); }, [load]);

  const insightCards = analytics ? [
    { t: analytics.productivityScore > 70 ? "🔥 High Productivity Streak" : analytics.productivityScore > 40 ? "✅ Decent Progress" : "⚠️ Low Productivity Alert",
      b: `Your score is ${analytics.productivityScore.toFixed(1)}%. ${analytics.productivityScore > 70 ? "You're in the top performance zone." : analytics.productivityScore > 40 ? "Keep Classroom and VS Code as primary tools." : "Open VS Code or Classroom to improve."}` },
    { t: "🔮 Current Prediction", b: analytics.prediction?.predictedNextApp !== "—"
        ? `Based on ${analytics.prediction?.probability}% confidence, you'll switch to ${analytics.prediction?.predictedNextApp} next. ${analytics.prediction?.explanation}`
        : "Not enough transitions yet. Keep tracking to build the Markov model." },
    analytics.anomalyStatus === "ANOMALY"
      ? { t: "🚨 Anomaly Detected", b: `Unusual usage pattern (score: ${analytics.anomalyScore}). One session is running unusually long.` }
      : { t: "✅ Normal Pattern", b: `No anomalies detected. Anomaly score: ${analytics.anomalyScore}/1.0. Your workflow looks stable.` },
    { t: "💡 Focus Tip", b: analytics.focusTip },
  ] : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">💡 Insights & Explainable AI</h1>
        <p className="text-muted-foreground mt-1 text-sm">Understand your patterns and how the prediction engine works.</p>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <h2 className="font-bold text-foreground mb-4">🧠 How FlowMind Learns Your Workflow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step:"1️⃣", title:"Python Tracker", body:"tracker.py detects your active window every 5s using ctypes/osascript/xdotool. It POSTs real app switches to the backend." },
            { step:"2️⃣", title:"Markov Learning", body:"Every switch is a transition: Chrome→Classroom (n=5). The engine builds a probability table of your real behavior over time." },
            { step:"3️⃣", title:"Prediction", body:"P(next|current) = count/total_switches. The highest-probability next state is shown with confidence % and explanation." },
          ].map(c => (
            <div key={c.step} className="bg-secondary rounded-xl p-4 border border-border">
              <div className="text-2xl mb-2">{c.step}</div>
              <p className="font-bold text-sm text-foreground mb-2">{c.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {insightCards.map((c, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-4 border-t-2 border-t-indigo-500">
            <p className="font-bold text-sm text-foreground mb-2">{c.t}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{c.b}</p>
          </div>
        ))}
        {!analytics && (
          <div className="col-span-2 flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Formulas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold text-foreground mb-3">⚡ Productivity Score Formula</h2>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p><strong className="text-emerald-400">Productive:</strong> VS Code, GitHub, Classroom, Terminal, Jupyter, Notion</p>
            <p><strong className="text-rose-400">Unproductive:</strong> YouTube, Netflix, Instagram, TikTok, Reddit</p>
            <code className="block bg-secondary p-3 rounded-lg text-xs font-mono text-indigo-400 mt-3">score = productive_ms / total_ms × 100</code>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-bold text-foreground mb-3">🚨 Anomaly Detection</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Checks if any single session is <strong className="text-foreground">4× longer than your average</strong>.</p>
          <code className="block bg-secondary p-3 rounded-lg text-xs font-mono text-indigo-400 mt-3">anomaly if max_duration &gt; avg_duration × 4</code>
          <p className="text-xs text-muted-foreground mt-2">Score &gt; 0.6 → ANOMALY → browser notification sent</p>
        </div>
      </div>

      {/* Markov Map */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-bold text-foreground mb-4">🗺 Your Markov Transition Map</h2>
        {Object.keys(transitions).length > 0 ? (
          <div className="space-y-2">
            {Object.entries(transitions).map(([src, targets]: [string, any]) => {
              const total = Object.values(targets as Record<string,number>).reduce((s: number, c: any) => s + c, 0);
              return (
                <div key={src} className="flex items-center flex-wrap gap-2 py-2 border-b border-border last:border-0 font-mono text-xs">
                  <span className="text-indigo-400 font-bold w-20">{src}</span>
                  <span className="text-muted-foreground">→</span>
                  {Object.entries(targets as Record<string,number>).sort(([,a],[,b])=>b-a).map(([app,cnt]) => (
                    <span key={app} className="px-2 py-0.5 bg-secondary border border-border rounded-md text-muted-foreground">
                      {app} <span className="text-amber-400">{((cnt/total)*100).toFixed(0)}%</span>
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        ) : <p className="text-sm text-muted-foreground py-4 text-center">No transitions yet. Keep the tracker running.</p>}
      </div>
    </div>
  );
}
