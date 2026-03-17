# Medici App — Claude Code Extraction Prompts

Execute these prompts one at a time in order. After each one, review the diff, verify the app renders identically, and commit before moving to the next.

**Critical global rules for every prompt:**
- Do NOT touch anything in the `Reference/` or `Scripts/` folders.
- The rendered output must not change visually.
- Preserve all existing CSS classes — do not remove or rename them.
- Do not rename any existing files.
- Do not modify `app/services/types.ts` unless explicitly told to.

---

## TIER 1: Shared Constants

---

### Prompt 1.1 — Extract TRIGGER_CONFIG

```
Create a new file `app/lib/workflow-constants.ts`.

In it, export a single constant `TRIGGER_CONFIG` that maps TriggerType (imported from `~/services/types`) to `{ icon: React.ElementType; label: string }`.

The canonical mapping is:
  'folder-watch' → { icon: FolderOpen, label: 'Folder Watch' }
  'manual'       → { icon: Hand, label: 'Manual' }
  'schedule'     → { icon: Clock, label: 'Schedule' }
  'email'        → { icon: Mail, label: 'Email' }
  'chat-command' → { icon: MessageSquare, label: 'Chat Command' }
  'chained'      → { icon: Link, label: 'Chained' }

Import icons from 'lucide-react'. Import React as needed for the type.

Then update these 4 files to use it, removing their local duplicates:

1. `app/components/workflows/workflow-card.tsx` — delete the `TRIGGER_META` constant (lines 17-24). Import `TRIGGER_CONFIG` instead. Where it currently reads `const trigger = TRIGGER_META[template.triggerType]`, change to get icon and label from TRIGGER_CONFIG. Render the icon as `<Icon className="size-3" />` where `Icon = TRIGGER_CONFIG[template.triggerType].icon`.

2. `app/components/workflows/workflow-list.tsx` — delete the `TRIGGER_ICONS` constant (lines 25-32). Import `TRIGGER_CONFIG`. Where it currently does `const TriggerIcon = TRIGGER_ICONS[template.triggerType] ?? Hand`, change to `const TriggerIcon = TRIGGER_CONFIG[template.triggerType]?.icon ?? Hand`.

3. `app/components/workflows/triggers-tab.tsx` — delete the local `triggerIcon()` function (lines 20-29) and `triggerLabel()` function (lines 33-42). Import `TRIGGER_CONFIG`. Replace `triggerIcon(trigger.type)` with `(() => { const Icon = TRIGGER_CONFIG[trigger.type]?.icon; return Icon ? <Icon className="size-3.5" /> : null; })()` and `triggerLabel(trigger.type)` with `TRIGGER_CONFIG[trigger.type]?.label ?? trigger.type`.

4. `app/components/workflows/template-detail.tsx` — delete the local `triggerIcon()` function (lines 42-52) and `triggerLabel()` function (lines 55-65). Import `TRIGGER_CONFIG`. Replace `triggerIcon(template.triggerType)` call on line 172 with rendering the icon component from TRIGGER_CONFIG: `(() => { const Icon = TRIGGER_CONFIG[template.triggerType]?.icon; return Icon ? <Icon className="size-3.5" /> : null; })()`. Replace `triggerLabel(template.triggerType)` with `TRIGGER_CONFIG[template.triggerType]?.label ?? template.triggerType`.

The rendered output must not change. All trigger chips, icons, and labels must look identical.
```

---

### Prompt 1.2 — Extract CATEGORY_COLORS and CATEGORY_LABELS

```
In the existing file `app/lib/workflow-constants.ts` (or create `app/lib/brain-constants.ts` — your choice, I suggest brain-constants.ts since these are brain-specific), export:

1. `GRAPH_CATEGORY_COLORS`: a Record<string, string> mapping category IDs to CSS variable colors:
   funds → 'var(--violet-3)'
   contacts → 'var(--berry-3)'
   documents → 'var(--blue-3)'
   workflows → 'var(--green)'
   systems → 'var(--amber)'
   entities → 'var(--taupe-3)'

2. `GRAPH_CATEGORY_LABELS`: a Record<string, string> mapping category IDs to display labels:
   funds → 'Fund'
   contacts → 'Contact'
   documents → 'Document'
   workflows → 'Workflow'
   systems → 'System'
   entities → 'Entity'

Then update these 2 files:

1. `app/components/brain/entity-graph.tsx` — delete the `CATEGORY_COLORS` constant (lines 32-39). Import `GRAPH_CATEGORY_COLORS` and alias it as `CATEGORY_COLORS` if you prefer minimal diff, or update usages on line 269. Keep `CATEGORY_RGB` in this file — that one has hex values for SVG gradients and can't use CSS vars.

2. `app/components/brain/entity-detail.tsx` — delete `CATEGORY_CSS_COLORS` (lines 18-25) and `CATEGORY_LABELS` (lines 28-35). Import `GRAPH_CATEGORY_COLORS` and `GRAPH_CATEGORY_LABELS`. Replace `CATEGORY_CSS_COLORS[entityCategory]` with `GRAPH_CATEGORY_COLORS[entityCategory]` on line 45. Replace `CATEGORY_LABELS[entityCategory]` with `GRAPH_CATEGORY_LABELS[entityCategory]` on line 75.

The rendered output must not change.
```

---

### Prompt 1.3 — Extract SCOPE_CONFIG

```
In `app/lib/brain-constants.ts` (create if it doesn't exist from 1.2), export:

export const SCOPE_CONFIG: Record<string, { label: string; cssClass: string }> = {
  user: { label: 'Personal', cssClass: 'scope-user' },
  company: { label: 'Company', cssClass: 'scope-company' },
};

Do NOT update any consumers yet — we'll use this in Story 2.2 (ScopeBadge). This is just getting the data defined centrally. Commit it alone.
```

---

### Prompt 1.4 — Extract MEMORY_CATEGORIES

```
In `app/lib/brain-constants.ts`, export:

export const MEMORY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'preference', label: 'Preference' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'contact', label: 'Contact' },
  { id: 'fund', label: 'Fund' },
  { id: 'style', label: 'Style' },
  { id: 'context', label: 'Context' },
] as const;

Then update `app/components/brain/memory-list.tsx`:
- Delete the local `CATEGORIES` constant (lines 14-22).
- Import `MEMORY_CATEGORIES` from `~/lib/brain-constants`.
- Replace every reference to `CATEGORIES` with `MEMORY_CATEGORIES` (there's one usage on line 116: `{CATEGORIES.map(...)}`).
- Also update the `<select>` options on lines 153-162 to derive from `MEMORY_CATEGORIES` (filter out 'all'): `{MEMORY_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}`

The rendered output must not change.
```

---

## TIER 2: Leaf Components

---

### Prompt 2.1 — Extract StatusDot component

```
Create `app/components/ui/status-dot.tsx`.

This is a tiny component that renders a colored dot for status indication. It must support these statuses with these color mappings (using the app's existing CSS variable system):

  success  → var(--green)
  failed   → var(--red)
  running  → var(--violet-3), with a pulse animation
  waiting  → var(--amber)
  muted    → var(--taupe-3)

Props:
  status: 'success' | 'failed' | 'running' | 'waiting' | 'muted'
  pulse?: boolean (defaults to true when status is 'running')
  size?: 'sm' | 'md' (default 'sm')
  className?: string

The component renders a <span> with:
- `display: inline-block`, `border-radius: 9999px`
- `sm` = 6px × 6px, `md` = 8px × 8px
- background-color from the status→color mapping
- When pulse is true, apply the existing `animate-[wf-pulse_2s_infinite] motion-reduce:animate-none` class

Export: `export function StatusDot({ status, pulse, size = 'sm', className }: StatusDotProps)`

Then replace ONLY these two instances to start (we'll do more later):
1. `app/components/workflows/runs-tab.tsx` line 72: replace `<div className={`run-status-dot ${dotClass}`} />` with `<StatusDot status={run.status === 'success' ? 'success' : 'failed'} />`. Keep the existing `run-status-dot` CSS class by passing it as className.
2. `app/components/workflows/overview-tab.tsx` lines 88-91: same pattern, replace `<div className={`run-status-dot ${dotClass}`} />` with `<StatusDot status={run.status === 'success' ? 'success' : 'failed'} className="run-status-dot" />`.

Do NOT touch workflow-card.tsx, workflow-list.tsx, or thread-list.tsx yet.

The rendered output must not change.
```

---

### Prompt 2.2 — Extract ScopeBadge component

```
Create `app/components/ui/scope-badge.tsx`.

This component displays "Personal" or "Company" with scope-specific styling. It uses the existing CSS classes `brain-scope-badge` plus `scope-user` or `scope-company`.

Import `SCOPE_CONFIG` from `~/lib/brain-constants`.
Import `cn` from `~/lib/utils`.

Props:
  scope: 'user' | 'company'
  className?: string

Implementation:
export function ScopeBadge({ scope, className }: ScopeBadgeProps) {
  const config = SCOPE_CONFIG[scope];
  return (
    <span className={cn('brain-scope-badge', config.cssClass, className)}>
      {config.label}
    </span>
  );
}

Then replace these 2 instances:

1. `app/components/brain/lesson-card.tsx` lines 39-46: replace the entire <span className={cn('brain-scope-badge', ...)}> block with `<ScopeBadge scope={lesson.scope} />`.

2. `app/components/brain/lesson-detail.tsx` lines 160-167: replace the entire <span className={cn('brain-scope-badge', ...)}> block with `<ScopeBadge scope={lesson.scope} />`.

Do NOT touch `workflows/lessons-tab.tsx` (it has different styling) or `_app.brain.lessons.tsx` (those are filter pills, not display badges).

The rendered output must not change.
```

---

### Prompt 2.3 — Extract TriggerChip component

```
Create `app/components/workflows/trigger-chip.tsx`.

This component renders a trigger type with its icon and label using TRIGGER_CONFIG from `~/lib/workflow-constants`.

Import `TRIGGER_CONFIG` from `~/lib/workflow-constants`.
Import `cn` from `~/lib/utils`.
Import type `TriggerType` from `~/services/types`.

Props:
  type: TriggerType
  size?: 'sm' | 'md' (default 'sm')
  className?: string

Implementation:
export function TriggerChip({ type, size = 'sm', className }: TriggerChipProps) {
  const config = TRIGGER_CONFIG[type];
  if (!config) return null;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'size-3' : 'size-3.5';
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  );
}

Then replace this ONE instance to start:
- `app/components/workflows/workflow-card.tsx` lines 89-91: replace `<span className="wf-card-trigger-chip">{trigger.icon} {trigger.label}</span>` with `<TriggerChip type={template.triggerType} className="wf-card-trigger-chip" />`. Remove the now-unused `const trigger = ...` line if TRIGGER_META was already removed in Story 1.1.

The rendered output must not change.
```

---

### Prompt 2.4 — Extract FilterPill component

```
Create `app/components/ui/filter-pill.tsx`.

This component renders a toggleable pill button used in filter bars. It uses the existing CSS class `mem-cat-pill` with conditional `active` class.

Import `cn` from `~/lib/utils`.

Props:
  label: string
  isActive: boolean
  onClick: () => void
  className?: string

Implementation:
export function FilterPill({ label, isActive, onClick, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'mem-cat-pill',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]',
        isActive && 'active',
        className
      )}
    >
      {label}
    </button>
  );
}

Then replace these 2 instances:

1. `app/components/brain/memory-list.tsx` lines 117-129: replace the `{MEMORY_CATEGORIES.map((cat) => (` block. Each <button> becomes `<FilterPill key={cat.id} label={cat.label} isActive={memoryCategory === cat.id} onClick={() => setMemoryCategory(cat.id)} />`.

2. `app/routes/_app.brain.lessons.tsx` lines 87-99: replace the `{LESSON_SCOPES.map((scope) => (` block. Each <button> becomes `<FilterPill key={scope.id} label={scope.label} isActive={lessonScope === scope.id} onClick={() => setLessonScope(scope.id)} />`.

The rendered output must not change.
```

---

### Prompt 2.5 — Extract EmptyState component

```
Create `app/components/ui/empty-state.tsx`.

This component renders a centered placeholder when a list or view has no content.

Import `cn` from `~/lib/utils`.

Props:
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string

Implementation — use the existing CSS classes `brain-empty-icon`, `brain-empty-title`, `brain-empty-desc` for consistency:
export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('mem-no-results', className)}>
      {icon && <div className="brain-empty-icon">{icon}</div>}
      <div className="brain-empty-title">{title}</div>
      {description && <div className="brain-empty-desc">{description}</div>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

Then replace these 3 instances:

1. `app/components/brain/memory-list.tsx` lines 188-195: replace the `<div className="mem-no-results">` block with:
   `<EmptyState icon={<Search size={32} />} title="No memories found" description="Try a different search or category filter." />`

2. `app/routes/_app.brain.lessons.tsx` lines 105-113: replace the `<div className="mem-no-results">` block with:
   `<EmptyState icon={<Search size={32} />} title="No lessons found" description="Try a different search term or filter." />`

3. `app/components/workflows/runs-tab.tsx` lines 29-34: replace the `<div className="runs-empty">` block with:
   `<EmptyState title="No runs yet" description="Run this workflow to see execution history" className="runs-empty" />`

Do NOT touch _app.chat.tsx (its empty state has suggestion chips — different structure), _app.workflows.tsx, or workflows/lessons-tab.tsx yet. Those can be handled later with the `action` prop.

The rendered output must not change.
```

---

### Prompt 2.6 — Extract ErrorBoundaryContent component

```
Create `app/components/ui/error-boundary-content.tsx`.

This component renders the error UI used inside every route's ErrorBoundary() export. It wraps the existing Alert + AlertCircle + AlertTitle + AlertDescription + Button pattern.

Import { AlertCircle } from 'lucide-react';
Import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
Import { Button } from '~/components/ui/button';

Props:
  title?: string (default: 'Something went wrong')
  message: string

Implementation:
export function ErrorBoundaryContent({ title = 'Something went wrong', message }: ErrorBoundaryContentProps) {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Alert>
    </div>
  );
}

Then replace ALL of these ErrorBoundary exports. For each file, the ErrorBoundary function should become a thin wrapper. Preserve the `useRouteError()` + `console.error()` calls and any `isRouteErrorResponse` checks.

1. `app/routes/_app.brain.memory.tsx` — replace ErrorBoundary body (lines 23-43):
   export function ErrorBoundary() {
     const error = useRouteError();
     console.error('Memory route error:', error);
     return <ErrorBoundaryContent message="An unexpected error occurred while loading memory data." />;
   }
   Remove the now-unused imports of Alert, AlertDescription, AlertTitle, AlertCircle if they're no longer used elsewhere in the file. Keep Button import only if used elsewhere.

2. `app/routes/_app.brain.lessons.tsx` — replace ErrorBoundary body (lines 129-149). Same pattern, message: "An unexpected error occurred while loading lessons."

3. `app/routes/_app.brain.graph.tsx` — replace ErrorBoundary body (lines 128-148). Message: "An unexpected error occurred while loading the knowledge graph."

4. `app/routes/_app.workflows.tsx` — replace ErrorBoundary body (lines 90-110). Message: "An unexpected error occurred while loading workflows."

5. `app/routes/_app.brain.lessons.$id.tsx` — this one has TWO branches (404 + generic). Replace:
   export function ErrorBoundary() {
     const error = useRouteError();
     console.error('Lesson route error:', error);
     if (isRouteErrorResponse(error) && error.status === 404) {
       return <ErrorBoundaryContent title="Lesson not found" message="The lesson you're looking for doesn't exist or has been removed." />;
     }
     return <ErrorBoundaryContent message="An unexpected error occurred while loading this lesson." />;
   }

6. `app/routes/_app.chat.$threadId.tsx` — same 404/generic pattern:
   export function ErrorBoundary() {
     const error = useRouteError();
     console.error('Thread route error:', error);
     if (isRouteErrorResponse(error) && error.status === 404) {
       return <ErrorBoundaryContent title="Thread not found" message="The thread you're looking for doesn't exist or has been removed." />;
     }
     return <ErrorBoundaryContent message="An unexpected error occurred while loading this thread." />;
   }

7. `app/routes/_app.workflows.$id.tsx` — same 404/generic pattern:
   export function ErrorBoundary() {
     const error = useRouteError();
     console.error('Workflow detail route error:', error);
     if (isRouteErrorResponse(error) && error.status === 404) {
       return <ErrorBoundaryContent title="Workflow not found" message="The workflow template you're looking for doesn't exist or has been removed." />;
     }
     return <ErrorBoundaryContent message="An unexpected error occurred while loading this workflow." />;
   }

For files 5, 6, 7: keep the `isRouteErrorResponse` import from 'react-router'.

After updating each file, clean up any imports that are no longer used (Alert, AlertTitle, AlertDescription, AlertCircle, Button) — but ONLY if they're not used elsewhere in that same file.

The rendered output must not change.
```

---

### Prompt 2.7 — Extract KVRow component

```
Create `app/components/ui/kv-row.tsx`.

This component renders a key-value display row. Uses existing CSS classes `kv-row`, `kv-key`, `kv-val`.

Import `cn` from `~/lib/utils`.

Props:
  label: string
  value: React.ReactNode
  valueClassName?: string
  className?: string

Implementation:
export function KVRow({ label, value, valueClassName, className }: KVRowProps) {
  return (
    <div className={cn('kv-row', className)}>
      <span className="kv-key">{label}</span>
      <span className={cn('kv-val', valueClassName)}>{value}</span>
    </div>
  );
}

Then replace in `app/components/workflows/overview-tab.tsx`:
All 8 `<div className="kv-row">` blocks (in the Status and Performance sections). For example, line 26-29:
  <div className="kv-row"><span className="kv-key">State</span><span className={`kv-val status-${template.status}`}>● {statusLabel}</span></div>
becomes:
  <KVRow label="State" value={<>● {statusLabel}</>} valueClassName={`status-${template.status}`} />

Apply the same transformation to all 8 KV rows in that file. Preserve the exact text and class names. The Status section has 4 rows (State, Last Run, Last Result, Avg Duration) and Performance has 4 rows (Total Runs, Success Rate, Files Processed, Created).

Do NOT touch `chat/artifact.tsx` yet (it uses a slightly different structure for metadata entries).

The rendered output must not change.
```

---

### Prompt 2.8 — Extract SectionPanel component

```
Create `app/components/ui/section-panel.tsx`.

This component wraps the recurring `detail-section bevel` container with art-stripe header bar. Uses existing CSS classes.

Import `cn` from `~/lib/utils`.

Props:
  title: string
  children: React.ReactNode
  className?: string

Implementation:
export function SectionPanel({ title, children, className }: SectionPanelProps) {
  return (
    <div className={cn('detail-section bevel', className)}>
      <div className="detail-section-bar">
        <div className="art-stripe" />
        <span className="detail-section-title">{title}</span>
        <div className="art-stripe" />
      </div>
      <div className="detail-section-body">
        {children}
      </div>
    </div>
  );
}

Then replace in `app/components/workflows/overview-tab.tsx`:
Replace the 3 section wrappers. For example, the Status section (lines 19-47) becomes:
  <SectionPanel title="Status">
    <KVRow ... />
    <KVRow ... />
    <KVRow ... />
    <KVRow ... />
  </SectionPanel>

Apply to all 3 sections: Status, Performance, and Recent Activity (the third one also has `className="overview-full"`).

Also replace in `app/components/workflows/schema-tab.tsx`:
Replace the 2 section wrappers (Input Schema lines 14-50, Output Schema lines 53-83). The second one has `className="mt-3"` — pass that as className.

Also replace in `app/components/workflows/workflow-stats.tsx`:
Replace the section wrapper (lines 32-49). This one uses `wf-stats-section bevel` instead of `detail-section bevel`, so pass `className="wf-stats-section"` and make the base class in SectionPanel just `bevel` — wait, that would change behavior. Instead, keep the component using `detail-section bevel` as the base, and for workflow-stats pass `className="wf-stats-section"` as an override. Actually, looking at the CSS, `wf-stats-section` likely has its own styles separate from `detail-section`. So for this file, just leave it as-is for now and only replace overview-tab.tsx and schema-tab.tsx.

The rendered output must not change.
```

---

### Prompt 2.9 — Move SSO brand icons to lib/icons

```
Create `app/lib/brand-icons.tsx`.

Move these 3 components from `app/routes/login.tsx` into the new file:
- `GoogleIcon` (lines 45-66 of login.tsx)
- `MicrosoftIcon` (lines 69-77)
- `AtlassianIcon` (lines 80-90)

Export all three as named exports.

In `app/routes/login.tsx`, delete the 3 inline component definitions and add:
  import { GoogleIcon, MicrosoftIcon, AtlassianIcon } from '~/lib/brand-icons';

No other changes needed. The rendered output must not change.
```

---

## TIER 3: Adopt Existing UI Components

---

### Prompt 3.1a — Replace header-btn buttons in chat-header.tsx

```
In `app/components/chat/chat-header.tsx`, replace the 3 raw <button> elements (Files, Export, Share) with the existing Button component.

Import { Button } from '~/components/ui/button'.

Replace each button. For example the Files button (lines 15-24):
  <button type="button" className={`header-btn bevel icon-btn${hasFiles ? "" : " disabled"}`} disabled={!hasFiles} title="Files" aria-label="Files" data-label="Files" onClick={() => hasFiles && openFilePanel('folder')}>
    <FolderOpen size={14} />
    <span className="a11y-label">Files</span>
  </button>
becomes:
  <Button variant="ghost" size="icon-sm" className="header-btn bevel icon-btn" disabled={!hasFiles} title="Files" aria-label="Files" data-label="Files" onClick={() => hasFiles && openFilePanel('folder')}>
    <FolderOpen size={14} />
    <span className="a11y-label">Files</span>
  </Button>

Apply the same pattern to the Export button (lines 27-35) and Share button (lines 36-44). Keep the existing `header-btn bevel icon-btn` classes as className pass-through so the visual styling doesn't change.

The rendered output must not change.
```

---

### Prompt 3.1b — Replace header-btn buttons in entity-detail.tsx

```
In `app/components/brain/entity-detail.tsx`, replace the Close button (lines 80-89) with the existing Button component.

Import { Button } from '~/components/ui/button'.

Replace:
  <button type="button" onClick={onClose} className="header-btn bevel" title="Close" aria-label="Close entity detail">
    <X className="size-4" />
    <span className="a11y-label">Close</span>
  </button>
With:
  <Button variant="ghost" size="icon-sm" className="header-btn bevel" onClick={onClose} title="Close" aria-label="Close entity detail">
    <X className="size-4" />
    <span className="a11y-label">Close</span>
  </Button>

The rendered output must not change.
```

---

### Prompt 3.1c — Replace header-btn buttons in lesson-detail.tsx

```
In `app/components/brain/lesson-detail.tsx`, replace the 3 action buttons (Edit, Cosimo, Delete) in the header (lines 123-155) with the existing Button component.

Import { Button } from '~/components/ui/button'.

For the Edit/Save toggle button (lines 123-135), replace the raw <button> with:
  <Button variant="ghost" size="icon-sm" className={cn('header-btn bevel label-mono icon-btn', isEditing && 'primary')} onClick={handleToggleEdit} title={isEditing ? 'Save Changes' : 'Edit Directly'} aria-label={isEditing ? 'Save Changes' : 'Edit Directly'}>
    {isEditing ? <Check className="size-3.5" /> : <Pencil className="size-3.5" />}
    <span className="a11y-label">{isEditing ? 'Save' : 'Edit'}</span>
  </Button>

Apply the same pattern to the Cosimo button (lines 136-145) and Delete button (lines 146-154). Keep all existing className strings.

Also replace the back button (lines 109-117):
  <Button variant="ghost" size="icon-sm" className="lesson-back-btn shrink-0" onClick={onBack} aria-label="Back to lessons">
    <span className="icon-char">&larr;</span>
    <span className="a11y-label">Back</span>
  </Button>

The rendered output must not change.
```

---

### Prompt 3.1d — Replace header-btn buttons in _app.brain.tsx

```
In `app/routes/_app.brain.tsx`, replace the action button (lines 30-42) with the existing Button component.

Import { Button } from '~/components/ui/button'.

Replace:
  <button type="button" className="header-btn bevel label-mono primary" onClick={...}>
    {currentSection.action}
  </button>
With:
  <Button variant="default" size="sm" className="header-btn bevel label-mono primary" onClick={...}>
    {currentSection.action}
  </Button>

The rendered output must not change.
```

---

### Prompt 3.1e — Replace buttons in memory-list.tsx add form

```
In `app/components/brain/memory-list.tsx`, replace the Cancel and Save buttons in the add-memory form (lines 166-178) with the existing Button component.

Import { Button } from '~/components/ui/button'.

Replace the Cancel button:
  <Button variant="ghost" size="sm" className="header-btn bevel label-mono" onClick={handleCancelAdd}>Cancel</Button>

Replace the Save button:
  <Button variant="default" size="sm" className="header-btn bevel label-mono primary" onClick={handleSaveMemory}>Save</Button>

The rendered output must not change.
```

---

### Prompt 3.2 — Replace raw search inputs with Input component

```
In `app/components/brain/memory-list.tsx`, replace the raw search <input> (lines 104-112) with the existing Input component.

Import { Input } from '~/components/ui/input'.

The current code is:
  <div className="relative mb-2">
    <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)] pointer-events-none" />
    <input type="search" placeholder="Search memories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mem-search-input" />
  </div>

Replace with:
  <div className="relative mb-2">
    <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)] pointer-events-none" />
    <Input type="search" placeholder="Search memories..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="mem-search-input" />
  </div>

Do the same in `app/routes/_app.brain.lessons.tsx` (lines 73-81) — same pattern, same replacement.

The rendered output must not change — the `mem-search-input` CSS class provides the visual styling.
```

---

### Prompt 3.3 — Create ConfirmDialog and replace inline delete modal

```
Create `app/components/ui/confirm-dialog.tsx`.

This wraps the existing Dialog component for destructive confirmation actions.

Import from existing components:
  import { Dialog, DialogPortal, DialogOverlay, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '~/components/ui/dialog';
  import { Button } from '~/components/ui/button';

Props:
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  confirmLabel?: string (default: 'Confirm')
  cancelLabel?: string (default: 'Cancel')
  variant?: 'default' | 'destructive' (default: 'destructive')
  onConfirm: () => void

Implementation:
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'destructive', onConfirm }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" size="sm">{cancelLabel}</Button>} />
            <Button variant={variant} size="sm" onClick={() => { onConfirm(); onOpenChange(false); }}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}

Then update `app/components/brain/memory-fact.tsx`:
- Import ConfirmDialog
- Replace the inline delete confirmation overlay (lines 135-153) with:
  <ConfirmDialog
    open={showDeleteConfirm}
    onOpenChange={setShowDeleteConfirm}
    title="Delete this memory?"
    confirmLabel="Delete"
    onConfirm={handleConfirmDelete}
  />

The Dialog component may render differently than the current inline overlay. That's OK — the functionality must be identical (confirm/cancel delete), but the visual can be an upgrade. If you want pixel-identical rendering, you can skip this story for now.
```

---

### Prompt 3.4 — Replace inline tab bar in template-detail.tsx with Tabs component

```
In `app/components/workflows/template-detail.tsx`, replace the custom tab bar (lines 243-253) with the existing Tabs component.

Import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'.

The current code is:
  <div className="tab-bar">
    {TAB_KEYS.map((key) => (
      <button key={key} className={cn('tab-btn', activeTab === key && 'active')} onClick={() => setTab(key)}>
        {TAB_LABELS[key]}
      </button>
    ))}
  </div>
  <div className="tab-content">
    {activeTab === 'overview' && <OverviewTab ... />}
    ...
  </div>

Replace with:
  <Tabs value={activeTab} onValueChange={(val) => setTab(val as typeof activeTab)} className="wf-detail-tabs">
    <TabsList variant="line" className="tab-bar">
      {TAB_KEYS.map((key) => (
        <TabsTrigger key={key} value={key} className="tab-btn">
          {TAB_LABELS[key]}
        </TabsTrigger>
      ))}
    </TabsList>
    <TabsContent value="overview" className="tab-content"><OverviewTab template={template} /></TabsContent>
    <TabsContent value="schema" className="tab-content"><SchemaTab template={template} /></TabsContent>
    <TabsContent value="triggers" className="tab-content"><TriggersTab template={template} /></TabsContent>
    <TabsContent value="runs" className="tab-content"><RunsTab template={template} /></TabsContent>
    <TabsContent value="lessons" className="tab-content"><LessonsTab template={template} /></TabsContent>
  </Tabs>

IMPORTANT: The Tabs component from @base-ui uses `onValueChange` — check the actual API. If it uses a different prop name, adapt accordingly. Read `app/components/ui/tabs.tsx` to verify.

Keep the existing `tab-bar` and `tab-btn` CSS classes as className pass-throughs.

The tab switching functionality must work identically. Visual appearance should be preserved by the CSS class pass-throughs.
```

---

### Prompt 3.5 — Replace raw table in data-table.tsx with Table component

```
In `app/components/chat/data-table.tsx`, replace the raw <table> with the existing Table components.

Import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '~/components/ui/table'.

The current code uses `<table className="data-tbl">`. Replace with:

  <Table className="data-tbl">
    <TableHeader>
      <TableRow>
        {columns.map((col, i) => (
          <TableHead key={i}>{col}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {rows.map((row, rowIdx) => (
        <TableRow key={rowIdx}>
          {row.map((cell, cellIdx) => (
            <TableCell key={cellIdx} dangerouslySetInnerHTML={{ __html: cell }} />
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>

Keep the `data-tbl` CSS class as className on the Table component. The CSS provides the monospace font and cell styling.

The rendered output must not change.
```

---

## TIER 4: Composite Components

---

### Prompt 4.1 — Extract SearchFilterBar

```
Create `app/components/ui/search-filter-bar.tsx`.

This combines a search Input with a row of FilterPill buttons.

Import { Search } from 'lucide-react';
Import { Input } from '~/components/ui/input';
Import { FilterPill } from '~/components/ui/filter-pill';

Props:
  placeholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    options: readonly { id: string; label: string }[]
    value: string
    onChange: (value: string) => void
  }
  className?: string

Implementation:
export function SearchFilterBar({ placeholder = 'Search...', searchValue, onSearchChange, filters, className }: SearchFilterBarProps) {
  return (
    <div className={className}>
      <div className="relative mb-2">
        <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)] pointer-events-none" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="mem-search-input"
        />
      </div>
      {filters && (
        <div className="flex flex-wrap gap-1">
          {filters.options.map((opt) => (
            <FilterPill
              key={opt.id}
              label={opt.label}
              isActive={filters.value === opt.id}
              onClick={() => filters.onChange(opt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

Then replace in `app/components/brain/memory-list.tsx`:
Replace the search input div + category pills block (the `<div className="mem-facts-toolbar">` inner content, lines 103-131) with:
  <SearchFilterBar
    placeholder="Search memories..."
    searchValue={searchQuery}
    onSearchChange={setSearchQuery}
    filters={{
      options: MEMORY_CATEGORIES,
      value: memoryCategory,
      onChange: setMemoryCategory,
    }}
  />

Also replace in `app/routes/_app.brain.lessons.tsx`:
Replace the search div + scope pills (lines 72-100) with:
  <SearchFilterBar
    placeholder="Search lessons..."
    searchValue={searchQuery}
    onSearchChange={setSearchQuery}
    filters={{
      options: LESSON_SCOPES,
      value: lessonScope,
      onChange: setLessonScope,
    }}
    className="mb-3"
  />

Remove the now-unused FilterPill and Input imports from both files if they were imported directly.

The rendered output must not change.
```

---

### Prompt 4.2 — Extract RunRow component

```
Create `app/components/workflows/run-row.tsx`.

This component renders a single run history row with status dot, run ID, trigger, time, and duration.

Import { StatusDot } from '~/components/ui/status-dot';
Import { cn } from '~/lib/utils';
Import type { RecentRun } from '~/services/types';

Props:
  run: RecentRun
  onClick?: (threadId: string) => void
  className?: string

Implementation:
export function RunRow({ run, onClick, className }: RunRowProps) {
  const hasThread = !!run.threadId;
  return (
    <div
      className={cn('run-row', hasThread && onClick && 'run-row-linked', className)}
      onClick={() => hasThread && onClick?.(run.threadId!)}
      onKeyDown={(e) => { if (e.key === 'Enter' && hasThread && onClick) onClick(run.threadId!); }}
      role={hasThread && onClick ? 'button' : undefined}
      tabIndex={hasThread && onClick ? 0 : undefined}
    >
      <StatusDot status={run.status === 'success' ? 'success' : 'failed'} className="run-status-dot" />
      <span className="run-id">{run.id}</span>
      <span className="run-trigger">{run.trigger}</span>
      <span className="run-time">{run.time}</span>
      <span className="run-duration">{run.duration}</span>
    </div>
  );
}

Then replace in `app/components/workflows/runs-tab.tsx`:
Replace the run row rendering (lines 58-78) with:
  {recentRuns.map((run) => (
    <RunRow key={run.id} run={run} onClick={(threadId) => navigate(`/chat/${threadId}`)} />
  ))}

Also replace in `app/components/workflows/overview-tab.tsx`:
Replace the recent activity rows (lines 87-98) with:
  {recentRuns.map((run) => (
    <RunRow key={run.id} run={run} />
  ))}

Remove the now-unused local `dotClass` variable and `handleRowClick` callback from runs-tab.tsx if they're no longer needed.

The rendered output must not change.
```

---

## TIER 5: Final Cleanup — Remaining Duplicate Stragglers

---

### Prompt 5.1 — Move CAT_CLASS into brain-constants and use from memory-fact

```
In `app/lib/brain-constants.ts`, add this new export after the existing `MEMORY_CATEGORIES`:

export const MEMORY_CATEGORY_CSS: Record<string, string> = {
  preference: 'cat-preference',
  workflow: 'cat-workflow',
  contact: 'cat-contact',
  fund: 'cat-fund',
  style: 'cat-style',
  context: 'cat-context',
};

Then in `app/components/brain/memory-fact.tsx`:
1. Add `MEMORY_CATEGORY_CSS` to the imports from `~/lib/brain-constants`.
2. Delete the local `CAT_CLASS` constant (lines 35-43, the block starting with `/** Category badge class mapping */` through the closing `};`).
3. Replace every reference to `CAT_CLASS` in this file with `MEMORY_CATEGORY_CSS`. There is one usage on line 75: `CAT_CLASS[fact.category] || 'cat-context'` — change it to `MEMORY_CATEGORY_CSS[fact.category] || 'cat-context'`.

The rendered output must not change.
```

---

### Prompt 5.2 — Consolidate LESSON_SCOPES into brain-constants

```
In `app/lib/brain-constants.ts`, add this new export after `SCOPE_CONFIG`:

export const LESSON_SCOPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'user', label: 'Personal' },
  { id: 'company', label: 'Company' },
] as const;

Then in `app/routes/_app.brain.lessons.tsx`:
1. Add `LESSON_SCOPE_FILTERS` to the imports from `~/lib/brain-constants`.
2. Delete the local `LESSON_SCOPES` constant (lines 17-21, the block starting with `const LESSON_SCOPES = [` through the closing `];`).
3. Replace the reference to `LESSON_SCOPES` on line 78 (`options: LESSON_SCOPES`) with `options: LESSON_SCOPE_FILTERS`.

The rendered output must not change.
```

---

### Prompt 5.3 — Move CATEGORY_RGB into brain-constants

```
In `app/lib/brain-constants.ts`, add this new export after `GRAPH_CATEGORY_LABELS`:

/** SVG radialGradient hex colors — can't use CSS vars inside SVG defs */
export const GRAPH_CATEGORY_RGB: Record<string, { core: string; mid: string; dim: string }> = {
  funds: { core: '#9b6bc2', mid: '#74418F', dim: '#4D2B5F' },
  contacts: { core: '#c278c4', mid: '#8B4F8D', dim: '#5D355E' },
  documents: { core: '#7bb8d9', mid: '#5a9fc2', dim: '#3a7a9e' },
  workflows: { core: '#6abf6e', mid: '#3D8B40', dim: '#2a6b2c' },
  systems: { core: '#d4a646', mid: '#B8862B', dim: '#8a6518' },
  entities: { core: '#9e9ca3', mid: '#6a6870', dim: '#4a484f' },
  you: { core: '#b478d8', mid: '#8855a8', dim: '#5a3070' },
};

Then in `app/components/brain/entity-graph.tsx`:
1. Add `GRAPH_CATEGORY_RGB` to the existing import from `~/lib/brain-constants` (line 10 already imports `GRAPH_CATEGORY_COLORS` — add `GRAPH_CATEGORY_RGB` to that same import).
2. Delete the local `CATEGORY_RGB` constant (lines 21-30, the block starting with `/** Category RGB hex values` through the closing `};`).
3. Replace every reference to `CATEGORY_RGB` in this file with `GRAPH_CATEGORY_RGB`. There are three usages:
   - Line 300: `Object.entries(CATEGORY_RGB)` → `Object.entries(GRAPH_CATEGORY_RGB)`
   - Line 318: `Object.entries(CATEGORY_RGB)` → `Object.entries(GRAPH_CATEGORY_RGB)`
   - Line 472: `CATEGORY_RGB[colorId]?.core` → `GRAPH_CATEGORY_RGB[colorId]?.core`

The rendered output must not change. The SVG gradients and glow filters must look identical.
```

---

## Post-Completion Checklist

After all prompts are done, verify:
- [ ] `npm run build` succeeds with no TypeScript errors
- [ ] All pages render identically to before
- [ ] No unused imports remain
- [ ] No duplicate constants remain across files
- [ ] Every new component in `components/ui/` has a clear single responsibility
