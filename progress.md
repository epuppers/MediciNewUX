# Refactoring Progress

**Started:** 2026-03-11
**Last updated:** 2026-03-11

## Status: IN PROGRESS — Phase 1

### Completed Tasks
- [x] **1.1 — Extract thread data to data object**
  Created `MOCK_THREADS` at top of app.js combining `threadTitles`, `threadHasFiles`, and search keywords into a single object. Removed old `threadTitles` and `threadHasFiles` constants. Updated all references in `selectThread()`, `updateFilesButton()`, `openFilePanel()`, `exportThread()`, and `runGlobalSearchEnhanced()`. Search function now derives its searchable list from `MOCK_THREADS` instead of a hardcoded array.

### Current Task
(none — awaiting next instruction)

### Blocked / Notes
(none)
