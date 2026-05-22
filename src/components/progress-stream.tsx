"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function ProgressStream({
  steps,
  isRunning,
}: {
  steps: string[];
  isRunning: boolean;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isRunning && steps.length > 0) {
      timerRef.current = setTimeout(() => setCollapsed(true), 3000);
    } else {
      setCollapsed(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isRunning, steps.length]);

  if (steps.length === 0) return null;

  return (
    <div className="rounded-lg border border-border/60 bg-card/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="flex w-full items-center gap-2.5 px-4 py-3 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 shrink-0" />
        ) : (
          <ChevronDown className="h-3 w-3 shrink-0" />
        )}
        <span className="font-sans tracking-wider uppercase text-[10px] font-medium">
          {isRunning ? "Research in progress" : `${steps.length} step${steps.length !== 1 ? "s" : ""} completed`}
        </span>
        {isRunning && (
          <span className="ml-1 flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block h-1 w-1 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }}
              />
            ))}
          </span>
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="relative">
            {steps.length > 1 && (
              <div className="absolute left-[8px] top-3 bottom-3 w-px bg-border/60" />
            )}
            <ul className="space-y-3">
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
                const active = isRunning && isLast;
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <div
                      className={`relative z-10 mt-[3px] h-[17px] w-[17px] shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-300 ${
                        active
                          ? "border-primary bg-background"
                          : "border-border bg-muted"
                      }`}
                    >
                      <div
                        className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                          active ? "bg-primary animate-pulse" : "bg-muted-foreground/40"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm leading-relaxed transition-colors duration-300 ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
