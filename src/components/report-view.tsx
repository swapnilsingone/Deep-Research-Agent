"use client";

import * as React from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { OutputStyle, Source } from "@/lib/research/types";

function linkifyCitations(text: string, sources: Source[]): string {
  if (!sources.length) return text;
  const valid = new Set(sources.map((s) => s.id));
  return text.replace(/\[(\d+)\]/g, (match, numStr) => {
    const n = Number(numStr);
    if (!valid.has(n)) return match;
    return `[\\[${n}\\]](#source-${n})`;
  });
}

const components: Components = {
  h1: ({ className, ...p }) => (
    <h1
      className={`font-display font-light mt-8 mb-4 text-[2.6rem] leading-tight tracking-wide text-foreground/95 ${className ?? ""}`}
      {...p}
    />
  ),
  h2: ({ className, ...p }) => (
    <h2
      className={`font-display font-light mt-10 mb-4 pb-2 border-b border-border/60 text-[2rem] leading-snug tracking-wide text-foreground/90 ${className ?? ""}`}
      {...p}
    />
  ),
  h3: ({ className, ...p }) => (
    <h3
      className={`font-sans font-semibold mt-7 mb-2 text-[0.8rem] uppercase tracking-[0.12em] text-muted-foreground ${className ?? ""}`}
      {...p}
    />
  ),
  p: ({ className, ...p }) => (
    <p className={`my-4 leading-[1.8] text-base ${className ?? ""}`} {...p} />
  ),
  ul: ({ className, ...p }) => (
    <ul
      className={`my-4 list-disc pl-7 space-y-2 marker:text-primary/60 ${className ?? ""}`}
      {...p}
    />
  ),
  ol: ({ className, ...p }) => (
    <ol
      className={`my-4 list-decimal pl-7 space-y-2 marker:text-primary/60 ${className ?? ""}`}
      {...p}
    />
  ),
  li: ({ className, ...p }) => (
    <li className={`leading-[1.8] ${className ?? ""}`} {...p} />
  ),
  blockquote: ({ className, ...p }) => (
    <blockquote
      className={`my-5 border-l-2 border-primary/50 bg-primary/5 px-5 py-3 italic text-foreground/85 rounded-r-sm ${className ?? ""}`}
      {...p}
    />
  ),
  hr: () => <hr className="my-8 border-border/50" />,
  strong: ({ className, ...p }) => (
    <strong className={`font-semibold text-foreground ${className ?? ""}`} {...p} />
  ),
  em: ({ className, ...p }) => (
    <em className={`italic ${className ?? ""}`} {...p} />
  ),
  code: ({ className, children, ...p }) => {
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code className={`font-mono text-[0.85em] ${className ?? ""}`} {...p}>
          {children}
        </code>
      );
    }
    return (
      <code
        className={`rounded bg-muted px-1.5 py-0.5 font-mono text-[0.82em] text-foreground/80 ${className ?? ""}`}
        {...p}
      >
        {children}
      </code>
    );
  },
  pre: ({ className, ...p }) => (
    <pre
      className={`my-5 overflow-x-auto rounded-lg border border-border/60 bg-card/80 p-4 font-mono text-sm leading-relaxed ${className ?? ""}`}
      {...p}
    />
  ),
  table: ({ className, ...p }) => (
    <div className="my-6 overflow-x-auto rounded-lg border border-border/60">
      <table
        className={`w-full border-collapse text-[0.88rem] ${className ?? ""}`}
        {...p}
      />
    </div>
  ),
  thead: ({ className, ...p }) => (
    <thead className={`bg-muted/40 ${className ?? ""}`} {...p} />
  ),
  tbody: ({ className, ...p }) => (
    <tbody
      className={`[&_tr:nth-child(even)]:bg-muted/15 ${className ?? ""}`}
      {...p}
    />
  ),
  tr: ({ className, ...p }) => (
    <tr className={`border-b border-border/50 last:border-b-0 ${className ?? ""}`} {...p} />
  ),
  th: ({ className, ...p }) => (
    <th
      className={`px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${className ?? ""}`}
      {...p}
    />
  ),
  td: ({ className, ...p }) => (
    <td
      className={`px-4 py-3 align-top leading-[1.65] ${className ?? ""}`}
      {...p}
    />
  ),
  a: ({ href, children, className, ...p }) => {
    const text = React.Children.toArray(children).join("");
    const m = /^\[(\d+)\]$/.exec(typeof text === "string" ? text : "");
    if (m && href?.startsWith("#source-")) {
      return (
        <a
          href={href}
          className="inline-flex items-center justify-center align-baseline mx-0.5 px-1.5 min-w-[1.35rem] h-[1.15rem] rounded bg-primary/15 text-primary text-[10px] font-semibold tabular-nums leading-none no-underline hover:bg-primary/25 transition-colors"
          {...p}
        >
          {m[1]}
        </a>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={`text-primary underline underline-offset-3 decoration-primary/40 hover:decoration-primary transition-colors ${className ?? ""}`}
        {...p}
      >
        {children}
      </a>
    );
  },
};

export function ReportView({
  report,
  sources,
  outputStyle,
}: {
  report: string;
  sources: Source[];
  outputStyle: OutputStyle;
}) {
  if (!report) return null;

  if (outputStyle === "plain-sources") {
    return (
      <div className="max-w-none font-serif">
        <p className="whitespace-pre-wrap leading-[1.8] text-base">{report}</p>
      </div>
    );
  }

  const content = linkifyCitations(report, sources);
  return (
    <div className="max-w-none font-serif text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        disallowedElements={[
          "script",
          "style",
          "iframe",
          "object",
          "embed",
          "link",
          "meta",
          "form",
          "input",
          "button",
        ]}
        unwrapDisallowed
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
