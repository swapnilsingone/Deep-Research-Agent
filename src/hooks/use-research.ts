"use client";

import { useCallback, useRef, useState } from "react";
import type {
  Depth,
  OutputStyle,
  ResearchEvent,
  Source,
} from "@/lib/research/types";

export interface ResearchState {
  status: "idle" | "running" | "done" | "error";
  steps: string[];
  sources: Source[];
  report: string;
  error: string | null;
}

const initial: ResearchState = {
  status: "idle",
  steps: [],
  sources: [],
  report: "",
  error: null,
};

export function useResearch() {
  const [state, setState] = useState<ResearchState>(initial);
  const abortRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => setState(initial), []);

  const run = useCallback(
    async (input: {
      query: string;
      depth: Depth;
      model: string;
      outputStyle: OutputStyle;
    }) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setState({ status: "running", steps: [], sources: [], report: "", error: null });

      try {
        const res = await fetch("/api/research", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(input),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
          throw new Error(err.error ?? `HTTP ${res.status}`);
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split("\n\n");
          buffer = parts.pop() ?? "";
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload) continue;
            let event: ResearchEvent;
            try {
              event = JSON.parse(payload) as ResearchEvent;
            } catch {
              continue;
            }
            setState((s) => {
              switch (event.type) {
                case "step":
                  return { ...s, steps: [...s.steps, event.label] };
                case "sources":
                  return { ...s, sources: event.items };
                case "token":
                  return { ...s, report: s.report + event.delta };
                case "error":
                  return { ...s, status: "error", error: event.message };
                case "done":
                  return s.status === "error" ? s : { ...s, status: "done" };
              }
            });
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState((s) => ({
          ...s,
          status: "error",
          error: err instanceof Error ? err.message : String(err),
        }));
      }
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setState((s) => (s.status === "running" ? { ...s, status: "idle" } : s));
  }, []);

  return { state, run, stop, reset, setState };
}
