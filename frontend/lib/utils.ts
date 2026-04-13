import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function fmtMs(ms: number): string {
  if (!ms || ms < 1000) return "<1s";
  const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
export function fmtMins(ms: number): string { return Math.floor(ms / 60000) + "m"; }
