# Add "New Research" / Reset Affordance

## Problem

Once a report is visible, there is no clear way to start a fresh query. The user has to manually click into the input field, select all, and delete the previous query text. There is no dedicated reset or "new research" action.

## Fix

Add a **New** button (or make the logo clickable) that clears the current result state and focuses the input.

**Option A — Button next to the query input:**

```tsx
{state.status !== 'idle' && (
  <button onClick={() => { resetState(); inputRef.current?.focus(); }}
    className="text-sm text-muted-foreground hover:text-foreground">
    New
  </button>
)}
```

**Option B — Clicking the "Deep Research" logo** resets to the idle state (common pattern in chat/research apps).

Either approach should:
1. Clear the report, sources, and steps
2. Clear the input field
3. Focus the input

## Location

`src/app/page.tsx` — the header or the query input row.

## Priority

Medium — affects the core usage loop for repeat users.
