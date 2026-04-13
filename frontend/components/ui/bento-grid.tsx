"use client";
import { cn } from "@/lib/utils";
import React from "react";

export interface BentoItem {
  title: string; description: string; icon: React.ReactNode;
  status?: string; tags?: string[]; meta?: string; cta?: string;
  colSpan?: number; hasPersistentHover?: boolean; value?: string | number;
}

export function BentoGrid({ items }: { items: BentoItem[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {items.map((item, i) => (
        <div key={i} className={cn(
          "group relative p-4 rounded-xl overflow-hidden transition-all duration-300",
          "border border-border bg-card hover:border-border/80",
          "hover:shadow-[0_2px_20px_rgba(99,102,241,0.08)]",
          "hover:-translate-y-0.5 will-change-transform",
          item.colSpan === 2 ? "md:col-span-2" : "col-span-1",
          item.hasPersistentHover && "border-indigo-500/20 shadow-[0_2px_20px_rgba(99,102,241,0.08)] -translate-y-0.5"
        )}>
          <div className={cn("absolute inset-0 transition-opacity duration-300", item.hasPersistentHover ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-[length:16px_16px]" />
          </div>
          <div className="relative flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-secondary border border-border group-hover:border-indigo-500/30 transition-all duration-300">
                {item.icon}
              </div>
              {item.status && (
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-secondary border border-border text-muted-foreground">
                  {item.status}
                </span>
              )}
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-foreground text-[15px] tracking-tight">
                {item.title}
                {item.meta && <span className="ml-2 text-xs text-muted-foreground font-normal">{item.meta}</span>}
              </h3>
              {item.value !== undefined && (
                <p className="text-2xl font-bold font-mono text-indigo-400">{item.value}</p>
              )}
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.tags?.map((tag, j) => (
                  <span key={j} className="text-[11px] px-2 py-0.5 rounded-md bg-secondary border border-border text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
              <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                {item.cta || "View →"}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
