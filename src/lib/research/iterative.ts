import { generateObject, streamText } from "ai";
import { z } from "zod";
import { openrouter } from "../openrouter";
import { searchExa } from "../exa";
import { formatSourcesForPrompt, systemPromptFor, userPromptFor } from "./prompts";
import type { OrchestratorContext, Source } from "./types";

const PlanSchema = z.object({
  subQueries: z.array(z.string()).min(2).max(5),
});

const GapSchema = z.object({
  gaps: z.array(z.string()),
  followUpQueries: z.array(z.string()),
});

const MAX_ITERATIONS = 3;

export async function runIterative({ config, emit }: OrchestratorContext) {
  emit({ type: "step", label: "Planning initial sub-queries…" });

  let queries: string[];
  try {
    const { object } = await generateObject({
      model: openrouter(config.model),
      schema: PlanSchema,
      prompt: `Break the following user question into 3 to 5 focused web search sub-queries.\n\nQuestion: ${config.query}`,
    });
    queries = object.subQueries;
  } catch {
    queries = [config.query];
  }

  const seen = new Set<string>();
  const merged: Source[] = [];

  for (let iteration = 1; iteration <= MAX_ITERATIONS; iteration++) {
    for (const q of queries) emit({ type: "step", label: `Searching Exa: ${q}` });
    const batches = await Promise.all(
      queries.map((q) => searchExa(q, { numResults: 4, withContents: true })),
    );
    for (const batch of batches) {
      for (const s of batch) {
        if (seen.has(s.url)) continue;
        seen.add(s.url);
        merged.push({ ...s, id: merged.length + 1 });
      }
    }

    emit({ type: "sources", items: merged });

    if (iteration === MAX_ITERATIONS) break;

    emit({ type: "step", label: `Reflecting on gaps (iteration ${iteration})…` });
    try {
      const { object } = await generateObject({
        model: openrouter(config.model),
        schema: GapSchema,
        prompt: `You are auditing research progress for the question: "${config.query}".\n\nSources collected so far:\n${formatSourcesForPrompt(merged.slice(0, 20))}\n\nList any important gaps in the information and propose up to 3 follow-up web search queries. If there are no meaningful gaps, return empty arrays.`,
      });
      if (!object.followUpQueries.length) break;
      queries = object.followUpQueries.slice(0, 3);
    } catch {
      break;
    }
  }

  if (merged.length === 0) {
    emit({ type: "error", message: "No sources found." });
    emit({ type: "done" });
    return;
  }

  emit({ type: "step", label: `Synthesizing final report from ${merged.length} sources…` });

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
