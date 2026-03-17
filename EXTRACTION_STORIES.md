# Medici App — Leaf-First Componentization Stories

**Purpose:** Ordered task list for Phase 3–4 cleanup. Each story is one atomic extraction. Work top to bottom. Each step: extract → find all instances → replace → verify render is identical → commit.

---

## Tier 1: Shared Constants (no UI changes, zero risk)

These aren't components — they're duplicated data/config that should be extracted first so the component extractions can reference them.

### Story 1.1 — Extract `TRIGGER_CONFIG` constant
**What:** The mapping of trigger type → icon component + label is duplicated in 4 files with slight variations (different icon components, emoji vs Lucide, different labels for the same types).
**Where duplicated:**
- `workflows/workflow-card.tsx` → `TRIGGER_META` (Lucide icons, `size-3`)
- `workflows/workflow-list.tsx` → `TRIGGER_ICONS` (Lucide icon components)
- `workflows/triggers-tab.tsx` → `triggerIcon()` + `triggerLabel()` functions (Lucide icons, `size-3.5`)
- `workflows/template-detail.tsx` → `triggerIcon()` + `triggerLabel()` functions (emoji strings)
**Extract to:** `lib/workflow-constants.ts`
**Shape:**
```ts
export const TRIGGER_CONFIG: Record<TriggerType, { icon: React.ElementType; label: string }> = {
  'folder-watch': { icon: FolderOpen, label: 'Folder Watch' },
  manual: { icon: Hand, label: 'Manual' },
  schedule: { icon: Clock, label: 'Schedule' },
  email: { icon: Mail, label: 'Email' },
  'chat-command': { icon: MessageSquare, label: 'Chat Command' },
  chained: { icon: Link, label: 'Chained' },
};
```
**Replace:** All 4 files import from the shared constant. Remove all local trigger mappings.

### Story 1.2 — Extract `CATEGORY_COLORS` constant
**What:** Category-to-color mappings are duplicated across brain components.
**Where duplicated:**
- `brain/entity-graph.tsx` → `CATEGORY_RGB` (hex values for SVG), `CATEGORY_COLORS` (CSS vars)
- `brain/entity-detail.tsx` → `CATEGORY_CSS_COLORS` (CSS vars), `CATEGORY_LABELS` (display names)
- `brain/memory-fact.tsx` → `CAT_CLASS` (CSS class names)
**Extract to:** `lib/brain-constants.ts`
**Shape:** One canonical `CATEGORY_CONFIG` with `{ color, rgb, label, cssClass }` per category.

### Story 1.3 — Extract `SCOPE_CONFIG` constant
**What:** Scope display logic (`'user'` → `'Personal'`, `'company'` → `'Company'`, plus CSS class selection) duplicated in 4 files.
**Where duplicated:**
- `brain/lesson-card.tsx` → inline ternary
- `brain/lesson-detail.tsx` → inline ternary
- `workflows/lessons-tab.tsx` → `lesson-scope-${lesson.scope}` class
- `routes/_app.brain.lessons.tsx` → `LESSON_SCOPES` array
**Extract to:** `lib/brain-constants.ts`

### Story 1.4 — Extract `MEMORY_CATEGORIES` constant
**What:** The category list `['preference', 'workflow', 'contact', 'fund', 'style', 'context']` with labels.
**Where duplicated:**
- `brain/memory-list.tsx` → `CATEGORIES` array
- `brain/memory-list.tsx` → `<select>` options (same list, inline)
- `brain/memory-fact.tsx` → `CAT_CLASS` keys
**Extract to:** `lib/brain-constants.ts`

---

## Tier 2: Leaf UI Components (smallest, zero dependencies on other custom components)

### Story 2.1 — Extract `StatusDot` component
**What:** A small colored dot indicating status. Appears as `<span className="wf-run-dot green" />`, `<div className="run-status-dot success" />`, etc. Tiny, self-contained, no dependencies.
**Props:** `status: 'success' | 'failed' | 'running' | 'waiting' | 'muted'`, `pulse?: boolean`, `size?: 'sm' | 'md'`
**Where used (6 instances):**
- `workflows/runs-tab.tsx` line 72 — `<div className="run-status-dot success/failed">`
- `workflows/overview-tab.tsx` line 91 — same pattern in recent activity section
- `workflows/workflow-card.tsx` line 115 — `<span className="wf-run-dot green/red/muted">`
- `workflows/workflow-list.tsx` line 73–74 — inline badge with `animate-[wf-pulse]`
- `chat/thread-list.tsx` line 29–43 — `ThreadIndicatorBadge` (status-colored inline badge with pulse)
**Extract to:** `components/ui/status-dot.tsx`
**Constraint:** Rendered output must be visually identical. Preserve existing CSS classes or translate to Tailwind equivalents.

### Story 2.2 — Extract `ScopeBadge` component
**What:** Displays "Personal" or "Company" with scope-specific styling. Always uses `brain-scope-badge` + `scope-user`/`scope-company` CSS classes.
**Props:** `scope: 'user' | 'company'`
**Where used (4 instances):**
- `brain/lesson-card.tsx` lines 40–46
- `brain/lesson-detail.tsx` lines 160–167
- `workflows/lessons-tab.tsx` line 61 — `lesson-tab-card-scope lesson-scope-${lesson.scope}`
- `routes/_app.brain.lessons.tsx` lines 86–99 — filter pills (different use — toggle buttons, not display)
**Extract to:** `components/ui/scope-badge.tsx` (uses `Badge` internally or standalone)
**Note:** The filter pills in `_app.brain.lessons.tsx` are interactive toggles, not display badges. Those get handled by `FilterPill` (Story 2.4). Only extract the display badge here.

### Story 2.3 — Extract `TriggerChip` component
**What:** Displays a trigger type with its icon and label. Now references `TRIGGER_CONFIG` from Story 1.1.
**Props:** `type: TriggerType`, `size?: 'sm' | 'md'`
**Where used (4 instances):**
- `workflows/workflow-card.tsx` line 89–91 — `<span className="wf-card-trigger-chip">{icon} {label}</span>`
- `workflows/workflow-list.tsx` line 126 — `<TriggerIcon className="size-3" />`
- `workflows/triggers-tab.tsx` lines 111–112 — trigger item with icon
- `workflows/template-detail.tsx` line 171–172 — `triggerIcon() triggerLabel()`
**Extract to:** `components/workflows/trigger-chip.tsx`

### Story 2.4 — Extract `FilterPill` component
**What:** A toggleable pill/chip button used in filter bars. Has `active` state styling via `mem-cat-pill active` CSS class.
**Props:** `label: string`, `isActive: boolean`, `onClick: () => void`
**Where used (3 instances):**
- `brain/memory-list.tsx` lines 117–129 — category filter pills
- `routes/_app.brain.lessons.tsx` lines 86–99 — scope filter pills
- Could be used in workflow library for status filters
**Extract to:** `components/ui/filter-pill.tsx`

### Story 2.5 — Extract `EmptyState` component
**What:** Centered placeholder shown when a list/view has no content. Always: icon + title + optional description + optional action.
**Props:** `icon: ReactNode`, `title: string`, `description?: string`, `action?: ReactNode`
**Where used (6 instances):**
- `routes/_app.chat.tsx` lines 41–58 — `empty-thread` with `◆` icon, title, subtitle, suggestion chips
- `routes/_app.brain.lessons.tsx` lines 105–113 — `mem-no-results` with Search icon
- `brain/memory-list.tsx` lines 188–195 — `mem-no-results` with Search icon (near-identical to above)
- `workflows/runs-tab.tsx` lines 29–34 — `runs-empty` with text only
- `workflows/lessons-tab.tsx` lines 42–48 — `lessons-tab-empty` with text + button
- `routes/_app.workflows.tsx` lines 80–83 — Workflow icon + text
**Extract to:** `components/ui/empty-state.tsx`

### Story 2.6 — Extract `ErrorBoundaryContent` component
**What:** The error boundary UI used in every route's `ErrorBoundary()` export. Identical structure: centered flex container → `Alert variant="destructive"` → `AlertCircle` icon → `AlertTitle` → `AlertDescription` → `Button variant="outline"` that calls `window.location.reload()`.
**Props:** `message?: string` (the description text varies per route)
**Where used (7+ instances — exact same JSX copy-pasted):**
- `routes/_app.brain.memory.tsx` ErrorBoundary
- `routes/_app.brain.lessons.tsx` ErrorBoundary
- `routes/_app.brain.lessons.$id.tsx` ErrorBoundary
- `routes/_app.brain.graph.tsx` ErrorBoundary
- `routes/_app.chat.$threadId.tsx` ErrorBoundary
- `routes/_app.workflows.tsx` ErrorBoundary
- `routes/_app.workflows.$id.tsx` ErrorBoundary
**Extract to:** `components/ui/error-boundary-content.tsx`
**Each route's ErrorBoundary becomes:**
```tsx
export function ErrorBoundary() {
  return <ErrorBoundaryContent message="Failed to load memory data." />;
}
```

### Story 2.7 — Extract `KVRow` component
**What:** A key-value display row used in detail sections. Always: `<div className="kv-row"><span className="kv-key">Label</span><span className="kv-val">Value</span></div>`.
**Props:** `label: string`, `value: ReactNode`, `valueClassName?: string`
**Where used (10+ instances):**
- `workflows/overview-tab.tsx` — 8 KV rows across Status and Performance sections
- `chat/artifact.tsx` — metadata artifact entries (line 71–76, same pattern with different class)
**Extract to:** `components/ui/kv-row.tsx`

### Story 2.8 — Extract `SectionPanel` component
**What:** The `detail-section bevel` container with `detail-section-bar` (art-stripe + title + art-stripe) header. Used for styled content sections.
**Props:** `title: string`, `children: ReactNode`, `className?: string`
**Where used (5+ instances):**
- `workflows/overview-tab.tsx` — 3 sections (Status, Performance, Recent Activity)
- `workflows/schema-tab.tsx` — 2 sections (Input Schema, Output Schema)
- `workflows/workflow-stats.tsx` — 1 section (Overview)
**Extract to:** `components/ui/section-panel.tsx`

### Story 2.9 — Move SSO brand icons to `lib/icons.ts`
**What:** `GoogleIcon`, `MicrosoftIcon`, `AtlassianIcon` are defined inline in `routes/login.tsx`. Move to shared location.
**From:** `routes/login.tsx` lines 44–90
**To:** `lib/icons.ts` (or `lib/brand-icons.tsx`)
**Update:** `login.tsx` imports from the new location.

---

## Tier 3: Adopt Existing UI Components (replace raw HTML with existing components)

These stories don't create new components — they replace inline HTML with the UI primitives you already have.

### Story 3.1 — Replace `header-btn bevel` buttons with `Button`
**What:** The `header-btn bevel label-mono` CSS class pattern is used for action buttons across the app. Replace each with the existing `Button` component, mapping to appropriate variant/size.
**Files to update (one at a time, in this order):**
1. `chat/chat-header.tsx` — 3 buttons (Files, Export, Share) → `Button variant="ghost" size="icon-sm"`
2. `brain/entity-detail.tsx` — Close button → `Button variant="ghost" size="icon"`
3. `brain/lesson-detail.tsx` — Edit, Cosimo, Delete buttons → `Button` with variants
4. `routes/_app.brain.tsx` — "+ Add Memory" / "+ New Lesson" → `Button variant="default" size="sm"`
5. `brain/memory-list.tsx` — Cancel/Save in add form → `Button variant="ghost"` / `Button variant="default"`
6. `workflows/template-detail.tsx` — Run button, back button → `Button`

**Important:** You may need to add a new `Button` variant (e.g., `"bevel"`) that preserves the existing visual style if you want pixel-identical rendering during transition. Alternatively, just pass className overrides.

### Story 3.2 — Replace raw `<input type="search">` with `Input` + icon pattern
**What:** Search inputs with a positioned Search icon are built from raw `<input>` + absolutely positioned Lucide icon. Replace with `Input` component (and optionally `InputGroup` if it supports icons).
**Files to update:**
1. `brain/memory-list.tsx` — search input (lines 104–112)
2. `routes/_app.brain.lessons.tsx` — search input (lines 73–81)

### Story 3.3 — Replace inline delete modal with `Dialog`-based `ConfirmDialog`
**What:** `brain/memory-fact.tsx` lines 135–153 build a delete confirmation from a raw `<div className="mem-delete-confirm">`. Replace with a proper dialog.
**Create:** `components/ui/confirm-dialog.tsx` wrapping `Dialog`
**Props:** `open`, `title`, `description`, `confirmLabel`, `variant`, `onConfirm`, `onCancel`
**Update:** `memory-fact.tsx` uses `ConfirmDialog` instead of the inline overlay.

### Story 3.4 — Replace inline tab bars with `Tabs`
**What:** Custom tab bars using raw `<button>` with `tab-btn active` classes. Replace with the existing `Tabs` component.
**Files to update:**
1. `workflows/template-detail.tsx` — 5-tab bar (lines 243–253)
2. `chat/file-panel.tsx` — 2-tab bar (lines 66–78)

### Story 3.5 — Replace raw `<table>` in `DataTable` with `Table` components
**What:** `chat/data-table.tsx` uses raw `<table>`, `<thead>`, `<tr>`, `<td>`. Replace with the existing `Table`, `TableHeader`, `TableRow`, `TableCell` components.
**File:** `chat/data-table.tsx`

---

## Tier 4: Composite Components (built from Tier 2 leaves + existing UI)

Only start these after Tiers 1–3 are done.

### Story 4.1 — Extract `SearchFilterBar` component
**What:** Combines `Input` (with search icon) + a row of `FilterPill` buttons. Built from `Input` (Story 3.2) + `FilterPill` (Story 2.4).
**Props:** `placeholder`, `value`, `onChange`, `filters: { options: {id, label}[], value, onChange }[]`
**Where used:**
- `brain/memory-list.tsx` (search + category pills)
- `routes/_app.brain.lessons.tsx` (search + scope pills)
**Extract to:** `components/ui/search-filter-bar.tsx`

### Story 4.2 — Extract `PageHeader` component
**What:** A consistent page/section header with optional back button, title, badges, and action buttons slot.
**Props:** `title`, `onBack?`, `badges?: ReactNode`, `actions?: ReactNode`
**Where used:**
- `routes/_app.brain.tsx` — section header
- `brain/lesson-detail.tsx` — detail header
- `workflows/template-detail.tsx` — detail header
- `chat/chat-header.tsx` — thread header
**Extract to:** `components/ui/page-header.tsx`
**Note:** This is higher risk because each header has distinct visual treatments. Start by extracting just the shared structural wrapper; keep the per-page action buttons as `children`/`actions` slot.

### Story 4.3 — Extract `RunRow` component
**What:** The repeating run history row: status dot + run ID + trigger + time + duration.
**Props:** `run: RecentRun`, `onClick?`
**Where used:**
- `workflows/runs-tab.tsx` — run rows (lines 58–78)
- `workflows/overview-tab.tsx` — recent activity rows (lines 87–98)
**Extract to:** `components/workflows/run-row.tsx`
**Uses:** `StatusDot` (Story 2.1)

---

## Execution Order Summary

Do these in sequence, one commit each:

```
TIER 1: Constants (4 stories — zero UI risk)
  1.1  TRIGGER_CONFIG
  1.2  CATEGORY_COLORS
  1.3  SCOPE_CONFIG
  1.4  MEMORY_CATEGORIES

TIER 2: Leaf components (9 stories — small, self-contained)
  2.1  StatusDot
  2.2  ScopeBadge
  2.3  TriggerChip
  2.4  FilterPill
  2.5  EmptyState
  2.6  ErrorBoundaryContent
  2.7  KVRow
  2.8  SectionPanel
  2.9  Brand icons → lib/icons

TIER 3: Adopt existing UI components (5 stories — replace raw HTML)
  3.1  header-btn → Button (do per-file, 6 sub-steps)
  3.2  raw <input> → Input
  3.3  raw delete modal → ConfirmDialog (new, wraps Dialog)
  3.4  raw tab bars → Tabs
  3.5  raw <table> → Table

TIER 4: Composites (3 stories — built from clean leaves)
  4.1  SearchFilterBar
  4.2  PageHeader
  4.3  RunRow
```

**Total: 21 stories, ~30 commits** (Story 3.1 has 6 sub-steps).

Each story is scoped so the agent holds exactly one extraction in context. The constraint on every single one: **rendered output must not change.**
