# Model Picker Scroll Indicator

## Problem

The model list in the Settings popover shows 4–5 entries with no scrollbar or "N more models" hint. Users may not realise there are many more models available below the visible fold.

## Fix

Add a visual scroll indicator at the bottom of the model list — either:

- A subtle gradient fade-out overlay at the bottom edge of the list container
- A "↓ N more models" count label beneath the visible items
- Ensure the scrollbar is always visible (not just on hover) within the list container

**Gradient fade approach (CSS only):**

```css
.model-list-container {
  position: relative;
  max-height: 240px;
  overflow-y: auto;
}
.model-list-container::after {
  content: '';
  position: sticky;
  bottom: 0;
  display: block;
  height: 32px;
  background: linear-gradient(to bottom, transparent, hsl(var(--popover)));
  pointer-events: none;
}
```

## Location

`src/components/settings-panel.tsx` — the model list scroll container.

## Priority

Low — minor discoverability issue.
