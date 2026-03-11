# MediciNewUX — Cosimo AI Assistant UI

## What This Is
A standalone UX prototype for Medici's AI finance assistant (Cosimo). Vanilla HTML/CSS/JS — no framework, no build tools. Will be integrated into the existing Medici codebase later.

## Dev Server
```
python3 -m http.server 8082
```
Serves at http://localhost:8082/index.html

## Project Structure
```
index.html          — Main SPA (all views: Chat, Workflows, Brain)
login.html          — Authentication screen
js/app.js           — All application logic
css/tokens.css      — Design tokens, color palette, dark mode vars
css/layout.css      — App frame, sidebar, panels, resize handles
css/chat.css        — Chat messages, streaming, artifacts
css/workflows.css   — Workflow listing and detail views
css/components.css  — Reusable UI elements (steps, cards, runs)
css/utilities.css   — Helpers (dropdowns, scrollbars, overlays)
fonts/              — ChicagoFLF.ttf (retro display font)
```

## Design System Rules
- ALL colors must use `var(--token)` from tokens.css — no raw hex/rgb
- Font stack: VT323 (pixel headings), IBM Plex Mono (UI/code), DM Sans (body)
- Visual style: Retro 3D beveled borders, muted palette, subtle shadows
- Dark mode: `[data-theme="dark"]` — every new UI element MUST work in both themes
- Spacing: Use consistent values, no magic numbers

## Code Conventions
- CSS classes: kebab-case (e.g., `.chat-thread`, `.msg-block`)
- JS functions: camelCase (e.g., `showToast()`, `selectThread()`)
- HTML IDs: camelCase (e.g., `#chatView`, `#filePanel`)
- Keep inline styles to zero — use CSS classes
- Prefer CSS custom properties for any repeated value

## Integration Context
This codebase will be handed to a separate Claude Code instance that will:
1. Replace all mock/hardcoded data with real API calls
2. Wire event handlers to the existing Medici backend
3. Integrate into the existing build system

So: keep mock data clearly separated, use descriptive function names, and maintain clean boundaries between presentation and data.

## Custom Agents
- `ux-review` — Design consistency and visual quality
- `refactor` — Code cleanliness and efficiency
- `integration-prep` — Readiness for backend integration
- `a11y-audit` — Accessibility compliance (WCAG 2.1 AA)
