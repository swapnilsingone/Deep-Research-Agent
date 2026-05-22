import { generateObject, streamText } from "ai";
import { z } from "zod";
import { openrouter } from "../openrouter";
import { searchExa } from "../exa";
import { systemPromptFor, userPromptFor } from "./prompts";
import type { OrchestratorContext, Source } from "./types";

const PlanSchema = z.object({
  subQueries: z.array(z.string()).min(2).max(5),
});

export async function runMultiStep({ config, emit }: OrchestratorContext) {
  emit({ type: "step", label: "Planning sub-queries…" });

  let subQueries: string[];
  try {
    const { object } = await generateObject({
      model: openrouter(config.model),
      schema: PlanSchema,
      prompt: `You are a research planner. Break the following user question into 3 to 5 focused web search sub-queries that together would let you write a thorough answer. Return ONLY the sub-queries (no preface).\n\nUser question: ${config.query}`,
    });
    subQueries = object.subQueries;
  } catch {
    subQueries = [config.query];
  }

  for (const q of subQueries) {
    emit({ type: "step", label: `Searching Exa: ${q}` });
  }

  const batches = await Promise.all(
    subQueries.map((q) => searchExa(q, { numResults: 4, withContents: true })),
  );

  const seen = new Set<string>();
  const merged: Source[] = [];
  for (const batch of batches) {
    for (const s of batch) {
      if (seen.has(s.url)) continue;
      seen.add(s.url);
      merged.push({ ...s, id: merged.length + 1 });
    }
  }

  if (merged.length === 0) {
    emit({ type: "error", message: "No sources found for this query." });
    emit({ type: "done" });
    return;
  }

  emit({ type: "sources", items: merged });
  emit({ type: "step", label: `Synthesizing report from ${merged.length} sources…` });

  const result = streamText({
    model: openrouter(config.model),
    system: systemPromptFor(config.outputStyle),
    prompt: userPromptFor(config.query, merged),
  });

  for await (const chunk of result.textStream) {
    emit({ type: "token", delta: chunk });
  }

  emit({ type: "done" });
}
