# PRD: Workflows Rebuild

## Goal

Rebuild the Workflows section of the Cosimo UX prototype to implement the Template / Run / Trigger conceptual model. Runs live inside Chat threads. Templates are inspected and edited in the Workflows view. A visual flow graph is the hero element. All new UI follows existing design system rules and conventions from `CLAUDE.md`.

## Success Criteria

- Dev server loads with zero console errors
- All 7 workflow templates render in the Library view with correct data
- Template Detail view shows visual flow graph with nodes, edges, and branches for all templates
- Clicking a node in the flow graph opens a detail popover
- Flow graph works in both full (Template Detail) and compact (Chat panel) modes
- Chat threads linked to workflow runs show the Workflow Context Panel with live status
- Three mock workflow chat threads render correctly (completed run, gate run, creation flow)
- Typing `/` in chat input shows workflow command autocomplete
- All cross-view navigation paths work (Library → Detail → Chat → back)
- Both light and dark mode render correctly for all new elements
- All accessibility modes work (dyslexia font, reduced motion, high contrast, text size zoom)
- Purple intensity slider affects all new violet/berry-colored elements
- Existing views (non-workflow Chat threads, Brain) function identically to pre-build state

## Completion Signal

When ALL tasks below are checked off in progress.md, output:
<promise>WORKFLOWS_COMPLETE</promise>

## Agent Rules (read every iteration)

1. Read `CLAUDE.md` before starting — it contains the full architecture, conceptual model, data model specs, mock conversation scripts, and design system rules
2. Complete ONE task per iteration, then stop
3. Update progress.md after each task
4. Verify the dev server loads (`curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/index.html`)
5. Git commit with message format: `workflows [task number]: [brief description]`
6. Do NOT git push (human will push after reviewing)
7. Do NOT combine multiple tasks into one iteration
8. ALL colors must use `var(--token)` from tokens.css — no raw hex/rgb
9. ALL new CSS must include dark mode overrides in the same file
10. ALL new interactive elements must have hover, active, focus-visible states
11. ALL animations must respect `[data-a11y-motion="reduce"]`
12. Use event delegation in `initEventListeners()` — no inline handlers
13. Mock data uses `MOCK_` prefix, goes in `js/mock-data.js`
14. New JS functions go in the `Workflows` or `Chat` namespace as appropriate
15. Preserve ALL existing functionality — do not break Chat, Brain, or any other working feature

---

## Phase 1: Data Layer

- [ ] **1.1 — Create MOCK_WORKFLOW_TEMPLATES**
      Replace `MOCK_WORKFLOWS` in mock-data.js with `MOCK_WORKFLOW_TEMPLATES`. Include all 7 templates with full data as specified in the "Template Data Model" section of CLAUDE.md: rent-roll, k1-extract, lp-waterfall, fee-calc, covenant, tener-valuation, due-diligence. Each template has: id, title, description, status, version, createdBy, createdDate, triggerType, triggerConfig, linkedLessons, linkedEntities, inputSchema, outputSchema, nodes array, edges array, runs summary, recentRuns array. The due-diligence template should have the most complex graph (branching to parallel paths then merging). Update any existing code that references `MOCK_WORKFLOWS` to use the new object. App must still load without errors.

- [ ] **1.2 — Create MOCK_WORKFLOW_RUNS**
      Add `MOCK_WORKFLOW_RUNS` to mock-data.js with two detailed run objects as specified in CLAUDE.md: `wf-run-tener-12` (status: waiting, 3 exceptions) and `wf-run-rentroll-047` (status: completed, 1 inference exception). Each run has: templateId, runId, status, triggerType, triggeredBy, startTime, threadId, inputManifest, nodeStatuses (keyed by node ID), exceptions, outputManifest.

- [ ] **1.3 — Create MOCK_WORKFLOW_COMMANDS and update MOCK_THREADS**
      Add `MOCK_WORKFLOW_COMMANDS` array to mock-data.js with 5 chat commands as specified in CLAUDE.md. Add 3 new workflow-linked entries to `MOCK_THREADS`: `wf-run-rentroll-047` (completed run, indicator: ready), `tener-batch-12` (waiting run, indicator: waiting), `wf-create-dd` (creation flow, no run link). Each new thread entry includes a `workflowRunId` field linking to the run data. Update the thread sidebar HTML in index.html to include these 3 new threads with appropriate data attributes.

- [ ] **1.4 — Add new trigger icons to icons.js**
      Add 6 new icon entries to the `ICONS` object: `folderWatch` (folder with eye), `schedule` (clock), `chatCommand` (terminal/prompt `>_`), `emailTrigger` (envelope), `manualTrigger` (play triangle), `webhook` (chain links). Follow existing icon conventions: SVG with viewBox, fill="none", stroke="currentColor", stroke-width appropriate to icon size.

## Phase 2: Workflow Library View

- [ ] **2.1 — Rebuild Library HTML and rendering function**
      Replace hardcoded cards inside `#wfListing > .wf-listing` with a single empty container. Create `Workflows.renderLibrary()` function that reads `MOCK_WORKFLOW_TEMPLATES`, builds card HTML, and injects it. Each card: `.wf-card` with header (title + status badge + trigger type chip), body (description), footer (linked lesson chip if any, last run status indicator, "▶ Run" button). Stats bar computes totals from data. Call `Workflows.renderLibrary()` on init. Wire card click → `Workflows.showWorkflowDetail(id)` via event delegation.

- [ ] **2.2 — Rebuild workflow sidebar**
      Replace hardcoded items in `#workflowSidebar` with dynamic rendering. Create `Workflows.renderSidebar()` function. Add "Active Runs" section at top of sidebar populated from `MOCK_WORKFLOW_RUNS` where status is running or waiting — each item shows template name, thread title, status indicator. Below: template list with trigger type icons. Wire sidebar clicks via event delegation.

- [ ] **2.3 — Library CSS**
      Add to `workflows.css`: `.wf-card-trigger-chip` (icon + label chip, mono 10px), `.wf-card-lesson-chip` (violet pill with ◆), `.wf-card-run-status` (dot + text), `.wf-card-run-btn` (small bevel button, visible on card hover), `.wf-active-runs` (sidebar section, tinted background), `.wf-active-run-item`, `@keyframes wf-pulse` (gated by `[data-a11y-motion]`). Include full dark mode overrides for all new classes.

## Phase 3: Template Detail — Flow Graph

- [ ] **3.1 — Two-column detail layout**
      Replace content inside `#wfDetail` with new structure: header (back button + title + actions dropdown + Run button), then `.wf-detail-columns` flex row containing `.wf-detail-graph-col` (60%) and `.wf-detail-info-col` (40%). Add CSS for the two-column layout, graph container (`.flow-graph-container` — full height, bevel border, overflow hidden), and info column (overflow-y auto). Include dark mode overrides. Update `Workflows.showWorkflowDetail()` to populate from `MOCK_WORKFLOW_TEMPLATES`.

- [ ] **3.2 — Flow graph SVG renderer**
      Create `Workflows.renderFlowGraph(templateId, containerId, options)`. Options: `{ compact: false, showStatus: false, runId: null }`. The function reads nodes and edges from template data, calculates pixel positions from x/y grid coords (x-spacing 200px, y-spacing 100px), and renders an SVG. Each node: rounded rect (160×60 full, 100×36 compact), stroke/fill by node type (colors per CLAUDE.md design guidelines), title text (mono 11px bold), description text (sans 10px, truncated — full mode only), lesson chip if applicable. Gate nodes: dashed stroke. Edges: lines with arrowheads, branch labels at midpoints. All colors via CSS custom properties. Add SVG-related CSS to `components.css`.

- [ ] **3.3 — Flow graph interaction (zoom, pan, node click)**
      Add mouse wheel zoom (scale transform on SVG viewBox or group) and mouse drag pan to the flow graph container (full mode only, not compact). Add click handler on nodes that calls `Workflows.selectNode(nodeId)`. Respect `[data-a11y-motion]`. Store current zoom/pan state in the `Workflows` namespace.

- [ ] **3.4 — Node detail popover**
      Create `Workflows.openNodePopover(nodeId, templateId, anchorRect)` that renders a `.node-popover` (320px wide, absolutely positioned over graph) with: type label badge, title, full description, linked lesson detail, "Edit with Cosimo" button, "Close" button. Click-outside-to-dismiss. Add CSS for `.node-popover` to `components.css` with dark mode overrides. Wire "Edit with Cosimo" to open existing Cosimo panel.

## Phase 4: Template Detail — Info Tabs

- [ ] **4.1 — Schema tab**
      Create the Schema tab panel (`#tab-schema`) in the info column. Two sections: Input Schema (description text + field table) and Output Schema (format chip + destination + column list). Each input field row: name (mono bold), type badge (small chip), required indicator, description text. Use existing `.detail-section` pattern for section headers. Populate from `MOCK_WORKFLOW_TEMPLATES[id].inputSchema` and `.outputSchema`. Add CSS for `.schema-field-row`, `.schema-type-badge`, `.schema-required` to `components.css`.

- [ ] **4.2 — Triggers tab**
      Create the Triggers tab panel (`#tab-triggers`). List of active triggers: icon by type, type label, config detail (folder path / cron / command string). "Add Trigger" dashed button using existing `.add-source-btn` pattern. Populate from template's `triggerConfig`. Add CSS for `.trigger-item` to `components.css`.

- [ ] **4.3 — Runs tab**
      Create the Runs tab panel (`#tab-runs`). Run history table using existing `.run-row` pattern. Each row: status dot, run ID, trigger + detail, timestamp, duration. Rows with `threadId` get cursor pointer and hover effect — clicking will navigate to chat thread (wired in Phase 6). Populate from template's `recentRuns`.

- [ ] **4.4 — Lessons tab**
      Create the Lessons tab panel (`#tab-lessons`). Card for each linked lesson: name, which nodes use it, last updated. "Link Lesson" dashed button. Populate by cross-referencing template's `linkedLessons` with `MOCK_LESSONS` data.

## Phase 5: Chat Integration

- [ ] **5.1 — Workflow Context Panel structure**
      Add `#workflowPanel` to the chat area in index.html (same side and pattern as `#filePanel`). Structure: `.workflow-panel-header` (template name, run ID, status badge, close button), `.workflow-panel-graph` (container for compact mini flow graph), `.workflow-panel-details` (scrollable: input manifest, exceptions, output manifest). Create `Chat.openWorkflowPanel(runId)` and `Chat.closeWorkflowPanel()`. Panel opens automatically when selecting a thread with `workflowRunId`, closes when selecting a thread without one. Resizable via drag handle (same pattern as file panel). Add CSS to `chat.css` with dark mode overrides.

- [ ] **5.2 — Compact flow graph with run status**
      Extend `Workflows.renderFlowGraph()` to handle `{ compact: true, showStatus: true, runId: '...' }`. Compact: nodes 100×36, title only, no description, no zoom/pan, fits within ~300px width. Status mode: node fill colors from `MOCK_WORKFLOW_RUNS[runId].nodeStatuses` — completed (green), running (violet + pulse), waiting (amber), pending (faded taupe), failed (red), skipped (faded + strikethrough). Wire into the workflow context panel graph container.

- [ ] **5.3 — Workflow chat thread content (completed run)**
      Add chat content HTML for `wf-run-rentroll-047` thread following the mock conversation script in CLAUDE.md "Thread A". User message with `/rent-roll` command chip (`.wf-command-chip`). Cosimo messages with run summary artifact and spreadsheet preview artifact. Use existing `.msg-block`, `.user-card`, `.ai-block`, `.artifact` patterns. Add CSS for `.wf-command-chip` (mono, violet bg, white text, pill shape) and update `Chat.selectThread()` to show this content.

- [ ] **5.4 — Workflow chat thread content (gate run)**
      Add chat content HTML for `tener-batch-12` thread following the mock conversation script in CLAUDE.md "Thread B". Gate messages get `.msg-gate` class on `.ai-block` — 3px amber left border, light amber background tint, "⏸ Awaiting Review" chip in header. Exception table as `.data-tbl` artifact. Add CSS for `.msg-gate` and `.msg-gate-chip`. Both light and dark mode.

- [ ] **5.5 — Workflow chat thread content (creation flow)**
      Add chat content HTML for `wf-create-dd` thread following the mock conversation script in CLAUDE.md "Thread C". Cosimo shows proposed flow graph as an artifact — call `Workflows.renderFlowGraph('due-diligence', artBodyDivId, { compact: false, showStatus: false })` after the DOM element is visible (use a small init function or requestAnimationFrame). Show both the initial and updated graph artifacts.

- [ ] **5.6 — Chat command autocomplete**
      When user types `/` as first character in chat input, show `.wf-command-autocomplete` dropdown above the input. Populate from `MOCK_WORKFLOW_COMMANDS`. Each item: command (mono bold violet), label, description. Keyboard nav (arrow keys, Enter, Escape). Mouse click to select. Selecting inserts command text. If command expects entity arg (check template), append placeholder. Dismiss on Escape / click-outside / blur. Add CSS to `chat.css` with dark mode overrides.

- [ ] **5.7 — Thread sidebar workflow indicators**
      Update sidebar thread rendering to detect `workflowRunId` on threads. Add small `⚙` icon (`.thread-wf-icon`) before title text. Add `waiting` indicator type (amber dot + "Waiting"). Add `running` indicator (violet dot + pulse). Pulse animation gated by `[data-a11y-motion]`. Add CSS to `layout.css` or `chat.css`.

## Phase 6: Navigation & Polish

- [ ] **6.1 — Wire Library → Detail → Chat navigation**
      Library card click → `Workflows.showWorkflowDetail(id)` (already roughed in, verify smooth). Detail "▶ Run" → switch to Chat view, select mock run thread, open workflow panel. Detail Runs tab row click → if threadId, switch to Chat, select thread. Back button → Library. Store last-viewed state in `Workflows` namespace so tab switching preserves it.

- [ ] **6.2 — Wire Chat → Workflows navigation**
      Sidebar active run click → switch to Chat, select thread, open workflow panel. "+ New Workflow" button → switch to Chat, select `wf-create-dd` thread. Command autocomplete selection → select mock run thread for that template, open workflow panel.

- [ ] **6.3 — Wire Cosimo panel integration**
      Template Detail "Edit with Cosimo" (actions dropdown) → open Cosimo panel with template context. Node popover "Edit with Cosimo" → open Cosimo panel with node context. Pre-populate the Cosimo panel input with context text.

- [ ] **6.4 — Toast notifications and keyboard shortcuts**
      Fire `showToast()` when navigating to completed run ("Run #047 completed") or waiting run ("Run #012 waiting for review"). Verify Escape key dismisses: node popover → command autocomplete → workflow panel (priority order). Verify `/` key in chat input triggers autocomplete.

- [ ] **6.5 — Final QA and polish**
      Full checklist: all navigation paths work, no console errors, light mode correct, dark mode correct, `[data-a11y-motion]` disables all pulse animations, `[data-a11y-contrast]` readable on all new elements, `[data-a11y-font]` doesn't break flow graph layout, font size slider doesn't break layout, purple intensity slider affects new violet/berry elements, existing chat threads (fund3, hilgard, q4lp, k1, erabor) unchanged, Brain section unchanged, login page unchanged, file panel works alongside workflow panel. Fix any issues found.

- [ ] **6.6 — Update CLAUDE.md**
      Update Project Structure section with any new files or changed line counts. Update JS Namespace Modules to include new `Workflows.*` and `Chat.*` functions. Update Key JS Sections list. Verify all documentation is current.

## Completion Signal

When ALL Phase 6 tasks are checked off in progress.md, output:
<promise>WORKFLOWS_COMPLETE</promise>
