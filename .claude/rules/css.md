---
paths:
  - "css/**/*.css"
---

# CSS Rules

- Never use raw color values — always reference `var(--token-name)` from tokens.css
- Every new selector must have both light and dark mode support
- Check for existing utility classes before creating new ones
- Place styles in the correct file: chat styles in chat.css, layout in layout.css, etc.
- Use the beveled border pattern for raised elements: `border-color: var(--light) var(--dark) var(--dark) var(--light)`
- Avoid `!important` — fix specificity instead
- Keep z-index values within the established layers (toasts: 200, panels: 50, handles: 10)
