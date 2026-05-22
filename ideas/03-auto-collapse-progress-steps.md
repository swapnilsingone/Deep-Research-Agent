# Auto-Collapse Progress Steps After Completion

## Problem

After research finishes, the progress steps panel (with 2–3 green checkmark lines) stays permanently visible above every report. It consumes ~70px of vertical space and pushes the report content down on every page view, even though the information is no longer actionable.

## Fix

Auto-fade the panel ~3 seconds after the `done` event is received, or make it collapsible with a chevron toggle.

**Approach A — Auto-fade:**

```ts
// in use-research.ts or the component
useEffect(() => {
  if (state.status === 'done') {
    const t = setTimeout(() => setStepsVisible(false), 3000);
    return () => clearTimeout(t);
  }
}, [state.status]);
```

**Approach B — Collapsible with chevron:**  
Add a collapse button to the steps container so users can manually hide it. Default to expanded while in-progress, collapsed once done.

Either approach also means the steps panel could re-expand if the user starts a new query.

## Priority

Low-medium — polish item, but affects every completed result view.
