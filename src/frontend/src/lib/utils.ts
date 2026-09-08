import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const date = new Date(seconds * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function formatRelativeTime(seconds: number): string {
  const now = Date.now() / 1000;
  const diff = now - seconds;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getInitial(name: string): string {
  return name?.charAt(0)?.toUpperCase() ?? "?";
}

export function clampScale(value: number, min = 0.3, max = 3): number {
  return Math.min(max, Math.max(min, value));
}
