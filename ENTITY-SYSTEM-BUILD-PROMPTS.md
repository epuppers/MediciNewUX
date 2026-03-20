# Entity System — Claude Code Build Prompts

## Implementation Guide for the Cosimo Rolodex / Entity System

**Date:** March 19, 2026
**Total Prompts:** 14 (7 phases)
**Estimated Scope:** ~15 new files, ~6 modified files

### How to Use This Document

Each prompt below is a self-contained Claude Code instruction. Run them **in order** — later prompts depend on files created by earlier ones. Each prompt includes:

- **Goal**: What this prompt produces
- **Dependencies**: Files that must exist before running
- **Files Created/Modified**: What changes
- **The Prompt**: Copy-paste this into Claude Code

After each prompt completes, run `npx tsc --noEmit` to verify. Fix any type errors before moving to the next prompt.

### CRITICAL: Pattern Rules (Apply to ALL Prompts)

Every prompt inherits these rules. Claude Code must follow them for every file:

1. **Imports**: Use `~/` path alias for all internal imports. Group: React → external libs → internal.
2. **Class merging**: Always use `cn()` from `~/lib/utils`. Never concatenate class strings.
3. **Data slots**: Add `data-slot="component-name"` on root elements of named components (e.g., `data-slot="entity-list-item"`). Follow existing ShadCN components.
4. **Dark mode**: Every bg, text, and border class must have a `dark:` variant. Test mentally in both themes.
5. **Animations**: Gate ALL animations and transitions with `motion-reduce:animate-none` or `motion-reduce:transition-none`.
6. **Focus states**: Use `focus-visible:` (not `focus:`) for all outline/ring states. Every interactive element needs one.
7. **Keyboard**: Every clickable div must have `role="button"`, `tabIndex={0}`, and `onKeyDown` for Enter/Space.
8. **No custom CSS**: Tailwind utilities only. No `style={}`. No CSS classes in app.css.
9. **CVA for variants**: If a component has visual variants (size, color, status), use `cva` from `class-variance-authority` and `VariantProps<typeof variantFn>` for type-safe props.
10. **Design tokens**: All colors from CSS custom properties. No raw hex/rgb. Use `rgba(var(--color-rgb), alpha)` for transparency.
11. **Fonts**: `font-pixel` for headings, `font-mono` for labels/data, `font-sans` for body text.
12. **Types**: Full TypeScript. No `any`. All props interfaces must be explicitly typed and exported.
13. **Architecture reference**: See `ENTITY-SYSTEM-ARCHITECTURE.md` in the repo root for the complete type system, schema samples, mock data examples, and UI component mapping.

---
---

## PHASE 1: Foundation (Types, Mock Data, Service, Store)

These prompts create the data layer — no UI yet. Everything downstream depends on these files.

---

### PROMPT 1-A: Entity Type Definitions

**Goal:** Add all Entity System types to the existing `services/types.ts`
**Dependencies:** None (this is the starting point)
**Files Modified:** `app/services/types.ts`

```
READ the file `app/services/types.ts` in full. Then APPEND the following new type
definitions at the end of the file, after the existing `RGBCompanions` type. Do NOT
modify any existing types. Add a section comment header matching the existing style.

Add these exact types in this exact order:

1. ENTITY SCHEMA section (per-tenant configuration):

EntitySchema — top-level schema config:
  - version: number
  - tenantId: string
  - tabLabel: string (display label for the Rolodex tab, default "Rolodex")
  - entityTypes: EntityTypeDefinition[]
  - relationshipTypes: RelationshipTypeDefinition[]
  - settings: EntitySchemaSettings

EntityTypeDefinition — defines a single entity type (e.g., "Fund", "Patient"):
  - id: string (kebab-case identifier)
  - label: string (singular)
  - labelPlural: string
  - icon: string (unicode character)
  - color: string (design token like "violet-3")
  - colorRgb: string (RGB triplet token like "var(--violet-3-rgb)")
  - properties: EntityPropertyDefinition[]
  - summaryProperties: string[] (property IDs to show in list view, max 4)
  - detailSections: EntityDetailSection[]
  - actions: EntityActionDefinition[]
  - healthIndicator: HealthIndicatorConfig | null
  - showInNav: boolean (whether this type appears as a top-level filter)
  - navOrder: number (sort order in filter bar)

EntityPropertyDefinition — a field on an entity type:
  - id: string (kebab-case)
  - label: string
  - type: EntityPropertyType
  - required: boolean
  - options?: string[] (for enum type)
  - format?: string (for currency/number display)
  - editable: boolean
  - aiPopulated: boolean
  - description?: string (tooltip text)

EntityPropertyType — union type:
  'text' | 'number' | 'currency' | 'date' | 'email' | 'phone' | 'url' |
  'enum' | 'boolean' | 'percentage' | 'tags' | 'rich-text'

EntityDetailSection:
  - label: string
  - propertyIds: string[]
  - collapsedByDefault?: boolean

EntityActionDefinition:
  - id: string
  - label: string
  - icon: string (Lucide icon name)
  - type: EntityActionType
  - target?: string (workflow template ID, prompt template, or URL template)
  - primary: boolean

EntityActionType — union type:
  'start-chat' | 'trigger-workflow' | 'compose-email' | 'add-note' |
  'schedule-meeting' | 'external-link' | 'create-task'

RelationshipTypeDefinition:
  - id: string (kebab-case)
  - fromType: string (entity type ID)
  - toType: string (entity type ID)
  - forwardLabel: string (e.g., "manages")
  - reverseLabel: string (e.g., "managed by")
  - autoInfer: boolean

HealthIndicatorConfig:
  - metric: 'last-interaction' | 'deadline-proximity' | 'custom-rule'
  - thresholds?: { healthy: number; warning: number; critical: number }
  - labels?: { healthy: string; warning: string; critical: string }

EntitySchemaSettings:
  - enableGraphView: boolean
  - autoCreateEntities: boolean
  - autoResolveRelationships: boolean
  - defaultSort: 'alphabetical' | 'last-activity' | 'health' | 'created'
  - defaultView: 'list' | 'grid' | 'graph'

2. ENTITY INSTANCES section (runtime data):

Entity — a resolved entity instance:
  - id: string
  - typeId: string (references EntityTypeDefinition.id)
  - name: string
  - subtitle: string
  - avatarUrl?: string
  - properties: Record<string, string | string[] | null>
  - aiSummary: string
  - insights: EntityInsight[]
  - health: 'healthy' | 'warning' | 'critical' | null
  - relationships: EntityRelationship[]
  - linkedThreadIds: string[]
  - linkedWorkflowIds: string[]
  - linkedLessonIds: string[]
  - linkedMemoryFactIndices: number[]
  - linkedKanbanCardIds: string[]
  - createdAt: string
  - updatedAt: string
  - lastActivityAt: string
  - sources: EntitySource[]
  - tags: string[]

EntityRelationship:
  - relationshipTypeId: string
  - targetEntityId: string
  - direction: 'forward' | 'reverse'
  - metadata?: string
  - autoInferred: boolean

EntityInsight:
  - id: string
  - type: 'reminder' | 'alert' | 'opportunity' | 'anomaly' | 'milestone'
  - text: string
  - generatedAt: string
  - dismissed: boolean
  - suggestedActionId?: string

EntitySource:
  - type: 'email' | 'document' | 'calendar' | 'conversation' | 'manual' | 'integration'
  - label: string
  - ref?: string
  - capturedAt: string

3. ACTIVITY TIMELINE section:

ActivityEvent:
  - id: string
  - entityId: string
  - type: ActivityEventType
  - title: string
  - description: string
  - timestamp: string
  - source: 'email' | 'calendar' | 'chat' | 'workflow' | 'manual' | 'integration'
  - refId?: string (for drill-through navigation)
  - refType?: 'thread' | 'workflow-run' | 'document' | 'lesson' | 'kanban-card'
  - involvedEntityIds: string[]

ActivityEventType — union type:
  'email-sent' | 'email-received' | 'meeting-scheduled' | 'meeting-completed' |
  'document-shared' | 'document-updated' | 'workflow-triggered' |
  'workflow-completed' | 'workflow-failed' | 'note-added' | 'property-updated' |
  'entity-created' | 'relationship-added' | 'task-created' | 'task-completed' |
  'milestone-reached' | 'chat-mention'

Add complete JSDoc comments on every interface and every property, matching the
existing documentation style in the file. Use the exact same comment format already
in the file (/** */ style). Group the types under section headers matching the
existing pattern: // ============================================

DO NOT modify, reorder, or touch any existing types. Only append.
After you are done, run `npx tsc --noEmit` to verify no type errors.
```

---

### PROMPT 1-B: Mock Entity Data

**Goal:** Create the full mock data file with schema + entities + timelines
**Dependencies:** Prompt 1-A (types must exist)
**Files Created:** `app/data/mock-entities.ts`

```
READ these files for context:
- `app/services/types.ts` (the full file — focus on the Entity System types at the bottom)
- `app/data/mock-brain.ts` (for existing entity names, facts, and relationships to mirror)
- `app/data/mock-workflows.ts` (first 50 lines — for template IDs used in actions)
- `app/data/mock-threads.ts` (first 30 lines — for thread IDs used in linkedThreadIds)

Now CREATE the file `app/data/mock-entities.ts`. Follow the EXACT style conventions
from mock-brain.ts:
- Same comment header format (// ============================================)
- Same import style (import type { ... } from '~/services/types')
- Same export pattern (export const MOCK_...)

The file must contain these exports:

1. MOCK_ENTITY_SCHEMA: EntitySchema
   Use tenantId 'meridian-capital', tabLabel 'Rolodex'.
   Define 4 entity types:

   a) 'contact' — People (color: berry-3, icon ○)
      Properties: company, title, email, phone, role (enum: Internal/LP/Service Provider/
      Advisor/Counterparty/Other), preferred-comm (enum: Email/Phone/In-Person/Teams-Zoom),
      notes (rich-text), birthday (date), cultural-notes (text)
      Summary props: title, company, role
      Actions: Send Email (compose-email, primary), Ask Cosimo (start-chat, primary),
               Add Note (add-note), Create Task (create-task), Schedule Meeting (schedule-meeting)
      Health: last-interaction, thresholds 14/30/60, labels Active/Cooling/Cold

   b) 'fund' — Funds (color: violet-3, icon ◈)
      Properties: vintage (number), strategy (enum: Real Estate/Infrastructure/Growth Equity/
      Credit/Venture/Opportunistic/Impact), status (enum: Fundraising/Investment Period/
      Harvest/Wind-Down/Liquidated), committed-capital (currency, format '$#,###'),
      lp-count (number), fee-structure (text), preferred-return (percentage),
      waterfall-type (enum: European/American/Hybrid)
      Summary props: vintage, strategy, status, committed-capital
      Actions: Generate Report (trigger-workflow, target 'fee-calc', primary),
               Ask Cosimo (start-chat, primary), Run Waterfall (trigger-workflow, target
               'lp-waterfall'), Process K-1s (trigger-workflow, target 'k1-extract')
      Health: deadline-proximity, thresholds 30/14/7, labels On Track/Reporting Due/Overdue

   c) 'lp' — Limited Partners (color: blue-3, icon ■)
      Properties: type (enum: Pension/Endowment/Family Office/Sovereign Wealth/Insurance/
      Fund of Funds/HNWI/Other), aum (currency), total-committed (currency),
      reup-quarter (text), primary-contact (text)
      Summary props: type, total-committed, reup-quarter
      Actions: Send Update (compose-email, primary), Ask Cosimo (start-chat, primary),
               LP Report (trigger-workflow), Create Task (create-task)
      Health: last-interaction, thresholds 30/60/90, labels Engaged/Check In/At Risk

   d) 'property' — Real Estate Assets (color: taupe-3, icon □)
      Properties: address (text), asset-type (enum: Multifamily/Industrial/Office/Retail/
      Mixed-Use/Data Center/Land), units (number), sqft (number),
      occupancy (percentage), noi (currency, format '$#,###')
      Summary props: asset-type, units, occupancy
      Actions: Run Rent Roll (trigger-workflow, target 'rent-roll', primary),
               Ask Cosimo (start-chat)
      Health: null (no health indicator)

   Relationship types:
   - manages: contact → fund
   - invested-in: lp → fund
   - owns: fund → property
   - advises: contact → fund
   - audits: contact → fund
   - reports-to: contact → contact
   - primary-contact-for: contact → lp
   - co-investor: lp → lp

   Settings: enableGraphView true, autoCreateEntities true,
   autoResolveRelationships true, defaultSort 'last-activity', defaultView 'list'

2. MOCK_ENTITIES: Entity[]
   Create AT LEAST 15 entities, pulling names and facts from MOCK_GRAPH_DATA in
   mock-brain.ts. This ensures the data is consistent across the app. Include:

   Contacts (6):
   - sarah-chen: CFO, Meridian Capital, Internal, healthy. Insights: birthday reminder,
     Q4 report awaiting approval. Linked threads: ['fund3','hilgard','q4lp'].
     Linked workflows: ['fee-calc','k1-extract']. Linked lessons: ['rent-roll-format','fee-calc-rules'].
   - marcus-webb: COO, Internal, healthy. Linked threads: ['hilgard'].
   - james-whitfield: Audit Partner, Deloitte, Service Provider, healthy.
   - elena-vasquez: Fund Controller, Internal, healthy.
   - david-park: IR Director, Internal, warning (hasn't been contacted in 22 days).
   - anna-kowalski: VP Acquisitions, Internal, healthy.

   Funds (4):
   - fund-iii: 2019, Real Estate, Harvest, $420M, 14 LPs, European, 8% pref.
     Health: warning (Q4 report 3 days past internal deadline).
     Insights: report overdue alert, 1.5x MOIC milestone.
   - hilgard: 2021, Real Estate, Harvest, $280M. Health: healthy.
   - erabor: 2023, Infrastructure, Investment Period, $190M committed of $280M target.
     Health: healthy.
   - growth-i: 2020, Growth Equity, Harvest, $310M. Health: healthy.

   LPs (3):
   - calpers: Pension, $500B AUM, $45M committed, re-up Q4 2026. Health: healthy.
     Insight: re-up prep opportunity.
   - harvard-mc: Endowment, $53B AUM, $20M committed. Health: warning.
   - adia: Sovereign Wealth, $900B AUM, $30M committed. Health: healthy.

   Properties (2):
   - prop-berkshire: 120 Berkshire Ave, Multifamily, 180 units, 94% occ, $3.2M NOI.
     Owned by fund-iii.
   - prop-marina: 450 Marina Blvd, Industrial, 85,000 sqft, 100% occ, $1.8M NOI.
     Owned by fund-iii.

   For every entity: fill out all properties as strings (numbers as "420000000",
   percentages as "94", dates as ISO strings). Include at least 1 insight per entity
   where it makes sense. Wire up relationships bidirectionally — if sarah-chen manages
   fund-iii, then fund-iii has a reverse relationship to sarah-chen. Include realistic
   linkedThreadIds, linkedWorkflowIds, and linkedLessonIds referencing IDs that exist
   in mock-threads.ts and mock-workflows.ts. Set createdAt/updatedAt/lastActivityAt
   to dates in Jan-Mar 2026. Include 1-2 sources per entity.

3. MOCK_ENTITY_TIMELINES: Record<string, ActivityEvent[]>
   Create timelines for at least 3 entities:

   sarah-chen (6 events): email received (Mar 17), workflow completed (Mar 15),
   meeting completed (Mar 12), chat mention (Mar 10), document shared (Mar 8),
   note added (Feb 12). Use realistic descriptions referencing Fund III, K-1s, etc.

   fund-iii (5 events): workflow completed (Mar 16), document updated (Mar 14),
   email sent (Mar 8), task created (Mar 5), milestone reached (Feb 28).

   calpers (4 events): email sent (Mar 10), meeting completed (Feb 28),
   document shared (Feb 15), note added (Jan 20).

   Every event must have a unique id (format: 'evt-{entityId}-{n}'), valid entityId,
   type matching ActivityEventType, realistic title/description, ISO timestamp,
   source matching the event type, and involvedEntityIds referencing other entity IDs
   that exist in MOCK_ENTITIES.

Make sure there are NO references to entity IDs that don't exist in MOCK_ENTITIES.
Every targetEntityId in every relationship must point to an entity in the array.
Every involvedEntityId in every timeline event must point to an entity in the array.

After you are done, run `npx tsc --noEmit` to verify no type errors.
```

---

### PROMPT 1-C: Entity Service + Entity Store

**Goal:** Create the service layer and Zustand store
**Dependencies:** Prompts 1-A and 1-B
**Files Created:** `app/services/entities.ts`, `app/stores/entity-store.ts`

```
READ these files for patterns:
- `app/services/brain.ts` (service pattern — async wrappers around mock data)
- `app/stores/brain-store.ts` (store pattern — Zustand with typed state + actions)
- `app/stores/ui-store.ts` (store pattern — how closeAllPanels works)
- `app/data/mock-entities.ts` (the mock data you'll wrap)
- `app/services/types.ts` (the Entity types)

CREATE `app/services/entities.ts`:
Follow the EXACT same pattern as brain.ts — import mock data, export async functions.

Functions:
- getEntitySchema(): Promise<EntitySchema> — returns MOCK_ENTITY_SCHEMA
- getEntities(typeId?: string): Promise<Entity[]> — returns MOCK_ENTITIES,
  filtered by typeId if provided
- getEntity(id: string): Promise<Entity | null> — find by id or return null
- getEntityTimeline(entityId: string): Promise<ActivityEvent[]> — returns
  MOCK_ENTITY_TIMELINES[entityId] or empty array
- searchEntities(query: string): Promise<Entity[]> — case-insensitive search
  on entity name, subtitle, and property values
- getRelatedEntities(entityId: string): Promise<Entity[]> — get the entity,
  collect all targetEntityIds from its relationships, return those entities
- getEntityCounts(): Promise<Record<string, number>> — count entities per typeId

Use the exact same JSDoc comment style as brain.ts.

CREATE `app/stores/entity-store.ts`:
Follow the EXACT same pattern as brain-store.ts — import create from zustand,
define interface, export hook.

State:
- viewMode: 'list' | 'grid' | 'graph' (default: 'list')
- activeTypeFilter: string | null (default: null — shows all)
- searchQuery: string (default: '')
- sortBy: 'alphabetical' | 'last-activity' | 'health' | 'created' (default: 'last-activity')
- selectedEntityId: string | null (default: null)
- detailMode: 'slide-over' | 'full-page' (default: 'slide-over')
- detailTab: 'overview' | 'timeline' | 'relationships' | 'linked' (default: 'overview')
- graphZoom: number (default: 1)
- graphPan: { x: number; y: number } (default: { x: 0, y: 0 })
- graphLevel: 'root' | 'cluster' | 'entity' (default: 'root')

Actions:
- setViewMode(mode)
- setTypeFilter(typeId: string | null)
- setSearchQuery(query: string)
- setSortBy(sort)
- selectEntity(id: string | null) — also resets detailTab to 'overview'
- setDetailMode(mode)
- setDetailTab(tab)
- setGraphZoom(zoom: number)
- setGraphPan(pan: { x: number; y: number })
- setGraphLevel(level)
- resetFilters() — resets typeFilter, searchQuery, and sortBy to defaults

Name the hook: useEntityStore

After you are done, run `npx tsc --noEmit` to verify no type errors.
```

---

### PROMPT 1-D: Entity Constants

**Goal:** Create constants file for entity colors, icons, and health status styling
**Dependencies:** Prompt 1-A
**Files Created:** `app/lib/entity-constants.ts`

```
READ these files for patterns:
- `app/lib/brain-constants.ts` (the exact pattern to follow)
- `app/lib/workflow-constants.ts` (additional pattern reference)

CREATE `app/lib/entity-constants.ts`:
Follow the brain-constants.ts pattern exactly — same export style, same Record types.

1. ENTITY_HEALTH_COLORS: Record<string, string>
   Map health status to Tailwind color classes:
   - healthy: 'bg-green'
   - warning: 'bg-amber'
   - critical: 'bg-red'
   - (no null case — null means no health indicator)

2. ENTITY_HEALTH_TEXT: Record<string, string>
   Map health status to text color classes:
   - healthy: 'text-green'
   - warning: 'text-amber'
   - critical: 'text-red'

3. ENTITY_HEALTH_BG: Record<string, string>
   Map health status to background tint classes for badges:
   - healthy: 'bg-[rgba(var(--green-rgb),0.08)] dark:bg-[rgba(var(--green-rgb),0.12)]'
   - warning: 'bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)]'
   - critical: 'bg-[rgba(var(--red-rgb),0.08)] dark:bg-[rgba(var(--red-rgb),0.12)]'

4. ACTIVITY_EVENT_ICONS: Record<ActivityEventType, string>
   Map each ActivityEventType to a Lucide icon name:
   - email-sent: 'Send'
   - email-received: 'MailOpen'
   - meeting-scheduled: 'CalendarPlus'
   - meeting-completed: 'CalendarCheck'
   - document-shared: 'FileUp'
   - document-updated: 'FilePen'
   - workflow-triggered: 'Play'
   - workflow-completed: 'CircleCheck'
   - workflow-failed: 'CircleX'
   - note-added: 'StickyNote'
   - property-updated: 'Pencil'
   - entity-created: 'Plus'
   - relationship-added: 'Link'
   - task-created: 'ListTodo'
   - task-completed: 'CheckSquare'
   - milestone-reached: 'Trophy'
   - chat-mention: 'AtSign'

5. ACTIVITY_EVENT_COLORS: Record<ActivityEventType, string>
   Map each event type to a text color class:
   - email-*: 'text-blue-3'
   - meeting-*: 'text-chinese-3'
   - document-*: 'text-taupe-3'
   - workflow-completed: 'text-green'
   - workflow-failed: 'text-red'
   - workflow-triggered: 'text-violet-3'
   - note-added: 'text-amber'
   - property-updated: 'text-taupe-3'
   - entity-created: 'text-violet-3'
   - relationship-added: 'text-berry-3'
   - task-*: 'text-chinese-3'
   - milestone-reached: 'text-amber'
   - chat-mention: 'text-violet-3'

6. INSIGHT_ICONS: Record<EntityInsight['type'], string>
   - reminder: 'Bell'
   - alert: 'AlertTriangle'
   - opportunity: 'Sparkles'
   - anomaly: 'AlertCircle'
   - milestone: 'Trophy'

7. INSIGHT_COLORS: Record<EntityInsight['type'], string>
   - reminder: 'text-blue-3'
   - alert: 'text-amber'
   - opportunity: 'text-green'
   - anomaly: 'text-red'
   - milestone: 'text-violet-3'

Import the needed types from '~/services/types'.
After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PHASE 2: Core Components

The primary UI components — entity list, entity card, and the detail panel shell.

---

### PROMPT 2-A: Entity List Item + Entity Card

**Goal:** Create the two primary ways to display an entity in list and grid views
**Dependencies:** Phase 1 complete
**Files Created:** `app/components/rolodex/entity-list-item.tsx`, `app/components/rolodex/entity-card.tsx`

```
READ these files for exact patterns to follow:
- `app/components/workflows/workflow-card.tsx` (card component pattern — 3D borders,
  hover states, click handling, keyboard support, dark mode)
- `app/components/ui/kv-row.tsx` (key-value display pattern)
- `app/components/ui/status-dot.tsx` (status indicator pattern)
- `app/components/ui/badge.tsx` (CVA variant pattern)
- `app/components/ui/filter-pill.tsx` (pill styling reference)
- `app/lib/entity-constants.ts` (health colors)
- `app/data/mock-entities.ts` (read the schema to understand property types)

CREATE `app/components/rolodex/entity-list-item.tsx`:

This is a row component for the entity list view. Pattern: follow WorkflowCard's
structure but as a horizontal row instead of a card.

Props interface EntityListItemProps:
  - entity: Entity
  - schema: EntitySchema (to look up the EntityTypeDefinition for this entity)
  - onClick: (id: string) => void
  - className?: string

Structure (single row, ~80 lines):
- Outer div: role="button", tabIndex={0}, onClick/onKeyDown handlers (Enter/Space)
  Styling: bg-white, 3D beveled border (border-2 border-t-taupe-2 border-l-taupe-2
  border-b-taupe-3 border-r-taupe-3), mb-1, cursor-pointer, rounded-[var(--r-md)],
  hover:border-violet transitions, dark:bg-surface-1. Match WorkflowCard exactly.
  Use cn() for all class merging.

- Inner layout: flex items-center gap-3 px-3.5 py-2.5

  Left section (fixed width):
  - Entity type icon (from the EntityTypeDefinition, rendered in the type's color)
    as a 32x32 rounded-full div with the icon centered, bg tinted with the type's
    colorRgb at 0.1 alpha. If entity has avatarUrl, show that instead.

  Middle section (flex-1, min-w-0):
  - Row 1: entity.name in font-mono text-[0.8125rem] font-semibold text-taupe-5
  - Row 2: entity.subtitle in font-mono text-[0.6875rem] text-taupe-3

  Right section (flex, gap-3, items-center):
  - Summary properties: render up to 3 summaryProperties as small text spans.
    Look up each property ID in the entity's properties Record and the schema's
    property definitions to get the label. Format: label is hidden, just show value
    in font-mono text-[0.6875rem] text-taupe-3 separated by a • character.
    For currency values, format with $ and commas. For percentages, append %.
  - Health dot: if entity.health is not null, render a StatusDot-style span
    (8x8 rounded-full) using ENTITY_HEALTH_COLORS[entity.health].
    Add pulse animation for 'critical' status, gated with motion-reduce:animate-none.
  - Insight count: if entity.insights has non-dismissed items, show a small count
    badge (same style as the task count badge in app-header.tsx — min-w-[14px],
    rounded-[var(--r-sm)], bg-amber, text-white, font-mono text-[9px] font-bold).

CREATE `app/components/rolodex/entity-card.tsx`:

This is a card component for grid view. Follow WorkflowCard's exact structure.

Props interface EntityCardProps:
  - entity: Entity
  - schema: EntitySchema
  - onClick: (id: string) => void
  - className?: string

Structure (card, ~100 lines):
- Outer div: same 3D border styling as WorkflowCard, role="button", tabIndex={0},
  onClick/onKeyDown. Width is controlled by the grid parent (this card fills its cell).

  Header section (px-3.5 py-2.5, border-b border-taupe-1, dark:border-taupe-2,
  bg-[rgba(0,0,0,0.01)] dark:bg-[rgba(255,255,255,0.02)]):
  - Left: entity type icon (same circle as list item) + entity.name (font-mono
    text-[0.8125rem] font-semibold text-taupe-5)
  - Right: health badge if entity.health is not null. Show the health label text
    from the schema's healthIndicator.labels, styled with ENTITY_HEALTH_TEXT color
    and ENTITY_HEALTH_BG background. Font-mono text-[0.625rem] font-semibold,
    px-2 py-[3px], border, rounded-[var(--r-sm)].

  Body section (px-3.5 py-2.5):
  - entity.subtitle in font-sans text-[0.8125rem] text-taupe-4 dark:text-taupe-3
  - Summary properties rendered as KVRow-style rows (but inline — don't import KVRow,
    just match its styling). Show label + value for each summaryProperty.

  Footer section (px-3.5 pt-1.5 pb-2, border-t border-taupe-1 dark:border-taupe-2):
  - Left: entity type label as a small pill (same style as TriggerChip in workflow-card)
  - Right: insight count if any non-dismissed insights exist (amber badge)

Both components must:
- Work in both light and dark mode
- Have focus-visible:outline-2 focus-visible:outline-violet-3 states
- Use cn() from '~/lib/utils' for all class merging
- Import Entity and EntitySchema types from '~/services/types'
- Import ENTITY_HEALTH_COLORS, ENTITY_HEALTH_TEXT, ENTITY_HEALTH_BG from '~/lib/entity-constants'
- Be fully typed with TypeScript — no 'any'

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 2-B: Entity Detail Panel (Shell + Overview Tab)

**Goal:** Create the main entity detail panel with the Overview tab
**Dependencies:** Phase 1 complete + Prompt 2-A
**Files Created:** `app/components/rolodex/entity-detail-panel.tsx`, `app/components/rolodex/entity-property-section.tsx`, `app/components/rolodex/entity-insight-bar.tsx`

```
READ these files for patterns:
- `app/components/layout/cosimo-panel.tsx` (slide-over panel pattern)
- `app/components/ui/section-panel.tsx` (SectionPanel with art-stripe header)
- `app/components/ui/kv-row.tsx` (property display)
- `app/components/ui/tabs.tsx` (if it exists — for detail tabs)
- `app/components/brain/entity-detail.tsx` (current entity detail — to see what exists)
- `app/stores/entity-store.ts`
- `app/services/entities.ts`
- `app/lib/entity-constants.ts`

CREATE `app/components/rolodex/entity-insight-bar.tsx` (~80 lines):

Props interface EntityInsightBarProps:
  - insights: EntityInsight[]
  - onDismiss: (insightId: string) => void
  - className?: string

Render only non-dismissed insights. If none, return null.

Structure: a vertical stack of insight items (flex flex-col gap-1.5, px-4, py-2,
bg-[rgba(var(--amber-rgb),0.04)] border-b border-taupe-1 dark:bg-[rgba(var(--amber-rgb),0.06)]
dark:border-taupe-2).

Each insight item:
- flex items-start gap-2
- Left: Lucide icon from INSIGHT_ICONS[insight.type], size-3.5,
  colored with INSIGHT_COLORS[insight.type]. Import icons dynamically or use a
  simple icon map component.
- Middle (flex-1): insight.text in font-sans text-xs text-taupe-4 dark:text-taupe-3
  leading-relaxed
- Right: dismiss button (X icon, size-3, text-taupe-2, hover:text-taupe-4,
  cursor-pointer, rounded, focus-visible outline). onClick calls onDismiss(insight.id).

CREATE `app/components/rolodex/entity-property-section.tsx` (~100 lines):

Props interface EntityPropertySectionProps:
  - section: EntityDetailSection (from the schema)
  - properties: Record<string, string | string[] | null> (from the entity)
  - propertyDefs: EntityPropertyDefinition[] (from the schema's entity type)
  - className?: string

Structure: wrap in a SectionPanel component (import from '~/components/ui/section-panel').
Title is section.label.

Inside: render each propertyId from section.propertyIds as a KVRow. Look up the
property definition to get the label. Look up the value in properties.

Value formatting based on property type:
- currency: parse string to number, format with $ and commas (use Intl.NumberFormat)
- percentage: append '%'
- date: format ISO string to human-readable (use Intl.DateTimeFormat)
- email: render as a mailto link (text-violet-3 hover:underline)
- phone: render as a tel link
- url: render as clickable link with external icon
- enum: render as-is
- tags: render as a flex-wrap of small badge-style spans
- boolean: render as ✓ or —
- text/rich-text: render as-is
- null/undefined: render as '—' in text-taupe-2 italic

CREATE `app/components/rolodex/entity-detail-panel.tsx` (~200 lines):

This is the main detail view. It can render as a slide-over OR as full-page content
depending on entity-store's detailMode.

Props interface EntityDetailPanelProps:
  - entity: Entity
  - schema: EntitySchema
  - className?: string

Structure:

1. Header (sticky top, bg-white dark:bg-surface-1, border-b-2 with gradient border
   matching Brain's style: borderImage linear-gradient):
   - Close button (X icon) at top-right — calls useEntityStore selectEntity(null)
   - Entity type icon circle (40x40, same style as list item but larger)
   - entity.name in font-pixel text-lg text-taupe-5 tracking-[0.5px]
   - entity.subtitle in font-mono text-[0.6875rem] text-taupe-3
   - Health badge (if not null): same styling as entity-card header badge
   - Action buttons row: render primary actions from the entity type's actions array.
     Each as a Button (import from ui/button) with variant="outline" size="sm".
     Icon from Lucide. Non-primary actions go in a "..." dropdown (DropdownMenu).

2. Insight bar: render EntityInsightBar if there are any non-dismissed insights.
   onDismiss is a no-op for now (just log to console — real implementation comes later).

3. Detail tabs: use a simple tab bar (flex, border-b, gap-0):
   Four tabs: Overview, Timeline, Relationships, Linked
   Active tab: border-b-2 border-violet-3 text-violet-3
   Inactive: text-taupe-3 hover:text-taupe-5
   Use font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em]
   Tab state from useEntityStore (detailTab / setDetailTab)

4. Tab content (flex-1 overflow-y-auto):
   For now, only implement the OVERVIEW tab:
   - entity.aiSummary in a light-bg box (bg-[rgba(var(--violet-3-rgb),0.04)]
     rounded-[var(--r-md)] p-3 mb-3, font-sans text-[0.8125rem] text-taupe-4
     dark:text-taupe-3 leading-relaxed, border border-[rgba(var(--violet-3-rgb),0.1)])
   - Then render each detailSection from the entity type definition using
     EntityPropertySection
   - Placeholder divs for Timeline, Relationships, Linked tabs with EmptyState
     component saying "Coming soon"

Import everything from the correct paths:
- Entity, EntitySchema types from '~/services/types'
- useEntityStore from '~/stores/entity-store'
- SectionPanel from '~/components/ui/section-panel'
- KVRow from '~/components/ui/kv-row'
- Button from '~/components/ui/button'
- EmptyState from '~/components/ui/empty-state'
- cn from '~/lib/utils'
- ENTITY_HEALTH_COLORS, ENTITY_HEALTH_TEXT, ENTITY_HEALTH_BG from '~/lib/entity-constants'
- Lucide icons: X, MoreHorizontal, and any action icons needed

All components must work in both light and dark mode.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PHASE 3: Routes, Sidebar, and Navigation Integration

Wire the entity system into the app shell — new route, header tab, sidebar content.

---

### PROMPT 3-A: Rolodex Route + Header Tab

**Goal:** Create the Rolodex route and add it to the top navigation
**Dependencies:** Phase 1 + Phase 2
**Files Created:** `app/routes/_app.rolodex.tsx`
**Files Modified:** `app/routes.ts`, `app/components/layout/app-header.tsx`, `app/stores/ui-store.ts`

```
READ these files in full:
- `app/routes.ts` (route config)
- `app/routes/_app.workflows.tsx` (route pattern to follow — loader, layout, child check)
- `app/routes/_app.brain.tsx` (alternative route pattern)
- `app/components/layout/app-header.tsx` (header with TABS array, useActiveTab)
- `app/stores/ui-store.ts` (ViewMode type, currentMode)

STEP 1: Modify `app/stores/ui-store.ts`
Change the ViewMode type to include 'rolodex':
  type ViewMode = 'chat' | 'workflows' | 'rolodex' | 'brain';
Do NOT change anything else in this file.

STEP 2: Modify `app/routes.ts`
Add the rolodex route inside the layout("routes/_app.tsx", [...]) array,
between the workflows route and the brain layout. Add it as:
  route("rolodex", "routes/_app.rolodex.tsx"),
(No child routes for now — entity detail is handled by the store, not URL params.
We may add URL-based entity detail later.)

STEP 3: Create `app/routes/_app.rolodex.tsx`
Follow the _app.workflows.tsx pattern:

Imports: useState, useEffect from react; useNavigate from react-router;
relevant Lucide icons (List, Grid3x3, GitGraph, Search, SlidersHorizontal);
entity components (EntityListItem, EntityCard, EntityDetailPanel from rolodex/);
EmptyState from ui/; FilterPill from ui/; entity service functions; entity store;
Entity/EntitySchema types.

clientLoader function:
  Fetch schema and entities in parallel: getEntitySchema(), getEntities()
  Return { schema, entities }

Default export function RolodexRoute({ loaderData }):
  Destructure schema and entities from loaderData.
  Get store state: viewMode, activeTypeFilter, searchQuery, sortBy,
  selectedEntityId, selectEntity, setViewMode, setTypeFilter, setSearchQuery, setSortBy.

  Compute filteredEntities:
  1. Filter by activeTypeFilter if not null
  2. Filter by searchQuery (case-insensitive match on name, subtitle, property values)
  3. Sort by sortBy:
     - alphabetical: sort by name
     - last-activity: sort by lastActivityAt descending
     - health: sort critical first, then warning, then healthy, then null
     - created: sort by createdAt descending

  Find selectedEntity from entities array using selectedEntityId.

  Render:
  - Outer: flex h-full flex-col bg-off-white dark:bg-surface-0

  - Section header (matching Brain's exact pattern):
    px-4 py-2.5, border-b-2, bg-white dark:bg-surface-1, min-h-[44px]
    borderImage: linear-gradient(90deg, var(--taupe-2), var(--berry-2), var(--violet-2)) 1
    Left: schema.tabLabel in font-pixel text-base text-taupe-5 tracking-[0.5px]
    Right: view mode toggle buttons (List/Grid/Graph icons as Button variant="ghost"
    size="icon-xs", active one gets bg-[rgba(var(--violet-3-rgb),0.1)] text-violet-3)

  - Filter/search bar (px-4 py-2, flex items-center gap-2, border-b border-taupe-1
    dark:border-taupe-2, bg-white dark:bg-surface-1):
    - "All" FilterPill (active when activeTypeFilter is null)
    - One FilterPill per entity type in the schema (where showInNav is true),
      sorted by navOrder. Active when activeTypeFilter === type.id
    - Spacer (flex-1)
    - Search input: same styling as sidebar search input in app-sidebar.tsx,
      but smaller (h-7, text-[0.6875rem]). Has Search icon prefix.
      value={searchQuery} onChange={setSearchQuery}

  - Content area (flex-1 overflow-y-auto p-5 px-6):
    If filteredEntities.length === 0:
      Render EmptyState with title "No entities found", description based on
      whether filters are active ("Try adjusting your filters" vs
      "Connect your data sources to get started")
    If viewMode === 'list':
      Render filteredEntities.map(entity => EntityListItem) in a flex flex-col
    If viewMode === 'grid':
      Render in a grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3
      with EntityCard components
    If viewMode === 'graph':
      Render EmptyState with title "Graph view" description "Coming in Phase 6"

  - Entity detail slide-over:
    If selectedEntity is not null, render EntityDetailPanel in a slide-over container.
    Use a fixed overlay: fixed inset-0 z-50 flex justify-end.
    Backdrop: absolute inset-0 bg-black/20 dark:bg-black/40, onClick to deselect.
    Panel: relative w-[480px] max-w-[90vw] h-full bg-white dark:bg-surface-1
    shadow-xl overflow-hidden. Animate with transition-transform (translate-x-full
    when closed, translate-x-0 when open). Gate animation with
    motion-reduce:transition-none.

STEP 4: Modify `app/components/layout/app-header.tsx`
Find the TABS constant. Add a new entry between Workflows and the end:
  { label: "Rolodex", path: "/rolodex", icon: RolodexIcon }

Create a RolodexIcon SVG component matching the style of ChatIcon and WorkflowsIcon
(16x16 viewBox, stroke currentColor, strokeWidth 1.5, 12x12 rendered size).
Design: a simple contacts/rolodex icon — use a person-with-card motif or an
address book shape. Keep it minimal.

Find the useActiveTab function. Add a check:
  if (path.startsWith("/rolodex")) return "/rolodex";
Add this BEFORE the fallback return "/chat".

All changes must preserve EVERY existing behavior. Do not remove, rename, or
modify anything that already works.

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 3-B: Sidebar Rolodex Section

**Goal:** Show a contextual sidebar when on the Rolodex tab
**Dependencies:** Prompt 3-A
**Files Modified:** `app/components/layout/app-sidebar.tsx`

```
READ `app/components/layout/app-sidebar.tsx` in full.

The sidebar currently switches content based on isWorkflowsView:
- Workflows view → shows WorkflowList
- Everything else → shows ThreadList

Modify the content area of AppSidebar (inside <SidebarContent>) to handle THREE
cases:
1. isWorkflowsView → WorkflowList (unchanged)
2. isRolodexView → EntityQuickList (new)
3. default → ThreadList (unchanged)

Add: const isRolodexView = location.pathname.startsWith("/rolodex");

Add a check BEFORE isWorkflowsView in the conditional rendering.

For the Rolodex case, render an inline entity quick-list (no new component file needed,
keep it inline in app-sidebar.tsx to minimize files):

Structure:
- A list of entity names grouped by type, similar to how ThreadList shows threads
- For each entity type in the schema (sorted by navOrder, only showInNav types):
  - Type header: font-mono text-[0.625rem] font-semibold uppercase tracking-[0.12em]
    text-taupe-3 px-2.5 py-1 mt-2 first:mt-0
    (match the existing sidebar section header style)
  - Entity items: map entities of that type, render as clickable rows:
    - font-mono text-[11px] text-taupe-2 dark:text-taupe-4 no-underline
    - flex items-center gap-2 rounded-[var(--r-md)] px-2.5 py-[7px]
    - hover:bg-[rgba(var(--white-pure-rgb),0.06)] hover:text-taupe-1
    - Active state (selectedEntityId matches): bg-berry-5 text-berry-1 dark:text-berry-3
    - Health dot (4x4 rounded-full) on the right if entity.health is not null
    - onClick: set selectedEntityId in entity store
    - Match brain-nav-btn styling EXACTLY
  - Collapses properly with sidebar collapse (icon-only mode shows just type icons)

To get the data: You'll need the schema and entities. Import getEntitySchema and
getEntities from services. Use useState + useEffect to load them when isRolodexView
is true. This matches how the sidebar already works — it receives data via props for
threads/workflows, but since entities aren't loaded in _app.tsx's loader yet, load
them locally. This is fine for now.

Import useEntityStore for selectedEntityId and selectEntity.

Also update the Brain nav section label: change "Brain" to "Knowledge" in the
BrainNav component's span text. This is the first step of the Brain→Knowledge rename.

All other sidebar behavior must remain EXACTLY the same.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PHASE 4: Detail Panel Inner Tabs (Timeline, Relationships, Linked)

---

### PROMPT 4-A: Activity Timeline Tab

**Goal:** Build the timeline component for the entity detail panel
**Dependencies:** Phase 2-B (EntityDetailPanel exists with placeholder)
**Files Created:** `app/components/rolodex/activity-timeline.tsx`
**Files Modified:** `app/components/rolodex/entity-detail-panel.tsx` (replace Timeline placeholder)

```
READ:
- `app/components/rolodex/entity-detail-panel.tsx` (to find where Timeline placeholder is)
- `app/components/brain/memory-list.tsx` (for list rendering patterns with categories)
- `app/lib/entity-constants.ts` (ACTIVITY_EVENT_ICONS, ACTIVITY_EVENT_COLORS)

CREATE `app/components/rolodex/activity-timeline.tsx` (~150 lines):

Props:
  - entityId: string
  - className?: string

This component loads the timeline data itself using getEntityTimeline(entityId)
from the service layer. Use useState + useEffect to fetch on mount and when
entityId changes.

State:
- events: ActivityEvent[] (loaded from service)
- loading: boolean

If loading: render a subtle skeleton (3 rows of animated bg-taupe-1 rounded bars,
matching skeleton.tsx pattern if it exists, or simple pulse divs).

If events.length === 0: render EmptyState with title "No activity yet",
description "Activity will appear here as you interact with this entity."

If events exist, render a vertical timeline:

Structure: relative flex flex-col (the vertical line is a pseudo-element or a
thin absolute div on the left)

Timeline line: absolute left-[19px] top-0 bottom-0 w-px bg-taupe-1 dark:bg-taupe-2

Each event:
- flex gap-3 relative py-2.5 first:pt-0 last:pb-0
- Left: icon circle (38x38 rounded-full bg-white dark:bg-surface-1 border-2
  border-taupe-1 dark:border-taupe-2 flex items-center justify-center z-10).
  Inside: Lucide icon from ACTIVITY_EVENT_ICONS[event.type], size-4,
  colored with ACTIVITY_EVENT_COLORS[event.type].
  To render the right icon dynamically, create an icon map at the top of the file:
  import { Send, MailOpen, CalendarPlus, CalendarCheck, FileUp, FilePen, Play,
  CircleCheck, CircleX, StickyNote, Pencil, Plus, Link, ListTodo, CheckSquare,
  Trophy, AtSign } from 'lucide-react';
  const ICON_MAP = { Send, MailOpen, ... } and look up by ACTIVITY_EVENT_ICONS[type].

- Right (flex-1):
  - Row 1: event.title in font-mono text-[0.8125rem] font-semibold text-taupe-5
  - Row 2: event.description in font-sans text-xs text-taupe-3 leading-relaxed mt-0.5
  - Row 3: timestamp in font-mono text-[0.625rem] text-taupe-2 mt-1
    Format the ISO timestamp to relative time ("2 days ago", "1 week ago") using
    a simple helper function at the top of the file. Don't add a dependency —
    write a small formatRelativeTime(iso: string): string function that handles
    minutes/hours/days/weeks ago.
  - If event.refType exists: render a small clickable chip that says
    "View thread" / "View run" / "View document" etc. Style: text-violet-3
    text-[0.625rem] font-mono hover:underline cursor-pointer.
    onClick: for now, just console.log the refId. Real navigation comes in Phase 5.

MODIFY `app/components/rolodex/entity-detail-panel.tsx`:
Replace the Timeline tab placeholder with the real ActivityTimeline component.
Import ActivityTimeline from './activity-timeline'.
In the tab content section, when detailTab === 'timeline', render:
  <ActivityTimeline entityId={entity.id} />

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 4-B: Relationships Tab + Linked Tab

**Goal:** Build the relationships and linked items tabs
**Dependencies:** Phase 2-B, Phase 1
**Files Created:** `app/components/rolodex/relationships-tab.tsx`, `app/components/rolodex/linked-tab.tsx`
**Files Modified:** `app/components/rolodex/entity-detail-panel.tsx`

```
READ:
- `app/components/rolodex/entity-detail-panel.tsx`
- `app/components/brain/entity-detail.tsx` (existing pattern for showing related entities)
- `app/services/entities.ts` (getRelatedEntities)
- `app/services/types.ts` (Entity, EntityRelationship, RelationshipTypeDefinition)

CREATE `app/components/rolodex/relationships-tab.tsx` (~120 lines):

Props:
  - entity: Entity
  - schema: EntitySchema
  - onEntityClick: (entityId: string) => void
  - className?: string

Load related entities using getRelatedEntities(entity.id). useState + useEffect.

Group the entity's relationships by relationshipTypeId. For each group:

- Look up the RelationshipTypeDefinition from schema.relationshipTypes
- Determine the label to display: if direction is 'forward', use forwardLabel;
  if 'reverse', use reverseLabel. Capitalize first letter.
- Render as a section with:
  - Label: font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em]
    text-taupe-3 mb-1.5 mt-3 first:mt-0
  - Items: each related entity as a clickable row:
    - flex items-center gap-2.5 py-2 px-2 rounded-[var(--r-md)] cursor-pointer
      hover:bg-[rgba(var(--violet-3-rgb),0.04)] transition-colors
    - Type icon circle (24x24, same pattern as list item but smaller)
    - Entity name: font-mono text-[0.8125rem] text-taupe-5 font-semibold
    - Entity subtitle: font-mono text-[0.6875rem] text-taupe-3
    - Relationship metadata if present: font-mono text-[0.625rem] text-taupe-2 italic
    - onClick: calls onEntityClick(targetEntityId)

If no relationships: EmptyState "No relationships found"

CREATE `app/components/rolodex/linked-tab.tsx` (~150 lines):

Props:
  - entity: Entity
  - className?: string

This tab shows cross-references to other parts of the system.
It does NOT load data from services — it reads the linked*Ids from the entity.

Four sections, each only rendered if the entity has items:

1. Chat Threads (linkedThreadIds):
   - Section header: "Chat Threads" + count badge
   - Each thread as a row: thread icon (MessageSquare), thread ID as text
     (font-mono text-[0.8125rem] text-violet-3 hover:underline cursor-pointer)
   - onClick: for now, console.log('navigate to /chat/' + threadId)

2. Workflows (linkedWorkflowIds):
   - Section header: "Workflows" + count badge
   - Each workflow as a row: workflow icon (GitBranch), workflow ID as text
   - onClick: console.log('navigate to /workflows/' + workflowId)

3. Lessons (linkedLessonIds):
   - Section header: "Lessons" + count badge
   - Each lesson as a row: BookOpen icon, lesson ID as text
   - onClick: console.log('navigate to /brain/lessons/' + lessonId)

4. Tasks (linkedKanbanCardIds):
   - Section header: "Tasks" + count badge
   - Each task as a row: CheckSquare icon, task ID as text

Section header style: font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em]
text-taupe-3 flex items-center justify-between py-2 border-b border-taupe-1
dark:border-taupe-2

Count badge: same amber/taupe style as used elsewhere (min-w-[14px] rounded-[var(--r-sm)]
bg-taupe-4 dark:bg-surface-3 px-[5px] font-mono text-[9px] font-bold text-taupe-3)

Row style: flex items-center gap-2 py-2 px-2 rounded-[var(--r-md)]
hover:bg-[rgba(var(--violet-3-rgb),0.04)] cursor-pointer transition-colors

If entity has no linked items at all: EmptyState "No linked items"
If only some sections are empty: just skip those sections (don't show empty ones).

MODIFY `app/components/rolodex/entity-detail-panel.tsx`:
Replace Relationships and Linked tab placeholders with real components.
Import RelationshipsTab and LinkedTab.
- When detailTab === 'relationships': <RelationshipsTab entity={entity}
  schema={schema} onEntityClick={(id) => selectEntity(id)} />
- When detailTab === 'linked': <LinkedTab entity={entity} />

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PHASE 5: Actions, Entity Mentions, and Cross-Linking

---

### PROMPT 5-A: Entity Action System + Entity Mention Chip

**Goal:** Make entity actions functional and create a reusable entity mention chip
**Dependencies:** Phases 1-4
**Files Created:** `app/components/rolodex/entity-mention.tsx`
**Files Modified:** `app/components/rolodex/entity-detail-panel.tsx`, `app/components/rolodex/linked-tab.tsx`

```
READ:
- `app/components/rolodex/entity-detail-panel.tsx` (action buttons in header)
- `app/components/rolodex/linked-tab.tsx` (navigation placeholders)
- `app/stores/entity-store.ts`
- `app/stores/ui-store.ts` (for setMode)
- react-router's useNavigate pattern (see any route file)

CREATE `app/components/rolodex/entity-mention.tsx` (~60 lines):

This is a small inline chip that can be used ANYWHERE in the app to reference
an entity. Clicking it opens the entity detail panel.

Props:
  - entityId: string
  - displayName: string
  - typeId: string
  - className?: string

Render: an inline-flex span, styled as a clickable chip:
- font-mono text-[0.6875rem] font-semibold
- Colored by entity type: look up the color from the schema (but since we can't
  always have the schema in scope, accept a typeId and use a simple color map
  defined in entity-constants.ts). Add to entity-constants.ts if needed:
  ENTITY_TYPE_COLORS: Record<string, string> that maps common type IDs to text colors.
  Fallback to text-violet-3.
- Background: rgba of the type color at 0.06 alpha
- px-1.5 py-0.5 rounded-[var(--r-sm)]
- cursor-pointer hover:opacity-80 transition-opacity
- onClick: calls useEntityStore.getState().selectEntity(entityId)
  (use getState() since this component may be rendered outside React tree contexts)
  Also: if not already on /rolodex, don't navigate — just open the slide-over.
  The slide-over should work from any route. (This may require moving the slide-over
  rendering to _app.tsx level in a future prompt. For now, just set the selectedEntityId.)

MODIFY `app/components/rolodex/entity-detail-panel.tsx`:
Make the action buttons in the header functional:

For each action rendered in the header:
- 'start-chat': navigate to /chat (new thread). For now: navigate('/chat').
  Also close the entity panel.
- 'trigger-workflow': if action.target exists, navigate to /workflows/{target}.
  For now, just navigate and close panel.
- 'compose-email': open mailto link using entity's email property if available.
  window.open('mailto:' + entity.properties.email)
- 'add-note': for now, log to console. Will integrate with memory system later.
- 'schedule-meeting': log to console. Future calendar integration.
- 'external-link': if action.target contains {{property-id}}, interpolate from
  entity.properties. Then window.open(url, '_blank').
- 'create-task': log to console. Future kanban integration.

MODIFY `app/components/rolodex/linked-tab.tsx`:
Replace all console.log navigation placeholders with actual useNavigate() calls:
- Thread: navigate('/chat/' + threadId)
- Workflow: navigate('/workflows/' + workflowId)
- Lesson: navigate('/brain/lessons/' + lessonId)
- Task: log to console (kanban doesn't exist yet)

Import useNavigate from 'react-router'. When navigating away from rolodex,
also call useEntityStore.getState().selectEntity(null) to close the detail panel.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PHASE 6: Graph View Migration + Knowledge Tab Rename

---

### PROMPT 6-A: Knowledge Tab Rename + Graph View Placeholder

**Goal:** Complete the Brain → Knowledge rename and set up the graph view
**Dependencies:** Phases 1-5
**Files Modified:** `app/routes/_app.brain.tsx`, `app/components/layout/app-sidebar.tsx`, `app/components/layout/app-header.tsx`

```
READ:
- `app/routes/_app.brain.tsx`
- `app/components/layout/app-sidebar.tsx` (BrainNav component)
- `app/components/layout/app-header.tsx` (check if Brain appears in any tab labels)
- `app/routes.ts` (brain route paths — these stay as /brain/* for now, no URL changes)

This prompt does a COSMETIC rename only. We are NOT changing route paths or file
names — just display labels.

MODIFY `app/routes/_app.brain.tsx`:
In the BRAIN_SECTIONS constant:
- Remove the "Data Graphs" entry entirely. The graph is now in Rolodex.
  Only keep Memory and Lessons.
- The section header will now only show Memory or Lessons.
  (The graph route still exists in routes.ts but will redirect to Rolodex later.)

MODIFY `app/components/layout/app-sidebar.tsx`:
In the BrainNav component:
- Change the header label text from "Brain" to "Knowledge"
- Remove the Graphs item from brainItems array. Only keep Memory and Lessons.
- Change aria-labels from "Brain nav" to "Knowledge nav"

MODIFY `app/components/layout/app-header.tsx`:
IF there is any reference to "Brain" in the header tabs or UI, update it to
"Knowledge". (Based on my reading, Brain doesn't appear in the header TABS constant,
but check and update if it does.)

VERIFY: The Rolodex tab should now have a graph view mode toggle button (from
Phase 3-A). Update the graph view mode in _app.rolodex.tsx so that instead of
showing an EmptyState, it shows a message:
"Entity graph view — migrating from Brain. Full graph visualization coming soon."
Use EmptyState with icon={<Network className="size-10" />} (import Network from
lucide-react).

Do NOT rename any files, change any route paths, or modify any imports that
reference brain/Brain paths. This is display-label only.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PHASE 7: Error States, Edge Cases, and Polish

---

### PROMPT 7-A: Error States + Loading States + Accessibility

**Goal:** Add comprehensive error handling, loading states, and accessibility
**Dependencies:** All previous phases
**Files Modified:** `app/routes/_app.rolodex.tsx`, `app/components/rolodex/entity-detail-panel.tsx`, `app/components/rolodex/activity-timeline.tsx`, `app/components/rolodex/relationships-tab.tsx`

```
READ:
- `app/routes/_app.tsx` (ErrorBoundary pattern — EXACT pattern to follow)
- `app/components/ui/error-boundary-content.tsx`
- `app/components/ui/empty-state.tsx`
- `app/routes/_app.rolodex.tsx`
- `app/components/rolodex/entity-detail-panel.tsx`

This prompt adds three things: error boundaries, loading skeletons, and
accessibility attributes.

MODIFY `app/routes/_app.rolodex.tsx`:

1. Add an ErrorBoundary export matching _app.tsx's pattern:
   export function ErrorBoundary() { ... }
   Use ErrorBoundaryContent if it exists, otherwise match _app.tsx's pattern with
   Alert, AlertTitle, AlertDescription, and a Reload button.

2. Add loading state: the clientLoader is async. While it loads, the route should
   show a skeleton. Add a HydrateFallback export:
   export function HydrateFallback() {
     return a skeleton matching the Rolodex layout: header bar skeleton, filter
     bar skeleton, and 5 list item skeletons (rectangles with pulse animation).
     Use bg-taupe-1 dark:bg-surface-3 rounded-[var(--r-md)] animate-pulse.
     Gate pulse with motion-reduce:animate-none.
   }

3. Keyboard navigation: ensure the entity list supports arrow key navigation.
   Add onKeyDown handler to the list container that moves focus between
   EntityListItem/EntityCard elements using ArrowUp/ArrowDown. Use
   document.activeElement and element.focus() — don't add a dependency.

MODIFY `app/components/rolodex/entity-detail-panel.tsx`:

1. Add keyboard support: Escape key closes the panel. Add useEffect with
   keydown listener for Escape that calls selectEntity(null). Clean up on unmount.

2. Aria attributes:
   - Panel container: role="dialog" aria-label="{entity.name} details"
     aria-modal="true" (when in slide-over mode)
   - Close button: aria-label="Close entity details"
   - Tab buttons: role="tab" aria-selected={isActive}
   - Tab content: role="tabpanel"
   - Action buttons: aria-label with descriptive text

3. Focus trap: when panel opens in slide-over mode, focus the close button.
   Use useEffect with a ref on the close button, calling .focus() on mount.

MODIFY `app/components/rolodex/activity-timeline.tsx`:

1. Error handling: wrap the fetch in try/catch. On error, show a small inline
   error message: "Failed to load timeline" with a Retry button.

2. Aria: add role="feed" on the timeline container, aria-label="Activity timeline"

MODIFY `app/components/rolodex/relationships-tab.tsx`:

1. Error handling: wrap the fetch in try/catch. Show error state on failure.

2. Aria: each relationship group gets role="list", each item role="listitem"

ALL CHANGES must:
- Preserve existing behavior
- Work in both light and dark mode
- Gate all animations with motion-reduce:animate-none
- Use focus-visible (not focus) for outline states
- Use cn() for all conditional classes

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 7-B: Final Polish + Global Slide-Over + Verification

**Goal:** Move the entity detail slide-over to app level so it works from any route, and final verification
**Dependencies:** All previous phases
**Files Modified:** `app/routes/_app.tsx`, `app/routes/_app.rolodex.tsx`

```
READ:
- `app/routes/_app.tsx` (the app shell layout)
- `app/routes/_app.rolodex.tsx` (where the slide-over currently lives)
- `app/components/layout/cosimo-panel.tsx` (existing slide-in panel — pattern reference)
- `app/components/rolodex/entity-detail-panel.tsx`
- `app/stores/entity-store.ts`
- `app/services/entities.ts`

The entity detail slide-over currently only renders inside the Rolodex route.
But entity mentions (from Phase 5-A) can appear in Chat, Workflows, or Knowledge.
When clicked, the entity detail needs to open from ANY route.

STEP 1: Modify `app/routes/_app.tsx`

Add the entity detail slide-over to the app shell, alongside the existing
CosimoPanel. It should render AFTER CosimoPanel in the DOM.

Add imports:
- useEntityStore from stores
- getEntity, getEntitySchema from services
- EntityDetailPanel from components/rolodex/
- Entity, EntitySchema types
- useState, useEffect from react
- X from lucide-react

Add state: selectedEntityId from entity store. When it's not null, fetch the
entity and schema using useState + useEffect. Render the slide-over.

Slide-over pattern — follow CosimoPanel's exact approach but simpler:
- Conditional rendering based on selectedEntityId !== null
- Fixed overlay: fixed inset-0 z-50 flex justify-end
- Backdrop: absolute inset-0 bg-black/20 dark:bg-black/40
  onClick closes (selectEntity(null))
- Panel: relative w-[480px] max-w-[90vw] h-full bg-white dark:bg-surface-1
  shadow-[-4px_0_24px_rgba(0,0,0,0.12)] overflow-hidden
  border-l border-taupe-2 dark:border-surface-3
- Transition: use a data attribute approach or simple conditional translate.
  transition-transform duration-200 ease-out. When open: translate-x-0.
  Gate with [data-a11y-motion="reduce"]:transition-none.
- Inside: <EntityDetailPanel entity={entity} schema={schema} />

Add loading state: while entity/schema are being fetched, show a skeleton
inside the panel.

STEP 2: Modify `app/routes/_app.rolodex.tsx`

Remove the inline slide-over rendering from the Rolodex route. The entity detail
is now handled globally in _app.tsx. The Rolodex route only renders the list/grid/graph
content. The selectedEntityId store still controls everything — clicking an entity
in the list still calls selectEntity(id), and the global slide-over picks it up.

STEP 3: Update the _app.tsx clientLoader

Add getEntitySchema() to the parallel fetch in the clientLoader:
  const [threads, runs, templates, entitySchema] = await Promise.all([
    getThreads(), getAllRuns(), getTemplates(), getEntitySchema(),
  ]);
  return { threads, runs, templates, entitySchema };

Pass entitySchema to the slide-over component so it doesn't need to re-fetch.

STEP 4: Verification

After all changes, run:
  npx tsc --noEmit

Then manually verify by checking these scenarios work correctly (describe what
should happen, don't actually test in a browser):

1. Navigate to /rolodex — entity list renders with filter pills and list items
2. Click an entity — detail panel slides in from right
3. Press Escape — detail panel closes
4. Click backdrop — detail panel closes
5. Click "Ask Cosimo" action — navigates to /chat, panel closes
6. Click a linked thread in the Linked tab — navigates to chat thread
7. Navigate to /chat — if entity was selected, slide-over still shows
   (now it's global). Click backdrop to close.
8. On /brain/memory — entity mention chips (if any) can open the slide-over
9. Dark mode — everything works
10. Reduced motion — transitions are disabled

If npx tsc --noEmit passes with 0 errors, the build is complete.
```

---
---

## APPENDIX: File Inventory

### New Files Created (14 total)
```
app/data/mock-entities.ts           — Mock schema, entities, timelines
app/lib/entity-constants.ts         — Color maps, icon maps, health styling
app/services/entities.ts            — Service layer (async mock wrappers)
app/stores/entity-store.ts          — Zustand store for entity UI state
app/routes/_app.rolodex.tsx         — Rolodex route (list/grid + filters)
app/components/rolodex/entity-list-item.tsx    — List view row
app/components/rolodex/entity-card.tsx         — Grid view card
app/components/rolodex/entity-detail-panel.tsx — Detail panel shell + overview
app/components/rolodex/entity-insight-bar.tsx  — Dismissible insight strip
app/components/rolodex/entity-property-section.tsx — Property group in detail
app/components/rolodex/activity-timeline.tsx   — Chronological event list
app/components/rolodex/relationships-tab.tsx   — Related entities tab
app/components/rolodex/linked-tab.tsx          — Cross-references tab
app/components/rolodex/entity-mention.tsx      — Inline entity chip
```

### Existing Files Modified (7 total)
```
app/services/types.ts               — Add ~20 new type definitions (append only)
app/stores/ui-store.ts              — Add 'rolodex' to ViewMode union
app/routes.ts                       — Add rolodex route
app/routes/_app.tsx                 — Add global entity slide-over + schema to loader
app/components/layout/app-header.tsx — Add Rolodex tab to TABS + useActiveTab
app/components/layout/app-sidebar.tsx — Add rolodex sidebar content + rename Brain→Knowledge
app/routes/_app.brain.tsx           — Remove Graphs from sections (moved to Rolodex)
```

### Dependency Graph
```
Prompt 1-A (types) ──────────────────────────────────────────┐
Prompt 1-B (mock data) ─── depends on 1-A                   │
Prompt 1-C (service + store) ─── depends on 1-A, 1-B        │
Prompt 1-D (constants) ─── depends on 1-A                   │
                                                             │
Prompt 2-A (list item + card) ─── depends on Phase 1        │
Prompt 2-B (detail panel) ─── depends on Phase 1, 2-A       │
                                                             │
Prompt 3-A (route + header) ─── depends on Phase 1, Phase 2 │
Prompt 3-B (sidebar) ─── depends on 3-A                     │
                                                             │
Prompt 4-A (timeline) ─── depends on 2-B                    │
Prompt 4-B (relationships + linked) ─── depends on 2-B      │
                                                             │
Prompt 5-A (actions + mentions) ─── depends on Phase 4      │
                                                             │
Prompt 6-A (rename + graph placeholder) ─── depends on 3-B  │
                                                             │
Prompt 7-A (error states + a11y) ─── depends on all above   │
Prompt 7-B (global slide-over + verification) ─── FINAL     │
```
