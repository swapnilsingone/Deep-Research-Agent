# Strip Raw Markdown from Source Card Descriptions

## Problem

`##`, `###`, and `#` Markdown heading markers appear literally in every source card snippet. For example:

> "## News ## 20th October 2025 # World-first use of 3D magnetic coils..."

Exa returns raw scraped page content that includes Markdown syntax. This text is rendered as plain text in the source cards in `src/components/sources-list.tsx`, so the markers are never interpreted — they just leak through as noise.

## Fix

Strip Markdown heading markers (and other common structural noise like `---` hr separators) from the `text` field before displaying it in the source card excerpt. A lightweight regex pass is enough — no need for a full Markdown parser:

```ts
function cleanSourceText(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')   // strip heading markers
    .replace(/^---+$/gm, '')        // strip hr separators
    .replace(/\n{3,}/g, '\n\n')     // collapse excess blank lines
    .trim();
}
```

Apply this in `sources-list.tsx` before passing `item.text` to the card body.

## Priority

High — this is the most visually jarring issue currently visible to users on every query.
