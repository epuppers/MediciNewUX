// ============================================
// TypeScript Interfaces — Medici Data Layer
// ============================================
// All data shapes used across the application.
// Components receive these types via route loaders
// or service functions — never import MOCK_* directly.

// ============================================
// CHAT THREADS & MESSAGES
// ============================================

/** Indicator badge shown on a thread in the sidebar */
export interface ThreadIndicator {
  type: 'ready' | 'waiting' | 'running' | 'streaming' | 'error';
  label: string;
}

/** File attachment on a user or AI message */
export interface Attachment {
  name: string;
  type: string;
  size?: string;
  pages?: number;
  sheets?: string[];
  fileCount?: number;
  error?: string;
}

/** Artifact embedded in an AI message (table, flow graph, metadata card, text block) */
export interface Artifact {
  title: string;
  type: 'table' | 'flow-graph' | 'metadata' | 'text';
  data: ArtifactTableData | ArtifactMetadataData | ArtifactFlowGraphData | string;
}

/** Data for a table-type artifact */
export interface ArtifactTableData {
  headers: string[];
  rows: string[][];
}

/** Data for a metadata-type artifact (key-value pairs) */
export interface ArtifactMetadataData {
  entries: { label: string; value: string }[];
}

/** Data for a flow-graph artifact (references a template) */
export interface ArtifactFlowGraphData {
  templateId: string;
  compact?: boolean;
}

/** A source citation referenced from message content */
export interface Citation {
  id: number;
  title: string;
  url: string;
  source?: 'file' | 'web' | 'document';
}

/** A single message in a chat thread */
export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  model?: string;
  timestamp?: string;
  latency?: string;
  attachments?: Attachment[];
  artifacts?: Artifact[];
  isGate?: boolean;
  gateStatus?: 'awaiting' | 'resolved';
  commandChip?: string;
  /** Error state — renders as a red error box instead of normal content */
  isError?: boolean;
  error?: {
    title: string;
    detail: string;
    meta: string;
  };
  /** Source citations referenced by inline <sup class="cite-ref"> markers in content */
  citations?: Citation[];
}

/** A chat thread containing messages */
export interface Thread {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  model: string;
  workflowRunId?: string | null;
  indicators: ThreadIndicator[];
  messages: Message[];
  hasFiles?: boolean;
  keywords?: string;
}

// ============================================
// WORKFLOW TEMPLATES
// ============================================

/** How a workflow run can be triggered */
export type TriggerType = 'manual' | 'folder-watch' | 'schedule' | 'email' | 'chat-command' | 'chained';

/** Configuration for workflow triggers */
export interface TriggerConfig {
  watchPath?: string;
  chatCommand?: string;
  schedule?: string;
  emailAddress?: string;
}

/** A condition branch on a branch node */
export interface BranchCondition {
  label: string;
  target: string;
}

/** Node type in a workflow flow graph */
export type FlowNodeType = 'input' | 'action' | 'gate' | 'branch' | 'output';

/** A node in the workflow flow graph */
export interface FlowNode {
  id: string;
  type: FlowNodeType;
  title: string;
  description: string;
  lesson: string | null;
  x: number;
  y: number;
  conditions?: BranchCondition[];
}

/** An edge connecting two nodes in the flow graph */
export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

/** Aggregate run statistics for a template */
export interface RunStats {
  total: number;
  successRate: number;
  avgDuration: string;
  filesProcessed: number;
}

/** A recent run entry shown on the template detail page */
export interface RecentRun {
  id: string;
  status: 'success' | 'failed';
  trigger: string;
  time: string;
  duration: string;
  threadId: string | null;
}

/** Schema field definition for workflow input */
export interface SchemaField {
  name: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'enum' | 'boolean';
  required: boolean;
  description: string;
  options?: string[];
}

/** Input schema for a workflow template */
export interface InputSchema {
  description: string;
  fields: SchemaField[];
}

/** Output schema for a workflow template */
export interface OutputSchema {
  format: string;
  destination: string;
  columns: string[];
}

/** A reusable workflow blueprint */
export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  version: number;
  createdBy: string;
  createdDate: string;
  triggerType: TriggerType;
  triggerConfig: TriggerConfig;
  linkedLessons: string[];
  linkedEntities: string[];
  inputSchema: InputSchema;
  outputSchema: OutputSchema;
  nodes: FlowNode[];
  edges: FlowEdge[];
  runs: RunStats;
  recentRuns: RecentRun[];
}

// ============================================
// WORKFLOW RUNS
// ============================================

/** Execution status of a single node in a run */
export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting';

/** An exception flagged during a workflow run */
export interface RunException {
  nodeId: string;
  type: 'inference' | 'low-confidence' | 'conflicting-value' | 'format-unknown';
  description: string;
  confidence: number | null;
}

/** A file or folder in the input/output manifest */
export interface FileManifest {
  name: string;
  type?: string;
  size?: string;
  path?: string;
  fileCount?: number;
  pages?: number;
  sheets?: string[];
}

/** A specific execution of a workflow template */
export interface WorkflowRun {
  templateId: string;
  runId: string;
  status: 'running' | 'waiting' | 'completed' | 'failed';
  triggerType: TriggerType;
  triggeredBy: string;
  startTime: string;
  threadId: string;
  inputManifest: FileManifest[];
  nodeStatuses: Record<string, NodeStatus>;
  exceptions: RunException[];
  outputManifest: FileManifest[];
}

// ============================================
// WORKFLOW COMMANDS
// ============================================

/** A slash command that triggers a workflow */
export interface WorkflowCommand {
  command: string;
  label: string;
  description: string;
  templateId: string;
  argPlaceholder?: string;
}

// ============================================
// BRAIN — MEMORY
// ============================================

/** A linked entity reference on a memory fact */
export interface LinkedEntity {
  name: string;
  type: string;
}

/** A single fact stored in Cosimo's memory */
export interface MemoryFact {
  text: string;
  category: string;
  source?: string;
  date?: string;
  linkedEntities?: LinkedEntity[];
}

/** A personality trait toggle */
export interface PersonalityTrait {
  name: string;
  active: boolean;
}

/** The full memory data shape */
export interface MemoryData {
  roleProfile: string;
  selectedTraits: string[];
  presetTraits: string[];
  facts: MemoryFact[];
}

// ============================================
// BRAIN — LESSONS
// ============================================

/** A structured content section within a lesson */
export interface LessonSection {
  heading: string;
  type: 'text' | 'table' | 'list' | 'colors';
  body?: string;
  items?: string[];
  listStyle?: 'ordered' | 'unordered';
  columns?: string[];
  rows?: string[][];
  swatches?: { label: string; value: string; color: string }[];
}

/** A domain knowledge lesson */
export interface Lesson {
  id: string;
  title: string;
  scope: 'user' | 'company';
  author: string;
  updated: string;
  usage: number;
  lastUsed: string;
  preview: string;
  content?: string;
  sections?: LessonSection[];
  linkedWorkflows?: string[];
}

// ============================================
// BRAIN — DATA GRAPH
// ============================================

/** A category in the graph explorer sidebar */
export interface GraphCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
}

/** A node in the knowledge graph */
export interface GraphNode {
  id: string;
  label: string;
  sub: string;
  facts: string[];
  related: string[];
}

/** An edge in the knowledge graph (for SVG rendering) */
export interface GraphEdge {
  source: string;
  target: string;
  label: string;
}

/** The full graph data shape */
export interface GraphData {
  categories: GraphCategory[];
  nodes: Record<string, GraphNode[]>;
}

// ============================================
// HEADER PANELS — Tasks, Calendar, Usage
// ============================================

/** A task item in the task panel */
export interface TaskData {
  title: string;
  meta: string;
  urgent: boolean;
}

/** A calendar event */
export interface CalendarEvent {
  title: string;
  meta: string;
  color: string;
}

/** Calendar panel data */
export interface CalendarData {
  month: string;
  events: CalendarEvent[];
}

/** Usage statistics for the usage panel */
export interface UsageData {
  planLimit: string;
  used: string;
  remaining: string;
  percentUsed: string;
  overage: string;
  renews: string;
}

// ============================================
// SPREADSHEET (File Panel)
// ============================================

/** A row in the spreadsheet view */
export interface SpreadsheetRow {
  row: number;
  cells: string[];
  formulas?: (string | null)[] | null;
}

/** Spreadsheet data for the file panel */
export interface SpreadsheetData {
  columns: string[];
  headers: string[];
  rows: SpreadsheetRow[];
}

// ============================================
// CONFIGURATION
// ============================================

/** Purple intensity color mapping per theme */
export interface PurpleBaseColors {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/** RGB companion token mapping */
export type RGBCompanions = Record<string, string>;

// ============================================
// CLOUD STORAGE
// ============================================

/** A cloud storage provider connection */
export interface CloudProvider {
  /** Unique provider identifier (e.g., 'sharepoint', 'google-drive') */
  id: string;
  /** Display name (e.g., 'SharePoint', 'Google Drive') */
  name: string;
  /** Provider platform type */
  type: 'microsoft' | 'google' | 'dropbox';
  /** Current connection status */
  status: 'connected' | 'disconnected' | 'error';
  /** Short identifier mapped to Lucide icons later */
  icon: string;
}

/** A SharePoint site containing document libraries */
export interface SharePointSite {
  /** Unique site identifier */
  id: string;
  /** Site display name (e.g., 'Market Finance', 'HR') */
  name: string;
  /** Full site URL */
  url: string;
  /** Document libraries within this site */
  libraries: SharePointLibrary[];
}

/** A document library within a SharePoint site */
export interface SharePointLibrary {
  /** Unique library identifier */
  id: string;
  /** Library display name (e.g., 'Documents', 'Shared Reports') */
  name: string;
  /** Whether Cosimo can access this library */
  enabled: boolean;
}

/** Google Drive service account configuration */
export interface GoogleDriveConfig {
  /** Service account email address */
  serviceAccount: string;
  /** Shared folders accessible via the service account */
  sharedFolders: GoogleSharedFolder[];
}

/** A shared folder in Google Drive */
export interface GoogleSharedFolder {
  /** Unique folder identifier */
  id: string;
  /** Folder display name (e.g., 'Monthly Reports', 'Tax Documents 2025') */
  name: string;
  /** Number of files in the folder */
  fileCount: number;
  /** Whether Cosimo can access this folder */
  enabled: boolean;
}

/** Top-level cloud storage settings combining all providers */
export interface CloudStorageSettings {
  /** Connected cloud storage providers */
  providers: CloudProvider[];
  /** SharePoint configuration, or null if not connected */
  sharepoint: { sites: SharePointSite[] } | null;
  /** Google Drive configuration, or null if not connected */
  googleDrive: GoogleDriveConfig | null;
}

/** A file or folder in cloud storage */
export interface CloudFile {
  /** Unique file identifier */
  id: string;
  /** File or folder name */
  name: string;
  /** MIME type or extension (e.g., 'docx', 'xlsx', 'pdf', 'folder') */
  type: string;
  /** Human-readable size (e.g., '245 KB', '1.2 MB') */
  size: string;
  /** Human-readable last modified date (e.g., 'Mar 10') */
  lastModified: string;
  /** Which provider this file belongs to */
  provider: 'sharepoint' | 'google-drive';
  /** Breadcrumb path (e.g., 'Documents > Finance > Q4') */
  path: string;
  /** Whether this entry is a folder */
  isFolder: boolean;
  /** Number of children (for folders only) */
  itemCount?: number;
}

/** A navigable source in the cloud source tree */
export interface CloudSource {
  /** Unique source identifier */
  id: string;
  /** Which provider this source belongs to */
  provider: 'sharepoint' | 'google-drive';
  /** Display name in the source tree */
  label: string;
  /** Source hierarchy type */
  type: 'site' | 'library' | 'shared-folder' | 'root';
  /** Nested child sources (e.g., libraries under a site) */
  children?: CloudSource[];
}

/** Toggle for a data scope (files, email, calendar) — used in settings */
export interface DataScopeToggle {
  /** Unique toggle identifier */
  id: string;
  /** Display label (e.g., 'Outlook Mail', 'Gmail') */
  label: string;
  /** Data scope category */
  type: 'files' | 'email' | 'calendar';
  /** Whether this scope is currently enabled */
  enabled: boolean;
  /** Provider platform this scope belongs to */
  provider: 'microsoft' | 'google';
}

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

/** Data type for entity properties — determines rendering and input component */
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

/** Action type for entity actions — determines what happens when triggered */
export type EntityActionType =
  | 'start-chat'
  | 'trigger-workflow'
  | 'compose-email'
  | 'add-note'
  | 'schedule-meeting'
  | 'external-link'
  | 'create-task';

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
    /** Days threshold for healthy status (e.g., 14 = contacted within 14 days) */
    healthy: number;
    /** Days threshold for warning status (e.g., 30 = contacted within 30 days) */
    warning: number;
    /** Days threshold for critical status (e.g., 60 = not contacted in 60+ days) */
    critical: number;
  };

  /** Display labels for each health state */
  labels?: {
    /** Label for healthy status (e.g., "Active", "On Track", "Current") */
    healthy: string;
    /** Label for warning status (e.g., "Cooling", "At Risk", "Due Soon") */
    warning: string;
    /** Label for critical status (e.g., "Cold", "Overdue", "Past Due") */
    critical: string;
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

  /** Chat threads mentioning this entity */
  linkedThreadIds: string[];

  /** Workflow templates associated with this entity */
  linkedWorkflowIds: string[];

  /** Lessons relevant to this entity */
  linkedLessonIds: string[];

  /** Indices into the memory facts array */
  linkedMemoryFactIndices: number[];

  /** Kanban cards (projects/tasks) for this entity */
  linkedKanbanCardIds: string[];

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

/** Activity event type — determines icon and rendering in the timeline */
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
