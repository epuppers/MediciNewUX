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
