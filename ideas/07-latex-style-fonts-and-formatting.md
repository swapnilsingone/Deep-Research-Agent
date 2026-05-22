# 07 — LaTeX-Style Fonts and Report Formatting

## Problem

The report output used Geist (a sans-serif UI font) and compact spacing, making research reports feel like a web dashboard rather than an academic document. Heading hierarchy was flat, line-height was tight, and there was no visual distinction between the UI chrome and the report content.

## Solution

Switch the report rendering area to **STIX Two Text** — the closest Google Fonts match to LaTeX's Computer Modern — and apply proper academic document spacing throughout.

### Font changes (`src/app/layout.tsx`, `src/app/globals.css`)

- Load **Inter** (`--font-sans`) for UI chrome (header, buttons, inputs)
- Load **STIX Two Text** (`--font-serif`, weights 400/500/600/700, normal + italic) for report content
- Load **Geist Mono** (`--font-mono`) for code blocks
- Register `--font-serif` in `@theme inline` so `font-serif` Tailwind utility works

### Report formatting (`src/components/report-view.tsx`)

- Apply `font-serif` class to the report container div
- Body text: 16px (`text-base`) with line-height 1.75 (was 15px / `leading-relaxed`)
- Heading sizes: h1 `1.85rem`, h2 `1.4rem`, h3 `1.1rem`; removed `tracking-tight` (inappropriate for serif)
- Paragraph spacing: `my-4` (was `my-3`)
- List indent: `pl-7` (was `pl-6`), spacing `space-y-2` (was `space-y-1.5`)
- Table cells: `py-2.5` padding, `leading-[1.6]` on `td`
- Code blocks: explicit `font-mono` on `pre` to keep monospace within the serif context
- Plain-sources mode also updated to use `font-serif` and `leading-[1.75]`

## Result

Research reports render as proper academic documents — serif font, generous spacing, clear heading hierarchy — while the UI chrome stays clean and sans-serif.
