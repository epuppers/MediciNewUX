# MediciNewUX — React Migration & Refactoring Plan

**Date:** March 13, 2026
**Scope:** Convert the vanilla HTML/CSS/JS prototype into a React codebase using React Router 7, Tailwind CSS, and shadcn/ui — while cleaning up the data layer, state management, and component architecture to make it production-ready.

---

## Current State Summary

The prototype is ~18,300 lines across 10 source files. It covers three major views (Chat, Workflows, Brain) with dark mode, accessibility, and a retro design system. It works and looks good but has structural problems typical of a fast-built prototype: all mock data is accessed globally by name, state is scattered across 8+ global variables, a single 5,500-line app.js handles all logic, and 2,300 lines of hardcoded HTML live in index.html.

This plan converts the codebase to React while simultaneously fixing all of that. The end goal: your CTO can diff the resulting shadcn components against your production components and merge the styling changes.

---

## Stack Decisions

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React Router 7 (framework mode) | CTO requirement. Vite-based, file routing, SSR-ready. |
| Styling | Tailwind CSS v4 | CTO requirement. CSS-first config, no tailwind.config.js needed. |
| Components | shadcn/ui | CTO requirement. Copy-paste components, diffable against production. |
| State | Zustand | Lightweight, no boilerplate, works with React Router loaders. |
| Data | React Router loaders + typed service layer | Loaders for route data, service layer for mutations and shared fetches. |
| Icons | Lucide React (shadcn default) | Replaces the custom ICONS object. shadcn uses lucide natively. |
| Dark mode | Class-based via shadcn theming (`next-themes` pattern) | CSS variables on `:root` / `.dark`, toggled via class on `<html>`. |
| TypeScript | Yes | CTO will be diffing components — types make that diff meaningful. |

**Note on `/frontend-design` plugin:** The CTO's instructions reference the Claude Code `/frontend-design` plugin. This plugin is used within the Claude Code CLI environment during implementation to guide component scaffolding and design system conversion. It isn't installed in this planning environment, but the implementation agent should invoke it when building components.

---

## Phase 1: Project Scaffolding

**Goal:** Set up the React Router 7 + Tailwind + shadcn project structure, get it running, and establish the foundation everything else builds on.

### 1.1 Initialize the React Router 7 project

```bash
npx create-react-router@latest medici-app
cd medici-app
```

This gives us a Vite-based project with React Router 7 in framework mode, file-based routing, and TypeScript support out of the box.

### 1.2 Install and configure Tailwind CSS v4

Follow the official Tailwind + React Router guide. Tailwind v4 uses a CSS-first approach:

```bash
npm install tailwindcss @tailwindcss/vite
```

Add the Vite plugin to `vite.config.ts`, then import Tailwind in the root CSS file:

```css
@import "tailwindcss";
```

No `tailwind.config.js` needed in v4 — configuration happens in CSS via `@theme`.

### 1.3 Install and configure shadcn/ui

```bash
npx shadcn@latest init
```

The CLI auto-detects React Router 7 and configures `components.json` accordingly. This sets up the `components/ui/` directory and the `lib/utils.ts` file with the `cn()` helper.

Install the base components we'll need immediately:

```bash
npx shadcn@latest add button card dialog dropdown-menu input label
npx shadcn@latest add tabs table badge separator scroll-area
npx shadcn@latest add tooltip popover sheet avatar switch slider
npx shadcn@latest add command sidebar skeleton alert
```

### 1.4 Port the design tokens to Tailwind/shadcn

The existing `tokens.css` defines the Medici design system with CSS custom properties. These need to be mapped into shadcn's theming system.

**Current tokens.css pattern:**
```css
:root {
  --taupe-1: #E8E6EC;
  --violet-3: #7C5CFC;
  --off-white: #FAF9F7;
  /* ... */
}
[data-theme="dark"] {
  --taupe-1: #2A2730;
  /* ... */
}
```

**Target: shadcn CSS variable pattern in `app.css`:**
```css
@layer base {
  :root {
    /* shadcn required variables */
    --background: 40 20% 98%;        /* maps to --off-white */
    --foreground: 270 8% 15%;        /* maps to --taupe-5 */
    --card: 0 0% 100%;
    --card-foreground: 270 8% 15%;
    --primary: 252 97% 67%;          /* maps to --violet-3 */
    --primary-foreground: 0 0% 100%;
    --secondary: 270 12% 92%;        /* maps to --taupe-1 */
    --secondary-foreground: 270 8% 15%;
    --muted: 270 12% 92%;
    --muted-foreground: 270 5% 52%;  /* maps to --taupe-3 */
    --accent: 270 12% 92%;
    --accent-foreground: 270 8% 15%;
    --destructive: 0 84% 60%;        /* maps to --red */
    --border: 270 10% 85%;           /* maps to --taupe-2 */
    --input: 270 10% 85%;
    --ring: 252 97% 67%;             /* maps to --violet-3 */
    --radius: 0.375rem;              /* maps to --r-lg (6px) */

    /* Medici custom extensions (beyond shadcn defaults) */
    --amber: 36 100% 50%;
    --green: 152 69% 41%;
    --blue: 211 100% 50%;
    --berry: 330 65% 50%;
    --violet-1: 252 97% 95%;
    --violet-3-rgb: 124, 92, 252;    /* for rgba() usage */
    --amber-rgb: 255, 179, 0;
    --green-rgb: 32, 178, 115;
  }

  .dark {
    --background: 270 10% 10%;       /* dark mode --off-white */
    --foreground: 270 5% 85%;
    --primary: 252 97% 72%;          /* brighter violet in dark */
    --border: 270 8% 22%;
    /* ... full dark mode mapping */
  }
}
```

**Critical:** The existing design system uses a unique retro aesthetic (beveled borders, ChicagoFLF pixel font, muted taupes). The shadcn components will initially look like default shadcn. That's intentional — the CTO will diff these against production components and apply the Medici styling. We preserve the token values so the styling layer is ready, but we use base shadcn component markup.

### 1.5 Set up fonts

Copy the `ChicagoFLF.ttf` to `public/fonts/` and register in CSS:

```css
@font-face {
  font-family: 'ChicagoFLF';
  src: url('/fonts/ChicagoFLF.ttf') format('truetype');
}
```

Configure Tailwind to include the custom font families:

```css
@theme {
  --font-pixel: 'ChicagoFLF', monospace;
  --font-mono: 'IBM Plex Mono', monospace;
  --font-sans: 'DM Sans', sans-serif;
}
```

### 1.6 Establish the project structure

```
medici-app/
├── app/
│   ├── root.tsx                    — Root layout, theme provider, font loading
│   ├── routes.ts                   — Route config (React Router 7)
│   ├── app.css                     — Tailwind imports + design tokens + dark mode
│   │
│   ├── routes/
│   │   ├── _app.tsx                — App shell layout (sidebar + main + panels)
│   │   ├── _app.chat.tsx           — Chat view (thread list default)
│   │   ├── _app.chat.$threadId.tsx — Chat view with thread selected
│   │   ├── _app.workflows.tsx      — Workflow library
│   │   ├── _app.workflows.$id.tsx  — Workflow template detail
│   │   ├── _app.brain.tsx          — Brain layout
│   │   ├── _app.brain.memory.tsx   — Brain memory section
│   │   ├── _app.brain.lessons.tsx  — Brain lessons list
│   │   ├── _app.brain.lessons.$id.tsx — Lesson detail
│   │   ├── _app.brain.graph.tsx    — Brain data graph
│   │   └── login.tsx               — Login page
│   │
│   ├── components/
│   │   ├── ui/                     — shadcn base components (auto-installed)
│   │   ├── layout/
│   │   │   ├── app-sidebar.tsx     — Main sidebar (thread list, nav)
│   │   │   ├── app-header.tsx      — Top bar (tabs, icons, profile)
│   │   │   ├── cosimo-panel.tsx    — Slide-in Cosimo chat panel
│   │   │   └── logo.tsx            — 6-sphere logo + logo mark
│   │   ├── chat/
│   │   │   ├── thread-list.tsx     — Sidebar thread items
│   │   │   ├── message-block.tsx   — Single message (user or AI)
│   │   │   ├── message-stream.tsx  — Streaming/typing animation
│   │   │   ├── chat-input.tsx      — Rich text input + command autocomplete
│   │   │   ├── file-panel.tsx      — Right-side file viewer panel
│   │   │   ├── workflow-panel.tsx  — Right-side workflow context panel
│   │   │   ├── artifact.tsx        — Inline artifact display
│   │   │   ├── data-table.tsx      — Inline data table in messages
│   │   │   └── gate-message.tsx    — Workflow gate message styling
│   │   ├── workflows/
│   │   │   ├── workflow-card.tsx    — Library card for a template
│   │   │   ├── workflow-stats.tsx   — Stats bar (total, active, runs, failed)
│   │   │   ├── template-detail.tsx  — Template detail with tabs
│   │   │   ├── flow-graph.tsx       — SVG flow graph renderer
│   │   │   ├── flow-node.tsx        — Individual graph node
│   │   │   ├── flow-edge.tsx        — Edge/connector line
│   │   │   ├── node-popover.tsx     — Node detail popover
│   │   │   ├── overview-tab.tsx     — Template overview tab
│   │   │   ├── schema-tab.tsx       — Input/output schema tab
│   │   │   ├── triggers-tab.tsx     — Trigger configuration tab
│   │   │   ├── runs-tab.tsx         — Run history tab
│   │   │   └── lessons-tab.tsx      — Linked lessons tab
│   │   └── brain/
│   │       ├── memory-list.tsx      — Memory facts list with filters
│   │       ├── memory-fact.tsx      — Single fact item (editable)
│   │       ├── trait-badges.tsx     — Personality trait toggles
│   │       ├── lesson-card.tsx      — Lesson list item
│   │       ├── lesson-detail.tsx    — Lesson detail/edit view
│   │       ├── entity-graph.tsx     — SVG entity relationship graph
│   │       └── entity-detail.tsx    — Entity detail panel
│   │
│   ├── lib/
│   │   ├── utils.ts                — cn() helper (shadcn default) + escapeHtml, showToast
│   │   ├── icons.ts                — Icon mapping (lucide-react replacements for ICONS object)
│   │   └── color-utils.ts          — hexToHsl, hslToHex, hexToRgbString (for purple intensity)
│   │
│   ├── services/
│   │   ├── threads.ts              — getThreads(), getThread(id), getMessages(threadId)
│   │   ├── workflows.ts            — getTemplates(), getTemplate(id), getRuns(), getRun(id)
│   │   ├── brain.ts                — getMemory(), getLessons(), getGraphData()
│   │   ├── panels.ts               — getTasks(), getCalendar(), getUsage()
│   │   └── types.ts                — All TypeScript interfaces (Thread, Template, Run, Node, etc.)
│   │
│   ├── data/
│   │   ├── mock-threads.ts         — MOCK_THREADS with full message data
│   │   ├── mock-workflows.ts       — MOCK_WORKFLOW_TEMPLATES, MOCK_WORKFLOW_RUNS, MOCK_WORKFLOW_COMMANDS
│   │   ├── mock-brain.ts           — MOCK_MEMORY, MOCK_LESSONS, MOCK_GRAPH_DATA
│   │   ├── mock-panels.ts          — MOCK_TASKS, MOCK_CALENDAR, MOCK_USAGE, MOCK_SPREADSHEET
│   │   └── config.ts               — All CONFIG_* constants + hardcoded values extracted from app.js
│   │
│   ├── stores/
│   │   ├── ui-store.ts             — Zustand: currentMode, sidebarCollapsed, panel states
│   │   ├── chat-store.ts           — Zustand: activeThreadId, autocomplete state, streaming state
│   │   ├── workflow-store.ts       — Zustand: activeTemplateId, selectedNodeId, activeTab
│   │   ├── brain-store.ts          — Zustand: activeBrainSection, filters, graph state
│   │   └── theme-store.ts          — Zustand: theme, purpleIntensity, a11y settings (persisted to localStorage)
│   │
│   └── hooks/
│       ├── use-theme.ts            — Theme toggling + purple intensity + a11y modes
│       ├── use-keyboard.ts         — Global keyboard shortcuts (Escape chains, Cmd+B/I/U)
│       ├── use-resize-panel.ts     — Drag-resize logic for file/workflow panels
│       └── use-command-autocomplete.ts — /command autocomplete logic
│
├── public/
│   └── fonts/
│       └── ChicagoFLF.ttf
│
├── components.json                 — shadcn config
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 2: Data Layer & Type System

**Goal:** Extract all mock data into typed service modules so that swapping to real APIs is a single-file change per entity, and every component gets type-safe data.

### 2.1 Define TypeScript interfaces (`services/types.ts`)

Every data shape from `mock-data.js` gets a proper interface:

```typescript
// services/types.ts

export interface Thread {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  model: string;
  workflowRunId?: string;
  indicators?: ThreadIndicator[];
  messages: Message[];
}

export interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  model?: string;
  attachments?: Attachment[];
  artifacts?: Artifact[];
  isGate?: boolean;        // for workflow gate messages
  gateStatus?: 'waiting' | 'resolved';
}

export interface Artifact {
  title: string;
  type: 'table' | 'flow-graph' | 'metadata' | 'text';
  data: Record<string, unknown>;
}

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
  inputSchema: Schema;
  outputSchema: OutputSchema;
  nodes: FlowNode[];
  edges: FlowEdge[];
  runs: RunStats;
  recentRuns: RecentRun[];
}

export type TriggerType = 'manual' | 'folder-watch' | 'schedule' | 'email' | 'chat-command' | 'chained';

export interface FlowNode {
  id: string;
  type: 'input' | 'action' | 'gate' | 'branch' | 'output';
  title: string;
  description: string;
  lesson: string | null;
  x: number;
  y: number;
  conditions?: BranchCondition[];
}

export interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

export interface WorkflowRun {
  templateId: string;
  runId: string;
  status: 'running' | 'waiting' | 'completed' | 'failed';
  triggerType: string;
  triggeredBy: string;
  startTime: string;
  threadId: string;
  inputManifest: FileManifest[];
  nodeStatuses: Record<string, NodeStatus>;
  exceptions: RunException[];
  outputManifest: FileManifest[];
}

export type NodeStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'waiting';

// ... Memory, Lesson, GraphEntity, etc.
```

### 2.2 Create service modules

Each service module wraps data access behind async functions. Today they return mock data; tomorrow they make API calls. The component code never changes.

```typescript
// services/workflows.ts
import type { WorkflowTemplate, WorkflowRun } from './types';
import { MOCK_WORKFLOW_TEMPLATES, MOCK_WORKFLOW_RUNS } from '~/data/mock-workflows';

export async function getTemplates(): Promise<WorkflowTemplate[]> {
  return Object.values(MOCK_WORKFLOW_TEMPLATES);
}

export async function getTemplate(id: string): Promise<WorkflowTemplate | null> {
  return MOCK_WORKFLOW_TEMPLATES[id] ?? null;
}

export async function getRun(id: string): Promise<WorkflowRun | null> {
  return MOCK_WORKFLOW_RUNS[id] ?? null;
}

export async function getRunsForTemplate(templateId: string): Promise<WorkflowRun[]> {
  return Object.values(MOCK_WORKFLOW_RUNS).filter(r => r.templateId === templateId);
}
```

### 2.3 Wire services into React Router loaders

React Router 7 loaders fetch data before the route renders — no loading spinners for initial data, no useEffect waterfalls:

```typescript
// routes/_app.workflows.tsx
import { getTemplates } from '~/services/workflows';
import type { Route } from './+types/_app.workflows';

export async function loader() {
  const templates = await getTemplates();
  return { templates };
}

export default function WorkflowsRoute({ loaderData }: Route.ComponentProps) {
  const { templates } = loaderData;
  return <WorkflowLibrary templates={templates} />;
}
```

When you swap to real APIs, only the service file changes. The loader, the component, and the types stay identical.

### 2.4 Extract hardcoded data from the original app.js into `data/config.ts`

Everything that's currently a magic number or inline array in app.js becomes a typed export:

```typescript
// data/config.ts
export const CONFIG = {
  fontZoomLevels: [1, 1.05, 1.1, 1.15, 1.2] as const,
  memoryCategories: ['all', 'preference', 'workflow', 'contact', 'fund', 'style'] as const,
  lessonScopes: ['all', 'user', 'company'] as const,
  sidebar: { narrowSnap: 56, narrowThreshold: 110 } as const,
  graphAnimMs: 500,
  eraborTimingMs: 2000,
  flowGraph: {
    nodeWidth: 160,
    nodeHeight: 60,
    compactNodeWidth: 100,
    compactNodeHeight: 36,
    colSpacing: 200,
    rowSpacing: 100,
    edgeStroke: 1.5,
  },
} as const;
```

### 2.5 Convert hardcoded HTML message content to data

The 850 lines of hardcoded chat messages in `index.html` become structured data in `mock-threads.ts`. Each thread's `messages` array contains the full conversation script:

```typescript
// data/mock-threads.ts (example for one thread)
export const MOCK_THREADS: Record<string, Thread> = {
  'wf-run-rentroll-047': {
    id: 'wf-run-rentroll-047',
    title: 'Rent Roll Extraction — Q4 Batch',
    workflowRunId: 'wf-run-rentroll-047',
    messages: [
      {
        id: 'msg-1',
        type: 'user',
        content: '',
        attachments: [
          { name: '245-Park-Ave-RentRoll.pdf', type: 'pdf' },
          { name: 'Marina-Heights-Q4.pdf', type: 'pdf' },
          { name: 'Berkshire-Units-Dec.pdf', type: 'pdf' },
        ],
        commandChip: '/rent-roll',
      },
      {
        id: 'msg-2',
        type: 'ai',
        model: 'Cosimo 2.1',
        content: 'Starting Rent Roll Extraction on 3 files...',
        artifacts: [{
          title: 'Workflow Run — Rent Roll Extraction',
          type: 'metadata',
          data: { template: 'Rent Roll Extraction', input: '3 PDF files', output: 'xlsx → /Finance/CRE/Processed/', status: 'Running' },
        }],
      },
      // ... remaining messages
    ],
  },
  // ... other threads
};
```

---

## Phase 3: State Management with Zustand

**Goal:** Replace the 8+ scattered global variables with typed Zustand stores that React components subscribe to reactively.

### 3.1 Create focused stores

Each store owns a slice of application state. Zustand stores are simple — just a function that returns state + actions:

```typescript
// stores/ui-store.ts
import { create } from 'zustand';

type ViewMode = 'chat' | 'workflows' | 'brain';

interface UIState {
  currentMode: ViewMode;
  sidebarCollapsed: boolean;
  cosimoPanelOpen: boolean;
  taskPanelOpen: boolean;
  calendarPanelOpen: boolean;
  usagePanelOpen: boolean;
  profileMenuOpen: boolean;

  // Actions
  setMode: (mode: ViewMode) => void;
  toggleSidebar: () => void;
  openCosimoPanel: () => void;
  closeCosimoPanel: () => void;
  closeAllPanels: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  currentMode: 'chat',
  sidebarCollapsed: false,
  cosimoPanelOpen: false,
  taskPanelOpen: false,
  calendarPanelOpen: false,
  usagePanelOpen: false,
  profileMenuOpen: false,

  setMode: (mode) => set({ currentMode: mode }),
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  openCosimoPanel: () => set({ cosimoPanelOpen: true }),
  closeCosimoPanel: () => set({ cosimoPanelOpen: false }),
  closeAllPanels: () => set({
    cosimoPanelOpen: false,
    taskPanelOpen: false,
    calendarPanelOpen: false,
    usagePanelOpen: false,
    profileMenuOpen: false,
  }),
}));
```

```typescript
// stores/theme-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  purpleIntensity: number;
  fontSizeLevel: number;
  dyslexiaFont: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  iconLabels: boolean;

  toggleTheme: () => void;
  setPurpleIntensity: (value: number) => void;
  cycleFontSize: () => void;
  toggleDyslexiaFont: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  toggleIconLabels: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      purpleIntensity: 50,
      fontSizeLevel: 0,
      dyslexiaFont: false,
      reducedMotion: false,
      highContrast: false,
      iconLabels: false,

      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setPurpleIntensity: (value) => set({ purpleIntensity: value }),
      cycleFontSize: () => set((s) => ({
        fontSizeLevel: (s.fontSizeLevel + 1) % 5,
      })),
      // ... other toggles
    }),
    { name: 'medici-theme' }  // persists to localStorage automatically
  )
);
```

### 3.2 Store map (what state lives where)

| Store | State Keys | Equivalent old globals |
|-------|-----------|----------------------|
| `useUIStore` | currentMode, sidebarCollapsed, panel open/close states | `UI.currentMode`, scattered panel flags |
| `useChatStore` | activeThreadId, filePanelOpen, workflowPanelOpen, autocomplete state, streaming state | `Chat.activeThread`, `Chat._acIndex`, `Chat._acOpen` |
| `useWorkflowStore` | activeTemplateId, activeTab, selectedNodeId, popoverOpen | `Workflows._lastViewState` |
| `useBrainStore` | activeBrainSection, memoryCategory, lessonScope, lessonId, graphState | `BrainLessons.currentLessonId`, `Graph.graphState`, `activeCategory`, `activeLessonScope` |
| `useThemeStore` | theme, purpleIntensity, all a11y toggles (persisted) | localStorage reads scattered through A11y namespace |

### 3.3 Theme application via root layout

The theme store drives data attributes on `<html>`, which cascade to all components:

```tsx
// root.tsx
import { useThemeStore } from '~/stores/theme-store';
import { CONFIG } from '~/data/config';

export default function Root() {
  const { theme, purpleIntensity, fontSizeLevel, dyslexiaFont, reducedMotion, highContrast } = useThemeStore();

  return (
    <html
      lang="en"
      className={theme === 'dark' ? 'dark' : ''}
      data-a11y-font={dyslexiaFont ? 'dyslexia' : undefined}
      data-a11y-motion={reducedMotion ? 'reduce' : undefined}
      data-a11y-contrast={highContrast ? 'high' : undefined}
      style={{
        fontSize: `${CONFIG.fontZoomLevels[fontSizeLevel] * 100}%`,
      }}
    >
      {/* ... */}
    </html>
  );
}
```

---

## Phase 4: Component Conversion

**Goal:** Convert every UI region from vanilla HTML/JS into React components using shadcn/ui primitives. This is the largest phase and the core of what the CTO needs for diffing.

### 4.1 Conversion strategy

For each component, the process is:

1. Read the original HTML structure from `index.html`
2. Read the rendering logic from the relevant namespace in `app.js`
3. Read the CSS from the relevant stylesheet
4. Build a React component using shadcn/ui primitives where possible
5. Apply Tailwind classes that approximate the existing CSS
6. Wire to Zustand stores for state and services for data

**shadcn component mapping** (what replaces what):

| Original pattern | shadcn replacement |
|------------------|--------------------|
| `.thread-item` (sidebar list items) | `SidebarMenuButton` from shadcn Sidebar |
| `.wf-card` (workflow library cards) | `Card`, `CardHeader`, `CardContent`, `CardFooter` |
| `.th-dropdown` (header dropdowns) | `DropdownMenu`, `DropdownMenuContent`, `DropdownMenuItem` |
| `.data-tbl` (inline data tables) | `Table`, `TableHeader`, `TableRow`, `TableCell` |
| Tab switching (workflow detail, brain sections) | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| Profile menu | `DropdownMenu` with `Avatar` trigger |
| Cosimo slide-in panel | `Sheet` (side="right") |
| Node popovers | `Popover`, `PopoverTrigger`, `PopoverContent` |
| Command autocomplete | `Command`, `CommandInput`, `CommandList`, `CommandItem` |
| Toggles (a11y settings) | `Switch` |
| Purple intensity slider | `Slider` |
| Status badges | `Badge` with variant |
| Toast notifications | `sonner` (shadcn's toast library) |
| File panel / Workflow panel | `Sheet` or `ResizablePanel` |
| Loading states (new) | `Skeleton` |
| Error states (new) | `Alert`, `AlertDescription` |

### 4.2 Component conversion order

Build in dependency order — layout shell first, then the pieces that fill it:

**Wave 1: App Shell (layout components)**
- `root.tsx` — HTML shell, theme provider, font loading
- `_app.tsx` — App frame layout (sidebar + main + panels)
- `app-sidebar.tsx` — Sidebar structure using shadcn `Sidebar`
- `app-header.tsx` — Top bar with tabs, icons, profile dropdown
- `logo.tsx` — 6-sphere logo (preserve exact HTML/CSS, don't convert to shadcn)

**Wave 2: Chat View**
- `_app.chat.tsx` + `_app.chat.$threadId.tsx` — Route components with loaders
- `thread-list.tsx` — Sidebar thread items
- `message-block.tsx` — User and AI message rendering
- `artifact.tsx` — Inline artifacts (tables, metadata, flow graphs)
- `data-table.tsx` — Using shadcn `Table`
- `gate-message.tsx` — Workflow gate styling (amber border, awaiting chip)
- `chat-input.tsx` — Rich text input with command autocomplete
- `file-panel.tsx` — Right-side resizable panel
- `workflow-panel.tsx` — Right-side workflow context panel

**Wave 3: Workflows View**
- `_app.workflows.tsx` + `_app.workflows.$id.tsx` — Route components
- `workflow-card.tsx` — Library cards using shadcn `Card`
- `workflow-stats.tsx` — Stats bar
- `template-detail.tsx` — Container with shadcn `Tabs`
- `overview-tab.tsx`, `schema-tab.tsx`, `triggers-tab.tsx`, `runs-tab.tsx`, `lessons-tab.tsx`
- `flow-graph.tsx` — SVG flow graph (custom, not shadcn — SVG is too specialized)
- `flow-node.tsx`, `flow-edge.tsx` — Graph primitives
- `node-popover.tsx` — Using shadcn `Popover`

**Wave 4: Brain View**
- `_app.brain.tsx` — Layout with section navigation
- `_app.brain.memory.tsx` — Memory route
- `memory-list.tsx` — Fact list with category filter using shadcn `Tabs`
- `memory-fact.tsx` — Editable fact item
- `trait-badges.tsx` — Toggle badges
- `_app.brain.lessons.tsx` + `_app.brain.lessons.$id.tsx` — Lesson routes
- `lesson-card.tsx` — List item card
- `lesson-detail.tsx` — Detail view with edit mode
- `_app.brain.graph.tsx` — Graph route
- `entity-graph.tsx` — SVG graph (custom, same as flow graph)
- `entity-detail.tsx` — Entity detail panel

**Wave 5: Overlay Panels**
- `cosimo-panel.tsx` — Using shadcn `Sheet`
- Header panels (tasks, calendar, usage) — Using `DropdownMenu` or `Popover`
- Profile dropdown — Using `DropdownMenu`

### 4.3 Example component conversion

Here's how a workflow card converts from vanilla to React + shadcn:

**Original (built as innerHTML string in Workflows.renderLibrary):**
```javascript
html += '<div class="wf-card" data-wf-id="' + t.id + '">' +
  '<div class="wf-card-header">' +
    '<span class="wf-card-title">' + escapeHtml(t.title) + '</span>' +
    '<span class="wf-card-status badge-' + t.status + '">' + t.status + '</span>' +
  '</div>' +
  '<div class="wf-card-body">' + escapeHtml(t.description) + '</div>' +
  '<div class="wf-card-footer">...</div>' +
'</div>';
```

**Converted (React + shadcn):**
```tsx
// components/workflows/workflow-card.tsx
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import type { WorkflowTemplate } from '~/services/types';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  draft: 'secondary',
  paused: 'outline',
  archived: 'secondary',
};

export function WorkflowCard({ template, onSelect, onRun }: {
  template: WorkflowTemplate;
  onSelect: (id: string) => void;
  onRun: (id: string) => void;
}) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={() => onSelect(template.id)}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="font-mono text-sm font-semibold">{template.title}</h3>
        <Badge variant={statusVariant[template.status] ?? 'secondary'}>
          {template.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <span className="text-xs text-muted-foreground">
          {template.runs.total} runs · {template.runs.successRate}% success
        </span>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => { e.stopPropagation(); onRun(template.id); }}
        >
          Run
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### 4.4 SVG components (flow graph + entity graph)

The flow graph and entity graph are too specialized for shadcn — they render SVG directly. Convert them to React components that accept data as props but keep the SVG rendering logic:

```tsx
// components/workflows/flow-graph.tsx
import type { FlowNode, FlowEdge } from '~/services/types';
import { FlowNodeComponent } from './flow-node';
import { FlowEdgeComponent } from './flow-edge';
import { CONFIG } from '~/data/config';

interface FlowGraphProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  nodeStatuses?: Record<string, NodeStatus>;  // for run view
  compact?: boolean;                           // for workflow context panel
  selectedNodeId?: string;
  onNodeSelect?: (nodeId: string) => void;
}

export function FlowGraph({ nodes, edges, nodeStatuses, compact, selectedNodeId, onNodeSelect }: FlowGraphProps) {
  const { nodeWidth, nodeHeight, colSpacing, rowSpacing } = compact
    ? { nodeWidth: 100, nodeHeight: 36, colSpacing: 130, rowSpacing: 65 }
    : CONFIG.flowGraph;

  // Calculate viewBox from node positions
  // ... layout math from original Workflows.renderFlowGraph()

  return (
    <svg viewBox={viewBox} className="w-full h-full">
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground" />
        </marker>
      </defs>
      {edges.map((edge) => (
        <FlowEdgeComponent key={`${edge.from}-${edge.to}`} edge={edge} nodes={nodes} config={{ nodeWidth, nodeHeight, colSpacing, rowSpacing }} />
      ))}
      {nodes.map((node) => (
        <FlowNodeComponent
          key={node.id}
          node={node}
          status={nodeStatuses?.[node.id]}
          selected={node.id === selectedNodeId}
          compact={compact}
          config={{ nodeWidth, nodeHeight, colSpacing, rowSpacing }}
          onClick={() => onNodeSelect?.(node.id)}
        />
      ))}
    </svg>
  );
}
```

---

## Phase 5: Routing with React Router 7

**Goal:** Map the current view-switching logic to proper URL-based routes with data loaders.

### 5.1 Route structure

```typescript
// app/routes.ts
import { type RouteConfig, route, layout } from '@react-router/dev/routes';

export default [
  route('login', 'routes/login.tsx'),
  layout('routes/_app.tsx', [
    route('chat', 'routes/_app.chat.tsx', [
      route(':threadId', 'routes/_app.chat.$threadId.tsx'),
    ]),
    route('workflows', 'routes/_app.workflows.tsx', [
      route(':id', 'routes/_app.workflows.$id.tsx'),
    ]),
    layout('routes/_app.brain.tsx', [
      route('brain/memory', 'routes/_app.brain.memory.tsx'),
      route('brain/lessons', 'routes/_app.brain.lessons.tsx', [
        route(':id', 'routes/_app.brain.lessons.$id.tsx'),
      ]),
      route('brain/graph', 'routes/_app.brain.graph.tsx'),
    ]),
  ]),
] satisfies RouteConfig;
```

### 5.2 Route-level data loading

Each route defines a loader that calls the service layer:

```typescript
// routes/_app.chat.$threadId.tsx
import { getThread } from '~/services/threads';
import { getRun } from '~/services/workflows';
import type { Route } from './+types/_app.chat.$threadId';

export async function loader({ params }: Route.LoaderArgs) {
  const thread = await getThread(params.threadId);
  if (!thread) throw new Response('Thread not found', { status: 404 });

  const run = thread.workflowRunId ? await getRun(thread.workflowRunId) : null;
  return { thread, run };
}

export default function ChatThread({ loaderData }: Route.ComponentProps) {
  const { thread, run } = loaderData;
  return (
    <>
      <ChatMessages messages={thread.messages} />
      {run && <WorkflowPanel run={run} />}
    </>
  );
}
```

### 5.3 URL mapping (replaces the old internal state switching)

| Old behavior | New URL | React Router route |
|-------------|---------|-------------------|
| `UI.switchMode('chat')` | `/chat` | `_app.chat.tsx` |
| `Chat.selectThread('fund3')` | `/chat/fund3` | `_app.chat.$threadId.tsx` |
| `UI.switchMode('workflows')` | `/workflows` | `_app.workflows.tsx` |
| `Workflows.showWorkflowDetail('rent-roll')` | `/workflows/rent-roll` | `_app.workflows.$id.tsx` |
| `UI.switchMode('brain') + switchBrainSection('memory')` | `/brain/memory` | `_app.brain.memory.tsx` |
| `BrainLessons.openLesson('rent-roll-format')` | `/brain/lessons/rent-roll-format` | `_app.brain.lessons.$id.tsx` |
| `Graph.openGraphEntity('fund-iii')` | `/brain/graph?entity=fund-iii` | `_app.brain.graph.tsx` with search param |

Navigation between views uses React Router's `<Link>` or `useNavigate()` — no more manual DOM class toggling.

---

## Phase 6: Styling — Tailwind + Dark Mode

**Goal:** Convert all CSS to Tailwind utility classes + shadcn CSS variables, ensure light and dark mode work perfectly.

### 6.1 The CSS conversion strategy

The CTO's goal is clear: get the app onto base shadcn components so he can diff against production. This means we don't try to perfectly replicate the retro prototype aesthetic in Tailwind. Instead:

1. **shadcn defaults** for all standard components (buttons, cards, dropdowns, inputs, tables, etc.)
2. **Tailwind utilities** for layout, spacing, and positioning
3. **Custom CSS** only for things shadcn can't handle: the SVG flow graph, the 6-sphere logo animation, the bevel borders (if kept), and the streaming text animation
4. **CSS variables** from the Medici design tokens preserved in `app.css` so the CTO can apply them to shadcn components during the styling diff

### 6.2 Dark mode implementation

shadcn uses class-based dark mode. The `useThemeStore` drives it:

```tsx
// In root.tsx
<html className={theme === 'dark' ? 'dark' : ''}>
```

All shadcn components automatically respond to the `.dark` class via their CSS variables. For custom components, use Tailwind's dark variant:

```tsx
<div className="bg-background text-foreground dark:bg-background dark:text-foreground">
  {/* No extra work needed — CSS variables handle it */}
</div>
```

For custom SVG elements (flow graph nodes), use Tailwind's dark variant on class names:

```tsx
<rect
  className={cn(
    // Input node colors
    node.type === 'input' && 'fill-blue-50 stroke-blue-500 dark:fill-blue-950 dark:stroke-blue-400',
    // Action node colors
    node.type === 'action' && 'fill-violet-50 stroke-violet-500 dark:fill-violet-950 dark:stroke-violet-400',
    // Gate node colors (dashed)
    node.type === 'gate' && 'fill-amber-50/10 stroke-amber-500 dark:fill-amber-950/20 dark:stroke-amber-400',
  )}
  strokeDasharray={node.type === 'gate' ? '6 3' : undefined}
/>
```

### 6.3 Purple intensity slider

This is the one custom theming feature that goes beyond shadcn defaults. Keep the `ColorUtils` logic (hex/HSL conversion) and apply it via inline CSS variables:

```tsx
// hooks/use-theme.ts
export function usePurpleIntensity() {
  const { purpleIntensity, theme } = useThemeStore();

  useEffect(() => {
    const baseColors = theme === 'dark'
      ? CONFIG_PURPLE_BASE_COLORS.dark
      : CONFIG_PURPLE_BASE_COLORS.light;

    // Apply adjusted purple hues to CSS variables
    const adjusted = adjustPurpleIntensity(baseColors, purpleIntensity);
    Object.entries(adjusted).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }, [purpleIntensity, theme]);
}
```

### 6.4 Accessibility modes

Keep the data attribute pattern from the original, applied at the `<html>` level:

```tsx
<html
  className={cn(theme === 'dark' ? 'dark' : '')}
  data-a11y-font={dyslexiaFont ? 'dyslexia' : undefined}
  data-a11y-motion={reducedMotion ? 'reduce' : undefined}
  data-a11y-contrast={highContrast ? 'high' : undefined}
>
```

Add a small `a11y.css` file for the attribute-based overrides that Tailwind can't handle:

```css
/* Dyslexia font override */
[data-a11y-font="dyslexia"] * {
  font-family: 'OpenDyslexic', sans-serif !important;
}

/* Reduced motion */
[data-a11y-motion="reduce"] * {
  animation-duration: 0.001ms !important;
  transition-duration: 0.001ms !important;
}

/* High contrast */
[data-a11y-contrast="high"] {
  --border: 0 0% 0%;
  --muted-foreground: 0 0% 20%;
}
.dark[data-a11y-contrast="high"] {
  --border: 0 0% 100%;
  --muted-foreground: 0 0% 80%;
}
```

### 6.5 What CSS files to keep vs. discard

| Original file | Action |
|---------------|--------|
| `tokens.css` | **Transform** → Medici tokens in `app.css` mapped to shadcn variable names |
| `layout.css` | **Discard** — replaced by Tailwind classes + shadcn Sidebar/Sheet |
| `chat.css` | **Mostly discard** — rebuild with Tailwind. Keep streaming animation as custom CSS. |
| `workflows.css` | **Discard** — replaced by Tailwind + shadcn Card/Tabs |
| `components.css` | **Partially keep** — flow graph SVG styles, entity graph styles as custom CSS |
| `utilities.css` | **Discard** — Tailwind handles all utilities. Keep only the a11y overrides. |

---

## Phase 7: Event System → React Patterns

**Goal:** Replace the vanilla event delegation system with React's own event handling and hooks.

### 7.1 What happens to the 600-line click handler

It disappears entirely. In React, events are handled at the component level:

```tsx
// OLD: document.addEventListener('click', e => { if (e.target.closest('[data-wf-id]')) ... })

// NEW: Event is on the component itself
<Card onClick={() => onSelect(template.id)}>
```

No delegation needed. No `.closest()` chains. Each component owns its own interactions.

### 7.2 Cross-component communication

The old EventBus pattern (`Workflows.navigateToRun` calls `Chat.selectThread`) becomes React Router navigation:

```tsx
// OLD
Workflows.navigateToRun = function(runId) {
  var thread = Workflows._findRunThread(runId);
  UI.switchMode('chat');
  Chat.selectThread(thread);
};

// NEW
function WorkflowRunLink({ threadId }: { threadId: string }) {
  return <Link to={`/chat/${threadId}`}>View Thread</Link>;
}
```

For non-navigation cross-component communication, Zustand stores serve as the shared bus:

```tsx
// Component A sets state
const openCosimo = useUIStore(s => s.openCosimoPanel);
<Button onClick={openCosimo}>Ask Cosimo</Button>

// Component B reacts to state
const isOpen = useUIStore(s => s.cosimoPanelOpen);
<Sheet open={isOpen}>{/* ... */}</Sheet>
```

### 7.3 Keyboard shortcuts

Replace the scattered `keydown` listeners with a single `use-keyboard.ts` hook:

```tsx
// hooks/use-keyboard.ts
export function useKeyboardShortcuts() {
  const closeCosimoPanel = useUIStore(s => s.closeCosimoPanel);
  const closeAllPanels = useUIStore(s => s.closeAllPanels);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        // Priority chain: popover → autocomplete → cosimo → panels
        closeCosimoPanel();
        closeAllPanels();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeCosimoPanel, closeAllPanels]);
}
```

---

## Phase 8: Loading States, Error States, and Polish

**Goal:** Add the UX states that the prototype skipped because mock data is instant and never fails.

### 8.1 Loading states with shadcn Skeleton

Every route that loads data should show skeletons during loading:

```tsx
// routes/_app.workflows.tsx
import { Skeleton } from '~/components/ui/skeleton';

export function HydrateFallback() {
  return (
    <div className="grid grid-cols-3 gap-4 p-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-lg" />
      ))}
    </div>
  );
}
```

### 8.2 Error boundaries

React Router 7 has built-in error handling per route:

```tsx
// routes/_app.chat.$threadId.tsx
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Failed to load thread. {error.message}
      </AlertDescription>
    </Alert>
  );
}
```

### 8.3 Streaming text animation

The Erabor thinking/streaming animation is complex enough to warrant its own hook:

```tsx
// hooks/use-stream.ts — manages the multi-phase streaming animation
// Phase 1: "Thinking" with animated dots
// Phase 2: Sections stream in one at a time
// Phase 3: Final content appears
```

This is one of the few places where the React conversion needs to carefully replicate the original behavior, since the timing and visual effect are key to the UX.

---

## Phase 9: Integration Prep & Documentation

**Goal:** Make the codebase ready for the CTO to diff against production and for the backend team to wire up real APIs.

### 9.1 API contract documentation

Create `docs/api-contract.md` documenting every service function, its parameters, return types, and expected data shapes. This is the spec the backend implements against:

```
GET /api/threads
  Returns: Thread[]
  Service: services/threads.ts → getThreads()

GET /api/threads/:id
  Returns: Thread (with messages)
  Service: services/threads.ts → getThread(id)

GET /api/workflows/templates
  Returns: WorkflowTemplate[]
  Service: services/workflows.ts → getTemplates()
```

### 9.2 Component inventory for diffing

Create `docs/component-map.md` listing every shadcn component used and where:

```
Button          → workflow-card.tsx (Run), chat-input.tsx (Send), app-header.tsx (icons)
Card            → workflow-card.tsx, lesson-card.tsx
Tabs            → template-detail.tsx, brain layout
Badge           → workflow-card.tsx (status), message-block.tsx (model badge)
Sheet           → cosimo-panel.tsx, file-panel.tsx
Table           → data-table.tsx, runs-tab.tsx, schema-tab.tsx
DropdownMenu    → app-header.tsx (profile, tasks, calendar, usage)
Command         → chat-input.tsx (autocomplete)
Popover         → node-popover.tsx
Switch          → profile dropdown (a11y toggles)
Slider          → profile dropdown (purple intensity)
Skeleton        → all route fallbacks
Alert           → all error boundaries
```

This gives the CTO a clear map of what to diff and where.

### 9.3 Styling handoff notes

Document which components use base shadcn styling (ready for the CTO's diff) vs. custom styling:

**Base shadcn (diff-ready):** Button, Card, Badge, Tabs, Table, DropdownMenu, Sheet, Command, Popover, Switch, Slider, Skeleton, Alert, Dialog, Avatar, Separator, ScrollArea, Tooltip

**Custom (needs manual styling):** Flow graph SVG, Entity graph SVG, 6-sphere logo, streaming animation, gate message border, command chip, bevel borders (if preserved)

---

## Execution Order

```
Phase 1 (Scaffolding)        — 1 session
  ↓
Phase 2 (Data Layer + Types) — 1 session
  ↓
Phase 3 (Zustand Stores)     — 1 session
  ↓
Phase 4 (Components)         — 3-4 sessions (largest phase)
  Wave 1: App Shell
  Wave 2: Chat View
  Wave 3: Workflows View
  Wave 4: Brain View
  Wave 5: Overlay Panels
  ↓
Phase 5 (Routing)            — 1 session (can overlap with Phase 4)
  ↓
Phase 6 (Styling + Dark Mode) — 1-2 sessions (runs alongside Phase 4)
  ↓
Phase 7 (Events → React)     — happens naturally during Phase 4
  ↓
Phase 8 (Loading/Error/Polish) — 1 session
  ↓
Phase 9 (Docs + Handoff)     — 1 session
```

**Total: 10-12 working sessions.**

Phases 4, 5, and 6 overlap heavily — you're building components, defining routes, and writing Tailwind classes at the same time. Phase 7 isn't a separate step; it happens as you build each component.

---

## Verification Checklist (After Each Wave)

- [ ] `npm run dev` starts without errors
- [ ] All routes resolve correctly (chat, workflows, brain sections)
- [ ] Dark mode toggle works — all components respond to `.dark` class
- [ ] Purple intensity slider adjusts CSS variables in both themes
- [ ] All 8 chat threads render with correct messages
- [ ] Workflow library shows all 7 template cards
- [ ] Flow graph SVG renders for each template
- [ ] Brain memory, lessons, and graph all load
- [ ] All accessibility toggles function
- [ ] Sidebar collapses/expands
- [ ] File panel and workflow context panel open correctly
- [ ] Cosimo panel slides in from all entry points
- [ ] Command autocomplete appears in chat input
- [ ] No direct `MOCK_*` imports in components (only in data/ and services/)
- [ ] No `document.getElementById` or `document.querySelector` calls
- [ ] No inline styles except for dynamic values (purple intensity, panel width)
- [ ] TypeScript compiles with no errors (`npx tsc --noEmit`)

---

## What Gets Preserved vs. What Changes

### Preserved exactly
- All mock data content (text, names, numbers, dates)
- The 6-sphere logo layout and animation
- Flow graph visual language (node shapes, colors, edge routing)
- The 3-view structure (Chat, Workflows, Brain)
- All chat thread scripts (messages, artifacts, gate flows)
- Dark mode color mappings
- Accessibility mode behaviors
- Purple intensity slider behavior

### Changes (intentional)
- Visual styling moves from custom CSS to base shadcn defaults (CTO will diff and apply production styling)
- Event delegation → React component events
- Global state → Zustand stores
- `<script>` tag loading → Vite bundling with ES modules
- innerHTML string building → JSX components
- Hash-based SPA → React Router 7 file routing with URL segments
- No TypeScript → Full TypeScript with interfaces for all data shapes
