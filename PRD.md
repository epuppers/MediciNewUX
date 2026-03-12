# PRD: MediciNewUX Refactoring

## Goal

Clean up and organize the Cosimo UX prototype codebase so it is ready for integration into the Medici production app. No visual changes — code quality and structure only.

## Success Criteria

- Dev server loads with zero console errors
- All views (Chat, Workflows, Brain) function identically to pre-refactor state
- Both light and dark mode render correctly
- All accessibility modes work (dyslexia font, reduced motion, high contrast, text size zoom)
- Purple intensity slider adjusts all violet/berry/chinese tokens correctly in both themes
- All interactive states work (hover, active, disabled, error, streaming)
- Mock data is cleanly separated from presentation logic
- No inline event handlers remain in HTML
- CSS has no duplicate rule blocks

## Completion Signal

When ALL tasks below are checked off in progress.md, output:
<promise>REFACTORED</promise>

## Agent Rules (read every iteration)

1. Complete ONE task per iteration, then stop
2. Update progress.md after each task
3. Verify the dev server loads (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/index.html`)
4. Git commit with message format: `refactor [task number]: [brief description]`
5. Do NOT git push (human will push after reviewing)
6. Do NOT combine multiple tasks into one iteration
7. Do NOT modify any visual appearance — code structure only
8. Use direct file edits (str_replace / Edit tool), NOT Python or bash scripts that rewrite entire files

---

## Phase 1: Data Extraction (separate mock data from logic)

- [ ] **1.1 — Extract thread data to data object**
      Move all hardcoded thread titles, metadata, and keyword lists from `threadTitles`, `threadHasFiles`, and the search function into a single `MOCK_THREADS` object at the top of app.js. Update all references.

- [ ] **1.2 — Extract workflow data to data object**
      The `workflowData` object already exists but the workflow sidebar items are hardcoded in HTML. Create `MOCK_WORKFLOWS` that drives both the sidebar and the detail view. Keep the HTML structure but populate it from the data object.

- [ ] **1.3 — Extract spreadsheet data to data object**
      Move `sheetData` and `colLetters` into a `MOCK_SPREADSHEET` object. Move the column definitions (headers, widths) into the same object.

- [ ] **1.4 — Extract Brain Memory data to data object**
      The memory facts and traits are hardcoded in HTML. Create `MOCK_MEMORY` with facts array and traits array. Render from data on page load.

- [ ] **1.5 — Extract Brain Lessons data to data object**
      `lessonData` exists but lesson list items are also in HTML. Consolidate into `MOCK_LESSONS`. Render the lesson list from this object.

- [ ] **1.6 — Extract Graph data to data object**
      `graphData` already exists as a large object. Rename to `MOCK_GRAPH_DATA` for consistency. Verify no hardcoded graph content remains in HTML.

- [ ] **1.7 — Extract header panel data (tasks, calendar, usage)**
      The task items, calendar events, and usage stats are hardcoded in HTML. Create `MOCK_TASKS`, `MOCK_CALENDAR`, `MOCK_USAGE` objects and render from JS on init.

- [ ] **1.8 — Extract purple intensity base colors to data object**
      Move `purpleBaseColors` into the mock data structure as `CONFIG_PURPLE_BASE_COLORS` (use CONFIG\_ prefix since this is configuration, not mock data). Move `rgbCompanions` mapping alongside it.

- [ ] **1.9 — Collect all MOCK* and CONFIG* objects into a single data file**
      Create `js/mock-data.js` containing all MOCK* and CONFIG* objects. Add a script tag in index.html before app.js. Remove the objects from app.js.

## Phase 2: HTML Cleanup (remove inline handlers, reduce duplication)

- [ ] **2.1 — Remove all inline onclick handlers from index.html**
      Replace every `onclick="..."` in index.html with event listeners in app.js. Use event delegation where appropriate (e.g., one listener on `.thread-list` for all thread clicks). Key areas: sidebar items, top tabs, header buttons, profile menu items, SSO buttons, workflow sidebar, brain sidebar, all buttons in workflow detail, graph buttons, Cosimo panel. Document each migration with a comment.

- [ ] **2.2 — Remove inline oninput handlers from index.html**
      The purple intensity slider and font size slider use `oninput="..."`. The search input uses `oninput="..."`. Replace with addEventListener in app.js.

- [ ] **2.3 — Remove inline onclick handlers from login.html**
      The SSO buttons use `onclick="window.location.href='index.html'"` and the form uses `onsubmit`. Replace with JS listeners.

- [ ] **2.4 — Remove all inline style attributes from index.html**
      Find every `style="..."` in index.html. Move to appropriate CSS classes. Common offenders: `display:none` on sidebars and panels (use a `.hidden` utility class), inline colors on calendar dots, inline styles on profile menu sections.

- [ ] **2.5 — Extract SVG icons to a shared reference**
      There are duplicate inline SVGs throughout (chat icon, workflow icon, brain icon, share, delete, close, export, folder, settings gear, lock, etc.). Create an `icons` object in app.js (or a separate `js/icons.js`) that stores SVG strings by name. Replace all inline SVGs in both HTML and JS with references to this object.

## Phase 3: CSS Cleanup (remove duplication, fix organization)

- [ ] **3.1 — Audit and remove duplicate CSS rules**
      Search all CSS files for rules that target the same selector. Merge duplicates. Pay special attention to dark mode overrides that may duplicate base styles.

- [ ] **3.2 — Extract repeated patterns into utility classes**
      The beveled border pattern (`border-color: light dark dark light`) appears on dozens of elements. Create `.bevel` and `.bevel-inset` utility classes. The mono-label pattern (uppercase, letter-spacing, small mono font) also repeats extensively — create `.label-mono`. Add these to utilities.css.

- [ ] **3.3 — Move misplaced CSS to correct files**
      Audit each file against its stated purpose. Specifically check: Cosimo panel styles (should be in components.css not chat.css), model selector (should be in chat.css), accessibility modes (correctly in layout.css — verify). Move any misplaced rules.

- [ ] **3.4 — Normalize dark mode override structure**
      Every CSS file should follow the same pattern: base styles first, then a single `/* DARK MODE OVERRIDES */` section at the end. Remove any scattered `[data-theme="dark"]` rules mixed into base styles. Verify no dark mode rules are duplicated across files.

- [ ] **3.5 — Audit border-radius consistency**
      All border-radius values should use `var(--r-sm)`, `var(--r-md)`, or `var(--r-lg)`. Search for any remaining raw `border-radius: Npx` values and replace with the appropriate token.

- [ ] **3.6 — Audit rgba() color consistency**
      All rgba() calls using violet-3 or berry-3 should use the `rgba(var(--violet-3-rgb), alpha)` pattern. Search for any remaining hardcoded `rgba(116,65,143,...)` or `rgba(136,85,168,...)` values and replace with the token version so the purple intensity slider affects them.

- [ ] **3.7 — Add missing dark mode support**
      Test every component in dark mode. Add overrides for any elements that look broken. Check the new accessibility toggles, profile menu slider, and folder-tab styles specifically.

## Phase 4: JavaScript Cleanup (organize, deduplicate, document)

- [ ] **4.1 — Group and order functions logically**
      app.js has grown organically. Reorder into clear sections matching this order:
  1. Imports / Constants / Config
  2. IIFE initializers (theme, rich text, drag-drop, hover actions, a11y restore)
  3. Purple Intensity + Accessibility functions
  4. Core UI (mode switching, panel toggles, sidebar)
  5. Chat (threads, messages, streaming, input)
  6. Workflows (listing, detail, tabs)
  7. Brain — Memory
  8. Brain — Lessons
  9. Brain — Data Graphs
  10. Utilities (toast, escapeHtml, helpers)
  11. Init (DOMContentLoaded bootstrap)

- [ ] **4.2 — Remove dead code**
      Search for functions that are defined but never called. Search for variables that are assigned but never read. Remove them. Be careful with functions called from event listeners (which should be migrated by now) — verify before deleting.

- [ ] **4.3 — Fix the dual search function issue**
      `runGlobalSearch()` just calls `runGlobalSearchEnhanced()`. Remove the wrapper, rename to `runGlobalSearch()`, and update all references.

- [ ] **4.4 — Consolidate color utility functions**
      `hexToHsl()`, `hslToHex()`, and `hexToRgbString()` are general-purpose color utilities. Group them into a `ColorUtils` namespace or clearly labeled utility section so they're reusable and not buried inside the purple intensity code.

- [ ] **4.5 — Add JSDoc comments to all public functions**
      Every function that is called from outside its defining scope should have a JSDoc comment describing what it does, its parameters, and any side effects. Internal/helper functions within IIFEs can have simpler comments.

- [ ] **4.6 — Wrap remaining global functions in modules**
      Group related globals into namespace objects to reduce pollution. For example: `Chat.selectThread()`, `Workflows.showDetail()`, `Brain.filterMemories()`, `A11y.toggleDyslexiaFont()`. Use an IIFE-module pattern since there's no build system.

## Phase 5: State & Interaction Audit

- [ ] **5.1 — Audit all button states**
      Every button should have: default, hover, active (pressed), disabled, and focus-visible styles. Check: `.sso-btn`, `.auth-submit`, `.header-btn`, `.new-btn`, `.tab-btn`, `.back-btn`, `.send-btn`, `.panel-send-btn`, `.profile-menu-toggle`. Add missing states.

- [ ] **5.2 — Audit empty/loading states**
      Verify that empty states exist for: empty thread (already has `.empty-thread`), no search results, empty workflow list, empty memory, empty lessons. Add missing empty states as needed.

- [ ] **5.3 — Verify error states**
      The K-1 thread has an error state demo. Ensure error patterns are reusable (`.error-state` class) and not hardcoded to one specific thread.

- [ ] **5.4 — Check streaming/generation states**
      Test the Erabor streaming sequence. Verify the thinking animation, streaming text, stop button, and completion all work. Verify they respect the reduced-motion accessibility setting.

- [ ] **5.5 — Verify all panel open/close transitions**
      Test: sidebar collapse, file panel open/close, Cosimo panel slide, all header dropdowns, profile dropdown, graph detail pane. Ensure transitions are smooth, panels don't leave artifacts, and reduced-motion mode properly disables animations.

- [ ] **5.6 — Verify accessibility settings persistence**
      Test each a11y toggle: enable it, reload the page, confirm it's still active. Verify that font size zoom, dyslexia font, reduced motion, and high contrast all survive a page refresh via localStorage. Verify purple intensity survives refresh.

## Phase 6: Final Verification

- [ ] **6.1 — Run full visual comparison**
      Open the app in both themes. Navigate every view. Toggle each accessibility mode. Adjust purple intensity. Confirm nothing has visually changed from pre-refactor state.

- [ ] **6.2 — Check console for errors**
      Open browser dev tools. Navigate all views, trigger all interactions (including all accessibility toggles and purple slider). Zero errors, zero warnings.

- [ ] **6.3 — Validate HTML**
      Check for unclosed tags, duplicate IDs, missing alt attributes on any images, proper semantic structure, and ARIA attributes where appropriate.

- [ ] **6.4 — Update CLAUDE.md**
      Update the project structure section to reflect any new files (mock-data.js, icons.js, etc.). Update the JS sections list. Verify all line counts are current.
