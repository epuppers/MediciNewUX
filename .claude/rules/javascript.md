---
paths:
  - "js/**/*.js"
---

# JavaScript Rules

- Cache DOM queries — don't call querySelector repeatedly for the same element
- Keep functions under ~40 lines; decompose larger ones
- Mock data and constants should be clearly grouped at the top of the file or in named objects
- All user-facing actions should provide feedback (toast, visual state change, etc.)
- When adding new view-switching logic, follow the existing `switchMode()` pattern
- Escape user-facing strings with `escapeHtml()` to prevent XSS
- Use event delegation on parent containers rather than individual listeners where possible
