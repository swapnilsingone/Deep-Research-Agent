# Fix Depth Dropdown Truncated Descriptions

## Problem

The Research depth dropdown in the Settings panel is too narrow. Option labels are cut off mid-word:

- "Single-shot — fast, one s…"
- "Multi-step — plan + par…"
- "Iterative — plan, search,…"

Users cannot read what each depth mode actually does before selecting it.

## Fix

Two options:

**Option A — Widen the dropdown** so the full label fits on one line. The full strings are short enough that a modest width increase (e.g. `min-w-64`) would fit them.

**Option B — Two-line option layout** with a bold title and a muted subtitle:

```
Single-shot
Fast — one Exa search, one synthesis pass

Multi-step
Planner generates 3–5 sub-queries, parallel Exa searches

Iterative
Multi-step + reflection pass, up to 2 extra search rounds
```

Option B is more informative and scales better if new depth modes are added.

## Location

`src/components/settings-panel.tsx` — the `<Select>` for `depth`.

## Priority

Medium — affects discoverability of the multi-step and iterative modes.
