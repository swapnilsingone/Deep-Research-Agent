import { streamText } from "ai";
import { openrouter } from "../openrouter";
import { searchExa } from "../exa";
import { systemPromptFor, userPromptFor } from "./prompts";
import type { OrchestratorContext } from "./types";

export async function runSingleShot({ config, emit }: OrchestratorContext) {
  emit({ type: "step", label: `Searching Exa for: "${config.query}"` });
  const sources = await searchExa(config.query, { numResults: 6, withContents: true });

  if (sources.length === 0) {
    emit({ type: "error", message: "No sources found for this query." });
    emit({ type: "done" });
    return;
  }

  emit({ type: "sources", items: sources });
  emit({ type: "step", label: `Reading ${sources.length} sources and synthesizing answer…` });

  const result = streamText({
    model: openrouter(config.model),
    system: systemPromptFor(config.outputStyle),
    prompt: userPromptFor(config.query, sources),
  });

  for await (const chunk of result.textStream) {
    emit({ type: "token", delta: chunk });
  }

  emit({ type: "done" });
}
