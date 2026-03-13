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
css/chat.css        — Chat messages, streaming, artifacts, file panel, workflow context panel (~1649 lines)
css/workflows.css   — Workflow library, template detail, flow graph container (~592 lines)
css/components.css  — Flow graph nodes/edges, Brain sections, Cosimo panel, error states (~2183 lines)
css/utilities.css   — Helpers (dropdowns, scrollbars, overlays, bevels, label-mono) (~245 lines)
fonts/              — ChicagoFLF.ttf (retro display font)
PRD.md              — Build task list (current: Workflows Rebuild)
progress.md         — Tracks completed tasks
```

## Architecture Overview

### Views (3 tabs in main area)
- **Chat** — Thread-based AI conversation with artifacts, streaming, file panel, workflow context panel
- **Workflows** — Library (template cards) + Template Detail (flow graph + info tabs)
- **Brain** — Memory (facts/traits), Lessons (domain knowledge), Data Graphs (entity SVG)

### Sidebars (swap per active tab)
- chatSidebar, workflowSidebar, brainSidebar — all defined inline in index.html

### Overlay Panels
- Cosimo slide-in panel (workflow editing chat)
- Task panel, Calendar panel, Usage panel (header dropdowns)
- File panel (right-side, resizable, spreadsheet + folder views)
- Workflow context panel (right-side, resizable, shows run status in Chat)
- Profile dropdown (theme toggle, purple intensity, accessibility settings)

### Logo
- Login page: 6-sphere inverted triangle (`.hero-spheres` with `.hero-sphere.dark` / `.hero-sphere.light`)
- Main app sidebar: small mark (`.logo-mark` > `.logo-mark-inner`)

---

## Workflows Conceptual Model

The Workflows feature has three core concepts: Templates, Runs, and Triggers.

### Template
A reusable workflow blueprint. Contains:
- **Identity**: name, description, status (draft / active / paused / archived), version, created by
- **Input Schema**: what data the workflow expects — document types, field definitions, or loose context
- **Output Schema**: what the workflow produces — column definitions, file formats, destinations
- **Flow Graph**: a directed graph of nodes and edges (see Node Types below)
- **Trigger Config**: how runs are kicked off
- **Linked Lessons**: which Brain lessons this workflow uses
- **Linked Entities**: which Graph entities this workflow touches

### Run
A specific execution of a template. Lives inside a chat thread. Contains:
- **Run metadata**: ID, template + version, trigger type, start time, status (running / waiting / completed / failed), triggered by
- **Input manifest**: exactly which files/data were fed in
- **Node execution log**: per-node status (pending / running / completed / failed / skipped / waiting-for-human)
- **Exceptions & flags**: low-confidence extractions, unexpected formats, judgment calls Cosimo made
- **Output manifest**: what was produced, where it went

### Trigger
How a run gets created:
- **Manual**: user clicks "Run" and selects/uploads input files
- **Chat command**: user types `/workflow-name` or `/workflow-name TargetEntity` in a chat thread
- **Folder watch**: new files in a watched folder trigger a run
- **Schedule**: cron-style recurring runs
- **Email**: incoming email attachment triggers a run
- **Chained**: output of another workflow triggers this one

### Node Types (in the flow graph)
- **Input Node**: where data enters — folder, upload, email, API, chat attachment
- **Action Node**: Cosimo does work — extract, transform, calculate, generate, enrich
- **Gate Node**: human review required — Cosimo pauses, posts to thread, waits for response
  - *Designed gate*: template author placed it explicitly
  - *Auto gate*: Cosimo creates one at runtime when hitting something unexpected
- **Branch Node**: conditional routing based on data or confidence
- **Output Node**: where results go — folder, email, dashboard, another workflow, chat artifact

### Key UX Principles
- Runs live in Chat threads — the run IS a conversation with Cosimo
- Gate nodes post messages in the thread; the user responds in natural language
- Workflows are created through conversation with Cosimo (creation flow = chat thread)
- Templates are inspectable and editable without Cosimo via the visual flow graph
- The app is context-aware: clicking into a workflow shows the most relevant view (active run → chat, idle → template detail)

---

## Template Data Model

Each entry in `MOCK_WORKFLOW_TEMPLATES` must have this structure:

```javascript
{
  id: 'template-id',
  title: 'Human Readable Name',
  description: 'What this workflow does, 1-2 sentences.',
  status: 'active',          // draft | active | paused | archived
  version: 1,
  createdBy: 'E. Puckett',
  createdDate: 'Jan 14, 2026',
  triggerType: 'folder-watch', // manual | folder-watch | schedule | email | chat-command | chained
  triggerConfig: {
    // varies by type:
    watchPath: '/path/to/folder/',     // for folder-watch
    chatCommand: '/command',           // for chat-command
    schedule: 'Monthly, 1st at 9 AM', // for schedule
    // can have multiple trigger configs
  },
  linkedLessons: ['lesson-id'],        // array of lesson IDs from MOCK_LESSONS
  linkedEntities: ['entity-id'],       // array of entity IDs from MOCK_GRAPH_DATA
  inputSchema: {
    description: 'What input this workflow expects',
    fields: [
      { name: 'Field Name', type: 'string', required: true, description: 'What this field is' }
      // type options: string, number, date, currency, enum, boolean
      // enum fields also have: options: ['Option1', 'Option2']
    ]
  },
  outputSchema: {
    format: 'xlsx',                    // xlsx, pdf, csv, email, json
    destination: '/output/path/',
    columns: ['Col1', 'Col2', 'Col3']  // for tabular output
  },
  nodes: [
    {
      id: 'n1',
      type: 'input',                   // input | action | gate | branch | output
      title: 'Node Title',
      description: 'What this node does',
      lesson: null,                    // lesson ID or null
      x: 0,                           // column position: -2, -1, 0, 1, 2
      y: 0                            // row position: 0, 1, 2, ... N
    }
    // branch nodes also have:
    // conditions: [{ label: 'Condition text', target: 'nodeId' }]
  ],
  edges: [
    { from: 'n1', to: 'n2' }
    // branch edges also have: label: 'Condition text'
  ],
  runs: {
    total: 47,
    successRate: 95.7,
    avgDuration: '12.4s',
    filesProcessed: 183
  },
  recentRuns: [
    {
      id: '#047',
      status: 'success',              // success | failed
      trigger: 'Manual — 3 files',
      time: 'Today, 12:15 PM',
      duration: '11.2s',
      threadId: 'wf-run-rentroll-047'  // null if no linked thread
    }
  ]
}
```

### Required Templates (7 total)

1. **rent-roll** — Active, folder-watch + `/rent-roll`. Flow: Input → Extract & Parse → Branch (confidence) → [low: Gate] → Standardize & Enrich → Quality Check → Output. Linked lesson: `rent-roll-extraction-standardized`. Input fields: Unit ID (string, required), Tenant Name (string, required), Lease Start (date, required), Lease End (date, required), Monthly Rent (currency, required), Sq Ft (number), Floor (number), Status (enum: Occupied/Vacant/Notice, required). Output: xlsx to `/Finance/CRE/Processed/Rent Rolls/`. 47 runs, 95.7% success.

2. **k1-extract** — Active, manual + `/k1`. Flow: Input → Parse K-1 Forms → Extract Allocations → Branch (multi-state check) → [multi: State Apportionment] → Map to Fund Structure → Gate (Discrepancy Review) → Output. 23 runs.

3. **lp-waterfall** — Draft, manual only. Flow: Input → Load LPA Terms → Calculate Preferred Return → Calculate Catch-Up → Calculate Carry Split → Gate (GP Review) → Generate Schedule → Output. Long linear chain (8 nodes). 0 runs.

4. **fee-calc** — Active, schedule (monthly) + `/fees`. Flow: Input → Load Commitments → Apply Fee Rates → Calculate Offsets → Output. Simple 5-node linear, no branches. 31 runs.

5. **covenant** — Paused, schedule (daily). Flow: Input → Pull Loan Data → Calculate Ratios → Branch (threshold: breach / warning / clear) → [breach: Alert Gate] / [warning: Alert Gate] / [clear: Log Only] → Output Report. Three-way branch. 18 runs.

6. **tener-valuation** — Active, chat command `/valuation`. Flow: Input → OCR & Extract → Identify Parcel Data → Branch (data quality: clean / issues) → [clean: Map to Schema] / [issues: Gate for Review] → Validate Against Tax Records → Generate Filing Package → Output. Input fields: Parcel ID (string, required), Assessed Value (currency, required), Tax Year (string, required), Filing Deadline (date, required), Property Address (string, required), Owner (string), Tax Class (enum). 34 runs.

7. **due-diligence** — Draft, chat command `/dd [company]`. Flow: Input → Branch (by doc type: financials / rent rolls / environmental / title / zoning) → [5 parallel Action nodes] → Cross-Reference Validation → Gate (Red Flag Review) → Generate DD Summary → Output. Most complex graph with parallel branching. 0 runs.

---

## Run Data Model

Each entry in `MOCK_WORKFLOW_RUNS`:

```javascript
{
  templateId: 'rent-roll',
  runId: '#047',
  status: 'completed',       // running | waiting | completed | failed
  triggerType: 'manual',
  triggeredBy: 'E. Puckett',
  startTime: 'Today, 12:15 PM',
  threadId: 'wf-run-rentroll-047',
  inputManifest: [
    { name: 'filename.pdf', type: 'pdf', size: '2.1 MB' }
    // or { name: 'FolderName/', type: 'folder', fileCount: 47 }
  ],
  nodeStatuses: {
    'n1': 'completed',       // pending | running | completed | failed | skipped | waiting
    'n2': 'completed',
    'n4': 'skipped'          // skipped = branch not taken
  },
  exceptions: [
    {
      nodeId: 'n5',
      type: 'inference',     // inference | low-confidence | conflicting-value | format-unknown
      description: 'Human-readable explanation of what happened',
      confidence: 94          // number or null
    }
  ],
  outputManifest: [
    { name: 'output-file.xlsx', path: '/output/path/', size: '84 KB' }
  ]
}
```

### Required Runs (2)

1. **wf-run-rentroll-047** — Completed. Template: rent-roll. 3 input PDFs. All nodes completed, gate skipped. 1 inference exception (floor inference, 94% confidence). 1 output xlsx.

2. **wf-run-tener-12** — Waiting. Template: tener-valuation. 47 input files (folder). Gate node waiting. 3 exceptions: conflicting assessed values, poor OCR quality, unexpected TIFF format.

---

## Mock Chat Thread Scripts

These scripts define the exact messages for the 3 new workflow-linked chat threads. Build the HTML using existing `.msg-block`, `.user-card`, `.ai-block`, `.artifact` patterns.

### Thread A: `wf-run-rentroll-047` — "Rent Roll Extraction — Q4 Batch"
A completed run. Workflow context panel shows green (completed) nodes.

**Message 1 — User:**
`/rent-roll` (render `/rent-roll` in a `.wf-command-chip`) + file attachment indicators for: 245-Park-Ave-RentRoll.pdf, Marina-Heights-Q4.pdf, Berkshire-Units-Dec.pdf

**Message 2 — Cosimo:**
"Starting Rent Roll Extraction on 3 files. I'll extract unit-level data and standardize to your output schema."
Include artifact titled "Workflow Run — Rent Roll Extraction" showing: Template: Rent Roll Extraction, Input: 3 PDF files, Output: xlsx → /Finance/CRE/Processed/, Status: Running

**Message 3 — Cosimo:**
"Extracted 142 units across 3 properties. All fields mapped successfully. Two units at Marina Heights had ambiguous floor data — I inferred Floor 2 from unit numbers 201–208. Confidence: 94%."

**Message 4 — Cosimo:**
"Output ready: Q4-2025-RentRoll-Standardized.xlsx saved to /Finance/CRE/Processed/Rent Rolls/. Here's a preview:"
Include artifact titled "Q4-2025-RentRoll-Standardized.xlsx" with a small data table showing 4-5 sample rows (Unit, Floor, Tenant, Lease Start, Lease End, Monthly Rent, Sq Ft, Status). Use existing `.data-tbl` pattern.

**Message 5 — User:**
"Looks good, thanks"

---

### Thread B: `tener-batch-12` — "Tener — Valuation Filing Batch 12"
A run waiting at a gate. Workflow context panel shows amber (waiting) gate node.

**Message 1 — User:**
`/valuation` (command chip) + attachment indicator: "Batch-12-Parcels/ — 47 files"

**Message 2 — Cosimo:**
"Starting Valuation Filing workflow on Batch 12 — 47 property files. I'll extract parcel IDs, assessed values, and filing deadlines."
Include artifact: "Workflow Run — Valuation Filing" showing run metadata.

**Message 3 — Cosimo (gate message — use `.msg-gate` styling):**
"Processed 44 of 47 files successfully. 3 files need your attention:"
Include artifact with `.data-tbl` exception table:
| File | Issue | Suggestion | Confidence |
| Parcel-2847-Assessment.pdf | Conflicting assessed values (p.3: $4.2M, p.7: $4.8M) | Use page 7 (amended) | — |
| Parcel-3102-Notice.pdf | Poor OCR quality — 3 fields uncertain | Manual review needed | 67% |
| Parcel-4411-Filing.tiff | Unexpected format (TIFF scan, not PDF) | Convert and retry | — |

**Message 4 — Cosimo (gate message):**
"Specifically: Parcel-2847-Assessment.pdf has two conflicting assessed values on pages 3 and 7 ($4.2M vs $4.8M). Which should I use, or should I flag both in the output?"
Add "⏸ Awaiting Review" chip in message header.

**Message 5 — User:**
"Use the page 7 value, that's the amended assessment"

**Message 6 — Cosimo:**
"Got it — using $4.8M for Parcel 2847. Resuming processing on remaining exceptions..."

**Message 7 — Cosimo:**
"All 47 files processed. Output saved to /Tener/Filings/Batch-12/. 3 parcels were flagged for manual values — I've noted your corrections in the audit trail."

---

### Thread C: `wf-create-dd` — "New Workflow: Due Diligence"
A workflow creation conversation. No workflow context panel (this isn't a run).

**Message 1 — User:**
"I want to create a workflow for due diligence on new investments"

**Message 2 — Cosimo:**
"Great — let's set up a DD workflow. A few questions to get the shape right. What kind of documents will typically be involved? And is this for a specific asset class or general?"

**Message 3 — User:**
"Real estate acquisitions. We usually get a data room with financials, rent rolls, environmental reports, title docs, and zoning info. I want Cosimo to pull key metrics from each doc type and flag any red flags."

**Message 4 — Cosimo:**
"Here's what I'm thinking for the flow:"
Include artifact titled "Proposed Workflow — Due Diligence" containing a flow graph SVG rendered from the due-diligence template's node data. Use `Workflows.renderFlowGraph('due-diligence', containerId, { compact: false })`.

**Message 5 — User:**
"Add a step that cross-references the rent roll numbers against the financials to check for consistency"

**Message 6 — Cosimo:**
"Added a cross-reference validation step after the extraction branches merge. Here's the updated flow:"
Include updated artifact with the flow graph (same graph — the mock data already includes the cross-reference node).

**Message 7 — Cosimo:**
"What should trigger this? I'd suggest a chat command — you'd type `/due-diligence [company name]` to kick it off and point it at the target's data room."

**Message 8 — User:**
"Perfect. Let's call it /dd for short"

**Message 9 — Cosimo:**
"Done. Your DD workflow is set up with the command `/dd`. You can run it now or find it in the Workflows library."

---

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

## Workflow-Specific Design Guidelines

### Flow Graph Visual Language
- Nodes: **160px wide × 60px tall** in full view, **100px × 36px** in compact panel view
- Node corner radius: `var(--r-lg)` (6px)
- Edge lines: 1.5px stroke, `var(--taupe-3)` color, small arrowhead marker
- Branch paths offset horizontally: 200px between columns
- Vertical spacing: 100px between rows
- Gate node dashed border: `stroke-dasharray="6 3"`
- Node title: `var(--mono)`, 11px, font-weight 600
- Node description: `var(--sans)`, 10px, `var(--taupe-3)` color
- All colors via CSS custom properties — graph must work in both themes

### Node Color Scheme
| Type | Stroke | Fill |
|------|--------|------|
| Input | `var(--blue-3)` | `var(--blue-1)` |
| Action | `var(--violet-3)` | `var(--violet-1)` |
| Gate | `var(--amber)` (dashed) | `rgba(var(--amber-rgb), 0.08)` |
| Branch | `var(--taupe-3)` | `var(--off-white)` |
| Output | `var(--green)` | `rgba(var(--green-rgb), 0.08)` |

Dark mode: increase alpha on tinted fills (0.08 → 0.12).

### Run Status Colors (compact graph in workflow context panel)
| Status | Fill | Extra |
|--------|------|-------|
| completed | `var(--green)` | — |
| running | `var(--violet-3)` | pulse animation |
| waiting | `var(--amber)` | — |
| pending | `var(--taupe-1)` | 40% opacity |
| failed | `var(--red)` | — |
| skipped | `var(--taupe-1)` | strikethrough on title |

### Chat Workflow Styling
- Command chip (`.wf-command-chip`): mono font, `var(--violet-3)` background, white text, `var(--r-sm)` radius, padding 2px 8px
- Gate message (`.msg-gate`): 3px left border `var(--amber)`, background `rgba(var(--amber-rgb), 0.05)`
- Gate chip: "⏸ Awaiting Review", amber coloring, same size/style as `.model-badge`
- Autocomplete dropdown: max 5 visible items, 240px max-height, positioned above input

### Sidebar Enhancements
- Active runs section: tinted background `rgba(var(--violet-3-rgb), 0.04)`, border-bottom separator
- Workflow icon on threads: small `⚙` character, `var(--taupe-3)`, 10px
- `waiting` indicator: amber dot + "Waiting" text (add to `.thread-indicator` pattern)
- `running` indicator: violet dot + pulse
- Pulse animation: `@keyframes wf-pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`, 2s, infinite
- Gate by: `[data-a11y-motion="reduce"] .wf-pulse { animation: none; }`

---

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

### JS Namespace Modules in app.js
Functions are organized into namespace objects to reduce globals:

- **ColorUtils** — hexToHsl, hslToHex, hexToRgbString
- **A11y** (7 functions) — toggleTheme, applyPurpleIntensity, applyFontSizeBoost, toggleDyslexiaFont, toggleReducedMotion, toggleHighContrast, syncA11yToggles
- **UI** (15 functions) — switchMode, switchBrainSection, renderHeaderPanels, closeAllPanels, toggleTaskPanel, toggleCalendarPanel, toggleUsagePanel, toggleProfileMenu, buildMiniCalendar, handleNew, openCosimoPanel, closeCosimoPanel, handlePanelKey, sendPanelMessage, toggleDropdown
- **Chat** (30+ functions) — runGlobalSearch, closeSearch, disableInput, giveFeedback, selectThread, updateFilesButton, openFilePanel, closeFilePanel, switchFilePanelTab, buildSpreadsheet, exportThread, shareThread, fillSuggestion, retryK1, streamReply, typeTextBlock, streamSectionBlock, tokenizeHTML, runEraborSequence, markEraborDone, cancelErabor, eraborTimer, showEraborStopBtn, softScroll, isNearBottom, attachFromComputer, attachFromDrive, toggleModelDropdown, selectModel, openWorkflowPanel, closeWorkflowPanel
- **Workflows** (10+ functions) — renderLibrary, renderSidebar, showWorkflowDetail, showWorkflowListing, switchTab, renderFlowGraph, selectNode, openNodePopover, closeNodePopover
- **BrainMemory** (14 functions) — renderMemoryFromData, toggleAddMemory, cancelAddMemory, submitNewMemory, filterMemories, filterByCategory, toggleFactMenu, editFact, deleteFact, confirmDelete, cancelDelete, toggleTrait, removeTrait, addCustomTrait
- **BrainLessons** (11 functions) — renderLessonList, filterLessons, filterLessonScope, openLesson, closeLessonDetail, toggleLessonEdit, openCosimoForLesson, toggleLessonScope, deleteLesson, createNewLesson, toggleCardScope
- **Graph** (18 functions) — findEntity, buildGraph, makeEdge, makeNode, animateNode, applyRootState, applyClusterState, graphNavigate, openGraphEntity, closeGraphDetail, navigateToRelated, updateBreadcrumb, showGraphTooltip, hideGraphTooltip, startDriftLoop, editGraphEntity, openCosimoForEntity
- **Globals** — showToast, escapeHtml

---

## Critical Rules for Build Agents

### DO NOT
- Change the visual appearance of any EXISTING component
- Remove or rename any existing user-facing mock data content
- Break dark mode — every change must be tested in both themes
- Break accessibility modes (dyslexia, reduced motion, high contrast)
- Break the purple intensity slider functionality
- Introduce any build tools, frameworks, or npm dependencies
- Combine CSS files that are currently separate
- Change the file naming convention (kebab-case CSS, camelCase JS)
- Modify tokens.css unless explicitly told to (it's the design system source of truth)
- Change the 6-sphere logo layout or animation
- Break existing Chat threads (fund3, hilgard, q4lp, k1, erabor)
- Break the Brain section (Memory, Lessons, Graphs)

### DO
- Keep all changes incremental — one task at a time
- Verify the dev server still loads after each change
- Update progress.md after completing each task
- Preserve ALL section comment headers in JS and CSS
- Keep mock data clearly identifiable (use `MOCK_` prefix for data objects)
- Maintain the existing event delegation patterns
- Test both light and dark mode after CSS changes
- Test accessibility toggles still work after any changes
- Include dark mode overrides for all new CSS
- Include hover, active, focus-visible states for all new interactive elements
- Gate all animations with `[data-a11y-motion]`

## Integration Context
This codebase will be handed to a separate Claude Code instance that will:
1. Replace all mock/hardcoded data with real API calls
2. Wire event handlers to the existing Medici backend
3. Integrate into the existing build system (likely React/Next.js)

So: keep mock data clearly separated, use descriptive function names, and maintain clean boundaries between presentation and data.
