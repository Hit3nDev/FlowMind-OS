"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X, Send, Paperclip, Square, Zap, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { API } from "@/lib/api";
import { useRouter } from "next/navigation";

interface Message { role: "user" | "assistant"; content: string; ts: number; }

const QUICK = [
  "Show my productivity score",
  "What did I do today?",
  "Predict my next app",
  "Start study session",
  "Open VS Code",
  "Give me focus tips",
];

function MarkdownLite({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        const code = bold.replace(/`([^`]+)`/g, '<code class="bg-black/30 px-1 py-0.5 rounded text-xs font-mono">$1</code>');
        if (line.startsWith("• ") || line.startsWith("- "))
          return <div key={i} className="flex gap-1.5"><span className="text-indigo-400 mt-0.5">•</span><span dangerouslySetInnerHTML={{ __html: code.replace(/^[•\-]\s/,"") }} /></div>;
        return <p key={i} dangerouslySetInnerHTML={{ __html: code }} className={line === "" ? "h-2" : ""} />;
      })}
    </div>
  );
}

export function ChatWidget() {
  const router   = useRouter();
  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState<Message[]>([]);
  const [input, setInput]         = useState("");
  const [loading, setLoading]     = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const fileRef    = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: "assistant",
        content: "Hey! I'm **FlowMind AI** 🤖 — powered by Claude.\n\nI can:\n• Answer any question\n• Analyse your real productivity data\n• Open apps and launch workflows\n• Help with coding, writing, math…\n\nTry: *show productivity*, *start study session*, or just ask anything!",
        ts: Date.now(),
      }]);
    }
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg && attachments.length === 0) return;
    setMessages(p => [...p, { role: "user", content: msg, ts: Date.now() }]);
    setInput("");
    setAttachments([]);
    setLoading(true);
    try {
      const data = await API.chat(msg);
      setMessages(p => [...p, { role: "assistant", content: data.reply || "(no response)", ts: Date.now() }]);
      if (data.action === "SHOW_ANALYTICS") { setTimeout(() => router.push("/analytics"), 800); }
      if (data.action === "SHOW_TIMELINE")  { setTimeout(() => router.push("/timeline"), 800); }
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "⚠️ Cannot reach backend. Is Spring Boot running on port 8080?", ts: Date.now() }]);
    } finally { setLoading(false); }
  }, [input, attachments, router]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMessages([]);

  return (
    <>
      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/40 hover:scale-110 transition-transform">
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}} transition={{duration:0.15}}><X className="h-5 w-5 text-white" /></motion.div>
            : <motion.div key="bot" initial={{rotate:90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.15}}><Bot className="h-5 w-5 text-white" /></motion.div>
          }
        </AnimatePresence>
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-24 right-6 z-50 w-[380px] h-[540px] bg-[hsl(222,47%,8%)] border border-border rounded-2xl flex flex-col shadow-2xl shadow-black/50 overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-[hsl(222,47%,10%)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">FlowMind AI</p>
                  <p className="text-[10px] text-emerald-400 font-mono">CLAUDE-POWERED · CONTEXT-AWARE</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={clearChat} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors" title="Clear chat">
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setOpen(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Zap className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className={cn("max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-br-sm font-medium"
                      : "bg-secondary border border-border text-foreground rounded-bl-sm"
                  )}>
                    {m.role === "assistant" ? <MarkdownLite text={m.content} /> : m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                  <div className="bg-secondary border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            {messages.length <= 1 && (
              <div className="px-3 pb-1 flex flex-wrap gap-1.5">
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary hover:border-indigo-500/40 hover:text-indigo-400 text-muted-foreground transition-colors">
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-3 border-t border-border">
              {attachments.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {attachments.map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-secondary rounded-lg px-2 py-1 text-[11px]">
                      <Paperclip className="h-3 w-3 text-muted-foreground" />
                      <span className="text-foreground truncate max-w-[100px]">{f.name}</span>
                      <button onClick={() => setAttachments(a => a.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-rose-400">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder="Ask anything…"
                    rows={1}
                    disabled={loading}
                    className="w-full bg-secondary border border-border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all min-h-[40px] max-h-[120px] overflow-y-auto"
                    style={{ height: "auto" }}
                    onInput={e => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 120) + "px";
                    }}
                  />
                  <button onClick={() => fileRef.current?.click()}
                    className="absolute right-2.5 bottom-2.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                </div>
                <button
                  onClick={() => send()}
                  disabled={loading || (!input.trim() && attachments.length === 0)}
                  className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                    !loading && (input.trim() || attachments.length > 0)
                      ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white hover:brightness-110 shadow-sm"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  )}>
                  {loading ? <Square className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
                </button>
              </div>
              <input ref={fileRef} type="file" multiple className="hidden"
                onChange={e => setAttachments(a => [...a, ...Array.from(e.target.files || [])])} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
