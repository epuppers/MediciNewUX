# Refactoring Progress

**Started:** 2026-03-11
**Last updated:** 2026-03-11

## Status: IN PROGRESS — Phase 6

### Completed Tasks
- [x] **1.1 — Extract thread data to data object**
  Created `MOCK_THREADS` at top of app.js combining `threadTitles`, `threadHasFiles`, and search keywords into a single object. Removed old `threadTitles` and `threadHasFiles` constants. Updated all references in `selectThread()`, `updateFilesButton()`, `openFilePanel()`, `exportThread()`, and `runGlobalSearchEnhanced()`. Search function now derives its searchable list from `MOCK_THREADS` instead of a hardcoded array.

- [x] **1.2 — Extract workflow data to data object**
  Created `MOCK_WORKFLOWS` at top of app.js combining the old `workflowData` (title, desc) with sidebar metadata (status, lastRun, notif) and card metadata (cardDesc, steps, runs, lastShort). Removed old `workflowData` object and hardcoded `sidebarMap` index-based lookup. Replaced with `data-wf-id` attributes on sidebar HTML items for clean ID-based sidebar sync in `showWorkflowDetail()`.

- [x] **1.3 — Extract spreadsheet data to data object**
  Created `MOCK_SPREADSHEET` at top of app.js with `columns` (A–H), `headers`, and `rows` arrays. Old `sheetData` and `colLetters` now reference `MOCK_SPREADSHEET.rows` and `MOCK_SPREADSHEET.columns`. `buildSpreadsheet()` unchanged — still works via the aliases.

- [x] **1.4 — Extract Brain Memory data to data object**
  Created `MOCK_MEMORY` at top of app.js with `roleProfile`, `selectedTraits`, `presetTraits`, and `facts` arrays. Added `renderMemoryFromData()` function that populates role text, trait tags, and fact cards from the data object. Removed all hardcoded memory content from index.html (role text, trait tags, 8 fact cards). HTML now contains empty containers populated by JS on load.

- [x] **1.5 — Extract Brain Lessons data to data object**
  Created `MOCK_LESSONS` at top of app.js consolidating old `lessonData` with card-level preview text from HTML. Added `renderLessonList()` function that generates lesson cards from data. Old `lessonData` now references `MOCK_LESSONS`. Removed all 6 hardcoded lesson cards from index.html.

- [x] **1.6 — Extract Graph data to data object**
  Renamed `graphData` to `MOCK_GRAPH_DATA` across all 12 references in app.js. Verified no hardcoded graph content exists in HTML — all graph nodes/categories are already rendered from JS.

- [x] **1.7 — Extract header panel data (tasks, calendar, usage)**
  Created `MOCK_TASKS`, `MOCK_CALENDAR`, and `MOCK_USAGE` data objects at top of app.js. Added `renderHeaderPanels()` function that populates all three header dropdown panels (task items, calendar events, usage gauge + stats) from data. Removed all hardcoded panel content from index.html — panels are now empty containers populated on load.

- [x] **1.8 — Extract purple intensity base colors to data object**
  Renamed `purpleBaseColors` to `CONFIG_PURPLE_BASE_COLORS` and `rgbCompanions` to `CONFIG_RGB_COMPANIONS` across all references in app.js. Both objects use the CONFIG_ prefix since they are configuration, not mock data.

- [x] **1.9 — Collect all MOCK* and CONFIG* objects into a single data file**
  Created `js/mock-data.js` containing all data objects: `MOCK_WORKFLOWS`, `MOCK_SPREADSHEET`, `MOCK_MEMORY`, `MOCK_TASKS`, `MOCK_CALENDAR`, `MOCK_USAGE`, `MOCK_LESSONS`, `MOCK_THREADS`, `CONFIG_PURPLE_BASE_COLORS`, `CONFIG_RGB_COMPANIONS`, `MOCK_GRAPH_DATA`. Added `<script src="js/mock-data.js">` tag in index.html before app.js. Removed all data object definitions from app.js (~680 lines moved out).

- [x] **2.1 — Remove all inline onclick handlers from index.html**
  Removed all 123 inline `onclick` attributes from index.html. Added `data-thread-id`, `data-section`, `data-tab`, `data-wf-id`, `data-suggestion`, `data-action`, `data-nav`, `data-entity-id`/`data-entity-cat` attributes and IDs to elements for targeting. Created `initEventListeners()` IIFE (~250 lines) at end of app.js using event delegation for repeated patterns (thread list, workflow list/cards, brain nav, feedback buttons, model selectors, attach options, memory facts/traits, lesson cards, graph breadcrumbs/pills) and direct listeners for unique buttons. Also removed inline onclick from JS-generated HTML in `renderMemoryFromData()`, `renderLessonList()`, `submitNewMemory()`, `deleteFact()`, search results, and graph breadcrumbs/pills.

- [x] **2.2 — Remove inline oninput handlers from index.html**
  Removed 5 `oninput` and 3 `onkeydown` inline attributes from index.html. Added corresponding `addEventListener('input')` and `addEventListener('keydown')` calls in `initEventListeners()`: sidebar search, purple intensity slider, font size slider, memory search, lesson search, trait input Enter, memory add input Enter, and Cosimo panel keydown.

- [x] **2.3 — Remove inline onclick handlers from login.html**
  Removed 3 `onclick="window.location.href='index.html'"` from SSO buttons. Added `addEventListener` in the existing `<script>` block using `querySelectorAll('.sso-btn')`.

- [x] **2.4 — Remove all inline style attributes from index.html**
  Removed all 37 inline `style="..."` attributes from index.html. Created utility classes in utilities.css: `.text-green`, `.text-red`, `.cursor-default`, `.inline-icon`, `.brain-empty-title-lg`, `.swatch-green/gold/red/blue`, `.badge-sm`, `.flex-fill`, `.wf-listing-layout`, `.wf-detail-layout`, `.wf-detail-header-row`, `.mb-12`, `.mb-14`. Replaced `style="display:none"` with `.hidden` class on 13 elements and updated all corresponding JS toggle code to use `classList.add/remove('hidden')` instead of `style.display`.

- [x] **2.5 — Extract SVG icons to a shared reference**
  Created `js/icons.js` with `ICONS` object containing 30 named SVG icon strings (brain, lessons, graphs, chat, workflows, gauge, folder, export, share, thumbUp, thumbDown, attach, computer, cloud, send, chevronDown, stop, search, person, building, edit, cosimo, trash, trashRed, close, arrowRight, copy, regen, dots, checkmark, retry). Added `icon(name, w, h)` helper for custom sizing and `injectIcons()` function that populates `[data-icon]` elements in HTML. Replaced all inline SVGs in index.html with `<span data-icon="name">` elements (only the graph canvas SVG remains as a container). Updated app.js to reference `ICONS.*` instead of inline SVG strings. Usage gauge SVG kept inline due to dynamic data interpolation.

- [x] **3.1 — Audit and remove duplicate CSS rules**
  Searched all 6 CSS files for duplicate selectors. Found one true duplicate: `.sidebar-search` appeared twice in layout.css (lines 971 and 998) with split properties (`margin-top` and `position: relative`). Merged into a single rule block and removed the duplicate. All other multi-occurrences are intentional dark mode overrides, pseudo-class variants, or child selectors — not duplicates.

- [x] **3.2 — Extract repeated patterns into utility classes**
  Created `.bevel`, `.bevel-inset`, and `.label-mono` utility classes in utilities.css. Applied `.bevel` to ~47 elements in index.html using `border-color: var(--taupe-2) var(--taupe-3) var(--taupe-3) var(--taupe-2)` and removed redundant CSS from 8 selectors (`.th-dropdown`, `.header-btn`, `.wf-card`, `.detail-section`, `.wf-stats-section`, `.empty-thread-chip`, `.step-marker`, `.step-card`). Applied `.bevel-inset` to ~11 elements using the inset pattern and cleaned 5 selectors (`.panel-text-input`, `.mem-trait-input`, `.mem-add-input`, `.fp-cell-ref`, `.text-input`). Applied `.label-mono` to ~90+ elements using exact `font-family: var(--mono); text-transform: uppercase; letter-spacing: 0.05em;` and cleaned 16 selectors. Skipped JS-generated elements and selectors with non-matching letter-spacing values (0.08em, 0.1em, 0.12em, 0.18em).

- [x] **3.3 — Move misplaced CSS to correct files**
  Moved 4 groups of misplaced CSS rules to components.css: (1) Cosimo thinking/reasoning/error styles + dark mode overrides from chat.css (~330 lines), (2) Brain view/nav/empty/notes-banner styles from layout.css (~110 lines), (3) Lesson-applied component + dark mode override from workflows.css (~55 lines), (4) Panel overlay + dark mode override from utilities.css (~20 lines). All dark mode overrides moved alongside their base styles. Model selector correctly stays in chat.css, accessibility modes correctly stay in layout.css.

- [x] **3.4 — Normalize dark mode override structure**
  Audited all 6 CSS files for scattered `[data-theme="dark"]` rules. Found 3 scattered rules in layout.css mixed into the profile toggle section: `#themeToggleTrack`, `#themeToggleThumb`, and `.profile-menu-slider`. Moved all 3 to the dark mode overrides section at the end of layout.css near other theme-toggle overrides. All other files (tokens.css, chat.css, workflows.css, components.css, utilities.css) were already properly organized. No cross-file dark mode duplicates found.

- [x] **3.5 — Audit border-radius consistency**
  Searched all CSS files for raw `border-radius: Npx` and `border-radius: N%` values. Found 3 raw px values (`9px`, `2px`, `2px`) and 5 `50%` values — all are intentional special cases for pill shapes (toggle track, slider track, resize handle) and circles (avatars, slider thumbs), not standard corner radii. No raw px values need converting to `var(--r-sm/md/lg)` tokens. All compound border-radius values already use tokens.

- [x] **3.6 — Audit rgba() color consistency**
  Searched all CSS files for hardcoded rgba() values matching violet-3 (`116,65,143` / `136,85,168`) and berry-3 (`139,79,141` / `168,96,170`) in both light and dark mode variants. Found zero hardcoded values — all 34 violet/berry rgba calls already use the `rgba(var(--violet-3-rgb), alpha)` / `rgba(var(--berry-3-rgb), alpha)` token pattern, so the purple intensity slider correctly affects them all.

- [x] **3.7 — Add missing dark mode support**
  Audited all components in dark mode. Added missing overrides: (1) `.bevel` and `.bevel-inset` utilities — flatten to `var(--taupe-2)` in dark mode to prevent 3D inversion since taupe scale flips; (2) `.profile-menu-item:hover` and `.th-dropdown-footer:hover` — use `var(--berry-3)` text for readability; (3) `.profile-menu-theme:hover` — subtle berry tint; (4) `.profile-menu-divider` — use `var(--taupe-2)` for visibility; (5) `.profile-menu-toggle-thumb` — use `var(--taupe-4)` background for contrast against dark track; (6) `.fp-folder-header` — darken border; (7) `.fp-file-item.active` — flatten border in dark mode. Accessibility toggles and folder-tab styles were already properly handled.

- [x] **4.1 — Group and order functions logically**
  Reordered all sections in app.js (3408 lines) to match the target logical grouping: (1) Imports/Constants/Config, (2) IIFE initializers (rich text, theme restore, drag-drop, hover actions, drag-resize), (3) Purple Intensity + Accessibility, (4) Core UI (mode switching, panel toggles, sidebar, cosimo, dropdown), (5) Chat (search, input, feedback, threads, file panel, spreadsheet, export, K-1, Erabor, streaming, attach, model selector), (6) Workflows, (7) Brain—Memory, (8) Brain—Lessons, (9) Brain—Data Graphs, (10) Utilities (toast, escapeHtml), (11) Init (event listeners). Moved `escapeHtml` to Utilities section. Moved `toggleTheme` to Purple Intensity section. Line count preserved exactly at 3408.

- [x] **4.2 — Remove dead code**
  Searched all functions and variables in app.js for unused definitions. Found and removed 1 dead function: `renderGraph()` (line 2933) — a backward-compat wrapper around `buildGraph()` that was never called anywhere; `buildGraph()` is called directly instead. All other functions are actively called from the event listeners IIFE or other code paths. All mock-data.js exports and icons.js icons are actively used. No inline event handlers remain in HTML.

- [x] **4.3 — Fix the dual search function issue**
  Removed the `runGlobalSearch()` wrapper that just called `runGlobalSearchEnhanced()`. Renamed `runGlobalSearchEnhanced` to `runGlobalSearch` across all references (function definition, section comment, event listener call). Net removal of 3 lines.

- [x] **4.4 — Consolidate color utility functions**
  Grouped `hexToHsl()`, `hslToHex()`, and `hexToRgbString()` into a `ColorUtils` namespace object in a new "COLOR UTILITIES" section header. Updated all 3 call sites in `applyPurpleIntensity()` to use `ColorUtils.hexToHsl()`, `ColorUtils.hslToHex()`, `ColorUtils.hexToRgbString()`. Functions are now clearly separated from the purple intensity logic and reusable.

- [x] **4.5 — Add JSDoc comments to all public functions**
  Added JSDoc comments to all 95 top-level public functions in app.js. Each includes a one-line description, `@param` tags with types, `@returns` where applicable, and side-effect notes (DOM modifications, localStorage updates). Also added JSDoc to the `ColorUtils` namespace object and its 3 methods. Skipped internal functions within IIFEs (rich text, theme init, drag-drop, hover actions, drag-resize, a11y restore, event listeners). All existing section headers preserved, no code changes.

- [x] **4.6 — Wrap global functions into namespace objects**
  Created 7 namespace objects: `A11y` (7 functions — toggleTheme, applyPurpleIntensity, applyFontSizeBoost, toggleDyslexiaFont, toggleReducedMotion, toggleHighContrast, syncA11yToggles), `UI` (15 functions + currentMode state — switchMode, switchBrainSection, renderHeaderPanels, closeAllPanels, toggleTaskPanel, toggleCalendarPanel, toggleUsagePanel, toggleProfileMenu, buildMiniCalendar, handleNew, openCosimoPanel, closeCosimoPanel, handlePanelKey, sendPanelMessage, toggleDropdown), `Chat` (30 functions + state — runGlobalSearch, closeSearch, disableInput, giveFeedback, selectThread, updateFilesButton, openFilePanel, closeFilePanel, switchFilePanelTab, buildSpreadsheet, exportThread, shareThread, fillSuggestion, retryK1, isNearBottom, softScroll, eraborTimer, showEraborStopBtn, runEraborSequence, markEraborDone, cancelErabor, streamReply, typeTextBlock, streamSectionBlock, tokenizeHTML, attachFromComputer, attachFromDrive, toggleModelDropdown, selectModel + searchTimer/activeThread/sheetData/colLetters/sheetBuilt/erabor* state), `Workflows` (3 functions — showWorkflowDetail, showWorkflowListing, switchTab), `BrainMemory` (13 functions — renderMemoryFromData, toggleAddMemory, cancelAddMemory, submitNewMemory, filterMemories, filterByCategory, toggleFactMenu, editFact, deleteFact, confirmDelete, cancelDelete, toggleTrait, removeTrait, addCustomTrait), `BrainLessons` (11 functions + currentLessonId — renderLessonList, filterLessons, filterLessonScope, openLesson, closeLessonDetail, toggleLessonEdit, openCosimoForLesson, toggleLessonScope, deleteLesson, createNewLesson, toggleCardScope), `Graph` (18 functions + all graph state — findEntity, buildGraph, makeEdge, makeNode, animateNode, applyRootState, applyClusterState, graphNavigate, openGraphEntity, closeGraphDetail, navigateToRelated, updateBreadcrumb, showGraphTooltip, hideGraphTooltip, startDriftLoop, editGraphEntity, openCosimoForEntity + graphState/graphColors/graphNodeEls/graphEdgeEls/graphBuilt/driftRAF/driftItems/ANIM). Kept `showToast` and `escapeHtml` global. Updated all 97 function definitions, all internal cross-references, and all call sites in the event listeners IIFE. Wrapped the `switchBrainSection` override in an IIFE. Syntax verified with `node --check`.

- [x] **5.1 — Audit all button states**
  Audited all 9 button types for missing interactive states. Added `:focus-visible` with `outline: 2px solid var(--violet-3); outline-offset: 2px` to all 9 buttons (`.sso-btn`, `.auth-submit`, `.header-btn`, `.new-btn`, `.tab-btn`, `.back-btn`, `.cmd-btn`, `.panel-send-btn`, `.profile-menu-toggle`). Added missing `:active` states to `.back-btn` and `.panel-send-btn`. Added `:disabled` styles to `.cmd-btn`, `.panel-send-btn`, and `.auth-submit`. Added missing dark mode overrides for `.back-btn` (base + hover). Tab button focus uses `outline-offset: -2px` to stay within the tab bar. Profile toggle focus targets the track via `.profile-menu-toggle:focus-visible .profile-menu-toggle-track`.

- [x] **5.2 — Audit empty/loading states**
  Verified empty states for all 5 areas: (1) Empty thread — `.empty-thread` with icon, title, subtitle, suggestion chips already exists. (2) No search results — `.search-no-results` generated by JS in `runGlobalSearch()` already exists. (3) Empty workflow list — **ADDED** `.wf-no-results` empty state in `index.html` (hidden by default) with workflow icon, title, description; added matching CSS in workflows.css. (4) Empty memory — `.mem-no-results` with search icon and filter hint already exists. (5) Empty lessons — `.lesson-no-results` with search icon and filter hint already exists. All empty states use consistent `brain-empty-*` class patterns.

- [x] **5.3 — Verify error states**
  Made the K-1 error pattern reusable by creating `.error-state` class aliases alongside existing `.cosimo-error` selectors. Added `.error-state`, `.error-state-icon`, `.error-state-content`, `.error-state-title`, `.error-state-detail`, `.error-state-meta`, `.error-state-retry` as grouped selectors with their `cosimo-error` counterparts — same styles, no duplication. Added dark mode overrides for all `.error-state-*` variants. Added `:focus-visible` to retry button. Existing HTML unchanged — `cosimo-error` classes still work, but new error instances can use the generic `error-state` pattern.

- [x] **5.4 — Check streaming/generation states**
  Audited the Erabor streaming sequence: thinking cubes (`cube-wave` animation), reasoning step reveal (CSS transition), stream cursor blink (`blink-cursor`), stop/send button toggle, and character-by-character text streaming. CSS-based animations (thinking cubes, cursor blink, reasoning transitions) were already handled by reduced-motion via the global `animation-duration/transition-duration: 0.01ms !important` override. **Fixed**: JS-driven streaming was NOT respecting reduced-motion — added `reducedMotion` check at the top of `runEraborSequence()` and `streamReply()`. When reduced-motion is active, the entire Erabor sequence now skips staged animation and reveals final content instantly. Stop button, completion, and input re-enable all verified working.

- [x] **5.5 — Verify all panel open/close transitions**
  Audited all 7 panel types. Panels with CSS transitions: file panel (width 0.2s ease), Cosimo panel (translateX 0.3s ease), graph detail pane (translateY 0.4s cubic-bezier), panel overlay (opacity 0.2s ease) — all properly disabled by the `[data-a11y-motion="reduced"]` and `@media (prefers-reduced-motion)` rules via `transition-duration: 0.01ms !important`. Panels using display toggling (no animation): sidebar collapse, header dropdowns (tasks/calendar/usage), profile menu — instant appear/disappear by design, no reduced-motion issue. No JS-driven panel animations found. No artifacts, no leaking transitions. No code changes needed.

- [x] **5.6 — Verify accessibility settings persistence**
  Verified all 6 settings save to localStorage and restore on page load: (1) Theme (`theme` key) — saved in `toggleTheme()`, restored in IIFE at line 130. (2) Purple intensity (`purpleIntensity`) — saved in `applyPurpleIntensity()`, restored in IIFE at line 464, slider value also restored. (3) Font size zoom (`a11yFontSize`) — saved in `applyFontSizeBoost()`, restored in IIFE at line 587, slider value also restored. (4) Dyslexia font (`a11yDyslexia`) — saved in `toggleDyslexiaFont()`, restored at line 594. (5) Reduced motion (`a11yMotion`) — saved in `toggleReducedMotion()`, restored at line 598, also respects OS `prefers-reduced-motion` as fallback. (6) High contrast (`a11yContrast`) — saved in `toggleHighContrast()`, restored at line 602. All toggle UI states sync via `syncA11yToggles()` on load. No code changes needed.

- [x] **6.1 — Run full visual comparison**
  Programmatic structural verification of index.html and login.html. Both pages load (HTTP 200). All 18 structural elements confirmed present: 3 main views (#chatView, #workflowsView, #brainView), sidebars with data-thread-id/data-wf-id/data-section attributes, 4 header panels (#taskPanel, #calendarPanel, #usagePanel, #profilePanel), #filePanel, .cosimo-panel, .graph-detail-pane, .logo-mark, 4 empty states (.empty-thread, #wfNoResults, #memNoResults, #lessonNoResults), .cosimo-error, 3 streaming elements (#erabor-thinking, #erabor-reasoning, #erabor-reply). All 6 CSS files and 3 JS files loaded in correct order. Dark mode: 191 `[data-theme="dark"]` selectors across all CSS files. Accessibility: all 5 toggle controls present (theme, purple intensity, font size, dyslexia, motion, contrast). No structural changes from pre-refactor state.

### Current Task
(none — awaiting next instruction)

### Blocked / Notes
(none)
