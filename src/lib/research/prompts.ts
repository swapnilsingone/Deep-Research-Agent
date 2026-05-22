import type { OutputStyle, Source } from "./types";

export function formatSourcesForPrompt(sources: Source[]): string {
  return sources
    .map(
      (s) =>
        `[${s.id}] ${s.title}\nURL: ${s.url}${s.publishedDate ? `\nPublished: ${s.publishedDate}` : ""}\n---\n${s.snippet}`,
    )
    .join("\n\n");
}

const MARKDOWN_RULES = `Using ONLY the provided web sources, write a polished markdown research report. Structure it like this — adapt section names to the topic, but keep the overall shape:

1. **Summary** — open with a 2–3 sentence "TL;DR" paragraph that directly answers the user's question. No table here.

2. **Key Facts** — when there are 3+ comparable data points (dates, prices, versions, specs, parties, deadlines, percentages, etc.) present them as a markdown table with two columns: \`| Attribute | Value |\`. If the topic is purely qualitative, you may skip this section.

3. **Body sections** — use h2 / h3 headings. Inside, prefer:
   - **Markdown tables** for anything multi-attribute (e.g. timelines, feature matrices, regional differences, pros/cons across options, version histories). Tables beat bullet lists whenever each row shares the same shape.
   - Short paragraphs with inline bracketed citations like \`[1]\`, \`[2]\` immediately after the claim they support.
   - Bullet lists ONLY when items don't share a common structure.
   - \`> blockquote\` callouts for critical caveats, official statements, or surprising facts.

4. **Comparison** — near the end, add a section titled "Comparison: <subject> vs <closest analogue>" with a markdown table. Pick the **closest similar but distinct** case: something a reader would naturally confuse or weigh against the subject, but that is **not the same thing**. Examples of the kind of pairing to look for:
   - EU AI Act ↔ US AI Executive Order (different jurisdictions, same domain)
   - Pinecone ↔ Postgres + pgvector (managed vs DIY, same goal)
   - LangChain ↔ LlamaIndex (overlapping, distinct emphases)
   - HBM3 ↔ HBM3e (same family, different generation)
   - React ↔ Vue (peer frameworks)
   Never compare a thing to itself or to an unrelated topic. Use at least 4 rows across meaningful dimensions (e.g. scope, status, enforcement, cost, audience). If the provided sources genuinely contain no information about a sensible comparable, write one sentence saying so and omit the table — do not invent facts.

Citation rules:
- Every factual claim must end with \`[n]\` (or \`[n][m]\` for multiple sources). The number is the source's id in the provided list.
- Do not include a trailing "Sources" list — the UI renders sources separately.
- Do not invent facts, URLs, or numbers. If sources conflict, say so explicitly.

Style:
- Crisp, neutral, declarative prose.
- Use **bold** for the most important phrases, sparingly.
- Use \`code\` formatting for product names, version numbers, file paths, and API names where it improves scannability.`;

export function systemPromptFor(style: OutputStyle): string {
  if (style === "plain-sources") {
    return `You are a research assistant. Read the provided web sources and produce a concise plain-text answer to the user's question. After the answer, list the sources you actually drew from. Do not invent facts. If sources disagree, say so. If sources are insufficient, say so.`;
  }
  if (style === "chat") {
    return `You are a conversational research assistant. Answer the user's question in a friendly chat tone using the provided web sources.

Use markdown freely — especially **markdown tables** for any structured / multi-attribute comparison, and inline \`[1]\` \`[2]\` citations after each factual claim. Where it fits, briefly compare the subject to its closest similar-but-distinct counterpart so the reader can ground the answer (e.g. EU AI Act vs US AI Executive Order). Never compare a thing to itself. Do not invent facts.`;
  }
  return `You are a thorough research assistant.

${MARKDOWN_RULES}`;
}

export function userPromptFor(query: string, sources: Source[]): string {
  return `Question:
${query}

Sources:
${formatSourcesForPrompt(sources)}

Write the answer now, following all formatting rules.`;
}
