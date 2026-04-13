"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap, Sparkles } from "lucide-react";
import { API } from "@/lib/api";

function FloatingOrb({ size, x, y, color }: { size: number; x: string; y: string; color: string }) {
  return (
    <div className="absolute rounded-full blur-3xl opacity-20 animate-pulse" style={{ width: size, height: size, left: x, top: y, background: color }} />
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername]   = useState("");
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [connStatus, setConnStatus] = useState<"checking"|"ok"|"err">("checking");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("fm_token")) { router.replace("/dashboard"); return; }
    API.health().then(() => setConnStatus("ok")).catch(() => setConnStatus("err"));
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const data = await API.login(username.trim(), password);
      if (data.error) { setError(data.error); }
      else {
        localStorage.setItem("fm_token", data.token);
        localStorage.setItem("fm_user", JSON.stringify({ username: data.username, displayName: data.displayName }));
        router.push("/dashboard");
      }
    } catch { setError("Cannot connect to backend. Is Spring Boot running?"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left - brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-950 via-[hsl(222,47%,8%)] to-violet-950 overflow-hidden">
        <FloatingOrb size={400} x="-10%" y="-10%" color="rgba(99,102,241,0.6)" />
        <FloatingOrb size={300} x="60%" y="60%" color="rgba(139,92,246,0.5)" />
        <FloatingOrb size={200} x="30%" y="40%" color="rgba(34,211,238,0.3)" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/40">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">FlowMind OS</span>
        </div>
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-3 mb-8 max-w-sm">
            {[
              { label: "Active Users", value: "2.4K" },
              { label: "Sessions Today", value: "18K" },
              { label: "Avg Score", value: "74%" },
              { label: "Apps Tracked", value: "50+" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4">
                <p className="text-2xl font-bold text-white font-mono">{value}</p>
                <p className="text-xs text-indigo-300 mt-1">{label}</p>
              </div>
            ))}
          </div>
          <h2 className="text-3xl font-bold text-white leading-tight">Track every minute.<br />Improve every day.</h2>
          <p className="text-indigo-300 mt-3 text-sm leading-relaxed max-w-sm">FlowMind uses real-time activity tracking and AI to give you genuine insights into your productivity patterns.</p>
        </div>
        <div className="relative z-10 flex gap-6 text-xs text-indigo-400">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Support</a>
        </div>
      </div>

      {/* Right - login form */}
      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <span className="text-xl font-bold text-foreground">FlowMind OS</span>
          </div>

          <div className={`mb-5 px-4 py-2.5 rounded-lg text-xs font-mono border ${connStatus==="ok"?"border-emerald-500/30 bg-emerald-500/10 text-emerald-400":connStatus==="err"?"border-rose-500/30 bg-rose-500/10 text-rose-400":"border-border bg-secondary text-muted-foreground"}`}>
            {connStatus==="checking"?"⏳ Checking backend…":connStatus==="ok"?"✓ Backend connected — FlowMind OS v3.0":"✗ Backend offline — run: mvn spring-boot:run"}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="text-muted-foreground text-sm mt-2">Sign in to your FlowMind workspace</p>
          </div>

          {error && <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Username</label>
              <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. harshit" autoComplete="username" required
                className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
              <div className="relative">
                <input value={password} onChange={e=>setPassword(e.target.value)} type={showPw?"text":"password"} placeholder="••••••••" required
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm" />
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-60">
              {loading?"Signing in…":"Sign In →"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link href="/signup" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Create one</Link>
          </p>
          <p className="text-center text-[11px] text-muted-foreground/50 mt-4 font-mono">
            Demo: harshit / pass123 · demo / demo
          </p>
        </div>
      </div>
    </div>
  );
}
