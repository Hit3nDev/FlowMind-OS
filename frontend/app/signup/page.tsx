"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Zap } from "lucide-react";
import { API } from "@/lib/api";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm]   = useState({ displayName:"", username:"", email:"", password:"" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("fm_token")) router.replace("/dashboard");
  }, [router]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const data = await API.signup(form.username.trim().toLowerCase(), form.password, form.displayName.trim(), form.email.trim());
      if (data.error) setError(data.error);
      else {
        localStorage.setItem("fm_token", data.token);
        localStorage.setItem("fm_user", JSON.stringify({ username: data.username, displayName: data.displayName }));
        router.push("/dashboard");
      }
    } catch { setError("Cannot connect to backend."); }
    finally { setLoading(false); }
  };

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({...p, [k]: e.target.value}));

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
          <span className="text-xl font-bold text-foreground">FlowMind OS</span>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create account</h1>
          <p className="text-muted-foreground text-sm mt-2">Start tracking your productivity today</p>
        </div>
        {error && <div className="mb-4 p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm">{error}</div>}
        <form onSubmit={handle} className="space-y-4">
          {[
            { label:"Display Name", key:"displayName", type:"text", ph:"Your full name" },
            { label:"Username",     key:"username",    type:"text", ph:"lowercase, no spaces" },
            { label:"Email",        key:"email",       type:"email",ph:"you@example.com (optional)" },
          ].map(({ label, key, type, ph }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</label>
              <input value={form[key as keyof typeof form]} onChange={f(key)} type={type} placeholder={ph}
                className="w-full h-11 px-4 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</label>
            <div className="relative">
              <input value={form.password} onChange={f("password")} type={showPw?"text":"password"} placeholder="min 4 characters" required
                className="w-full h-11 px-4 pr-11 rounded-xl border border-border bg-secondary text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm" />
              <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-sm shadow-lg shadow-indigo-500/25 disabled:opacity-60">
            {loading?"Creating…":"Create Account →"}
          </button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
