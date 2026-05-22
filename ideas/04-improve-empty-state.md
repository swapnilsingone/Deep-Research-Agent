# Improve Empty / Landing State

## Problem

The initial screen is a large black canvas with a single line of plain instruction text:

> "Type a question above. Configure depth, output style, and model from Settings."

There is no visual interest, no example queries, and no indication of what kinds of questions work well. This creates friction for new users who aren't sure what to type.

## Fix

Add a set of clickable example query chips below the input. Clicking one populates the input field (and optionally auto-submits).

**Example chips:**
- "Latest breakthroughs in nuclear fusion energy"
- "Compare Claude 4 vs GPT-4o for coding"
- "How does the EU AI Act affect startups?"
- "Best practices for React Server Components in 2025"

**Implementation sketch:**

```tsx
const EXAMPLES = [
  "Latest breakthroughs in nuclear fusion energy",
  "Compare Claude 4 vs GPT-4o for coding",
  "How does the EU AI Act affect startups?",
];

// In page.tsx, render when query === '' && status === 'idle'
<div className="flex flex-wrap gap-2 mt-4">
  {EXAMPLES.map(q => (
    <button key={q} onClick={() => setQuery(q)}
      className="px-3 py-1.5 text-sm rounded-full border border-border hover:bg-muted">
      {q}
    </button>
  ))}
</div>
```

## Priority

Medium-high — biggest impact on first impressions and time-to-first-result for new users.
