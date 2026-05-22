"use client";

import { useEffect, useRef, useState } from "react";
import { Telescope } from "lucide-react";
import { SearchBar } from "@/components/search-bar";
import { SettingsPanel } from "@/components/settings-panel";
import { ProgressStream } from "@/components/progress-stream";
import { ReportView } from "@/components/report-view";
import { SourcesList } from "@/components/sources-list";
import { HistoryDrawer } from "@/components/history-drawer";
import { ThemeToggle } from "@/components/theme-toggle";
import { useResearch } from "@/hooks/use-research";
import { DEFAULT_MODEL } from "@/lib/openrouter";
import { saveHistoryEntry, type HistoryEntry } from "@/lib/history";
import type { Depth, OutputStyle } from "@/lib/research/types";

export default function Page() {
  const [query, setQuery] = useState("");
  const [depth, setDepth] = useState<Depth>("single-shot");
  const [outputStyle, setOutputStyle] = useState<OutputStyle>("markdown-citations");
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const { state, run, stop, setState } = useResearch();
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (
      state.status === "done" &&
      state.report.trim() &&
      state.sources.length > 0 &&
      savedKey !== state.report
    ) {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        query,
        depth,
        model,
        outputStyle,
        sources: state.sources,
        report: state.report,
      };
      saveHistoryEntry(entry);
      setSavedKey(state.report);
    }
  }, [state.status, state.report, state.sources, query, depth, model, outputStyle, savedKey]);

  const onSubmit = () => {
    if (!query.trim()) return;
    setSavedKey(null);
    run({ query: query.trim(), depth, model, outputStyle });
  };

  const onPickHistory = (e: HistoryEntry) => {
    setQuery(e.query);
    setDepth(e.depth);
    setModel(e.model);
    setOutputStyle(e.outputStyle);
    setState({
      status: "done",
      steps: [],
      sources: e.sources,
      report: e.report,
      error: null,
    });
  };

  const isRunning = state.status === "running";
  const hasResult = !!(state.report || state.sources.length > 0);
  const inputRef = useRef<HTMLInputElement>(null);

  const onReset = () => {
    stop();
    setState({ status: "idle", steps: [], sources: [], report: "", error: null });
    setQuery("");
    setSavedKey(null);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const EXAMPLE_QUERIES = [
    "Latest breakthroughs in nuclear fusion energy",
    "Compare Claude 4 vs GPT-4o for coding tasks",
    "How does the EU AI Act affect startups?",
    "Best React Server Component patterns in 2025",
  ];

  const isIdle = state.status === "idle" && !state.report;

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border/60 backdrop-blur-sm bg-background/80 sticky top-0 z-40">
        <div className="mx-auto max-w-5xl w-full px-4 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2.5 hover:opacity-75 transition-opacity group"
          >
            <Telescope className="h-4 w-4 text-primary shrink-0" />
            <span className="font-display text-base font-medium tracking-[0.14em] uppercase text-foreground/90">
              Deep Research
            </span>
          </button>
          <div className="flex items-center gap-1.5">
            <HistoryDrawer onPick={onPickHistory} />
            <SettingsPanel
              depth={depth}
              setDepth={setDepth}
              outputStyle={outputStyle}
              setOutputStyle={setOutputStyle}
              model={model}
              setModel={setModel}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {isIdle ? (
        <section className="mx-auto max-w-5xl w-full px-4 flex flex-col items-center gap-10 pt-20 pb-10">
          <div className="text-center animate-fade-up" style={{ animationDelay: "0ms" }}>
            <h1 className="font-display font-light text-[4.5rem] leading-none tracking-[0.08em] uppercase text-foreground/90 sm:text-[5.5rem]">
              Deep Research
            </h1>
            <p className="mt-4 text-xs tracking-[0.35em] uppercase text-muted-foreground font-medium">
              Intelligence · Synthesized
            </p>
          </div>

          <div className="w-full max-w-2xl animate-fade-up" style={{ animationDelay: "80ms" }}>
            <SearchBar
              value={query}
              onChange={setQuery}
              onSubmit={onSubmit}
              onStop={stop}
              isRunning={isRunning}
              inputRef={inputRef}
              prominent
            />
          </div>

          <div
            className="flex flex-wrap gap-2 justify-center max-w-2xl animate-fade-up"
            style={{ animationDelay: "160ms" }}
          >
            {EXAMPLE_QUERIES.map((q, i) => (
              <button
                key={q}
                type="button"
                style={{ animationDelay: `${200 + i * 60}ms` }}
                onClick={() => {
                  setQuery(q);
                  inputRef.current?.focus();
                }}
                className="animate-fade-up rounded-full border border-border/70 px-4 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-primary/5 transition-all duration-200 tracking-wide"
              >
                {q}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-5xl w-full px-4 py-6 space-y-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onSubmit={onSubmit}
            onStop={stop}
            isRunning={isRunning}
            inputRef={inputRef}
          />

          {state.steps.length > 0 && (
            <ProgressStream steps={state.steps} isRunning={isRunning} />
          )}

          {state.error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {state.error}
            </div>
          )}

          {(state.report || state.sources.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              <div className="min-w-0">
                <ReportView
                  report={state.report}
                  sources={state.sources}
                  outputStyle={outputStyle}
                />
                {outputStyle === "plain-sources" && state.sources.length > 0 && (
                  <div className="mt-6">
                    <SourcesList sources={state.sources} />
                  </div>
                )}
              </div>
              {outputStyle !== "plain-sources" && (
                <aside>
                  <SourcesList sources={state.sources} />
                </aside>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
