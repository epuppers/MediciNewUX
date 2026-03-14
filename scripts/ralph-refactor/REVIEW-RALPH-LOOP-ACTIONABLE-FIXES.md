# Ralph Loop Review — Actionable Fixes

## HIGH PRIORITY: R-45 Ordering Fix

### Problem
R-45 (Finalize routes.ts) is at position 25, but three earlier tasks create route files:
- R-25: Create _app.chat.tsx + _app.chat.$threadId.tsx routes
- R-33: Create _app.workflows.tsx + _app.workflows.$id.tsx routes
- R-38: Create Brain route files — layout + memory + lessons + graph

These route files likely need routes.ts to be configured before creation.

### Solution
Move R-45 to position 15 in prd.json (immediately after R-24, before R-25).

In the JSON, change the userStories array order:
```json
// BEFORE (current order, positions 24-25)
...
{ "id": "R-24", ... },
{ "id": "R-25", ... },
...
{ "id": "R-45", ... }  ← at position 25

// AFTER (corrected order)
...
{ "id": "R-24", ... },
{ "id": "R-45", ... },  ← moved to position 15 (after R-24)
{ "id": "R-25", ... },
...
```

### Implementation (manual)
1. In prd.json, find the R-45 object (currently around line 660)
2. Cut the entire R-45 object
3. Locate the R-24 object (around line 490)
4. Paste R-45 immediately after R-24

Time to fix: 2 minutes

---

## MEDIUM PRIORITY: Add Verification Steps to Component Tasks

### Problem
Component creation tasks have minimal verification steps. Example:

**Current (R-21):**
```
VERIFICATION: Component renders both user and AI message types without errors
when given sample message data. TypeScript compiles.
```

**Better (proposed):**
```
VERIFICATION:
1. Run `cd medici-app && npx tsc --noEmit` — must exit 0
2. Import in a route file and check console for errors
3. Toggle dark mode — colors adapt correctly
4. Verify relevant functionality: click handlers work, state binding correct
```

### Solution
Apply this standard verification template to component creation tasks:

```
VERIFICATION:
1. TypeScript check: cd medici-app && npx tsc --noEmit (exit 0)
2. Browser rendering: Add to a route, npm run dev, check for console errors
3. Dark mode: Toggle .dark class on <html>, verify colors/contrast
4. Functionality: Test interactive elements relevant to this component
```

### Tasks to Update
- R-21: Create message-block.tsx
- R-22: Create artifact.tsx + data-table.tsx
- R-23: Create chat-input.tsx
- R-24: Create thread-list.tsx
- R-27: Create workflow-card.tsx + workflow-stats.tsx
- R-28: Create flow-graph.tsx + flow-node.tsx + flow-edge.tsx
- R-29: Create node-popover.tsx
- R-30: Create template-detail.tsx
- R-31: Create overview-tab.tsx + schema-tab.tsx
- R-32: Create triggers-tab.tsx + runs-tab.tsx + lessons-tab.tsx
- R-35: Create memory-list.tsx + memory-fact.tsx + trait-badges.tsx
- R-36: Create lesson-card.tsx + lesson-detail.tsx
- R-37: Create entity-graph.tsx + entity-detail.tsx
- R-40: Create cosimo-panel.tsx
- R-41: Create header dropdown panels
- R-42: Create profile dropdown
- R-43: Create file-panel.tsx + workflow-panel.tsx

### Implementation (manual)
For each task, find the `VERIFICATION:` section and expand it to include all 4 steps.

Time to fix: 15 minutes (entire batch)

---

## MEDIUM PRIORITY: Task Sizing Concerns

### R-28 (Flow Graph Components) — 25-30 context blocks

**Issue**: Combines 3 files (flow-graph.tsx, flow-node.tsx, flow-edge.tsx) with SVG rendering and state management. Too large for one iteration.

**Option A: Split into 2 tasks**

Insert new task between current R-28 and R-29:

```json
{
  "id": "R-28a",
  "title": "Create flow-graph.tsx + flow-edge.tsx — SVG container and edges",
  "description": "[Keep first 2 components only, trim the description]",
  "passes": false
},
{
  "id": "R-28b",
  "title": "Create flow-node.tsx — SVG nodes with status colors",
  "description": "[Move flow-node.tsx to separate task]",
  "passes": false
}
```

Then renumber all subsequent tasks from R-29 onwards (increasing count by 1).

**Option B: Keep as-is but document**

Add a note to CLAUDE.md:

```
## Large Tasks (May require 2 iterations)

Some tasks are large and may exceed a single iteration. If an iteration fails:
- R-28 (flow-graph components): May need 2 iterations. Focus on SVG rendering
  in first iteration, then status colors/pulse animation in second.
- R-42 (profile dropdown + a11y): Focus on UI in first iteration, wiring
  to state in second.
- R-49 (dark mode verification): May require 2-3 iterations given app size.
  First iteration: Chat view. Second: Workflows. Third: Brain + overlays.
```

**Recommendation**: Option A (split). Reduces risk.

Time to fix: 10 minutes (Option A) or 2 minutes (Option B)

---

## MEDIUM PRIORITY: R-49 Multi-Iteration Documentation

### Problem
R-49 (Dark Mode Verification) is the largest task (40-50 context blocks) and likely needs 2-3 iterations.

### Solution
Update CLAUDE.md to explicitly allow multi-iteration for R-49:

```markdown
### Special Cases: Multi-Iteration Tasks

Some tasks are too large for a single iteration. For these tasks:

**R-49 (Dark mode verification pass):**
- This task reviews the entire app in dark mode across 3 major views.
- It is acceptable to complete this in 2-3 iterations.
- Iteration 1: Review Chat view + fix all issues found
- Iteration 2: Review Workflows view + fix all issues found
- Iteration 3: Review Brain view + overlays + finalize

In progress.txt, document which views you checked in each iteration.
Do not mark R-49 as passed until all 3 views are verified.
```

Time to fix: 2 minutes

---

## LOW PRIORITY: Add Task Size Hints

### Problem
Agents don't know task complexity ahead of time, can't plan accordingly.

### Solution
Add optional "complexity" field to prd.json:

```json
{
  "id": "R-01",
  "title": "Initialize React Router 7 project",
  "description": "...",
  "complexity": "small",
  "passes": false
}
```

Size mappings:
- **small** (2-5 context blocks): Simple npm/config tasks (R-01, R-02, R-05, R-45)
- **medium** (8-15 blocks): Component creation, data extraction (R-21, R-23, R-24, R-27, R-41)
- **large** (20-30 blocks): Multi-file components, complex state (R-13, R-28, R-42, R-43)
- **xlarge** (40+ blocks): Full app review/verification (R-49, R-54, R-57)

Time to fix: 10 minutes

---

## SUMMARY OF FIXES

| Fix | Priority | Time | Impact |
|-----|----------|------|--------|
| R-45 ordering | HIGH | 2 min | Prevents task failures |
| Verification steps | MEDIUM | 15 min | Improves task clarity |
| Task sizing (R-28) | MEDIUM | 10 min | Reduces iteration risk |
| R-49 documentation | MEDIUM | 2 min | Sets expectations |
| Complexity hints | LOW | 10 min | Helps future planning |

**Total time to implement all fixes: 39 minutes**

Recommended order:
1. Fix R-45 immediately (blocks deployment)
2. Add verification steps before first run
3. Handle R-28 splitting decision
4. Add complexity hints for future reference
