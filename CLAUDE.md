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
index.html          — Main SPA (all views: Chat, Workflows, Brain) (~2300 lines)
login.html          — Authentication screen (SSO-only, no email form)
js/app.js           — All application logic (~3450 lines)
css/tokens.css      — Design tokens, color palette, dark mode vars, border radii, RGB triplets
css/layout.css      — App frame, sidebar, panels, resize handles, accessibility modes (~1750 lines)
css/chat.css        — Chat messages, streaming, artifacts, file panel (~1950 lines)
css/workflows.css   — Workflow listing and detail views, folder-tab pattern (~640 lines)
css/components.css  — Workflow steps/runs, Brain sections, Cosimo panel (~1616 lines)
css/utilities.css   — Helpers (dropdowns, scrollbars, overlays) (~190 lines)
fonts/              — ChicagoFLF.ttf (retro display font)
PRD.md              — Refactoring task list (read this first on every iteration)
progress.md         — Tracks completed tasks (update after each task)
```

## Architecture Overview

### Views (3 tabs in main area)
- **Chat** — Thread-based AI conversation with artifacts, streaming, file panel
- **Workflows** — Listing + detail view with folder-tab navigation (Overview, Steps, Runs, Outputs)
- **Brain** — Memory (facts/traits), Lessons (domain knowledge), Data Graphs (entity SVG)

### Sidebars (swap per active tab)
- chatSidebar, workflowSidebar, brainSidebar — all defined inline in index.html

### Overlay Panels
- Cosimo slide-in panel (workflow editing chat)
- Task panel, Calendar panel, Usage panel (header dropdowns)
- File panel (right-side, resizable, spreadsheet + folder views)
- Profile dropdown (theme toggle, purple intensity, accessibility settings)

### Logo
- Login page: 6-sphere inverted triangle (`.hero-spheres` with `.hero-sphere.dark` / `.hero-sphere.light`)
- Main app sidebar: small mark (`.logo-mark` > `.logo-mark-inner`)

### Key JS Sections in app.js
1. Rich text input (contenteditable markdown shortcuts)
2. Toast notifications
3. Message hover actions (copy, regen, delete)
4. Thread hover actions (share, delete)
5. Feedback buttons
6. Search (global, debounced)
7. Drag & drop file zone
8. Input disabled during generation
9. Theme toggle (localStorage, data-theme attribute)
10. **Purple intensity** (HSL adjustment of berry/violet/chinese tokens, localStorage)
11. **Accessibility** (font size zoom, dyslexia font, reduced motion, high contrast)
12. Mode switching (chat/workflows/brain)
13. Thread switching + file panel
14. Drag-resize panels (sidebar, file panel)
15. Spreadsheet builder (mock data)
16. Header panel toggles (tasks, calendar, usage, profile)
17. Export/share thread
18. Workflow data + detail/listing switching
19. Cosimo panel (slide-in chat)
20. Erabor streaming demo (typing animation + sections)
21. Streaming text engine (tokenizeHTML, typeTextBlock, streamSectionBlock)
22. Attach file dropdown + model selector
23. Brain Memory (add/edit/delete/filter facts, traits)
24. Brain Lessons (list/detail/edit/scope/delete)
25. Brain Data Graphs (SVG force graph, navigation, drill-down, tooltips)

## Design System Rules
- ALL colors must use `var(--token)` from tokens.css — no raw hex/rgb
- For alpha colors use `rgba(var(--violet-3-rgb), 0.1)` pattern (RGB triplet tokens)
- Font stack: ChicagoFLF (pixel headings), IBM Plex Mono (UI/code), DM Sans (body)
- Border radii: use `var(--r-sm)` (3px), `var(--r-md)` (4px), `var(--r-lg)` (6px) — never raw px
- Visual style: Retro 3D beveled borders, muted palette, subtle shadows
- Dark mode: `[data-theme="dark"]` — every element MUST work in both themes
- Accessibility modes: `[data-a11y-font]`, `[data-a11y-motion]`, `[data-a11y-contrast]`
- Spacing: Use consistent values, no magic numbers
- Beveled borders pattern: `border-color: light dark dark light` (3D raised effect)

## Code Conventions
- CSS classes: kebab-case (e.g., `.chat-thread`, `.msg-block`)
- JS functions: camelCase (e.g., `showToast()`, `selectThread()`)
- HTML IDs: camelCase (e.g., `#chatView`, `#filePanel`)
- Keep inline styles to zero — use CSS classes
- Prefer CSS custom properties for any repeated value
- Section headers in JS/CSS: `// ========` comment blocks with descriptive names

## Critical Rules for Refactoring Agents

### DO NOT
- Change the visual appearance of any component (this is a code-only refactor)
- Remove or rename any user-facing mock data content
- Break dark mode — every change must be tested in both themes
- Break accessibility modes (dyslexia, reduced motion, high contrast)
- Break the purple intensity slider functionality
- Introduce any build tools, frameworks, or npm dependencies
- Combine CSS files that are currently separate
- Change the file naming convention (kebab-case CSS, camelCase JS)
- Modify tokens.css unless explicitly told to (it's the design system source of truth)
- Change the 6-sphere logo layout or animation

### DO
- Keep all changes incremental — one task at a time
- Verify the dev server still loads after each change
- Update progress.md after completing each task
- Preserve ALL section comment headers in JS and CSS
- Keep mock data clearly identifiable (use `MOCK_` prefix for data objects)
- Maintain the existing event delegation patterns
- Test both light and dark mode after CSS changes
- Test accessibility toggles still work after any profile menu changes

## Integration Context
This codebase will be handed to a separate Claude Code instance that will:
1. Replace all mock/hardcoded data with real API calls
2. Wire event handlers to the existing Medici backend
3. Integrate into the existing build system (likely React/Next.js)

So: keep mock data clearly separated, use descriptive function names, and maintain clean boundaries between presentation and data.
