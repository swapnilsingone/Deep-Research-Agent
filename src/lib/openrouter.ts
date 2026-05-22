import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export const DEFAULT_MODEL = "google/gemini-3-flash-preview";

export function openrouter(modelId: string = DEFAULT_MODEL) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  const provider = createOpenAICompatible({
    name: "openrouter",
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    headers: {
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Deep Research Agent",
    },
  });
  return provider(modelId);
}

export interface OpenRouterModel {
  id: string;
  name: string;
  promptCostPerMillion: number;
  completionCostPerMillion: number;
  contextLength?: number;
}

export async function listModels(): Promise<OpenRouterModel[]> {
  const res = await fetch("https://openrouter.ai/api/v1/models", {
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`OpenRouter models fetch failed: ${res.status}`);
  const data = await res.json();
  const items: OpenRouterModel[] = (data.data ?? []).map((m: {
    id: string;
    name?: string;
    pricing?: { prompt?: string; completion?: string };
    context_length?: number;
  }) => ({
    id: m.id,
    name: m.name ?? m.id,
    promptCostPerMillion: Number(m.pricing?.prompt ?? 0) * 1_000_000,
    completionCostPerMillion: Number(m.pricing?.completion ?? 0) * 1_000_000,
    contextLength: m.context_length,
  }));
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}
