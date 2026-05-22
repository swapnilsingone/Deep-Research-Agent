import type { Depth, OutputStyle, Source } from "./research/types";

export interface HistoryEntry {
  id: string;
  createdAt: number;
  query: string;
  depth: Depth;
  model: string;
  outputStyle: OutputStyle;
  sources: Source[];
  report: string;
}

const KEY = "deep-research-history";
const MAX_ENTRIES = 50;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveHistoryEntry(entry: HistoryEntry) {
  if (typeof window === "undefined") return;
  const list = loadHistory();
  list.unshift(entry);
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES)));
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export function deleteHistoryEntry(id: string) {
  if (typeof window === "undefined") return;
  const list = loadHistory().filter((e) => e.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(list));
}
