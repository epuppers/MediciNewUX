# Medici App — Component Audit & Cleanup Plan

**Date:** March 16, 2026
**Scope:** All files under `app/` (excluding Reference and Scripts)

---

## 1. Existing Component Inventory

### UI Primitives (`components/ui/` — 25 files)

| Component | Variants (CVA) | Complexity | Notes |
|-----------|----------------|------------|-------|
| `Alert` | variant: default, destructive | Low | Clean compound component |
| `AttachButton` | — | Low | Hardcoded labels |
| `Avatar` | size: default, sm, lg | Medium | Compound (Image, Fallback, Badge, Group) |
| `Badge` | 6 variants | Low | Uses `@base-ui` render prop |
| `Button` | 6 variants × 8 sizes | Low | Well-structured CVA usage |
| `Card` | size: default, sm | Medium | Compound (Header, Title, Description, Action, Content, Footer) |
| `Command` | — | High | Wraps `cmdk`; 9 sub-components |
| `Dialog` | — | Medium | Wraps `@base-ui`; 10 sub-components |
| `DropdownMenu` | item variant: default, destructive | Very High | 14 sub-components; heavy custom styling |
| `Input` | — | Very Low | Thin wrapper |
| `InputGroup` | align variants, button sizes | Medium | Flexible composition |
| `Label` | — | Very Low | Thin wrapper |
| `Popover` | — | Medium | 6 sub-components |
| `ScrollArea` | orientation: vertical, horizontal | Low | |
| `SendButton` | size: default, sm | Low | Hardcoded pixel values |
| `Separator` | orientation: horizontal, vertical | Very Low | |
| `Sheet` | side: top, right, bottom, left | High | Animated sliding panel |
| `Sidebar` | 21 sub-components | Very High | 721 lines; cookie persistence, keyboard shortcut, mobile detection |
| `Skeleton` | — | Very Low | |
| `Slider` | — | Low | Dynamic thumb count |
| `Switch` | size: sm, default | Low | |
| `Table` | — | Low | 8 sub-components, semantic HTML |
| `Tabs` | variant: default, line | Medium | Orientation support |
| `Textarea` | — | Very Low | |
| `Tooltip` | — | Medium | Positioning per side |

### Layout Components (`components/layout/` — 5 files)

| Component | What it does | Uses UI components? |
|-----------|-------------|---------------------|
| `AppSidebar` | Main navigation sidebar: logo, search, thread/workflow lists, brain nav | Yes — Sidebar, SidebarMenu, etc. |
| `AppHeader` | Top tab bar: mode tabs, task/calendar/usage popovers, profile menu | Yes — Popover, DropdownMenu, Switch |
| `CosimoPanel` | Right-side AI assistant chat panel | Yes — Sheet, Badge |
| `Logo` | 6-sphere inverted triangle SVG mark | No — uses CSS module |
| `SidebarResizeHandle` | Drag handle for sidebar width | No — minimal custom styling |

### Chat Components (`components/chat/` — 10 files)

| Component | What it does | Uses UI components? |
|-----------|-------------|---------------------|
| `Artifact` | Collapsible container for tables, flow graphs, text | Partially — some raw Tailwind |
| `ChatHeader` | Thread title + action buttons (Files, Export, Share) | Minimal |
| `ChatInput` | Rich input with file strip, autocomplete, model selector | Partially — InputGroup, AttachButton |
| `Citations` | Footnote list with hover tooltips | No — all raw HTML/CSS |
| `DataTable` | Simple HTML table for artifacts | No — raw `<table>` |
| `FilePanel` | Resizable file/spreadsheet viewer | No — builds tabs/content inline |
| `MessageBlock` | Message renderer (user/AI, attachments, artifacts, feedback) | Partially — Avatar, Badge |
| `MessageStream` | Multi-phase animated streaming response | No — all custom inline |
| `ThreadList` | Sidebar thread list (Active/Recent sections) | Yes — Sidebar components |
| `WorkflowPanel` | Right-side panel showing workflow run details | Partially — uses FlowGraph |

### Brain Components (`components/brain/` — 9 files)

| Component | What it does | Uses UI components? |
|-----------|-------------|---------------------|
| `EntityGraph` | SVG knowledge graph with zoom/pan, radial gradients, glow | No — all raw SVG/CSS |
| `EntityDetail` | Right-side detail panel for selected entity | No — raw HTML/Tailwind |
| `GraphBreadcrumb` | "You > Category > Entity" nav breadcrumb | No — raw buttons |
| `GraphTooltip` | SVG-to-screen coordinate tooltip | No — raw positioning |
| `LessonCard` | Card with scope badge, title, preview, workflow count | No — raw HTML, Lucide icons |
| `LessonDetail` | Full lesson view with editable sections, linked workflows | No — raw HTML, contentEditable |
| `MemoryFact` | Fact card with category badge, entity chips, delete modal | Partially — DropdownMenu only |
| `MemoryList` | Full memory page: role editor, traits, search, filter, fact list | No — raw HTML forms |
| `TraitBadges` | Selected traits, preset traits, custom input | No — raw input/buttons |

### Workflow Components (`components/workflows/` — 13 files)

| Component | What it does | Uses UI components? |
|-----------|-------------|---------------------|
| `FlowEdge` | SVG edge lines with labels | No — raw SVG |
| `FlowNode` | SVG node rectangles with status indicators | No — raw SVG/CSS |
| `FlowGraph` | SVG wrapper composing edges + nodes | No — just FlowEdge + FlowNode |
| `LessonsTab` | Lesson list within workflow detail | No — raw HTML |
| `NodePopover` | Popover for clicked flow node | Yes — Popover components |
| `OverviewTab` | Status/performance grid within workflow detail | No — raw HTML |
| `RunsTab` | Run history list within workflow detail | No — raw HTML |
| `SchemaTab` | Input/output schema display | No — raw HTML/badges |
| `TemplateDetail` | Main workflow detail orchestrator (graph + tabs) | Partially — DropdownMenu |
| `TriggersTab` | Trigger list within workflow detail | No — Lucide icons only |
| `WorkflowCard` | Library card with status, triggers, run count | No — Lucide icons only |
| `WorkflowList` | Sidebar workflow list with active runs | Yes — Sidebar components |
| `WorkflowStats` | Stats summary bar | No — raw HTML |

---

## 2. Elements That SHOULD Use Existing Components But Don't

These are places where we already have a UI component, but the code builds the same pattern from scratch with raw HTML and Tailwind.

### 2a. `Button` component exists but raw buttons are everywhere

**Existing component:** `Button` with 6 variants × 8 sizes — covers virtually any button need.

**Files using raw `<button>` or custom CSS button classes instead:**

| File | What it builds | Should use |
|------|---------------|------------|
| `_app.brain.tsx` | `<button className="header-btn bevel label-mono primary">` for section actions | `Button` variant="default" or a new "pixel" variant |
| `brain/entity-detail.tsx` | Close button with raw `<button>` + Lucide X icon | `Button` variant="ghost" size="icon" |
| `brain/graph-breadcrumb.tsx` | Breadcrumb nav buttons with raw `<button>` | `Button` variant="ghost" size="sm" |
| `brain/trait-badges.tsx` | "Add" button and trait toggle buttons, raw `<button>` | `Button` variant="outline" size="xs" |
| `brain/lesson-detail.tsx` | Back button, Edit toggle, Cosimo button, Delete — all raw `<button>` | `Button` with appropriate variants |
| `brain/memory-list.tsx` | "Add Memory" submit button, raw `<button>` | `Button` variant="default" size="sm" |
| `chat/chat-header.tsx` | Files, Export, Share action buttons | `Button` variant="ghost" size="sm" |
| `chat/file-panel.tsx` | Tab buttons built inline | `Button` variant="ghost" |
| `workflows/template-detail.tsx` | Run button with `▶` symbol, tab buttons | `Button` variant="default"; tabs should use `Tabs` |
| `workflows/workflow-card.tsx` | Run button `▶` | `Button` variant="ghost" size="icon-sm" |
| `routes/login.tsx` | SSO buttons built inline with custom classes | `Button` variant="outline" |

### 2b. `Badge` component exists but inline badges are common

**Existing component:** `Badge` with 6 variants.

**Files building badges from scratch:**

| File | What it builds | Should use |
|------|---------------|------------|
| `brain/lesson-card.tsx` | Scope badges ("Personal"/"Company") with raw `<span>` | `Badge` variant="secondary" or "outline" |
| `brain/lesson-detail.tsx` | Scope badge, usage stat badges | `Badge` |
| `brain/memory-fact.tsx` | Category badges with custom CSS classes | `Badge` with custom color prop |
| `workflows/workflow-card.tsx` | Status badges (active/draft/paused), trigger chips | `Badge` |
| `workflows/workflow-list.tsx` | `StatusBadge` helper built inline | `Badge` with variant mapping |
| `workflows/schema-tab.tsx` | Type badges, "required" badge, format chips | `Badge` variant="outline" |
| `workflows/triggers-tab.tsx` | "primary" badge | `Badge` |
| `workflows/runs-tab.tsx` | Status dots (success/failed) | `Badge` or a new `StatusDot` |
| `routes/_app.brain.lessons.tsx` | Scope filter pills | `Badge` as toggle buttons |

### 2c. `Card` component exists but cards are built inline

**Existing component:** `Card` with Header, Title, Description, Content, Footer.

**Files building card-like containers from scratch:**

| File | What it builds |
|------|---------------|
| `brain/lesson-card.tsx` | Full card layout with custom classes |
| `brain/memory-fact.tsx` | Fact card with header, content, footer |
| `workflows/workflow-card.tsx` | Workflow card with header, body, footer |
| `workflows/runs-tab.tsx` | Run row items (card-like clickable rows) |
| `chat/message-block.tsx` | Message containers (card-like blocks) |

### 2d. `Tabs` component exists but tabs are rebuilt inline

**Existing component:** `Tabs` with TabsList, TabsTrigger, TabsContent, line variant.

**Files building custom tab bars:**

| File | What it builds |
|------|---------------|
| `workflows/template-detail.tsx` | 5-tab bar (Overview, Schema, Triggers, Runs, Lessons) — entirely custom |
| `chat/file-panel.tsx` | 2-tab bar (Spreadsheet, Folder) — entirely custom |
| `layout/app-header.tsx` | Mode tabs (Chat, Workflows) — custom tab-like buttons |

### 2e. `Table` component exists but raw `<table>` is used

**Existing component:** `Table` with all semantic sub-components.

| File | What it builds |
|------|---------------|
| `chat/data-table.tsx` | Renders artifact tables using raw `<table>`, `<thead>`, `<tr>`, `<td>` |

### 2f. `Input` / `InputGroup` exist but raw inputs are used

| File | What it builds |
|------|---------------|
| `brain/memory-list.tsx` | Search input with icon — raw `<input>` |
| `brain/trait-badges.tsx` | Custom trait text input — raw `<input>` |
| `routes/_app.brain.lessons.tsx` | Search input with icon — raw `<input>` |
| `brain/memory-list.tsx` | Category `<select>` dropdown — raw HTML select |

### 2g. `Dialog` component exists but confirmation modals are inline

| File | What it builds |
|------|---------------|
| `brain/memory-fact.tsx` | Delete confirmation modal built with raw `<div>` overlay |

---

## 3. Patterns That Need New Components

These are recurring UI patterns across the codebase that have no corresponding component and should be extracted.

### 3a. `EmptyState` — used in 6+ places

A consistent empty state with icon, title, and description/action.

**Current instances (all built inline, all slightly different):**
- `_app.chat.tsx` — empty thread state with `◆` icon + suggestion chips
- `_app.brain.lessons.tsx` — "No lessons found" with Search icon
- `brain/memory-list.tsx` — "No memories found" with icon + text
- `workflows/runs-tab.tsx` — "No runs yet" message
- `workflows/lessons-tab.tsx` — "No linked lessons" + button
- `_app.workflows.tsx` — "No workflows" empty state

**Proposed API:**
```tsx
<EmptyState
  icon={<Search />}
  title="No lessons found"
  description="Try adjusting your search"
  action={<Button>Create Lesson</Button>}
/>
```

### 3b. `PageHeader` / `SectionHeader` — used in 5+ places

A header with title, optional back button, and action buttons. Currently every page builds its own.

**Current instances:**
- `_app.brain.tsx` — section title + action button
- `brain/lesson-detail.tsx` — back arrow + title + edit/cosimo/delete buttons
- `workflows/template-detail.tsx` — back button + title + badges + action dropdown + Run button
- `chat/chat-header.tsx` — thread title + Files/Export/Share buttons
- `chat/file-panel.tsx` — panel title + close button

**Proposed API:**
```tsx
<PageHeader
  backTo="/brain/lessons"
  title="Lesson Name"
  badges={[<Badge>Personal</Badge>]}
  actions={<Button size="icon-sm"><Pencil /></Button>}
/>
```

### 3c. `SearchFilterBar` — used in 3+ places

A search input with optional category/scope filter pills.

**Current instances (all built from raw HTML):**
- `_app.brain.lessons.tsx` — search input + scope pills (All / Personal / Company)
- `brain/memory-list.tsx` — search input + category pills (Preference / Workflow / Contact / etc.)
- `_app.workflows.tsx` — could benefit from search + status filter

**Proposed API:**
```tsx
<SearchFilterBar
  placeholder="Search memories..."
  filters={[{ key: "category", options: CATEGORIES, value, onChange }]}
  onSearch={setQuery}
/>
```

### 3d. `StatusDot` / `StatusIndicator` — used in 6+ places

A colored dot indicating status (running, success, failed, active, draft, paused).

**Current instances:**
- `workflows/runs-tab.tsx` — dot class "success" or "failed"
- `workflows/workflow-card.tsx` — run status dot (green/red/muted)
- `workflows/workflow-list.tsx` — pulsing dot for running, colored for waiting
- `workflows/overview-tab.tsx` — last result status dot
- `chat/thread-list.tsx` — active thread status badges

**Proposed API:**
```tsx
<StatusDot status="running" pulse />
<StatusDot status="success" />
<StatusDot status="failed" />
```

### 3e. `ErrorBoundaryContent` — identical in 8 routes

Every route with async loading has the same error boundary structure: `Alert` with `AlertCircle` icon, title, message, optional reload `Button`.

**Current instances (copy-pasted in each):**
- `_app.brain.graph.tsx`
- `_app.brain.lessons.tsx`
- `_app.brain.lessons.$id.tsx`
- `_app.brain.memory.tsx`
- `_app.chat.$threadId.tsx`
- `_app.workflows.tsx`
- `_app.workflows.$id.tsx`
- `_app.tsx`

**Proposed API:**
```tsx
<ErrorBoundaryContent
  error={error}
  notFoundMessage="Lesson not found"
  genericMessage="Failed to load lessons"
/>
```

### 3f. `LoadingSkeleton` factory — 7+ unique but similar patterns

Every `HydrateFallback` builds a placeholder layout from `Skeleton` primitives. The shapes differ by page but the pattern is identical.

**Proposed:** Create skeleton presets per feature area:
```tsx
<PageSkeleton variant="detail" />   // back button + title + content area
<PageSkeleton variant="list" />     // search bar + card grid
<PageSkeleton variant="graph" />    // full-bleed canvas area
```

### 3g. `ConfirmDialog` — needed in multiple places, only exists raw in one

Currently `memory-fact.tsx` builds a delete confirmation modal from a raw `<div>` overlay. This pattern will be needed everywhere delete/destructive actions exist.

**Proposed API:**
```tsx
<ConfirmDialog
  open={showConfirm}
  title="Delete memory?"
  description="This action cannot be undone."
  confirmLabel="Delete"
  variant="destructive"
  onConfirm={handleDelete}
  onCancel={() => setShowConfirm(false)}
/>
```

### 3h. `IconLabel` / `MetaRow` — small but very frequent

A pattern of icon + text on a single line, used for metadata, stats, and details. Currently built inline with inconsistent spacing/sizing every time.

**Current instances:** lesson cards (workflow count, date, author), run rows (trigger, time, duration), overview tab (KV rows), schema fields, entity detail facts.

### 3i. `TriggerChip` — repeated in 4 workflow files

The same trigger-type-to-icon-and-label mapping is duplicated:

- `workflows/workflow-card.tsx`
- `workflows/workflow-list.tsx`
- `workflows/triggers-tab.tsx`
- `workflows/template-detail.tsx`

Each file independently maps trigger types (`folder-watch`, `manual`, `schedule`, `email`, `api`, `chain`) to Lucide icons and labels.

**Proposed:** Single `TriggerChip` component + shared `TRIGGER_CONFIG` constant.

### 3j. `ScopeBadge` — repeated for "Personal" / "Company"

The same scope display logic appears in `lesson-card.tsx`, `lesson-detail.tsx`, `lessons-tab.tsx`, and `_app.brain.lessons.tsx`.

---

## 4. Other Cleanup Issues

### 4a. Hardcoded color values scattered across files

The app has a CSS variable system (`--taupe-0` through `--taupe-5`, `--violet-3`, `--berry-3`, etc.) but several components use hardcoded hex colors:

- `entity-graph.tsx` — `CATEGORY_RGB` with hex values like `#9b6bc2`, `#c278c4`, `#7bb8d9`
- `dropdown-menu.tsx` — `rgba(0,0,0,0.15)` shadow, hardcoded CSS variable references in Tailwind
- `login.tsx` — Google/Microsoft/Atlassian brand colors inline in SVG

**Recommendation:** Extract `CATEGORY_RGB` to a shared config and keep brand colors in a `brand-colors.ts` constant file.

### 4b. Magic string IDs in route logic

- `_app.chat.$threadId.tsx` checks `thread.id === 'erabor'` and `'q4lp'` to conditionally render special animated components
- These should be feature flags or configuration, not hardcoded strings

### 4c. Hardcoded user/company data

Multiple files reference "Eliot Puplett", "e.puplett@medici.com", "Medici & Company" inline. This is presumably demo/mock data, but it should be sourced from a single config or mock data file, not sprinkled across components.

### 4d. Inconsistent CSS strategy

The codebase uses three different styling approaches:
1. **Tailwind utility classes** (most UI components)
2. **Custom CSS classes** from `app.css` — `mem-*`, `wf-*`, `flow-*`, `brain-*`, `chat-*`, `header-btn bevel`, etc.
3. **CSS modules** (`login.module.css` for the login page, `logo` component)

The custom CSS classes in `app.css` essentially duplicate what could be achieved with Tailwind `@apply` or component-level styles. A cleanup should decide on one primary strategy.

### 4e. `contentEditable` divs used as form inputs

- `brain/lesson-detail.tsx` — content editing via `contentEditable`
- `brain/memory-list.tsx` — role description via `contentEditable`

These should either use a proper rich-text component or controlled `Textarea` for accessibility and form integration.

### 4f. Inline SVG icons in login.tsx

`GoogleIcon`, `MicrosoftIcon`, and `AtlassianIcon` are defined as inline components within the login route file. They should be extracted to `lib/icons.ts` or a dedicated `icons/` directory.

---

## 5. Priority Cleanup Roadmap

### Phase 1 — Quick wins (low risk, high consistency impact)

1. **Extract `ErrorBoundaryContent`** — deduplicate 8 identical error boundaries
2. **Extract `EmptyState`** — deduplicate 6+ empty states
3. **Replace raw `<button>` with `Button`** across brain and workflow components
4. **Replace raw badges with `Badge`** across all feature areas
5. **Extract `TriggerChip`** + shared config — deduplicate 4 files
6. **Extract `ScopeBadge`** — deduplicate 4 files
7. **Move inline SVG icons** from `login.tsx` to `lib/icons.ts`

### Phase 2 — Structural improvements (medium effort)

8. **Extract `PageHeader`** — unify 5+ header patterns
9. **Extract `SearchFilterBar`** — unify 3 search/filter patterns
10. **Extract `StatusDot`** — unify 6+ status indicators
11. **Replace raw tabs with `Tabs`** in `template-detail.tsx` and `file-panel.tsx`
12. **Replace raw `<table>` with `Table`** in `data-table.tsx`
13. **Replace raw `<input>` with `Input`/`InputGroup`** in brain components
14. **Extract `ConfirmDialog`** wrapping `Dialog` for destructive confirmations
15. **Adopt `Card` component** in `lesson-card`, `memory-fact`, `workflow-card`

### Phase 3 — Architecture decisions (higher effort, discuss first)

16. **Resolve CSS strategy** — decide between Tailwind-only vs. keeping custom class system
17. **Replace `contentEditable` divs** with proper input components
18. **Extract `LoadingSkeleton` presets** per feature area
19. **Move hardcoded data** (categories, scopes, trigger types, suggestions) to shared constants
20. **Eliminate magic IDs** (`'erabor'`, `'q4lp'`) — use config or feature flags

---

## 6. Component Usage Heatmap

How often each existing UI component is actually imported across feature code:

| Component | Used in | Underused? |
|-----------|---------|------------|
| `Sidebar` (+ sub-components) | app-sidebar, thread-list, workflow-list | No — well adopted |
| `DropdownMenu` | app-header, memory-fact, template-detail | Moderate — could replace more inline menus |
| `Popover` | app-header, node-popover | Moderate |
| `Sheet` | cosimo-panel | Low — only 1 usage |
| `Dialog` | command only | **Very underused** — delete modals use raw divs |
| `Button` | _app.tsx error boundary, some routes | **Very underused** — most buttons are raw HTML |
| `Badge` | cosimo-panel, message-block | **Very underused** — most badges are raw spans |
| `Card` | — | **Not used at all** in feature components |
| `Tabs` | — | **Not used at all** in feature components |
| `Table` | — | **Not used at all** — data-table uses raw HTML |
| `Input` | — | **Not used at all** in feature components |
| `Alert` | error boundaries only | Appropriate usage |
| `Skeleton` | route fallbacks | Appropriate usage |
| `Avatar` | message-block, app-header | Appropriate usage |
| `Switch` | app-header settings | Appropriate usage |
| `Tooltip` | sidebar menu buttons | Moderate |
| `ScrollArea` | — | **Not used** in feature code |
| `Slider` | app-header (font size) | Single usage, appropriate |

---

*This audit covers all 60 components, 12 routes, and root files. The Reference and Scripts folders were excluded per request.*
