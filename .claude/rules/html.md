---
paths:
  - "**/*.html"
---

# HTML Rules

- Use semantic elements: `<button>` not `<div onclick>`, `<nav>` for navigation, `<section>` for content groups
- Every interactive element needs: hover state, focus state, and cursor: pointer
- New panels/views must include `aria-label` and keyboard dismiss (Escape key)
- Keep comment dividers for major sections: `<!-- ======== SECTION NAME ======== -->`
- No inline styles — add a class instead
- All images/icons need alt text or aria-label
