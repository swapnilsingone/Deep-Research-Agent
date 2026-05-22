"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import type { Source } from "@/lib/research/types";

function cleanSourceText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function SourcesList({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5 pb-1">
        <h3 className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Sources
        </h3>
        <span className="inline-flex items-center justify-center h-4 min-w-[1.25rem] rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold text-primary tabular-nums">
          {sources.length}
        </span>
      </div>
      <ol className="space-y-2">
        {sources.map((s) => {
          const host = hostOf(s.url);
          const date = formatDate(s.publishedDate);
          return (
            <li
              key={s.id}
              id={`source-${s.id}`}
              className="group rounded-lg border border-border/60 bg-card/60 p-3 transition-all duration-200 hover:border-primary/30 hover:bg-card target:border-primary/40 scroll-mt-24"
            >
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer noopener"
                className="block"
              >
                <div className="flex items-start gap-2.5">
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
                    alt=""
                    width={16}
                    height={16}
                    unoptimized
                    className="mt-0.5 h-4 w-4 shrink-0 rounded-sm bg-muted opacity-80"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-1.5">
                      <span className="inline-flex h-4 min-w-[1.25rem] items-center justify-center rounded bg-primary/15 px-1 text-[9px] font-bold text-primary tabular-nums leading-none shrink-0">
                        {s.id}
                      </span>
                      <span className="line-clamp-2 text-xs font-medium leading-snug text-foreground/85 group-hover:text-foreground transition-colors">
                        {s.title}
                      </span>
                      <ExternalLink className="ml-auto mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="mt-1 truncate text-[10px] text-muted-foreground/70 font-sans tracking-wide">
                      {host}
                      {date ? <span className="opacity-60"> · {date}</span> : null}
                    </div>
                  </div>
                </div>
                {s.snippet ? (
                  <p className="mt-2 line-clamp-3 text-[11px] leading-relaxed text-muted-foreground/70">
                    {cleanSourceText(s.snippet)}
                  </p>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
