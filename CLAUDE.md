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
index.html          — Main SPA (all views: Chat, Workflows, Brain) (~1955 lines)
login.html          — Authentication screen (SSO-only, no email form)
js/app.js           — Application logic, namespaced modules (~3710 lines)
js/mock-data.js     — All MOCK_* and CONFIG_* data objects (~710 lines)
js/icons.js         — SVG icon strings + icon() helper + injectIcons() (~94 lines)
css/tokens.css      — Design tokens, color palette, dark mode vars, border radii, RGB triplets (~133 lines)
css/layout.css      — App frame, sidebar, panels, resize handles, accessibility modes (~1585 lines)
css/chat.css        — Chat messages, streaming, artifacts, file panel (~1649 lines)
css/workflows.css   — Workflow listing and detail views, folder-tab pattern (~592 lines)
css/components.css  — Workflow steps/runs, Brain sections, Cosimo panel, error states (~2183 lines)
css/utilities.css   — Helpers (dropdowns, scrollbars, overlays, bevels, label-mono) (~245 lines)
fonts/              — ChicagoFLF.ttf (retro display font)
PRD.md              — Refactoring task list
progress.md         — Tracks completed tasks
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

### JS Namespace Modules in app.js
Functions are organized into namespace objects to reduce globals:

- **ColorUtils** — hexToHsl, hslToHex, hexToRgbString
- **A11y** (7 functions) — toggleTheme, applyPurpleIntensity, applyFontSizeBoost, toggleDyslexiaFont, toggleReducedMotion, toggleHighContrast, syncA11yToggles
- **UI** (15 functions) — switchMode, switchBrainSection, renderHeaderPanels, closeAllPanels, toggleTaskPanel, toggleCalendarPanel, toggleUsagePanel, toggleProfileMenu, buildMiniCalendar, handleNew, openCosimoPanel, closeCosimoPanel, handlePanelKey, sendPanelMessage, toggleDropdown
- **Chat** (30 functions) — runGlobalSearch, closeSearch, disableInput, giveFeedback, selectThread, updateFilesButton, openFilePanel, closeFilePanel, switchFilePanelTab, buildSpreadsheet, exportThread, shareThread, fillSuggestion, retryK1, streamReply, typeTextBlock, streamSectionBlock, tokenizeHTML, runEraborSequence, markEraborDone, cancelErabor, eraborTimer, showEraborStopBtn, softScroll, isNearBottom, attachFromComputer, attachFromDrive, toggleModelDropdown, selectModel
- **Workflows** (3 functions) — showWorkflowDetail, showWorkflowListing, switchTab
- **BrainMemory** (14 functions) — renderMemoryFromData, toggleAddMemory, cancelAddMemory, submitNewMemory, filterMemories, filterByCategory, toggleFactMenu, editFact, deleteFact, confirmDelete, cancelDelete, toggleTrait, removeTrait, addCustomTrait
- **BrainLessons** (11 functions) — renderLessonList, filterLessons, filterLessonScope, openLesson, closeLessonDetail, toggleLessonEdit, openCosimoForLesson, toggleLessonScope, deleteLesson, createNewLesson, toggleCardScope
- **Graph** (18 functions) — findEntity, buildGraph, makeEdge, makeNode, animateNode, applyRootState, applyClusterState, graphNavigate, openGraphEntity, closeGraphDetail, navigateToRelated, updateBreadcrumb, showGraphTooltip, hideGraphTooltip, startDriftLoop, editGraphEntity, openCosimoForEntity
- **Globals** — showToast, escapeHtml

### Key JS Sections (in order)
1. IIFEs: Rich text input, theme restore, drag-drop, hover actions, drag-resize
2. A11y: Purple intensity, color utilities, accessibility toggles
3. Core UI: Mode switching, panel toggles, sidebar, Cosimo panel, dropdowns
4. Chat: Search, input, feedback, threads, file panel, spreadsheet, export, streaming
5. Workflows: Detail/listing switching, tab navigation
6. Brain—Memory: Facts CRUD, traits, filtering
7. Brain—Lessons: List/detail, editing, scoping
8. Brain—Data Graphs: SVG force graph, navigation, tooltips, drift animation
9. Utilities: Toast, escapeHtml
10. Init: Event listeners IIFE (event delegation)

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
- JS functions: Namespace.camelCase (e.g., `Chat.selectThread()`, `A11y.toggleTheme()`)
- HTML IDs: camelCase (e.g., `#chatView`, `#filePanel`)
- Data attributes for event delegation: `data-thread-id`, `data-wf-id`, `data-section`, `data-tab`, `data-action`, `data-icon`
- Mock data prefix: `MOCK_` (e.g., `MOCK_THREADS`), config prefix: `CONFIG_`
- Keep inline styles to zero — use CSS classes
- No inline event handlers — use event delegation in initEventListeners()
- Prefer CSS custom properties for any repeated value
- Section headers in JS/CSS: `// ========` comment blocks with descriptive names
- All public functions have JSDoc comments

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
