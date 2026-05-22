# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev -- -p 3001  # dev server (Turbopack) — always use port 3001 (http://localhost:3001)
npm run build    # production build (also runs `tsc --noEmit` via the build pipeline)
npm run start    # serve the production build
npm run lint     # eslint
npx tsc --noEmit # standalone type-check
```

There is no test runner configured.

## Environment

Two env vars are required at runtime; both live in `.env.local` (gitignored):

- `OPENROUTER_API_KEY` — used by `src/lib/openrouter.ts` to talk to `https://openrouter.ai/api/v1` via `@ai-sdk/openai-compatible`.
- `EXA_API_KEY` — used by `src/lib/exa.ts` (the `exa-js` client) for web search + page contents.

If either is missing, the `/api/research` route returns an error event and the UI shows a destructive banner.

## Architecture

### Research pipeline (the non-obvious part)

The user submits a query through the homepage (`src/app/page.tsx`), which calls `POST /api/research` with `{ query, depth, model, outputStyle }`. The route handler (`src/app/api/research/route.ts`) opens a **Server-Sent Events** `ReadableStream` and hands the work to one of three orchestrators in `src/lib/research/`:

- `single-shot.ts` — one Exa search + one LLM synthesis pass.
- `multi-step.ts` — LLM planner produces 3–5 sub-queries via `generateObject(...)` against a Zod schema, Exa runs them in parallel, results are deduped by URL, then a final LLM synthesis.
- `iterative.ts` — multi-step, then a "gaps" reflection step that may trigger up to two more rounds of searches.

All three are dispatched from `src/lib/research/index.ts` based on `config.depth` and emit the **same event shape** defined in `src/lib/research/types.ts`:

```
{type:"step", label}        // progress line
{type:"sources", items}     // numbered Source[]
{type:"token", delta}       // streamed synthesis chunk
{type:"error", message}     // user-facing error
{type:"done"}               // terminal marker
```

This contract is the seam — the UI is depth-agnostic. If you add a new depth mode, you only need to:
1. Add the orchestrator file, accept `OrchestratorContext`, emit the events above.
2. Add it to the switch in `src/lib/research/index.ts`.
3. Add it to the `Depth` union in `types.ts` and the Zod enum in `api/research/route.ts`.
4. Add it to the `<Select>` options in `src/components/settings-panel.tsx`.

### Client streaming

`src/hooks/use-research.ts` does the manual SSE parsing (no `eventsource` lib) — it splits the response body by `\n\n`, parses each `data: …` payload, and folds events into the `ResearchState` reducer. `AbortController` is wired so the "Stop" button cancels in-flight requests.

### LLM prompt contract

`src/lib/research/prompts.ts` is the single source of truth for synthesis style. The `markdown-citations` system prompt enforces a specific report shape — Summary paragraph → optional Key Facts table → body sections with markdown tables for structured data → a **"Comparison: X vs <closest analogue>"** table comparing the subject to something similar-but-distinct → inline `[n]` citations. Update this file (not individual orchestrators) to change report style.

### Rendering layer

- `src/components/report-view.tsx` does **not** use the `@tailwindcss/typography` plugin (it isn't installed). Instead it passes explicit `components` overrides for every markdown element to `<ReactMarkdown>`. It also runs `linkifyCitations(...)` over the streaming text to rewrite `[n]` into `[\[n\]](#source-n)`, then the custom `<a>` renderer detects those and emits a citation pill that scrolls to the matching source card.
- `src/components/sources-list.tsx` renders cards with `id="source-${id}"`, which is the scroll target for citation pills. Each card pulls a favicon from `google.com/s2/favicons` (using `<Image unoptimized>` so no `next.config.ts` remotePatterns entry is needed).
- A `:target` CSS animation in `src/app/globals.css` provides the flash highlight when a card is scrolled into view.
- `disallowedElements` is set on `<ReactMarkdown>` (script/iframe/style/etc.) because LLM output can contain raw HTML pulled from Exa page contents.

### OpenRouter model picker

`GET /api/models` (`src/app/api/models/route.ts`) proxies `https://openrouter.ai/api/v1/models` with `revalidate: 3600`. Pricing in OpenRouter's response is `$ per token` — `listModels()` in `src/lib/openrouter.ts` multiplies by `1e6` so the UI can show `$/M tokens`. Default model is `google/gemini-3-flash-preview` (constant in the same file).

### History

`src/lib/history.ts` is browser-only (`typeof window` guards) and uses `localStorage` key `deep-research-history` with a 50-entry cap. Restoration is implemented by writing the saved entry into the `useResearch` state via the hook's exposed `setState`.

## Project-specific gotchas

- **Next.js 16 with Turbopack.** Per `AGENTS.md` ("This is NOT the Next.js you know"), this version has breaking changes from older training data — when something behaves unexpectedly, consult `node_modules/next/dist/docs/`. `npm run dev` and `npm run build` both use Turbopack.
- **shadcn primitives use Base UI, not Radix.** `Popover` and `Sheet` triggers do **not** accept `asChild` — use the Base UI `render={<Button … />}` prop instead. Existing usages in `settings-panel.tsx` and `history-drawer.tsx` are the pattern to copy.
- **Client-only theme.** `next-themes` is wired in `src/app/layout.tsx` with `defaultTheme="dark"`. Any component that branches on `theme` / `resolvedTheme` during render must gate on a `mounted` state (see `theme-toggle.tsx`) or it will hydrate-mismatch.
- **`page.tsx` is `"use client"`.** Everything renders through one client tree; server components are limited to the two API routes. Don't try to add `async` server components inside `app/` without converting `page.tsx`.
- **API routes pin `runtime = "nodejs"`** (not edge) because `exa-js` and `@ai-sdk/openai-compatible` need Node APIs. `maxDuration = 300` on `/api/research` to allow long iterative runs.
