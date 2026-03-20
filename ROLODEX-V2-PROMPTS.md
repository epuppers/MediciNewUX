# Rolodex V2 — Claude Code Plan-Mode Prompts

## Build-On-Foundation Strategy

These prompts MODIFY existing files. The Rolodex v1 is already built (14 files across data, services, stores, components, and routes). These prompts refine, extend, and upgrade — they do NOT rewrite from scratch.

### How to Use

Feed each prompt to Claude Code in **plan mode**. Let it generate a plan, review, then execute. Run `npx tsc --noEmit` after each prompt completes. The prompts are ordered — later prompts depend on earlier ones.

### Who Uses This Product

These are the real people sitting on the other side of this screen:

- **Sarah Chen** is a Fund CFO at a PE firm. She manages 3 funds, 14 LPs, and has K-1 season breathing down her neck. She's drowning in Excel and needs to see — at a glance — which entities need attention RIGHT NOW. She doesn't browse a list for fun. She opens Rolodex because something needs doing.

- **Kris** is an Investment Partner at Hilgard. He juggles 5 active deals, 15 portfolio companies, and context-switches between them constantly. He needs "instant answers during IC meetings." When he opens an entity, he needs the full picture in 2 seconds — not a form to scroll through.

- **The Associate** lives in Excel 60+ hours a week. Data room organization, model building, comp analysis. They need Rolodex to show them relationships between entities they didn't even know existed, and to kick off workflows that save them from 11pm nights.

- **Genie & Alexis** at Tenner run client operations. 50+ customized client emails per week, 100+ templates. They need batch workflows visible at the entity level — "I ran the K-1 workflow for 14 LPs, but CalPERS had an exception, let me see it."

Every UI decision below is made with these people in mind.

### Pattern Rules (Inherited by ALL Prompts)

Every prompt inherits these rules from CLAUDE.md. Claude Code must follow them for every file:

1. **Imports**: `~/` path alias for all internal imports. Group: React → external libs → internal.
2. **Class merging**: Always use `cn()` from `~/lib/utils`. Never concatenate class strings.
3. **Data slots**: `data-slot="component-name"` on root elements.
4. **Dark mode**: Every bg, text, border class must have a `dark:` variant.
5. **Animations**: Gate ALL with `motion-reduce:animate-none` or `motion-reduce:transition-none`.
6. **Focus states**: `focus-visible:` (not `focus:`) on all interactive elements.
7. **Keyboard**: Every clickable div needs `role="button"`, `tabIndex={0}`, `onKeyDown` for Enter/Space.
8. **No custom CSS**: Tailwind utilities only. No `style={}` except the existing gradient borderImage pattern.
9. **Design tokens**: All colors from CSS custom properties. No raw hex/rgb.
10. **Fonts**: `font-[family-name:var(--pixel)]` for headings, `font-[family-name:var(--mono)]` (or `font-mono`) for labels/data, `font-sans` for body text.
11. **Types**: Full TypeScript. No `any`.
12. **Existing components**: Check `/app/components/ui/` before building anything. Use ShadCN components. Use `SectionPanel`, `KVRow`, `FilterPill`, `EmptyState`, `Button`, `DropdownMenu`.
13. **Bug fix protocol**: Minimal diff. Match surrounding patterns. No drive-by refactors.

---
---

## PROMPT SET 1: Attention Dashboard + Insight-First Landing

### The Problem

The current Rolodex landing (`_app.rolodex.tsx`) is a flat list/grid browser. It's a phone book. Nobody opens a phone book in the morning — they open it when they already know who they're looking for.

For Sarah Chen, opening Rolodex should feel like checking her command center: "Fund III's Q4 report is 3 days overdue. CalPERS re-up is coming in Q4. David Park hasn't been contacted in 22 days." THEN she can browse the list.

### PROMPT 1A — Attention Summary Banner

**Goal:** Add a collapsible "Needs Attention" summary at the top of the Rolodex route, above the filter bar. This is the first thing the user sees.

**Files Modified:** `app/routes/_app.rolodex.tsx`
**Files Created:** `app/components/rolodex/attention-banner.tsx`

```
READ these files completely:
- app/routes/_app.rolodex.tsx (the current rolodex route — you'll modify this)
- app/components/rolodex/entity-insight-bar.tsx (insight rendering pattern)
- app/components/rolodex/entity-list-item.tsx (entity rendering pattern)
- app/lib/entity-constants.ts (health colors, insight icons/colors)
- app/services/entities.ts (data access pattern)
- app/data/mock-entities.ts (first 100 lines — schema + entity structure)
- app/components/ui/section-panel.tsx (if it exists — collapsible panel pattern)

CREATE `app/components/rolodex/attention-banner.tsx`:

This is a compact, information-dense banner that summarizes what needs the user's
attention across ALL entities. Think of it as the "morning briefing" — the reason
Sarah Chen opens Rolodex.

Props interface:
- entities: Entity[]
- schema: EntitySchema
- onEntityClick: (entityId: string) => void
- className?: string

The component computes three things from the entity array:

1. HEALTH ALERTS: entities where health === 'warning' or 'critical'
   Group by health status. Show critical first, then warning.
   For each: entity icon + name + health label from schema (e.g., "Overdue", "Cold")
   Clicking navigates to that entity (calls onEntityClick).

2. ACTIVE INSIGHTS: gather all non-dismissed insights across all entities.
   Show the top 3 most recent (by generatedAt). Each shows:
   insight icon + insight text + entity name as a clickable suffix.

3. SUMMARY COUNTS: a single line like:
   "6 contacts · 4 funds · 3 LPs · 2 properties — 2 need attention"
   The "2 need attention" part uses text-amber if warnings, text-red if any critical.

Layout structure:
- Outer container: full width, bg-[rgba(var(--violet-3-rgb),0.03)]
  dark:bg-[rgba(var(--violet-3-rgb),0.06)], border-b border-taupe-1 dark:border-surface-3,
  px-4 py-3.
- If there are zero health alerts and zero insights, render ONLY the summary counts
  line — keep it minimal. No empty state needed.
- If there ARE alerts/insights, show two sections:

  TOP ROW — health alert chips (horizontal scroll if overflow):
  Each chip is a small inline-flex item:
  - 6px health dot (use ENTITY_HEALTH_COLORS)
  - entity name (font-mono text-[0.75rem] font-semibold)
  - health label in parentheses (font-mono text-[0.6875rem] text-taupe-3)
  - cursor-pointer, hover state, focus-visible ring
  - Chips wrap on mobile, horizontal scroll on desktop if > 5

  BOTTOM ROW — insight preview:
  Show up to 3 insights in a compact list. Each is:
  - Insight icon (use INSIGHT_ICONS from entity-constants, resolve to Lucide component)
  - Insight text (truncated to 1 line, font-sans text-[0.8125rem])
  - "— {entity name}" suffix (font-mono text-[0.6875rem] text-taupe-3, clickable)

- A "Dismiss all" text button (font-mono text-[0.625rem] text-taupe-3 uppercase)
  in the top-right corner that will eventually clear seen insights (for now, console.log).

- The entire banner is collapsible. Add a small toggle — a ChevronUp/ChevronDown icon
  in the top-right area. When collapsed, only show the summary counts line.
  Store collapsed state in component-level useState (not in the entity store — this
  is session-level UI state).

Style requirements:
- Match the visual density of entity-insight-bar.tsx (compact, not spacious)
- Health chips should feel like the FilterPill component but smaller and status-colored
- The whole banner should feel URGENT but not alarming — think Bloomberg terminal, not
  red-alert klaxon
- Must work perfectly in dark mode

MODIFY `app/routes/_app.rolodex.tsx`:

Import AttentionBanner. Render it between the section header and the filter bar.
Pass entities, schema, and a callback that calls selectEntity.

The banner should NOT re-render when filters change — it always shows the full
picture across ALL entities (not the filtered subset). Use the raw `entities` from
loaderData, not the `filtered` variable.

After you are done, run `npx tsc --noEmit` to verify no type errors.
```

---

### PROMPT 1B — Smarter List Item with Inline Insight Preview

**Goal:** Upgrade EntityListItem to show the most important insight inline, and make the health indicator more informative.

**Files Modified:** `app/components/rolodex/entity-list-item.tsx`

```
READ these files:
- app/components/rolodex/entity-list-item.tsx (the file you'll modify)
- app/components/rolodex/entity-card.tsx (for consistency reference)
- app/lib/entity-constants.ts (ENTITY_HEALTH_COLORS, INSIGHT_ICONS, INSIGHT_COLORS)
- app/data/mock-entities.ts (look at entity.insights structure — first 200 lines)

MODIFY `app/components/rolodex/entity-list-item.tsx`:

The current list item shows: icon | name + subtitle | summary values · health dot · insight count badge.

This is fine for a phone book. But Sarah Chen doesn't scan a list to count badges — she
needs to see WHY something needs attention without clicking into it.

Changes:

1. HEALTH INDICATOR upgrade:
   Replace the tiny 2px health dot with a more informative indicator.
   When health is non-null, show a small pill to the left of the summary values:
   - Use ENTITY_HEALTH_BG[health] for background, ENTITY_HEALTH_TEXT[health] for text
   - Show the health LABEL from the schema (e.g., "Active", "Overdue", "Cold"), not
     just a dot. Font-mono text-[0.5625rem] uppercase tracking-[0.05em] font-semibold
     px-1.5 py-[1px] rounded-[var(--r-sm)].
   - If health is 'critical', add a subtle pulse animation (gated with motion-reduce).

   To get the health label, the component needs the schema's healthIndicator.labels
   for the entity's type. The schema is already passed as a prop. Look up
   typeDef.healthIndicator?.labels?.[entity.health].

2. INLINE INSIGHT PREVIEW:
   If the entity has non-dismissed insights, show the FIRST (most important) one
   as a second line below the subtitle. Structure:
   - Only show if there's at least 1 non-dismissed insight
   - Rendered as a new row below the name/subtitle div
   - Layout: insight icon (size-3, colored per INSIGHT_COLORS) + insight text
     (font-sans text-[0.6875rem] text-taupe-4 dark:text-taupe-3 truncate, max 1 line)
   - If there are MORE insights beyond the first, append "+ {n} more" in
     text-taupe-2 font-mono text-[0.5625rem] at the end

3. KEEP the insight count badge on the right side — it's still useful as a quick
   scan indicator. But now the user can also READ the most important insight without
   clicking.

4. SUBTLE RELATIONSHIP COUNT:
   After the summary values, before the health pill, add a small count of
   relationships: e.g., "4↔" using font-mono text-[0.625rem] text-taupe-2.
   Only show if entity.relationships.length > 0. Use the ↔ character (or the
   Link icon from lucide at size-2.5 with the count next to it).

Do NOT change the overall structure of the component — same container, same
click handler, same keyboard handling, same data-slot. Just enhance the content
inside.

The insight text line should have a max-height transition so it doesn't cause
layout jank. Or better: just always reserve the space with min-h if insights exist.
Actually, simplest approach: make the component slightly taller when insights are
present by adding a conditional wrapper. The list should feel scannable, not
cramped.

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 1C — Grid Card Upgrade: Contextual Intelligence

**Goal:** Make the entity grid card surface actionable intelligence, not just data.

**Files Modified:** `app/components/rolodex/entity-card.tsx`

```
READ these files:
- app/components/rolodex/entity-card.tsx (the file you'll modify)
- app/components/rolodex/entity-list-item.tsx (for consistency with 1B changes)
- app/lib/entity-constants.ts (INSIGHT_ICONS, INSIGHT_COLORS)

MODIFY `app/components/rolodex/entity-card.tsx`:

The current card shows: icon + name + health badge | subtitle + summary properties | type pill + insight count. This is a database record card.

Upgrade it to surface intelligence:

1. INSIGHT SECTION:
   After the summary properties and before the footer, add an insight preview area.
   If the entity has non-dismissed insights, show up to 2 of them:
   - Each insight: icon (size-3) + text (font-sans text-[0.6875rem] truncate)
   - Separated from properties by a thin border-t border-taupe-1 dark:border-taupe-2
   - Compact: px-3.5 py-2
   - If more than 2, show "+ {n} more" text

2. RELATIONSHIP PREVIEW:
   In the footer, after the entity type pill, add a compact relationship summary.
   Show up to 3 tiny avatar circles (overlapping, like GitHub contributor avatars):
   Each is a 16px circle with the entity type icon of the related entity, colored
   by its type color. Overlap them by -4px margin-left on each after the first.
   After the circles, show total count if > 3 (e.g., "+2").
   This is purely visual — shows at a glance how connected this entity is.

3. COSIMO SUMMARY:
   Replace the subtitle text with entity.aiSummary (truncated to 2 lines) when
   available. The subtitle is generic ("CFO, Meridian Capital") — the AI summary
   is more useful ("Sarah manages Fund III and Fund IV reporting. K-1 season is
   her current priority."). Fall back to subtitle if no aiSummary.
   Use font-sans text-[0.6875rem] text-taupe-3 line-clamp-2.

Keep the same overall card structure, borders, hover states, keyboard handling.
Just enrich what's inside.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PROMPT SET 2: Entity Detail Panel — Relationship Intelligence

### The Problem

The current detail panel is a form viewer with tabs. It shows data. But Kris the Investment Partner doesn't want to READ a form — he wants to UNDERSTAND the entity's context in 2 seconds. "What's happening with Fund III? Who's involved? What's overdue? What can Cosimo do about it?"

### PROMPT 2A — Overview Tab: From Form to Intelligence Brief

**Goal:** Transform the Overview tab from a property-form display into a relationship intelligence brief.

**Files Modified:** `app/components/rolodex/entity-detail-panel.tsx`

```
READ these files:
- app/components/rolodex/entity-detail-panel.tsx (the file you'll modify)
- app/components/rolodex/entity-property-section.tsx (current property display)
- app/components/rolodex/entity-insight-bar.tsx (insight display)
- app/components/rolodex/relationships-tab.tsx (relationship display pattern)
- app/services/entities.ts (getRelatedEntities function)
- app/data/mock-entities.ts (entity.aiSummary, entity.relationships structure)
- app/stores/entity-store.ts (store actions)

MODIFY `app/components/rolodex/entity-detail-panel.tsx`:

The overview tab currently shows: AI Summary box → Property sections.

Restructure the overview tab content to prioritize intelligence over data entry:

1. COSIMO BRIEF (keep, but enhance):
   The existing AI Summary box stays, but rename the label from "AI Summary" to
   "Cosimo Brief" — there is no "AI" in this product, only Cosimo. Change the
   Sparkles icon label text from "AI Summary" to "Cosimo Brief".

   Below the summary text, add a small "Ask Cosimo about {entity.name}" link
   (font-mono text-[0.625rem] text-violet-3 hover:underline cursor-pointer).
   Clicking this should: selectEntity(null) then navigate to /chat.
   (In the future this will pre-fill context — for now just navigate.)

2. KEY METRICS STRIP (new):
   After the Cosimo Brief, add a horizontal strip of 3-4 key metrics pulled from
   summaryProperties. Display them as compact stat blocks in a row:
   - Use a flex container with gap-3
   - Each block: label (font-mono text-[0.5625rem] uppercase text-taupe-3) on top,
     value (font-mono text-[1rem] font-bold text-taupe-5) below
   - For currency values, use compact format ($420M instead of $420,000,000).
     Write a small helper: if number >= 1_000_000_000 use "B", >= 1_000_000 use "M",
     >= 1_000 use "K".
   - This gives Kris his "2-second glance" without reading a form.

3. QUICK RELATIONSHIPS (new):
   After the metrics strip, add a "Key Relationships" section that shows the
   top 3-4 related entities inline (without switching to the Relationships tab).
   - Section header: "Connected To" (font-mono text-[0.625rem] uppercase tracking)
   - Each relationship row: entity type icon (size-5, rounded-full, colored bg) +
     entity name (font-mono text-[0.8125rem] font-semibold) + relationship label
     (font-mono text-[0.6875rem] text-taupe-3, e.g., "manages", "invested in")
   - Rows are clickable — call selectEntity(relatedEntityId) to navigate
   - If > 4 relationships, show a "View all {n} relationships →" link that
     switches to the relationships tab (setDetailTab('relationships'))
   - To get related entity names, you need to call getRelatedEntities. Add a
     useState + useEffect in the overview section that fetches them. Use the
     same loading/error pattern as relationships-tab.tsx but lighter (inline
     skeleton, no full error boundary).

4. PROPERTY SECTIONS (keep, move down):
   The existing EntityPropertySection blocks stay — but they move BELOW the
   intelligence sections. They're the reference data, not the headline.
   Optionally wrap them in a collapsible section that defaults to collapsed,
   with a "Show All Properties" toggle (ChevronDown icon). This keeps the
   panel focused on intelligence while still making data accessible.

Do NOT change the header, tab bar, insight bar, or other tabs. Only modify the
content rendered when detailTab === 'overview'.

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 2B — Timeline Tab: Richer Events with Drill-Through

**Goal:** Make timeline events actually navigable, and add date grouping.

**Files Modified:** `app/components/rolodex/activity-timeline.tsx`

```
READ these files:
- app/components/rolodex/activity-timeline.tsx (the file you'll modify)
- app/data/mock-entities.ts (MOCK_ENTITY_TIMELINES — search for the variable)
- app/services/types.ts (ActivityEvent interface — search for "ActivityEvent")

MODIFY `app/components/rolodex/activity-timeline.tsx`:

Two problems:
1. Events are a flat list with no date grouping — hard to scan.
2. "View thread" and "View run" buttons just console.log — they don't navigate.

Changes:

1. DATE GROUPING:
   Group events by date. Use these group labels:
   - "Today" if same calendar day
   - "Yesterday" if previous calendar day
   - "This Week" if same ISO week but not today/yesterday
   - Otherwise, show the date formatted as "Mon, Mar 15"

   Render each group with a sticky date header:
   - font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-taupe-2
   - Sticky top-0 z-10 bg-white dark:bg-surface-1 py-1
   - Thin line extending to the right (use a pseudo-element approach with
     Tailwind's after: modifier, or just a border-b)

2. DRILL-THROUGH NAVIGATION:
   Replace the console.log on "View thread" / "View run" buttons with real navigation.
   Import useNavigate from react-router.
   Import useEntityStore for selectEntity.

   Navigation map based on refType:
   - 'thread' → selectEntity(null), then navigate(`/chat/${event.refId}`)
   - 'workflow-run' → selectEntity(null), then navigate(`/workflows/${event.refId}`)
   - 'document' → console.log (still placeholder — document viewer doesn't exist yet)
   - 'lesson' → selectEntity(null), then navigate(`/brain/lessons/${event.refId}`)
   - 'kanban-card' → console.log (placeholder)

   Make the "View" button look more like a link: remove the button styling,
   use just a text link (text-violet-3 text-[0.625rem] font-mono hover:underline).

3. INVOLVED ENTITIES:
   If event.involvedEntityIds has entries, show them as small clickable chips
   below the event description. Use the same style as EntityMention
   (font-mono text-[0.6875rem], type-colored bg tint). Clicking calls
   selectEntity(involvedEntityId).

   To resolve entity names from IDs, you'll need access to the entities array.
   Add an optional prop `entities?: Entity[]` to ActivityTimelineProps.
   If provided, use it to look up names. If not provided, just show the ID.
   Update the parent (entity-detail-panel.tsx) to pass entities if available
   (they can be fetched via getEntities() in the parent — or just pass a
   lookup function instead of the full array to keep it light).

   Actually, simpler approach: add an optional `onEntityClick?: (id: string) => void`
   prop and an optional `entityNames?: Record<string, string>` prop. The parent
   passes selectEntity for onEntityClick and can build a names map from related
   entities. Keep the timeline component simple.

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 2C — Linked Tab: Real Content Instead of Raw IDs

**Goal:** The Linked tab currently shows raw IDs like "fund3" and "fee-calc". Make it show actual names and metadata.

**Files Modified:** `app/components/rolodex/linked-tab.tsx`
**Files Read (for data):** `app/data/mock-threads.ts`, `app/data/mock-workflows.ts`, `app/data/mock-brain.ts`

```
READ these files:
- app/components/rolodex/linked-tab.tsx (the file you'll modify)
- app/data/mock-threads.ts (thread structure — look for title/name fields)
- app/data/mock-workflows.ts (template structure — look for name/title fields)
- app/data/mock-brain.ts (lesson structure — look for title fields, first 100 lines)
- app/services/threads.ts (getThread or getThreads function signature)
- app/services/workflows.ts (getTemplate or getTemplates function signature)

MODIFY `app/components/rolodex/linked-tab.tsx`:

The current linked tab shows section headers with raw ID strings as clickable items.
"fund3" means nothing to Sarah Chen. "Q4 LP Reporting — Fund III" means everything.

Changes:

1. RESOLVE NAMES:
   Add a data-fetching layer to resolve IDs to display names. Add state:
   - threadNames: Record<string, string>
   - workflowNames: Record<string, string>
   - lessonNames: Record<string, string>

   In a useEffect, fetch the data needed to resolve names:
   - Import getThreads from '~/services/threads' — call it, then build a
     Record<id, title> map from the result.
   - Import getTemplates from '~/services/workflows' — call it, build a
     Record<id, name> map.
   - For lessons: import getLessons from '~/services/brain' — call it, build a
     Record<id, title> map. (getLessons returns Lesson[], each has an id and title.)

   Show a tiny inline skeleton while loading (use the same pattern as the
   relationships tab).

2. DISPLAY FORMAT:
   Replace the raw ID text with:
   - Thread items: thread title (resolved from data) + a small subtitle showing
     the thread's last message timestamp or message count if available.
   - Workflow items: template name + template description (truncated, 1 line).
   - Lesson items: lesson title.
   - Task items (kanban cards): keep as ID for now (no task service exists yet),
     but prefix with "Task: " so it's at least labeled.

   Each item row should have: section-colored icon (existing) + resolved name
   (font-mono text-[0.8125rem] text-taupe-5) + optional metadata
   (font-mono text-[0.625rem] text-taupe-2) on the right side.

3. EMPTY STATE messaging:
   Change "Linked threads, workflows, lessons, and tasks will appear here." to:
   "Cosimo automatically links related conversations, workflows, and knowledge
   as you work. They'll appear here."

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PROMPT SET 3: Sidebar Navigation — A Real Hub

### The Problem

The current sidebar in Rolodex view (`RolodexQuickList` in app-sidebar.tsx) is a flat list of entity names grouped by type, with tiny health dots. It's essentially a duplicate of the main content area but worse. A sidebar should provide NAVIGATION and ORIENTATION — "where am I in my entity universe?"

### PROMPT 3A — Sidebar: Health-Aware Navigation Hub

**Goal:** Transform the Rolodex sidebar from a flat entity list into a navigation hub with health summaries, counts, and quick-access to attention items.

**Files Modified:** `app/components/layout/app-sidebar.tsx`

```
READ these files:
- app/components/layout/app-sidebar.tsx (the file you'll modify — focus on RolodexQuickList)
- app/stores/entity-store.ts (store for selectedEntityId, activeTypeFilter, etc.)
- app/lib/entity-constants.ts (ENTITY_HEALTH_COLORS)
- app/data/mock-entities.ts (entity + schema structure)

MODIFY the `RolodexQuickList` component in `app/components/layout/app-sidebar.tsx`:

Replace the current flat entity list with a structured navigation hub.

New structure:

1. HEALTH SUMMARY BAR (top of sidebar content):
   A compact bar showing health across all entities:
   - Three small indicators in a row: green dot + count, amber dot + count, red dot + count
   - Only show colors that have > 0 entities
   - Font-mono text-[0.625rem] text-taupe-2
   - Clicking a health indicator sets the main view's sort to 'health' and scrolls
     to the relevant entities (for now, just call setSortBy('health') from entity store)

2. TYPE SECTIONS (keep, but enhance):
   Keep the grouping by entity type, but add to each section header:
   - Entity count badge: e.g., "Contacts (6)" — the count in text-taupe-2
   - Click the section header to set activeTypeFilter in the entity store
     (so clicking "Funds" in the sidebar filters the main list to funds)
   - Active section header gets a violet left border or bg tint

3. ENTITY ITEMS (enhance):
   Keep the entity buttons but add more info:
   - Health dot (keep, but make it 6px instead of 6px — actually keep size-1.5, it's fine)
   - Entity name (keep)
   - If entity has insights, show a tiny amber dot after the name (size-1, bg-amber)
   - If entity is the selectedEntityId, highlight with bg-berry-5 (existing pattern)

4. ATTENTION SECTION (new, top of list):
   Before the type groups, add an "Attention" section that shows ONLY entities
   with health === 'warning' or 'critical'. This section:
   - Header: "⚠ Attention" (font-mono text-[0.625rem] uppercase, text-amber)
   - Only renders if there are entities needing attention
   - Shows entities sorted by severity (critical first)
   - Each item shows health dot + name + health label abbreviation

5. COLLAPSED STATE:
   When the sidebar is collapsed (group-data-[collapsible=icon]), the quick list
   should hide entirely (opacity-0, pointer-events-none — existing pattern).

Keep the same overall integration pattern — the sidebar still loads data via
the useEffect when isRolodexView is true. Don't change how data flows in,
just change what renders.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PROMPT SET 4: Actions & Workflow Integration

### The Problem

The action system is hollow. "Ask Cosimo" opens an empty chat page. "Generate Report" navigates to a workflow template page. For Genie & Alexis at Tenner, actions need to feel like they DO something — especially workflow triggers. And when they've run a batch workflow across 14 LPs, they need to see that run status on each LP entity.

### PROMPT 4A — Smarter Action Execution with Context

**Goal:** Make entity actions carry context instead of navigating to blank pages.

**Files Modified:** `app/components/rolodex/entity-action-button.tsx`

```
READ these files:
- app/components/rolodex/entity-action-button.tsx (the file you'll modify)
- app/stores/entity-store.ts (selectEntity)
- app/components/layout/cosimo-panel.tsx (if you can read the first 50 lines — to understand how the Cosimo chat panel works)
- app/data/mock-entities.ts (entity structure — properties, relationships)

MODIFY `app/components/rolodex/entity-action-button.tsx`:

The `executeAction` function currently does bare navigation. Upgrade it:

1. START-CHAT action:
   Instead of just navigating to /chat, build a context-aware URL or state payload.
   - Navigate to `/chat` (keep this)
   - BUT ALSO: store a "pending chat context" in the entity store. Add a new store
     field if needed (or use a lightweight approach).

   Actually, simplest approach for now: navigate to `/chat?entity={entityId}&name={encodeURIComponent(entity.name)}`
   The chat route can later read these query params to pre-fill context.

   Update the button label: instead of "Ask Cosimo", show "Ask Cosimo about {entity.name}"
   BUT only in the entity-detail-panel's primary action buttons (the button component
   itself should accept an optional `entityName` prop for the label override).
   In the detail panel, pass entity.name. In other contexts, fall back to action.label.

   Wait — that changes the EntityActionButton interface. Instead, keep it simple:
   just change the executeAction function to use the query param approach. Don't
   change the button label — the label "Ask Cosimo" is fine for the button,
   the context comes from the navigation.

2. TRIGGER-WORKFLOW action:
   Currently navigates to `/workflows/${action.target}`.
   Upgrade: navigate to `/workflows/${action.target}?entity=${entity.id}&entityName=${encodeURIComponent(entity.name)}`
   This lets the workflow template page know which entity triggered it.
   (The workflow route can later use this to pre-configure the run.)

3. COMPOSE-EMAIL action:
   Currently opens mailto: with just the email address.
   Enhance: include entity.name in the mailto subject line:
   `mailto:${email}?subject=Re: ${encodeURIComponent(entity.name)}`
   This is a small but meaningful improvement — the email starts with context.

4. ADD-NOTE action:
   Currently console.logs. Keep the console.log for now, but also show a visual
   feedback: maybe a brief toast-like indication. Actually, for MVP, just keep the
   console.log but add a TODO comment: `// TODO: Open inline note editor`

5. CREATE-TASK action:
   Same as add-note — console.log + TODO comment: `// TODO: Open task creation panel`

6. SCHEDULE-MEETING action:
   console.log + TODO: `// TODO: Open calendar with entity pre-filled`

The key change is items 1-3: actions now carry entity context through navigation.

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 4B — Workflow Run Status on Entity Detail

**Goal:** Show active/completed workflow runs related to an entity in the entity detail panel. This is how Genie sees "I ran K-1s for 14 LPs — CalPERS had an exception."

**Files Modified:** `app/components/rolodex/entity-detail-panel.tsx`
**Files Created:** `app/components/rolodex/entity-workflow-runs.tsx`

```
READ these files:
- app/components/rolodex/entity-detail-panel.tsx (where you'll integrate)
- app/services/types.ts (search for WorkflowRun interface — understand the run structure)
- app/services/workflows.ts (getRunsForTemplate, getAllRuns, or similar functions)
- app/data/mock-workflows.ts (first 100 lines — run structure)
- app/lib/workflow-constants.ts (run status colors if they exist)

CREATE `app/components/rolodex/entity-workflow-runs.tsx`:

A component that shows workflow runs linked to an entity.

Props:
- entityId: string
- linkedWorkflowIds: string[] (from entity.linkedWorkflowIds)
- className?: string

How it works:
- Import getAllRuns from workflows service
- In useEffect, fetch all runs
- Filter runs that are relevant to this entity. A run is relevant if:
  a) Its templateId is in linkedWorkflowIds, OR
  b) Its id is in linkedWorkflowIds
  (The mock data may link template IDs or run IDs — handle both.)
- Sort by most recent first (by startedAt or a date field)
- Show up to 3 most recent runs

Display per run:
- Status indicator: a small colored dot or icon
  - 'completed' → green CircleCheck
  - 'running' → violet Play with pulse animation (gated)
  - 'paused' / 'waiting' → amber Clock
  - 'failed' → red CircleX
- Workflow/template name (font-mono text-[0.8125rem] font-semibold)
- Timestamp (font-mono text-[0.625rem] text-taupe-2 — use relative time)
- Status label (font-mono text-[0.5625rem] uppercase — completed/running/failed)
- Clickable — navigates to the workflow run detail

If no runs are found, don't render anything (return null — not an empty state).

MODIFY `app/components/rolodex/entity-detail-panel.tsx`:

In the overview tab, after the Cosimo Brief and before the Key Metrics strip
(from Prompt 2A), add the EntityWorkflowRuns component. It should render only
if the entity has linkedWorkflowIds.length > 0. Wrap it with a section header:
"Recent Workflows" (font-mono text-[0.625rem] uppercase tracking).

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PROMPT SET 5: Interactive Entity Graph

### The Problem

The graph view is a placeholder EmptyState. It was supposed to be a vector graph-RAG visualizer with clickable nodes — the visual representation of how entities connect. For the Investment Partner, seeing "CalPERS → invested in → Fund III → owns → 120 Berkshire Ave → managed by → Sarah Chen" as a visual graph is enormously powerful.

### PROMPT 5A — SVG-Based Entity Relationship Graph

**Goal:** Build an interactive SVG graph that visualizes entity relationships as clickable nodes and edges.

**Files Created:** `app/components/rolodex/entity-graph.tsx`
**Files Modified:** `app/routes/_app.rolodex.tsx`

```
READ these files:
- app/routes/_app.rolodex.tsx (where graph view mode currently shows EmptyState)
- app/stores/entity-store.ts (graphZoom, graphPan, graphLevel, setGraphZoom, setGraphPan)
- app/lib/entity-constants.ts (ENTITY_TYPE_COLORS, ENTITY_TYPE_COLOR_RGB, ENTITY_HEALTH_COLORS)
- app/data/mock-entities.ts (entity relationships structure — search for "relationships:")
- app/services/entities.ts (getEntities, getRelatedEntities)

CREATE `app/components/rolodex/entity-graph.tsx`:

An SVG-based force-directed (or computed-layout) graph of entities and their
relationships. This is the visual knowledge graph — the "see your world" view.

Props:
- entities: Entity[]
- schema: EntitySchema
- onEntityClick: (entityId: string) => void
- className?: string

LAYOUT ALGORITHM:
Don't use d3-force or any external library. Implement a simple computed layout:

1. Place entities in a circular arrangement by type.
   - Group by typeId
   - Each type group occupies a segment of the circle
   - Within a segment, spread entities evenly
   - Center the graph in the SVG viewport

2. Calculate positions:
   const RADIUS = 280; // base circle radius
   const CENTER = { x: 400, y: 350 }; // SVG center
   For each type group, calculate angular range based on entity count.
   Within each range, space entities evenly.

3. Store computed positions in a useMemo that recalculates when entities change.

SVG STRUCTURE:
- Outer container: a div with relative positioning, overflow-hidden
- SVG fills the container, viewBox="0 0 800 700" (adjust as needed)
- Use CSS cursor: grab on the SVG, cursor: grabbing while panning

EDGES (relationships):
- For each entity, for each relationship, draw a line from entity to target
- Line: stroke using the source entity's type color (at 30% opacity)
- stroke-width: 1.5
- Use <line> elements, not <path> (keep it simple)
- Deduplicate: if A→B and B→A exist, only draw one line
- On hover, highlight the edge: stroke-width: 2.5, opacity to 60%

NODES (entities):
- Each entity is a <g> group at its computed position
- Circle: r=24, fill: white (dark: surface-1), stroke: entity type color (2px)
- Entity type icon character centered in the circle (text element, font-size 14)
- Entity name label below the circle: font-size 10, text-anchor: middle,
  truncated to 12 characters + "…" if longer
- Health indicator: if health is non-null, add a small dot at the top-right of
  the circle (r=4, fill: health color). If critical, add a pulse animation
  (SVG animate, gated with @media prefers-reduced-motion).

NODE INTERACTIONS:
- Hover: scale the node group slightly (transform: scale(1.1)), show a tooltip
  with entity name + subtitle. Use a <title> element for native tooltip, or a
  custom SVG <rect> + <text> tooltip group.
- Click: call onEntityClick(entity.id) — this opens the detail slide-over.
- Focus: each node <g> should have tabIndex={0}, role="button",
  aria-label="{entity.name}, {typeDef.label}". onKeyDown Enter/Space = click.
  focus-visible: show a ring (use an extra circle with stroke: violet-3,
  controlled by :focus-visible CSS or a state variable).

ZOOM + PAN:
- Read graphZoom and graphPan from entity store.
- Apply them as a transform on a parent <g> element:
  transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
- Mouse wheel: onWheel handler that calls setGraphZoom (zoom in/out, clamped 0.3–3)
- Mouse drag: onMouseDown/Move/Up handlers that call setGraphPan
- Gate all transform transitions with motion-reduce

ZOOM CONTROLS:
- Render a small floating control bar in the bottom-right corner of the container
  (absolute positioned, not inside SVG):
  - Zoom in (+) button
  - Zoom level display (e.g., "100%")
  - Zoom out (-) button
  - Reset button (resets zoom to 1, pan to 0,0)
  Use Button component, variant="outline", size="icon-xs".

TYPE FILTER INTEGRATION:
- If activeTypeFilter is set in the entity store, dim (opacity: 0.15) all nodes
  and edges that don't match the filter. Don't hide them — dimming preserves
  spatial context.

MODIFY `app/routes/_app.rolodex.tsx`:

Replace the EmptyState in the graph view mode section with the new EntityGraph
component. Pass entities (the unfiltered set from loaderData), schema, and
selectEntity as onEntityClick.

After you are done, run `npx tsc --noEmit` to verify.
```

---

### PROMPT 5B — Graph: Edge Labels and Cluster Grouping

**Goal:** Add relationship labels on edges and subtle cluster backgrounds.

**Files Modified:** `app/components/rolodex/entity-graph.tsx`

```
READ:
- app/components/rolodex/entity-graph.tsx (the file you just created in 5A)
- app/data/mock-entities.ts (relationship structure — search for "relationshipTypes:")

MODIFY `app/components/rolodex/entity-graph.tsx`:

Two enhancements:

1. EDGE LABELS:
   On each edge (relationship line), add a small text label at the midpoint
   showing the relationship type label (e.g., "manages", "invested in", "owns").
   - Font-size: 8px, font-family: var(--mono)
   - Color: taupe-3 (both themes)
   - Background: a small white (dark: surface-1) rect behind the text for readability
   - Only show labels when zoom > 0.7 (at low zoom they'd be unreadable noise)
   - Rotate the text to follow the edge angle, but keep it readable (flip if
     angle > 90° or < -90° so text is never upside down)

   To get the label: look up the relationship type in schema.relationshipTypes,
   then use forwardLabel or reverseLabel based on the relationship direction.

2. CLUSTER BACKGROUNDS:
   Behind each type group, draw a subtle background ellipse or rounded rect:
   - Fill: entity type color at 3% opacity (light) / 5% opacity (dark)
   - No stroke
   - Sized to contain all nodes in the type group with 40px padding
   - Rendered BEHIND nodes and edges (early in SVG draw order)
   - Label: type's labelPlural (e.g., "Contacts", "Funds") at the top of the
     cluster, font-size: 11px, font-family: var(--mono), uppercase, tracking-wider,
     type color at 40% opacity

   Calculate cluster bounds by finding the min/max x,y of all entities in each
   type group, then adding padding.

After you are done, run `npx tsc --noEmit` to verify.
```

---
---

## PROMPT SET 6: Mock Data Enrichment

### The Problem

The prompts above add UI that surfaces insights, timelines, workflow runs, and relationship intelligence. But the mock data needs to actually TELL A STORY that resonates with the personas. Sarah Chen's timeline should read like a real CFO's week.

### PROMPT 6A — Enrich Mock Data for Persona Storytelling

**Goal:** Update mock entity data so insights, timelines, and AI summaries tell realistic stories.

**Files Modified:** `app/data/mock-entities.ts`

```
READ these files completely:
- app/data/mock-entities.ts (the full file — you'll modify it)
- app/data/mock-threads.ts (first 50 lines — for thread IDs and titles)
- app/data/mock-workflows.ts (first 80 lines — for template IDs and names)

MODIFY `app/data/mock-entities.ts`:

The goal is to make the mock data tell stories that our target personas would
recognize as their own lives. Every insight, timeline event, and AI summary
should feel like something that would actually happen at a PE fund.

1. AI SUMMARIES — rewrite every entity's aiSummary to be genuinely useful:

   sarah-chen: "Sarah leads fund accounting for Funds III and IV. Currently
   managing Q4 2025 LP report distribution and K-1 prep for 14 LPs. Fund III's
   Q4 report is 3 days past internal deadline — auditor review pending."

   marcus-webb: "Marcus oversees deal execution and portfolio ops. Currently
   leading the Hilgard closing and Erabor infrastructure pipeline. No urgent
   items."

   fund-iii: "Fund III ($420M, 2019 vintage) is in harvest phase with 14 LPs.
   Q4 2025 reporting is 3 days past internal deadline. 1.5x MOIC milestone
   reached in February. Two properties generating strong NOI."

   calpers: "CalPERS committed $45M across Funds III and IV. Re-up decision
   expected Q4 2026 — prep window opens in 6 months. Last substantive contact
   was 18 days ago; quarterly update is due."

   Update ALL entity aiSummaries. Make each one specific, actionable, and
   reference other entities by name (not ID).

2. INSIGHTS — make them specific and actionable:

   sarah-chen insights:
   - type: 'reminder', text: "Sarah's birthday is April 15 — 26 days away"
   - type: 'alert', text: "Fund III Q4 report needs Sarah's sign-off before
     auditor review. 3 days overdue."

   fund-iii insights:
   - type: 'alert', text: "Q4 LP report is 3 days past internal deadline.
     Auditor review blocked."
   - type: 'milestone', text: "Fund III reached 1.5x MOIC on Feb 28. Consider
     LP communication."
   - type: 'opportunity', text: "Marina Blvd property hit 100% occupancy.
     May warrant investor update."

   calpers insights:
   - type: 'opportunity', text: "CalPERS re-up decision is Q4 2026. Start
     relationship warming and performance deck prep."
   - type: 'reminder', text: "Quarterly update due to CalPERS. Last sent
     Jan 15."

   david-park insights:
   - type: 'alert', text: "No outreach to David in 22 days. IR Director
     engagement cooling."

   Add/update insights for ALL entities. Each should reference specific, concrete
   details — not generic "follow up" messages.

3. TIMELINES — make MOCK_ENTITY_TIMELINES richer:

   Ensure at least 5 entities have timelines (currently only 3 do).
   Add timelines for: fund-iii (if not already rich), hilgard, calpers,
   david-park, and prop-berkshire.

   Each timeline event should:
   - Reference real entity names in descriptions (not IDs)
   - Use realistic titles: "K-1 package generated for CalPERS" not
     "Workflow completed"
   - Include involvedEntityIds that point to actual entities
   - Have valid refType and refId where applicable (use thread/workflow IDs
     from the mock data files)

   Make the timelines tell a story. Sarah-chen's timeline should read like:
   Mar 17: Received email from James Whitfield (Deloitte) re: Fund III audit
   Mar 15: K-1 extract workflow completed for Fund III
   Mar 12: Meeting with CalPERS — quarterly check-in
   Mar 10: Mentioned in chat thread about Hilgard closing
   Mar 8: Shared Q4 report draft with Marcus Webb
   Feb 12: Added cultural notes for CalPERS contact

4. Set all dates to January-March 2026 timeframe. Use ISO 8601 format.
   Make lastActivityAt consistent with the most recent timeline event.

Do NOT change the schema (MOCK_ENTITY_SCHEMA). Do NOT change entity IDs,
type IDs, or relationship structure. Only update content: aiSummary, insights,
timeline events, and dates.

After you are done, run `npx tsc --noEmit` to verify no type errors.
```

---
---

## Execution Order

Run these prompts in this order:

1. **6A** (Mock Data) — do this FIRST so all subsequent UI work has good data to show
2. **1A** (Attention Banner) — the entry point experience
3. **1B** (List Item upgrade) — inline intelligence in list view
4. **1C** (Grid Card upgrade) — intelligence in grid view
5. **2A** (Overview Tab rewrite) — the intelligence brief
6. **2B** (Timeline upgrade) — drill-through and grouping
7. **2C** (Linked Tab) — resolve IDs to names
8. **3A** (Sidebar) — navigation hub
9. **4A** (Actions) — context-aware actions
10. **4B** (Workflow Runs) — entity-level run visibility
11. **5A** (Graph — structure) — interactive SVG graph
12. **5B** (Graph — polish) — labels and clusters

After ALL prompts are done, run `npx tsc --noEmit` one final time and verify
both light and dark mode work.
