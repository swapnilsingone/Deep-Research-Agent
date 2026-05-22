"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import type { OpenRouterModel } from "@/lib/openrouter";

function fmtCost(n: number): string {
  if (!Number.isFinite(n) || n === 0) return "free";
  if (n < 0.01) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(2)}`;
}

export function ModelPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setError(data.error);
        else setModels(data.models ?? []);
      })
      .catch((e) => !cancelled && setError(String(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return models;
    return models.filter(
      (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
    );
  }, [models, query]);

  const selected = models.find((m) => m.id === value);

  return (
    <div className="space-y-2">
      <div className="rounded-md border px-3 py-2 text-sm">
        <div className="font-medium truncate">{selected?.name ?? value}</div>
        {selected ? (
          <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-muted-foreground">
            <Badge variant="secondary">
              in {fmtCost(selected.promptCostPerMillion)}/M
            </Badge>
            <Badge variant="secondary">
              out {fmtCost(selected.completionCostPerMillion)}/M
            </Badge>
            {selected.contextLength ? (
              <Badge variant="outline">
                ctx {(selected.contextLength / 1000).toFixed(0)}k
              </Badge>
            ) : null}
          </div>
        ) : (
          <div className="mt-1 text-xs text-muted-foreground">
            Default selection — pricing loads from OpenRouter.
          </div>
        )}
      </div>

      <Input
        placeholder="Filter models…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading ? (
        <div className="text-xs text-muted-foreground px-1">Loading models…</div>
      ) : error ? (
        <div className="text-xs text-destructive px-1">Failed: {error}</div>
      ) : (
        <div className="relative">
          <ScrollArea className="h-56 rounded-md border">
            <ul className="p-1">
            {filtered.slice(0, 200).map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onChange(m.id)}
                  className={`w-full text-left rounded px-2 py-1.5 text-sm hover:bg-accent ${
                    m.id === value ? "bg-accent" : ""
                  }`}
                >
                  <div className="truncate font-medium">{m.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.id} · in {fmtCost(m.promptCostPerMillion)} / out{" "}
                    {fmtCost(m.completionCostPerMillion)} per 1M
                  </div>
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-2 py-2 text-xs text-muted-foreground">No matches.</li>
            )}
          </ul>
        </ScrollArea>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 rounded-b-md bg-gradient-to-t from-popover to-transparent" />
        </div>
      )}
    </div>
  );
}
