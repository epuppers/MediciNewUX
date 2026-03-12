# Refactoring Progress

**Started:** 2026-03-11
**Last updated:** 2026-03-11

## Status: IN PROGRESS — Phase 1

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

### Current Task
(none — awaiting next instruction)

### Blocked / Notes
(none)
