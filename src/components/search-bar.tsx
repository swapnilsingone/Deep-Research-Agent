"use client";

import { ArrowRight, Square } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  onSubmit,
  onStop,
  isRunning,
  inputRef,
  prominent = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop: () => void;
  isRunning: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  prominent?: boolean;
}) {
  return (
    <form
      className="flex w-full items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (isRunning) onStop();
        else onSubmit();
      }}
    >
      <div className={`relative flex-1 ${prominent ? "shadow-lg shadow-black/20" : ""}`}>
        <input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask anything — e.g. latest news on AI regulation in the EU"
          disabled={isRunning}
          className={`
            w-full rounded-lg border border-border/80 bg-card text-foreground
            placeholder:text-muted-foreground/50
            focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60
            disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-200
            font-sans tracking-wide
            ${prominent
              ? "h-14 px-5 text-base"
              : "h-11 px-4 text-sm"
            }
          `}
        />
      </div>
      <button
        type="submit"
        className={`
          shrink-0 flex items-center gap-2 rounded-lg font-sans font-medium tracking-wide
          bg-primary text-primary-foreground
          hover:opacity-90 active:opacity-80
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150
          ${prominent ? "h-14 px-6 text-sm" : "h-11 px-4 text-sm"}
        `}
      >
        {isRunning ? (
          <>
            <Square className="h-3.5 w-3.5 shrink-0" />
            Stop
          </>
        ) : (
          <>
            Research
            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
          </>
        )}
      </button>
    </form>
  );
}
