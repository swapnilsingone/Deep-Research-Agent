import Exa from "exa-js";
import type { Source } from "./research/types";

let client: Exa | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.EXA_API_KEY;
    if (!apiKey) throw new Error("EXA_API_KEY is not set");
    client = new Exa(apiKey);
  }
  return client;
}

export interface ExaSearchOptions {
  numResults?: number;
  withContents?: boolean;
}

interface ExaResult {
  title?: string | null;
  url: string;
  publishedDate?: string;
  text?: string;
}

function trim(text: string | undefined, max = 2000): string {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export async function searchExa(
  query: string,
  { numResults = 6, withContents = true }: ExaSearchOptions = {},
): Promise<Source[]> {
  const exa = getClient();
  const response = withContents
    ? await exa.searchAndContents(query, {
        numResults,
        text: { maxCharacters: 2500 },
        type: "auto",
      })
    : await exa.search(query, { numResults, type: "auto" });

  const results = (response.results ?? []) as ExaResult[];
  return results.map((r, idx) => ({
    id: idx + 1,
    title: r.title ?? r.url,
    url: r.url,
    snippet: trim(r.text, 2000),
    publishedDate: r.publishedDate,
  }));
}
