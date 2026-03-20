# Cosimo Entity System Architecture

## A domain-agnostic, AI-native CRM layer for the Medici platform

**Author:** Architecture Working Doc
**Date:** March 19, 2026
**Status:** Draft — for CTO review and UX planning

---

## 1. Core Thesis

The Entity System is not a CRM bolted onto Cosimo — it's the **interactive surface** of the knowledge graph that the ingestor already builds. Traditional CRMs require manual data entry and operate as siloed databases. Cosimo's Entity System inverts this: data flows in from the graph-RAG pipeline, the AI organizes it, and the user interacts with a living, auto-updating view of their professional universe.

The system is domain-agnostic by design. A PE fund sees Funds, LPs, Properties, and Deals. A tax certification company sees Clients, Filings, Jurisdictions, and Deadlines. A medical practice sees Patients, Providers, Encounters, and Conditions. The underlying infrastructure is identical — only the **Entity Schema** changes.

### What This Document Covers

1. The **Entity Schema** — a per-tenant configuration that defines entity types, properties, relationships, and actions
2. The **Entity Instance** model — what a resolved entity actually looks like at runtime
3. The **Activity Timeline** — a unified event stream per entity
4. The **Action System** — contextual operations available per entity type
5. Two complete **sample schemas** (PE/CRE and Tax Certification) showing vertical flexibility
6. **Mock data** for both verticals
7. **UI component mapping** — how schema concepts render in the frontend
8. **Integration points** — how entities connect to Chat, Workflows, Knowledge, and Kanban
9. **Navigation architecture** — where this lives in the app and how it relates to Brain

---

## 2. Navigation Architecture

### Current State

```
Top Nav:  Chat  |  Workflows  |  Brain
                                  ├── Memory
                                  ├── Lessons
                                  └── Graph (entity visualization)
```

Brain is overloaded. Memory and Lessons are about **teaching the AI** (inward-facing). The entity graph is about **seeing your world** (outward-facing). These are fundamentally different user intents.

### Proposed State

```
Top Nav:  Chat  |  Workflows  |  Rolodex  |  Knowledge

Rolodex (new)                     Knowledge (renamed from Brain)
├── List View (default)           ├── Memory (unchanged)
├── Graph View (toggle)           └── Lessons (unchanged)
└── Entity Detail (drill-in)
```

**Rolodex** is the working name for the entity hub — it's retro (fits the brand), immediately understood, and domain-neutral. The tenant can relabel this in their schema (a medical firm might call it "Patients," a law firm might call it "Matters"). But the default resonates.

**Knowledge** absorbs Memory and Lessons from Brain. The graph visualization could optionally appear here as an exploration tool ("how things connect"), but the primary entity interaction surface moves to Rolodex.

### Why This Split Works

- **Chat** = conversation (verb: *talk*)
- **Workflows** = automation (verb: *run*)
- **Rolodex** = relationships & entities (verb: *manage*)
- **Knowledge** = institutional memory (verb: *teach*)

Each tab has a clear mental model. No confusion about where to go.

---

## 3. Entity Schema (Per-Tenant Configuration)

The Entity Schema is the configuration layer that makes the system domain-agnostic. It defines what entity types exist, what properties they carry, how they relate to each other, and what actions are available. The schema is:

- **Initialized by the AI** based on ingested data ("I found these patterns...")
- **Refined by the user** through conversation or a lightweight setup UI
- **Stored per tenant** and loaded at app initialization
- **Versioned** so schema changes don't break existing entity data

### TypeScript Interfaces

```typescript
// ============================================
// ENTITY SCHEMA — Per-Tenant Configuration
// ============================================

/**
 * The top-level schema configuration for a tenant.
 * Defines all entity types, relationship types, and global settings.
 * This is what makes the system work for PE, tax, medical, or any vertical.
 */
export interface EntitySchema {
  /** Schema version for migration support */
  version: number;

  /** Tenant identifier */
  tenantId: string;

  /** Display label for the Rolodex tab (default: "Rolodex") */
  tabLabel: string;

  /** Entity type definitions — the core of the schema */
  entityTypes: EntityTypeDefinition[];

  /** Relationship type definitions — how entities connect */
  relationshipTypes: RelationshipTypeDefinition[];

  /** Global settings */
  settings: EntitySchemaSettings;
}

/**
 * Defines a single entity type (e.g., "Fund," "Patient," "Client").
 * Controls how entities of this type are displayed, what properties they carry,
 * and what actions are available.
 */
export interface EntityTypeDefinition {
  /** Unique identifier (kebab-case, e.g., "limited-partner", "patient") */
  id: string;

  /** Singular display label (e.g., "Fund", "Patient") */
  label: string;

  /** Plural display label (e.g., "Funds", "Patients") */
  labelPlural: string;

  /** Unicode icon character for graph/list display */
  icon: string;

  /** Color token from design system (e.g., "violet-3", "berry-3") */
  color: string;

  /** RGB triplet token for alpha variants */
  colorRgb: string;

  /**
   * Property definitions — the "fields" this entity type carries.
   * Think of these as the columns in a traditional CRM, but flexible.
   */
  properties: EntityPropertyDefinition[];

  /**
   * Which properties to display in the list/card view.
   * References property IDs. Max 4 recommended for UI clarity.
   */
  summaryProperties: string[];

  /**
   * Grouped sections for the entity detail view.
   * Allows organizing properties into logical sections (e.g., "Financials," "Contact Info").
   */
  detailSections: EntityDetailSection[];

  /**
   * Available actions for entities of this type.
   * Actions appear in the entity detail view and context menus.
   */
  actions: EntityActionDefinition[];

  /**
   * Health indicator configuration. Defines what "health" means for this entity type.
   * For contacts: engagement recency. For projects: deadline proximity. For patients: care gap alerts.
   * Null means no health indicator for this type.
   */
  healthIndicator: HealthIndicatorConfig | null;

  /**
   * Whether this entity type appears as a top-level filter in the Rolodex list view.
   * Set to false for "support" entity types that exist mainly as relationships
   * (e.g., "Jurisdiction" might be a filter; "Filing Period" might not).
   */
  showInNav: boolean;

  /**
   * Sort order in the nav/filter bar. Lower numbers appear first.
   */
  navOrder: number;
}

/**
 * A property definition on an entity type.
 * Drives both display and data validation.
 */
export interface EntityPropertyDefinition {
  /** Unique identifier within this entity type (kebab-case) */
  id: string;

  /** Display label */
  label: string;

  /** Data type — determines rendering and input component */
  type: EntityPropertyType;

  /** Whether this property is required */
  required: boolean;

  /** For enum type: allowed values */
  options?: string[];

  /** For currency/number: format string (e.g., "$#,###", "#.##%") */
  format?: string;

  /** Whether this property is editable by the user in the detail view */
  editable: boolean;

  /** Whether this property is populated by the AI (vs. manual entry) */
  aiPopulated: boolean;

  /** Short description shown as tooltip/help text */
  description?: string;
}

export type EntityPropertyType =
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'email'
  | 'phone'
  | 'url'
  | 'enum'
  | 'boolean'
  | 'percentage'
  | 'tags'
  | 'rich-text';

/**
 * Groups properties into sections for the entity detail view.
 * Similar to how a Salesforce page layout has sections, but simpler.
 */
export interface EntityDetailSection {
  /** Section heading */
  label: string;

  /** Property IDs to display in this section */
  propertyIds: string[];

  /** Whether this section is collapsed by default */
  collapsedByDefault?: boolean;
}

/**
 * Defines an action available for an entity type.
 * Actions are buttons/menu items in the entity detail view and context menus.
 */
export interface EntityActionDefinition {
  /** Unique identifier */
  id: string;

  /** Display label (e.g., "Send Email", "Run Report") */
  label: string;

  /** Lucide icon name */
  icon: string;

  /** What happens when the action is triggered */
  type: EntityActionType;

  /**
   * For workflow actions: the template ID to trigger.
   * For chat actions: a pre-filled prompt template.
   * For link actions: a URL template with {{property}} interpolation.
   */
  target?: string;

  /** Whether this is a primary action (shown prominently) vs. overflow menu */
  primary: boolean;
}

export type EntityActionType =
  | 'start-chat'       // Opens a new chat thread with this entity as context
  | 'trigger-workflow'  // Kicks off a workflow with this entity as input
  | 'compose-email'     // Opens email composition with entity context
  | 'add-note'          // Adds a memory fact linked to this entity
  | 'schedule-meeting'  // Creates a calendar event (future integration)
  | 'external-link'     // Opens an external URL
  | 'create-task';      // Creates a kanban task linked to this entity

/**
 * Defines a type of relationship between entities.
 * Relationships are bidirectional by default — the schema defines labels for both directions.
 */
export interface RelationshipTypeDefinition {
  /** Unique identifier (kebab-case) */
  id: string;

  /** The entity type on the "from" side */
  fromType: string;

  /** The entity type on the "to" side */
  toType: string;

  /** Label when viewed from the "from" side (e.g., "manages") */
  forwardLabel: string;

  /** Label when viewed from the "to" side (e.g., "managed by") */
  reverseLabel: string;

  /** Whether the AI should automatically infer this relationship from data */
  autoInfer: boolean;
}

/**
 * Configures the health/engagement indicator for an entity type.
 * This is the visual cue that tells users "you should pay attention to this."
 */
export interface HealthIndicatorConfig {
  /** What drives the health score */
  metric: 'last-interaction' | 'deadline-proximity' | 'custom-rule';

  /** For last-interaction: thresholds in days */
  thresholds?: {
    healthy: number;   // e.g., 14 (contacted within 14 days)
    warning: number;   // e.g., 30 (contacted within 30 days)
    critical: number;  // e.g., 60 (not contacted in 60+ days)
  };

  /** Display labels for each health state */
  labels?: {
    healthy: string;   // e.g., "Active", "On Track", "Current"
    warning: string;   // e.g., "Cooling", "At Risk", "Due Soon"
    critical: string;  // e.g., "Cold", "Overdue", "Past Due"
  };
}

/**
 * Global entity system settings for this tenant.
 */
export interface EntitySchemaSettings {
  /** Whether to show the graph view toggle (some users prefer list-only) */
  enableGraphView: boolean;

  /** Whether the AI should auto-create entities from ingested data */
  autoCreateEntities: boolean;

  /** Whether the AI should auto-resolve relationships from context */
  autoResolveRelationships: boolean;

  /** Default sort for the entity list */
  defaultSort: 'alphabetical' | 'last-activity' | 'health' | 'created';

  /** Default view mode */
  defaultView: 'list' | 'grid' | 'graph';
}
```

---

## 4. Entity Instances (Runtime Data)

These are the actual resolved entities — what the graph-RAG produces and the user interacts with. The schema defines the *shape*; instances carry the *data*.

```typescript
// ============================================
// ENTITY INSTANCES — Runtime Data
// ============================================

/**
 * A resolved entity instance. This is what the UI renders.
 * Created by the graph-RAG pipeline, enriched by the AI, editable by the user.
 */
export interface Entity {
  /** Unique identifier (generated by the entity resolution pipeline) */
  id: string;

  /** References the EntityTypeDefinition.id from the schema */
  typeId: string;

  /** Primary display name (e.g., "Sarah Chen", "Fund III", "Acme Corp") */
  name: string;

  /** Secondary display line (e.g., "CFO", "2019 Vintage", "Tax Client") */
  subtitle: string;

  /** Avatar/image URL if available (from email, LinkedIn, etc.) */
  avatarUrl?: string;

  /**
   * Property values keyed by EntityPropertyDefinition.id.
   * Values are stored as strings and rendered based on the property type in the schema.
   */
  properties: Record<string, string | string[] | null>;

  /**
   * AI-generated summary of this entity. Updated periodically by the AI
   * based on all known context. 2-3 sentences.
   */
  aiSummary: string;

  /**
   * AI-generated insights/alerts. These are ephemeral — recalculated
   * on each data refresh. They surface things the user should know.
   */
  insights: EntityInsight[];

  /**
   * Current health status, derived from the HealthIndicatorConfig
   * in the schema. Null if the entity type has no health indicator.
   */
  health: 'healthy' | 'warning' | 'critical' | null;

  /**
   * Relationships to other entities.
   * Each entry references a RelationshipTypeDefinition and a target entity.
   */
  relationships: EntityRelationship[];

  /**
   * Linked system references — connecting this entity to other parts of Cosimo.
   * These are the "glue" between the entity system and Chat/Workflows/Knowledge.
   */
  linkedThreadIds: string[];        // Chat threads mentioning this entity
  linkedWorkflowIds: string[];      // Workflow templates associated with this entity
  linkedLessonIds: string[];        // Lessons relevant to this entity
  linkedMemoryFactIndices: number[]; // Indices into the memory facts array
  linkedKanbanCardIds: string[];    // Kanban cards (projects/tasks) for this entity

  /** When this entity was first created in the system */
  createdAt: string;

  /** When any property was last updated (by AI or user) */
  updatedAt: string;

  /** When the last activity event occurred */
  lastActivityAt: string;

  /**
   * Data provenance — where did this entity come from?
   * Helps users understand why an entity exists and trust the data.
   */
  sources: EntitySource[];

  /**
   * User-applied tags for custom organization.
   * These are freeform and not part of the schema.
   */
  tags: string[];
}

/**
 * A relationship from one entity to another.
 */
export interface EntityRelationship {
  /** References a RelationshipTypeDefinition.id */
  relationshipTypeId: string;

  /** The target entity ID */
  targetEntityId: string;

  /** The direction of this relationship (for label rendering) */
  direction: 'forward' | 'reverse';

  /** Optional metadata on the relationship (e.g., "since 2019", "lead partner") */
  metadata?: string;

  /** Whether this relationship was auto-inferred by the AI */
  autoInferred: boolean;
}

/**
 * An AI-generated insight or alert for an entity.
 */
export interface EntityInsight {
  /** Unique identifier */
  id: string;

  /** Insight type — determines icon and color in the UI */
  type: 'reminder' | 'alert' | 'opportunity' | 'anomaly' | 'milestone';

  /** Short display text */
  text: string;

  /** When this insight was generated */
  generatedAt: string;

  /** Whether the user has dismissed this insight */
  dismissed: boolean;

  /** Optional action to take (maps to EntityActionDefinition.id) */
  suggestedActionId?: string;
}

/**
 * Data provenance — where the entity or a property value came from.
 */
export interface EntitySource {
  /** What kind of source provided this data */
  type: 'email' | 'document' | 'calendar' | 'conversation' | 'manual' | 'integration';

  /** Human-readable label (e.g., "Email from Sarah Chen, Feb 14") */
  label: string;

  /** Optional link to the source (thread ID, document path, etc.) */
  ref?: string;

  /** When the data was captured */
  capturedAt: string;
}

// ============================================
// ACTIVITY TIMELINE
// ============================================

/**
 * A single event in an entity's activity timeline.
 * The timeline is auto-assembled from multiple data sources.
 * It's the "what happened" view that replaces manual CRM logging.
 */
export interface ActivityEvent {
  /** Unique identifier */
  id: string;

  /** The entity this event belongs to */
  entityId: string;

  /** Event type — determines icon and rendering in the timeline */
  type: ActivityEventType;

  /** Short display title (e.g., "Email sent", "Workflow completed") */
  title: string;

  /** Longer description or preview text */
  description: string;

  /** When the event occurred */
  timestamp: string;

  /** Where this event data came from */
  source: 'email' | 'calendar' | 'chat' | 'workflow' | 'manual' | 'integration';

  /** Optional reference ID (thread ID, run ID, document ID) for drill-through */
  refId?: string;

  /** Optional reference type for navigation */
  refType?: 'thread' | 'workflow-run' | 'document' | 'lesson' | 'kanban-card';

  /** Other entities involved in this event */
  involvedEntityIds: string[];
}

export type ActivityEventType =
  | 'email-sent'
  | 'email-received'
  | 'meeting-scheduled'
  | 'meeting-completed'
  | 'document-shared'
  | 'document-updated'
  | 'workflow-triggered'
  | 'workflow-completed'
  | 'workflow-failed'
  | 'note-added'
  | 'property-updated'
  | 'entity-created'
  | 'relationship-added'
  | 'task-created'
  | 'task-completed'
  | 'milestone-reached'
  | 'chat-mention';
```

### Property Value Storage Conventions

All property values in `Entity.properties` are stored as **strings**, regardless of their schema type. This simplifies serialization and the data layer. The frontend is responsible for parsing and formatting based on the `EntityPropertyDefinition.type` and `format` fields:

| Schema Type | Storage Format | Display Example |
|---|---|---|
| `text` | Raw string | `"Sarah Chen"` |
| `number` | Numeric string | `"14"` → `14` |
| `currency` | Raw numeric string (no symbols) | `"420000000"` → `$420,000,000` |
| `date` | ISO 8601 string | `"2026-04-15"` → `Apr 15, 2026` |
| `percentage` | Numeric string (whole number) | `"8"` → `8%` |
| `email` | Email string | `"schen@meridiancap.com"` |
| `enum` | The option value string | `"Real Estate"` |
| `tags` | Stored as `string[]` | `["tier-1", "reup-2026"]` |
| `boolean` | `"true"` or `"false"` | `"true"` → checkmark |

**User edits are "pinned"**: when a user manually edits a property, that value is marked as user-set and the AI will not overwrite it. If the AI later infers a conflicting value, it surfaces as an insight ("Cosimo thinks Sarah's title may have changed to 'Co-CFO' based on a recent email — update?") rather than silently overwriting.

---

## 5. Zustand Store

```typescript
// ============================================
// ENTITY STORE — Zustand
// ============================================

/**
 * State management for the Rolodex / Entity System.
 * Follows the same patterns as brain-store, chat-store, etc.
 */
export interface EntityState {
  // --- Navigation ---
  /** Active view mode */
  viewMode: 'list' | 'grid' | 'graph';

  /** Currently selected entity type filter (null = all types) */
  activeTypeFilter: string | null;

  /** Search query */
  searchQuery: string;

  /** Sort order */
  sortBy: 'alphabetical' | 'last-activity' | 'health' | 'created';

  /** Currently selected entity ID (opens the detail panel) */
  selectedEntityId: string | null;

  /** Whether the entity detail panel is in slide-over mode (vs. full-page) */
  detailMode: 'slide-over' | 'full-page';

  /** Active tab within the entity detail view */
  detailTab: 'overview' | 'timeline' | 'relationships' | 'linked';

  // --- Graph-specific ---
  /** Graph zoom level */
  graphZoom: number;

  /** Graph pan offset */
  graphPan: { x: number; y: number };

  /** Whether graph is in exploration mode (root/cluster/entity drill-down) */
  graphLevel: 'root' | 'cluster' | 'entity';

  // --- Actions ---
  setViewMode: (mode: 'list' | 'grid' | 'graph') => void;
  setTypeFilter: (typeId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: 'alphabetical' | 'last-activity' | 'health' | 'created') => void;
  selectEntity: (id: string | null) => void;
  setDetailMode: (mode: 'slide-over' | 'full-page') => void;
  setDetailTab: (tab: 'overview' | 'timeline' | 'relationships' | 'linked') => void;
  setGraphZoom: (zoom: number) => void;
  setGraphPan: (pan: { x: number; y: number }) => void;
  setGraphLevel: (level: 'root' | 'cluster' | 'entity') => void;
}
```

---

## 6. Service Layer

```typescript
// ============================================
// ENTITY SERVICE — Data Access
// ============================================

/**
 * Service functions for entity data access.
 * Follows the existing pattern: async wrappers that currently
 * return mock data, later swapped for API calls.
 */

/** Get the tenant's entity schema */
export async function getEntitySchema(): Promise<EntitySchema>;

/** Get all entities, optionally filtered by type */
export async function getEntities(typeId?: string): Promise<Entity[]>;

/** Get a single entity by ID */
export async function getEntity(id: string): Promise<Entity>;

/** Get the activity timeline for an entity */
export async function getEntityTimeline(
  entityId: string,
  limit?: number,
  offset?: number
): Promise<ActivityEvent[]>;

/** Search entities by name or property values */
export async function searchEntities(query: string): Promise<Entity[]>;

/** Get entities related to a specific entity */
export async function getRelatedEntities(entityId: string): Promise<Entity[]>;

/** Update an entity's property values (user edits) */
export async function updateEntityProperties(
  entityId: string,
  properties: Record<string, string | string[] | null>
): Promise<Entity>;

/** Add a manual note/activity event to an entity */
export async function addEntityNote(
  entityId: string,
  note: string
): Promise<ActivityEvent>;

/** Dismiss an insight on an entity */
export async function dismissInsight(
  entityId: string,
  insightId: string
): Promise<void>;

/** Get entity counts by type (for nav badges) */
export async function getEntityCounts(): Promise<Record<string, number>>;
```

---

## 7. Sample Schema: PE/CRE Fund (Medici Core Vertical)

```typescript
const PE_CRE_SCHEMA: EntitySchema = {
  version: 1,
  tenantId: 'meridian-capital',
  tabLabel: 'Rolodex',
  settings: {
    enableGraphView: true,
    autoCreateEntities: true,
    autoResolveRelationships: true,
    defaultSort: 'last-activity',
    defaultView: 'list',
  },

  entityTypes: [
    // ---- CONTACTS ----
    {
      id: 'contact',
      label: 'Contact',
      labelPlural: 'Contacts',
      icon: '\u25CB',
      color: 'berry-3',
      colorRgb: 'var(--berry-3-rgb)',
      showInNav: true,
      navOrder: 1,
      properties: [
        { id: 'company', label: 'Company', type: 'text', required: false, editable: true, aiPopulated: true },
        { id: 'title', label: 'Title', type: 'text', required: false, editable: true, aiPopulated: true },
        { id: 'email', label: 'Email', type: 'email', required: false, editable: true, aiPopulated: true },
        { id: 'phone', label: 'Phone', type: 'phone', required: false, editable: true, aiPopulated: true },
        { id: 'role', label: 'Role', type: 'enum', required: false, editable: true, aiPopulated: true,
          options: ['Internal', 'LP', 'Service Provider', 'Advisor', 'Counterparty', 'Other'] },
        { id: 'preferred-comm', label: 'Preferred Communication', type: 'enum', required: false, editable: true, aiPopulated: true,
          options: ['Email', 'Phone', 'In-Person', 'Teams/Zoom'] },
        { id: 'notes', label: 'Notes', type: 'rich-text', required: false, editable: true, aiPopulated: false },
        { id: 'birthday', label: 'Birthday', type: 'date', required: false, editable: true, aiPopulated: true },
        { id: 'cultural-notes', label: 'Cultural Notes', type: 'text', required: false, editable: true, aiPopulated: true,
          description: 'Dietary restrictions, holiday observances, communication preferences' },
      ],
      summaryProperties: ['title', 'company', 'role'],
      detailSections: [
        { label: 'Contact Information', propertyIds: ['email', 'phone', 'company', 'title'] },
        { label: 'Relationship', propertyIds: ['role', 'preferred-comm', 'cultural-notes', 'birthday'] },
        { label: 'Notes', propertyIds: ['notes'] },
      ],
      actions: [
        { id: 'email', label: 'Send Email', icon: 'Mail', type: 'compose-email', primary: true },
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: true },
        { id: 'note', label: 'Add Note', icon: 'StickyNote', type: 'add-note', primary: false },
        { id: 'task', label: 'Create Task', icon: 'CheckSquare', type: 'create-task', primary: false },
        { id: 'meeting', label: 'Schedule Meeting', icon: 'Calendar', type: 'schedule-meeting', primary: false },
      ],
      healthIndicator: {
        metric: 'last-interaction',
        thresholds: { healthy: 14, warning: 30, critical: 60 },
        labels: { healthy: 'Active', warning: 'Cooling', critical: 'Cold' },
      },
    },

    // ---- FUNDS ----
    {
      id: 'fund',
      label: 'Fund',
      labelPlural: 'Funds',
      icon: '\u25C8',
      color: 'violet-3',
      colorRgb: 'var(--violet-3-rgb)',
      showInNav: true,
      navOrder: 2,
      properties: [
        { id: 'vintage', label: 'Vintage Year', type: 'number', required: true, editable: false, aiPopulated: true },
        { id: 'strategy', label: 'Strategy', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Real Estate', 'Infrastructure', 'Growth Equity', 'Credit', 'Venture', 'Opportunistic', 'Impact'] },
        { id: 'status', label: 'Status', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Fundraising', 'Investment Period', 'Harvest', 'Wind-Down', 'Liquidated'] },
        { id: 'committed-capital', label: 'Committed Capital', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
        { id: 'lp-count', label: 'LP Count', type: 'number', required: false, editable: true, aiPopulated: true },
        { id: 'fee-structure', label: 'Fee Structure', type: 'text', required: false, editable: true, aiPopulated: true },
        { id: 'preferred-return', label: 'Preferred Return', type: 'percentage', required: false, editable: true, aiPopulated: true },
        { id: 'waterfall-type', label: 'Waterfall', type: 'enum', required: false, editable: true, aiPopulated: true,
          options: ['European', 'American', 'Hybrid'] },
      ],
      summaryProperties: ['vintage', 'strategy', 'status', 'committed-capital'],
      detailSections: [
        { label: 'Fund Overview', propertyIds: ['vintage', 'strategy', 'status', 'committed-capital', 'lp-count'] },
        { label: 'Economics', propertyIds: ['fee-structure', 'preferred-return', 'waterfall-type'] },
      ],
      actions: [
        { id: 'report', label: 'Generate Report', icon: 'FileText', type: 'trigger-workflow', target: 'fee-calc', primary: true },
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: true },
        { id: 'waterfall', label: 'Run Waterfall', icon: 'ArrowDownUp', type: 'trigger-workflow', target: 'lp-waterfall', primary: false },
        { id: 'k1', label: 'Process K-1s', icon: 'FileSpreadsheet', type: 'trigger-workflow', target: 'k1-extract', primary: false },
      ],
      healthIndicator: {
        metric: 'deadline-proximity',
        thresholds: { healthy: 30, warning: 14, critical: 7 },
        labels: { healthy: 'On Track', warning: 'Reporting Due', critical: 'Overdue' },
      },
    },

    // ---- LPs ----
    {
      id: 'lp',
      label: 'LP',
      labelPlural: 'LPs',
      icon: '\u25A0',
      color: 'blue-3',
      colorRgb: 'var(--blue-3-rgb)',
      showInNav: true,
      navOrder: 3,
      properties: [
        { id: 'type', label: 'Type', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Pension', 'Endowment', 'Family Office', 'Sovereign Wealth', 'Insurance', 'Fund of Funds', 'HNWI', 'Other'] },
        { id: 'aum', label: 'Total AUM', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
        { id: 'total-committed', label: 'Committed to Us', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
        { id: 'reup-quarter', label: 'Re-Up Decision', type: 'text', required: false, editable: true, aiPopulated: true },
        { id: 'primary-contact', label: 'Primary Contact', type: 'text', required: false, editable: true, aiPopulated: true },
      ],
      summaryProperties: ['type', 'total-committed', 'reup-quarter'],
      detailSections: [
        { label: 'LP Profile', propertyIds: ['type', 'aum', 'total-committed'] },
        { label: 'Relationship', propertyIds: ['reup-quarter', 'primary-contact'] },
      ],
      actions: [
        { id: 'email', label: 'Send Update', icon: 'Mail', type: 'compose-email', primary: true },
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: true },
        { id: 'report', label: 'LP Report', icon: 'FileText', type: 'trigger-workflow', primary: false },
        { id: 'task', label: 'Create Task', icon: 'CheckSquare', type: 'create-task', primary: false },
      ],
      healthIndicator: {
        metric: 'last-interaction',
        thresholds: { healthy: 30, warning: 60, critical: 90 },
        labels: { healthy: 'Engaged', warning: 'Check In', critical: 'At Risk' },
      },
    },

    // ---- PROPERTIES (Real Estate Assets) ----
    {
      id: 'property',
      label: 'Property',
      labelPlural: 'Properties',
      icon: '\u25A1',
      color: 'taupe-3',
      colorRgb: 'var(--taupe-3-rgb)',
      showInNav: true,
      navOrder: 4,
      properties: [
        { id: 'address', label: 'Address', type: 'text', required: true, editable: true, aiPopulated: true },
        { id: 'asset-type', label: 'Asset Type', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Multifamily', 'Industrial', 'Office', 'Retail', 'Mixed-Use', 'Data Center', 'Land'] },
        { id: 'units', label: 'Units', type: 'number', required: false, editable: true, aiPopulated: true },
        { id: 'sqft', label: 'Sq Footage', type: 'number', required: false, editable: true, aiPopulated: true },
        { id: 'occupancy', label: 'Occupancy', type: 'percentage', required: false, editable: true, aiPopulated: true },
        { id: 'noi', label: 'NOI', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
      ],
      summaryProperties: ['asset-type', 'units', 'occupancy'],
      detailSections: [
        { label: 'Property Details', propertyIds: ['address', 'asset-type', 'units', 'sqft'] },
        { label: 'Performance', propertyIds: ['occupancy', 'noi'] },
      ],
      actions: [
        { id: 'rent-roll', label: 'Run Rent Roll', icon: 'Table', type: 'trigger-workflow', target: 'rent-roll', primary: true },
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: false },
      ],
      healthIndicator: null,
    },
  ],

  relationshipTypes: [
    { id: 'manages', fromType: 'contact', toType: 'fund', forwardLabel: 'manages', reverseLabel: 'managed by', autoInfer: true },
    { id: 'invested-in', fromType: 'lp', toType: 'fund', forwardLabel: 'invested in', reverseLabel: 'LP investor', autoInfer: true },
    { id: 'owns', fromType: 'fund', toType: 'property', forwardLabel: 'owns', reverseLabel: 'owned by', autoInfer: true },
    { id: 'advises', fromType: 'contact', toType: 'fund', forwardLabel: 'advises', reverseLabel: 'advised by', autoInfer: true },
    { id: 'audits', fromType: 'contact', toType: 'fund', forwardLabel: 'audits', reverseLabel: 'audited by', autoInfer: true },
    { id: 'reports-to', fromType: 'contact', toType: 'contact', forwardLabel: 'reports to', reverseLabel: 'manages', autoInfer: true },
    { id: 'primary-contact-for', fromType: 'contact', toType: 'lp', forwardLabel: 'primary contact for', reverseLabel: 'primary contact', autoInfer: true },
    { id: 'co-investor', fromType: 'lp', toType: 'lp', forwardLabel: 'co-investor with', reverseLabel: 'co-investor with', autoInfer: true },
  ],
};
```

---

## 8. Sample Schema: Tax Certification Company

This demonstrates the same infrastructure serving a completely different vertical.

```typescript
const TAX_CERT_SCHEMA: EntitySchema = {
  version: 1,
  tenantId: 'clearpath-tax',
  tabLabel: 'Clients',   // <-- they renamed the tab
  settings: {
    enableGraphView: false,  // Simpler users — list-only by default
    autoCreateEntities: true,
    autoResolveRelationships: true,
    defaultSort: 'health',   // Sort by deadline proximity
    defaultView: 'list',
  },

  entityTypes: [
    // ---- CLIENTS ----
    {
      id: 'client',
      label: 'Client',
      labelPlural: 'Clients',
      icon: '\u25CB',
      color: 'berry-3',
      colorRgb: 'var(--berry-3-rgb)',
      showInNav: true,
      navOrder: 1,
      properties: [
        { id: 'company-name', label: 'Company Name', type: 'text', required: true, editable: true, aiPopulated: true },
        { id: 'contact-name', label: 'Primary Contact', type: 'text', required: false, editable: true, aiPopulated: true },
        { id: 'email', label: 'Email', type: 'email', required: false, editable: true, aiPopulated: true },
        { id: 'phone', label: 'Phone', type: 'phone', required: false, editable: true, aiPopulated: true },
        { id: 'industry', label: 'Industry', type: 'enum', required: false, editable: true, aiPopulated: true,
          options: ['Real Estate', 'Manufacturing', 'Technology', 'Healthcare', 'Financial Services', 'Retail', 'Energy', 'Other'] },
        { id: 'annual-revenue', label: 'Annual Revenue', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
        { id: 'engagement-type', label: 'Engagement Type', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Full Service', 'Review Only', 'Appeal Support', 'Consulting'] },
        { id: 'client-since', label: 'Client Since', type: 'date', required: false, editable: true, aiPopulated: true },
      ],
      summaryProperties: ['company-name', 'engagement-type', 'industry'],
      detailSections: [
        { label: 'Company Info', propertyIds: ['company-name', 'industry', 'annual-revenue', 'client-since'] },
        { label: 'Contact', propertyIds: ['contact-name', 'email', 'phone'] },
        { label: 'Engagement', propertyIds: ['engagement-type'] },
      ],
      actions: [
        { id: 'email', label: 'Send Email', icon: 'Mail', type: 'compose-email', primary: true },
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: true },
        { id: 'new-filing', label: 'Start Filing', icon: 'FilePlus', type: 'trigger-workflow', target: 'new-filing', primary: true },
        { id: 'note', label: 'Add Note', icon: 'StickyNote', type: 'add-note', primary: false },
      ],
      healthIndicator: {
        metric: 'last-interaction',
        thresholds: { healthy: 14, warning: 30, critical: 60 },
        labels: { healthy: 'Active', warning: 'Follow Up', critical: 'Needs Attention' },
      },
    },

    // ---- FILINGS ----
    {
      id: 'filing',
      label: 'Filing',
      labelPlural: 'Filings',
      icon: '\u25A1',
      color: 'violet-3',
      colorRgb: 'var(--violet-3-rgb)',
      showInNav: true,
      navOrder: 2,
      properties: [
        { id: 'filing-type', label: 'Filing Type', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Property Tax', 'Sales Tax', 'Income Tax', 'Payroll Tax', 'Use Tax', 'Exemption Certificate'] },
        { id: 'jurisdiction', label: 'Jurisdiction', type: 'text', required: true, editable: true, aiPopulated: true },
        { id: 'tax-year', label: 'Tax Year', type: 'number', required: true, editable: true, aiPopulated: true },
        { id: 'deadline', label: 'Deadline', type: 'date', required: true, editable: true, aiPopulated: true },
        { id: 'status', label: 'Status', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Not Started', 'In Progress', 'Under Review', 'Filed', 'Accepted', 'Rejected', 'Under Appeal'] },
        { id: 'assessed-value', label: 'Assessed Value', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
        { id: 'tax-savings', label: 'Tax Savings', type: 'currency', required: false, editable: true, aiPopulated: true, format: '$#,###' },
        { id: 'assigned-to', label: 'Assigned To', type: 'text', required: false, editable: true, aiPopulated: false },
      ],
      summaryProperties: ['filing-type', 'jurisdiction', 'deadline', 'status'],
      detailSections: [
        { label: 'Filing Details', propertyIds: ['filing-type', 'jurisdiction', 'tax-year', 'deadline', 'status', 'assigned-to'] },
        { label: 'Financials', propertyIds: ['assessed-value', 'tax-savings'] },
      ],
      actions: [
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: true },
        { id: 'generate-filing', label: 'Generate Filing', icon: 'FileText', type: 'trigger-workflow', target: 'generate-filing', primary: true },
        { id: 'appeal', label: 'Start Appeal', icon: 'Scale', type: 'trigger-workflow', target: 'file-appeal', primary: false },
        { id: 'task', label: 'Create Task', icon: 'CheckSquare', type: 'create-task', primary: false },
      ],
      healthIndicator: {
        metric: 'deadline-proximity',
        thresholds: { healthy: 30, warning: 14, critical: 7 },
        labels: { healthy: 'On Track', warning: 'Due Soon', critical: 'Urgent' },
      },
    },

    // ---- JURISDICTIONS ----
    {
      id: 'jurisdiction',
      label: 'Jurisdiction',
      labelPlural: 'Jurisdictions',
      icon: '\u2691',
      color: 'blue-3',
      colorRgb: 'var(--blue-3-rgb)',
      showInNav: true,
      navOrder: 3,
      properties: [
        { id: 'level', label: 'Level', type: 'enum', required: true, editable: true, aiPopulated: true,
          options: ['Federal', 'State', 'County', 'Municipal', 'Special District'] },
        { id: 'state', label: 'State', type: 'text', required: false, editable: true, aiPopulated: true },
        { id: 'filing-frequency', label: 'Filing Frequency', type: 'enum', required: false, editable: true, aiPopulated: true,
          options: ['Annual', 'Semi-Annual', 'Quarterly', 'Monthly', 'As Needed'] },
        { id: 'portal-url', label: 'Portal URL', type: 'url', required: false, editable: true, aiPopulated: true },
        { id: 'notes', label: 'Notes', type: 'rich-text', required: false, editable: true, aiPopulated: false,
          description: 'Quirks, known issues, contact info for the tax office' },
      ],
      summaryProperties: ['level', 'state', 'filing-frequency'],
      detailSections: [
        { label: 'Jurisdiction Details', propertyIds: ['level', 'state', 'filing-frequency'] },
        { label: 'Access', propertyIds: ['portal-url'] },
        { label: 'Notes', propertyIds: ['notes'] },
      ],
      actions: [
        { id: 'chat', label: 'Ask Cosimo', icon: 'MessageSquare', type: 'start-chat', primary: true },
        { id: 'link', label: 'Open Portal', icon: 'ExternalLink', type: 'external-link', target: '{{portal-url}}', primary: true },
      ],
      healthIndicator: null,
    },
  ],

  relationshipTypes: [
    { id: 'client-filing', fromType: 'client', toType: 'filing', forwardLabel: 'has filing', reverseLabel: 'filed for', autoInfer: true },
    { id: 'filing-jurisdiction', fromType: 'filing', toType: 'jurisdiction', forwardLabel: 'filed in', reverseLabel: 'has filings', autoInfer: true },
    { id: 'client-jurisdiction', fromType: 'client', toType: 'jurisdiction', forwardLabel: 'operates in', reverseLabel: 'has clients', autoInfer: true },
  ],
};
```

---

## 9. Sample Mock Data: PE/CRE Vertical

> **Note:** This is a representative subset — 3 entities showing one of each type (Contact, Fund, LP) plus a timeline. The full mock dataset for implementation would include all entities from the existing Brain graph (~80 nodes across categories) migrated to the new Entity format. Relationship targets like `marcus-webb`, `david-park`, `erabor`, `prop-berkshire` etc. reference entities that would exist in the full dataset but are omitted here for brevity.

```typescript
// ============================================
// MOCK ENTITIES — PE/CRE (Meridian Capital)
// ============================================
// Representative subset. Full dataset migrates all Brain graph nodes.

const MOCK_ENTITIES_PE: Entity[] = [
  {
    id: 'sarah-chen',
    typeId: 'contact',
    name: 'Sarah Chen',
    subtitle: 'CFO',
    avatarUrl: undefined,
    properties: {
      'company': 'Meridian Capital Partners',
      'title': 'Chief Financial Officer',
      'email': 'schen@meridiancap.com',
      'phone': '+1 (212) 555-0142',
      'role': 'Internal',
      'preferred-comm': 'Email',
      'notes': null,
      'birthday': '1978-06-15',
      'cultural-notes': 'Prefers executive summaries. Direct communicator. Available early mornings.',
    },
    aiSummary: 'Sarah is the CFO and primary approver for quarterly reports. She prefers concise executive summaries over detailed breakdowns. She manages the relationship with Deloitte and oversees Fund III and Erabor directly.',
    insights: [
      {
        id: 'ins-1',
        type: 'reminder',
        text: 'Sarah\'s birthday is June 15 — 3 months away.',
        generatedAt: '2026-03-19T08:00:00Z',
        dismissed: false,
      },
      {
        id: 'ins-2',
        type: 'alert',
        text: 'Q4 report for Fund III is awaiting Sarah\'s approval (3 days pending).',
        generatedAt: '2026-03-18T10:00:00Z',
        dismissed: false,
        suggestedActionId: 'email',
      },
    ],
    health: 'healthy',
    relationships: [
      { relationshipTypeId: 'manages', targetEntityId: 'fund-iii', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'manages', targetEntityId: 'erabor', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'reports-to', targetEntityId: 'marcus-webb', direction: 'reverse', metadata: 'Direct report', autoInferred: true },
    ],
    linkedThreadIds: ['fund3', 'hilgard', 'q4lp'],
    linkedWorkflowIds: ['fee-calc', 'k1-extract'],
    linkedLessonIds: ['rent-roll-format', 'fee-calc-rules'],
    linkedMemoryFactIndices: [1, 6],
    linkedKanbanCardIds: ['task-q4-review'],
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-03-14T00:00:00Z',
    lastActivityAt: '2026-03-17T14:30:00Z',
    sources: [
      { type: 'email', label: 'Resolved from email correspondence', capturedAt: '2026-01-15T00:00:00Z' },
      { type: 'conversation', label: 'Details added via chat with Cosimo', capturedAt: '2026-02-12T00:00:00Z' },
    ],
    tags: ['executive', 'approver'],
  },

  {
    id: 'fund-iii',
    typeId: 'fund',
    name: 'Fund III',
    subtitle: '2019 Vintage',
    properties: {
      'vintage': '2019',
      'strategy': 'Real Estate',
      'status': 'Harvest',
      'committed-capital': '420000000',
      'lp-count': '14',
      'fee-structure': '2/20 with European waterfall',
      'preferred-return': '8',
      'waterfall-type': 'European',
    },
    aiSummary: 'Fund III is the firm\'s flagship 2019 real estate fund with $420M committed. Currently in harvest period with strong performance. 14 LP investors. Managed by Sarah Chen with Marcus Webb overseeing LP comms.',
    insights: [
      {
        id: 'ins-f1',
        type: 'alert',
        text: 'Q4 quarterly report is 3 days past the internal deadline.',
        generatedAt: '2026-03-19T08:00:00Z',
        dismissed: false,
        suggestedActionId: 'report',
      },
      {
        id: 'ins-f2',
        type: 'milestone',
        text: 'Fund III crossed 1.5x MOIC this quarter.',
        generatedAt: '2026-03-15T00:00:00Z',
        dismissed: false,
      },
    ],
    health: 'warning',
    relationships: [
      { relationshipTypeId: 'manages', targetEntityId: 'sarah-chen', direction: 'reverse', autoInferred: true },
      { relationshipTypeId: 'invested-in', targetEntityId: 'calpers', direction: 'reverse', autoInferred: true },
      { relationshipTypeId: 'owns', targetEntityId: 'prop-berkshire', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'owns', targetEntityId: 'prop-marina', direction: 'forward', autoInferred: true },
    ],
    linkedThreadIds: ['fund3', 'q4lp', 'k1'],
    linkedWorkflowIds: ['lp-waterfall', 'k1-extract', 'fee-calc', 'rent-roll'],
    linkedLessonIds: ['waterfall-calc', 'fee-calc-rules'],
    linkedMemoryFactIndices: [2],
    linkedKanbanCardIds: ['task-q4-review', 'task-annual-audit'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    lastActivityAt: '2026-03-18T09:00:00Z',
    sources: [
      { type: 'document', label: 'Extracted from LPA documents', capturedAt: '2026-01-10T00:00:00Z' },
      { type: 'manual', label: 'Fee structure confirmed by user', capturedAt: '2026-02-10T00:00:00Z' },
    ],
    tags: ['flagship', 'real-estate'],
  },

  {
    id: 'calpers',
    typeId: 'lp',
    name: 'CalPERS',
    subtitle: 'Institutional LP',
    properties: {
      'type': 'Pension',
      'aum': '500000000000',
      'total-committed': '45000000',
      'reup-quarter': 'Q4 2026',
      'primary-contact': 'David Park',
    },
    aiSummary: 'CalPERS is the largest LP across the platform, committed $45M across 3 funds. Re-up decisions happen in Q4 — David Park manages this relationship. Strong engagement, regular quarterly check-ins.',
    insights: [
      {
        id: 'ins-lp1',
        type: 'opportunity',
        text: 'CalPERS re-up decision is in Q4 2026. Begin prep materials by Q2.',
        generatedAt: '2026-03-19T08:00:00Z',
        dismissed: false,
        suggestedActionId: 'task',
      },
    ],
    health: 'healthy',
    relationships: [
      { relationshipTypeId: 'invested-in', targetEntityId: 'fund-iii', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'invested-in', targetEntityId: 'growth-i', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'invested-in', targetEntityId: 'co-invest-iii', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'primary-contact-for', targetEntityId: 'david-park', direction: 'reverse', autoInferred: true },
    ],
    linkedThreadIds: ['q4lp'],
    linkedWorkflowIds: ['lp-waterfall'],
    linkedLessonIds: [],
    linkedMemoryFactIndices: [],
    linkedKanbanCardIds: ['task-calpers-reup-prep'],
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    lastActivityAt: '2026-03-10T16:00:00Z',
    sources: [
      { type: 'document', label: 'Extracted from subscription agreements', capturedAt: '2026-01-10T00:00:00Z' },
    ],
    tags: ['tier-1', 'reup-2026'],
  },
];

// ============================================
// MOCK TIMELINE — Sarah Chen
// ============================================

const MOCK_TIMELINE_SARAH: ActivityEvent[] = [
  {
    id: 'evt-1',
    entityId: 'sarah-chen',
    type: 'email-received',
    title: 'Email from Sarah Chen',
    description: 'Re: Q4 Fund III report — requesting revised executive summary with updated IRR figures',
    timestamp: '2026-03-17T14:30:00Z',
    source: 'email',
    refId: 'email-thread-4521',
    refType: 'thread',
    involvedEntityIds: ['fund-iii'],
  },
  {
    id: 'evt-2',
    entityId: 'sarah-chen',
    type: 'workflow-completed',
    title: 'K-1 extraction completed',
    description: 'K-1 batch for Fund III — 14 documents processed, 0 exceptions',
    timestamp: '2026-03-15T11:00:00Z',
    source: 'workflow',
    refId: 'wf-run-k1-batch-14',
    refType: 'workflow-run',
    involvedEntityIds: ['fund-iii'],
  },
  {
    id: 'evt-3',
    entityId: 'sarah-chen',
    type: 'meeting-completed',
    title: 'Q4 Review Meeting',
    description: 'Quarterly review with Sarah and Marcus. Discussed Fund III performance and Erabor pipeline.',
    timestamp: '2026-03-12T10:00:00Z',
    source: 'calendar',
    involvedEntityIds: ['marcus-webb', 'fund-iii', 'erabor'],
  },
  {
    id: 'evt-4',
    entityId: 'sarah-chen',
    type: 'chat-mention',
    title: 'Mentioned in chat thread',
    description: 'Referenced in "Hilgard rent roll review" — Cosimo noted Sarah\'s formatting preferences apply',
    timestamp: '2026-03-10T16:45:00Z',
    source: 'chat',
    refId: 'hilgard',
    refType: 'thread',
    involvedEntityIds: ['hilgard'],
  },
  {
    id: 'evt-5',
    entityId: 'sarah-chen',
    type: 'document-shared',
    title: 'Shared Q4 draft report',
    description: 'Fund III Q4 2025 draft sent to Sarah for review',
    timestamp: '2026-03-08T09:15:00Z',
    source: 'email',
    involvedEntityIds: ['fund-iii'],
  },
  {
    id: 'evt-6',
    entityId: 'sarah-chen',
    type: 'note-added',
    title: 'Note added',
    description: 'Sarah prefers executive summaries. Updated communication preference.',
    timestamp: '2026-02-12T00:00:00Z',
    source: 'manual',
    involvedEntityIds: [],
  },
];
```

---

## 10. Sample Mock Data: Tax Cert Vertical

```typescript
// ============================================
// MOCK ENTITIES — Tax Certification (ClearPath Tax)
// ============================================

const MOCK_ENTITIES_TAX: Entity[] = [
  {
    id: 'acme-manufacturing',
    typeId: 'client',
    name: 'Acme Manufacturing',
    subtitle: 'Full Service Client',
    properties: {
      'company-name': 'Acme Manufacturing Inc.',
      'contact-name': 'Linda Torres',
      'email': 'ltorres@acmemfg.com',
      'phone': '+1 (713) 555-0198',
      'industry': 'Manufacturing',
      'annual-revenue': '85000000',
      'engagement-type': 'Full Service',
      'client-since': '2023-04-01',
    },
    aiSummary: 'Acme Manufacturing is a full-service client since 2023. They have property tax filings across 4 states with significant assessed values in Texas and Ohio. Linda Torres is the primary contact. 2 filings approaching deadline.',
    insights: [
      {
        id: 'ins-t1',
        type: 'alert',
        text: 'Texas property tax protest deadline is April 15 — 27 days away.',
        generatedAt: '2026-03-19T08:00:00Z',
        dismissed: false,
        suggestedActionId: 'new-filing',
      },
      {
        id: 'ins-t2',
        type: 'opportunity',
        text: 'Acme acquired a new facility in Columbus, OH last month. May need new exemption filing.',
        generatedAt: '2026-03-17T00:00:00Z',
        dismissed: false,
      },
    ],
    health: 'warning',
    relationships: [
      { relationshipTypeId: 'client-filing', targetEntityId: 'filing-acme-tx-2025', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'client-filing', targetEntityId: 'filing-acme-oh-2025', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'client-jurisdiction', targetEntityId: 'harris-county-tx', direction: 'forward', autoInferred: true },
      { relationshipTypeId: 'client-jurisdiction', targetEntityId: 'franklin-county-oh', direction: 'forward', autoInferred: true },
    ],
    linkedThreadIds: ['thread-acme-review'],
    linkedWorkflowIds: ['new-filing', 'generate-filing'],
    linkedLessonIds: ['tx-protest-rules'],
    linkedMemoryFactIndices: [],
    linkedKanbanCardIds: ['task-acme-tx-protest', 'task-acme-oh-exemption'],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-17T00:00:00Z',
    lastActivityAt: '2026-03-17T11:00:00Z',
    sources: [
      { type: 'email', label: 'Initial engagement emails', capturedAt: '2023-04-01T00:00:00Z' },
      { type: 'document', label: 'Tax filing documents ingested', capturedAt: '2026-01-05T00:00:00Z' },
    ],
    tags: ['manufacturing', 'multi-state'],
  },

  {
    id: 'filing-acme-tx-2025',
    typeId: 'filing',
    name: 'Acme — Harris County Property Tax 2025',
    subtitle: 'Protest Deadline: Apr 15',
    properties: {
      'filing-type': 'Property Tax',
      'jurisdiction': 'Harris County, TX',
      'tax-year': '2025',
      'deadline': '2026-04-15',
      'status': 'In Progress',
      'assessed-value': '12500000',
      'tax-savings': null,
      'assigned-to': 'Mike Rodriguez',
    },
    aiSummary: 'Property tax protest filing for Acme\'s Houston manufacturing facility. Assessed value of $12.5M is likely overvalued based on recent comparable sales. Protest deadline April 15. Mike Rodriguez is handling.',
    insights: [
      {
        id: 'ins-f-t1',
        type: 'alert',
        text: 'Deadline in 27 days. Comparable sales analysis not yet started.',
        generatedAt: '2026-03-19T08:00:00Z',
        dismissed: false,
        suggestedActionId: 'task',
      },
    ],
    health: 'warning',
    relationships: [
      { relationshipTypeId: 'client-filing', targetEntityId: 'acme-manufacturing', direction: 'reverse', autoInferred: true },
      { relationshipTypeId: 'filing-jurisdiction', targetEntityId: 'harris-county-tx', direction: 'forward', autoInferred: true },
    ],
    linkedThreadIds: [],
    linkedWorkflowIds: ['generate-filing'],
    linkedLessonIds: ['tx-protest-rules'],
    linkedMemoryFactIndices: [],
    linkedKanbanCardIds: ['task-acme-tx-protest'],
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-03-15T00:00:00Z',
    lastActivityAt: '2026-03-15T14:00:00Z',
    sources: [
      { type: 'document', label: 'Harris County appraisal notice', capturedAt: '2026-02-01T00:00:00Z' },
    ],
    tags: ['protest', 'high-value'],
  },

  {
    id: 'harris-county-tx',
    typeId: 'jurisdiction',
    name: 'Harris County, TX',
    subtitle: 'County — Texas',
    properties: {
      'level': 'County',
      'state': 'Texas',
      'filing-frequency': 'Annual',
      'portal-url': 'https://hcad.org',
      'notes': 'Protest deadline is typically May 15 or 30 days after notice. Informal hearings available. ARB hearings can be scheduled online.',
    },
    aiSummary: 'Harris County Appraisal District (HCAD) — largest appraisal district in Texas. Annual property tax protest deadline is typically May 15. Online portal at hcad.org for filing and hearing scheduling.',
    insights: [],
    health: null,
    relationships: [
      { relationshipTypeId: 'filing-jurisdiction', targetEntityId: 'filing-acme-tx-2025', direction: 'reverse', autoInferred: true },
      { relationshipTypeId: 'client-jurisdiction', targetEntityId: 'acme-manufacturing', direction: 'reverse', autoInferred: true },
    ],
    linkedThreadIds: [],
    linkedWorkflowIds: [],
    linkedLessonIds: ['tx-protest-rules'],
    linkedMemoryFactIndices: [],
    linkedKanbanCardIds: [],
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
    lastActivityAt: '2026-03-15T14:00:00Z',
    sources: [
      { type: 'integration', label: 'HCAD public data', capturedAt: '2026-01-05T00:00:00Z' },
    ],
    tags: ['texas'],
  },
];
```

---

## 11. UI Component Mapping

This maps the schema concepts to actual frontend components. All components follow existing Cosimo patterns (ShadCN, CVA, Tailwind, `cn()`, `data-slot`).

### New Route Structure

```
/rolodex                             → _app.rolodex.tsx (layout)
  /rolodex                           → Entity list (default)
  /rolodex/:entityId                 → Entity detail (full-page mode)
```

The entity detail can also open as a slide-over panel (like the existing Cosimo panel) from any view, triggered by clicking an entity name in Chat, Workflows, or Knowledge.

### Component Hierarchy

```
Rolodex Tab
├── RolodexSidebar                    (left sidebar — entity type nav + search)
│   ├── EntityTypeFilter              (type filter pills, like Brain's category nav)
│   ├── EntitySearchInput             (search bar)
│   └── EntityQuickList               (condensed entity list for sidebar)
│
├── RolodexMain                       (main content area)
│   ├── RolodexToolbar                (view mode toggle, sort, bulk actions)
│   ├── EntityListView                (default — filterable, sortable list)
│   │   └── EntityListItem            (row: avatar, name, subtitle, summary props, health dot)
│   ├── EntityGridView                (card grid alternative)
│   │   └── EntityCard                (card: avatar, name, key props, health, insight count)
│   └── EntityGraphView               (graph visualization — evolved from Brain's entity-graph)
│       └── (reuses existing graph infrastructure with schema-driven categories)
│
└── EntityDetailPanel                 (slide-over or full-page)
    ├── EntityDetailHeader            (avatar, name, subtitle, health badge, action buttons)
    ├── EntityInsightBar              (AI insights/alerts strip — dismissible)
    ├── EntityDetailTabs              (Overview | Timeline | Relationships | Linked)
    │   ├── OverviewTab
    │   │   ├── EntityPropertySection (grouped properties from detailSections)
    │   │   │   └── EntityPropertyRow (label + value, inline editing)
    │   │   └── EntityAiSummary       (AI-generated summary block)
    │   ├── TimelineTab
    │   │   └── ActivityTimeline      (chronological event stream)
    │   │       └── ActivityEventItem (icon, title, description, timestamp, drill-through link)
    │   ├── RelationshipsTab
    │   │   └── RelationshipGroup     (grouped by relationship type)
    │   │       └── RelatedEntityRow  (clickable, opens target entity detail)
    │   └── LinkedTab
    │       ├── LinkedThreadsList     (chat threads mentioning this entity)
    │       ├── LinkedWorkflowsList   (associated workflow templates)
    │       ├── LinkedLessonsList     (relevant lessons from Knowledge)
    │       └── LinkedKanbanCards     (tasks/projects from kanban)
    └── EntityActionBar               (fixed bottom bar with primary + overflow actions)
```

### Reuse of Existing UI Components

| Existing Component | Reuse In Entity System |
|---|---|
| `badge.tsx` | Health status badges, entity type badges |
| `status-dot.tsx` | Health indicator dots in list/grid view |
| `kv-row.tsx` | Property display rows in entity detail |
| `filter-pill.tsx` | Entity type filter pills in sidebar |
| `avatar.tsx` | Entity avatars in list/detail views |
| `tabs.tsx` | Entity detail tabs (Overview/Timeline/etc.) |
| `card.tsx` | Entity cards in grid view |
| `scroll-area.tsx` | Scrollable entity list and timeline |
| `empty-state.tsx` | Empty states for no entities, no timeline events |
| `section-panel.tsx` | Property section containers in detail view |
| `tooltip.tsx` | Property descriptions, health indicator explanations |
| `dropdown-menu.tsx` | Action overflow menu |
| `input.tsx` / `input-group.tsx` | Inline property editing |
| `sheet.tsx` | Slide-over entity detail panel |

### New Components Needed

| Component | Purpose | Estimated Size |
|---|---|---|
| `EntityListItem` | Row in list view | ~80 lines |
| `EntityCard` | Card in grid view | ~100 lines |
| `EntityDetailHeader` | Top section of detail panel | ~120 lines |
| `EntityInsightBar` | Dismissible insight strip | ~80 lines |
| `EntityPropertySection` | Grouped properties with section headers | ~100 lines |
| `EntityPropertyRow` | Single property with inline editing | ~120 lines |
| `ActivityTimeline` | Chronological event list | ~150 lines |
| `ActivityEventItem` | Single timeline event | ~80 lines |
| `RelationshipGroup` | Grouped related entities | ~80 lines |
| `EntityActionBar` | Action buttons (primary + overflow) | ~80 lines |
| `RolodexToolbar` | View mode + sort controls | ~80 lines |

All under 300 lines. No mega-components.

---

## 12. Integration Points

### Entities ↔ Chat

**Entity → Chat:**
- "Ask Cosimo" action opens a new thread with entity context pre-loaded
- Cosimo knows the entity's properties, relationships, and recent activity
- Prompt template: `"Tell me about {{entity.name}}"` or `"Draft an email to {{entity.name}} about {{topic}}"`

**Chat → Entity:**
- Entity names in chat messages are **clickable** — opens entity detail panel as slide-over
- When Cosimo mentions an entity, it renders as a linked chip (like the existing `linkedEntities` on memory facts)
- Thread store tracks `mentionedEntityIds` per thread for cross-referencing

### Entities ↔ Workflows

**Entity → Workflow:**
- Actions like "Run Rent Roll" or "Generate Report" trigger a workflow with the entity as input context
- The entity's properties auto-populate workflow input fields (via schema field mapping)
- Entity detail view shows linked workflow templates and recent runs

**Workflow → Entity:**
- Workflow runs can create/update entities (e.g., an ingestion workflow creates new contacts)
- Workflow nodes can reference entities (e.g., "Send output to {{contact.email}}")
- Run results appear in the entity's activity timeline

### Entities ↔ Knowledge

**Entity → Knowledge:**
- Entity detail "Linked" tab shows relevant lessons
- Clicking a lesson navigates to Knowledge > Lessons > Lesson Detail
- Memory facts with `linkedEntities` matching this entity are surfaced

**Knowledge → Entity:**
- Lessons can reference entity types (e.g., "This lesson applies to all Fund entities")
- Memory facts already have `linkedEntities` — these now link bidirectionally
- From a lesson, clicking a linked entity opens the entity detail

### Entities ↔ Kanban (Future)

**Entity → Kanban:**
- "Create Task" action creates a kanban card linked to this entity
- Entity detail "Linked" tab shows active kanban cards
- Entity health can factor in task completion status

**Kanban → Entity:**
- Kanban cards have `linkedEntityIds` — clicking opens entity detail
- Moving a card to "Done" creates an activity event on the linked entity
- Kanban board can be filtered by entity (e.g., "Show all tasks for CalPERS")

### Cross-Cutting: Entity Mentions Everywhere

The entity system introduces a **universal entity reference** pattern. Anywhere in Cosimo where an entity name appears — chat messages, workflow nodes, lesson content, kanban cards — it renders as a clickable chip that opens the entity detail panel. This is the "ambient" quality: the entity system isn't a tab you go to, it's a layer that's always available.

```typescript
/**
 * A universal entity reference used across all views.
 * Renders as a colored chip with the entity name.
 * Clicking opens the entity detail panel as a slide-over.
 */
export interface EntityMention {
  entityId: string;
  displayName: string;
  typeId: string;
}
```

This replaces/evolves the existing `LinkedEntity` type which only has `name` and `type` (strings). The new `EntityMention` has an actual `entityId` that resolves to a full entity.

---

## 13. Migration Path from Current Brain Graph

The existing Brain graph data (`GraphData`, `GraphNode`, `GraphCategory`) maps cleanly to the new entity system:

| Current Brain Concept | New Entity Concept |
|---|---|
| `GraphCategory` | `EntityTypeDefinition` |
| `GraphNode` | `Entity` (enriched with properties, timeline, actions) |
| `GraphNode.facts[]` | `Entity.properties` + `Entity.aiSummary` |
| `GraphNode.related[]` | `Entity.relationships[]` (typed, bidirectional) |
| `GraphEdge` | `EntityRelationship` (with relationship type metadata) |
| `GraphData.nodes` | Service: `getEntities()` |
| `GRAPH_CATEGORY_COLORS` | `EntityTypeDefinition.color` (schema-driven) |

The graph visualization component (`entity-graph.tsx`) can be refactored to read from the entity service instead of the brain service, using the schema for category colors and icons. The drill-down behavior (root → cluster → entity) remains the same, but the entity-level view now opens the full `EntityDetailPanel` instead of the minimal `entity-detail.tsx`.

### Backward Compatibility

The existing `LinkedEntity` type on `MemoryFact` should be evolved to `EntityMention`:

```typescript
// Before (current)
export interface LinkedEntity {
  name: string;
  type: string;
}

// After (new — backward compatible)
export interface LinkedEntity {
  name: string;
  type: string;
  entityId?: string;  // Optional — populated when entity resolution succeeds
}
```

This allows the memory system to work with both resolved entities (clickable, navigable) and unresolved mentions (display-only, like today).

---

## 14. Setup Flow: How a New Tenant Gets Their Schema

This is the Cosimo-native alternative to a "CRM admin panel."

### Step 1: Data Ingestion
The tenant connects their data sources (email, documents, calendar). The ingestor runs and builds the initial knowledge graph.

### Step 2: Schema Proposal
Cosimo analyzes the graph and proposes a schema:

> *"I've analyzed your data and found these types of entities: **Clients** (47), **Properties** (23), **Filings** (156), and **Jurisdictions** (12). I've also identified common relationship patterns like 'Client has Filing' and 'Filing filed in Jurisdiction.' Does this structure make sense for how you think about your work?"*

### Step 3: Refinement via Conversation
The user can adjust through natural language:

> User: *"We also track our internal team members separately from clients. And we call them 'Engagements' not 'Filings.'"*
>
> Cosimo: *"Got it — I'll add a **Team Member** entity type and rename Filing to **Engagement**. I'll re-categorize the 12 internal contacts I found. Anything else?"*

### Step 4: Schema Saved
The refined schema is saved and the Rolodex tab populates with the resolved entities. The user can continue refining at any time through conversation.

### Step 5: Ongoing Evolution
As new data flows in, Cosimo may suggest schema additions:

> *"I've noticed several email threads reference 'insurance carriers' that don't fit your current entity types. Want me to add an **Insurance Carrier** type?"*

This is the key UX innovation: the CRM configures itself through conversation, not through an admin panel. Non-technical users can set it up without knowing what a "custom object" is.

---

## 15. Open Questions for CTO Discussion

1. **Entity resolution pipeline** — Where does entity resolution happen? Is it a step in the ingestor, a separate service, or part of the graph-RAG query layer? The frontend just needs an API; this doc doesn't prescribe the backend architecture.

2. **Real-time updates** — When new data comes in (email, document upload), how quickly should entities update? WebSocket push vs. polling vs. refresh-on-navigate?

3. **Conflict resolution** — When the AI infers a property value that conflicts with a user edit, who wins? Suggestion: user edits are "pinned" and AI can only suggest changes to pinned fields (shown as an insight), not overwrite them.

4. **Schema versioning** — When the schema changes (new entity type, renamed property), how do existing entities migrate? Suggestion: additive changes are automatic; breaking changes require a migration step.

5. **Kanban integration** — How tightly coupled should entities and kanban cards be? Options range from "kanban cards can optionally link to entities" (loose) to "every kanban card must belong to an entity" (tight). The cofounder's kanban work may influence this.

6. **Permissions / visibility** — In a multi-user team, can different users see different entities? Does the schema vary per user or per tenant? Suggestion: schema is per-tenant; visibility is per-user via access controls on the entity instances.

7. **Graph view evolution** — Should the graph visualization in Rolodex be the same component as the current Brain graph, or a purpose-built replacement? The current `entity-graph.tsx` is SVG-based with manual layout — at scale (100+ entities), it may need a proper graph rendering library.

8. **Mobile / responsive** — The entity list view is naturally mobile-friendly. The graph view is not. Should mobile users get list-only? Or a simplified graph?
