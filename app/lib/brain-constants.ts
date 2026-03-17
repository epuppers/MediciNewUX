export const GRAPH_CATEGORY_COLORS: Record<string, string> = {
  funds: 'var(--violet-3)',
  contacts: 'var(--berry-3)',
  documents: 'var(--blue-3)',
  workflows: 'var(--green)',
  systems: 'var(--amber)',
  entities: 'var(--taupe-3)',
};

export const GRAPH_CATEGORY_LABELS: Record<string, string> = {
  funds: 'Fund',
  contacts: 'Contact',
  documents: 'Document',
  workflows: 'Workflow',
  systems: 'System',
  entities: 'Entity',
};

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

export const SCOPE_CONFIG: Record<string, { label: string; className: string }> = {
  user: {
    label: 'Personal',
    className: 'font-mono text-[0.625rem] font-bold px-[7px] py-[2px] rounded-md uppercase tracking-[0.06em] bg-violet-3 text-white border border-violet-3',
  },
  company: {
    label: 'Company',
    className: 'font-mono text-[0.625rem] font-bold px-[7px] py-[2px] rounded-md uppercase tracking-[0.06em] bg-blue-3 text-white border border-blue-3',
  },
};

export const LESSON_SCOPE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'user', label: 'Personal' },
  { id: 'company', label: 'Company' },
] as const;

export const MEMORY_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'preference', label: 'Preference' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'contact', label: 'Contact' },
  { id: 'fund', label: 'Fund' },
  { id: 'style', label: 'Style' },
  { id: 'context', label: 'Context' },
] as const;

export const MEMORY_CATEGORY_STYLES: Record<string, string> = {
  preference: 'bg-berry-1 text-berry-4 border border-berry-2 dark:bg-[rgba(var(--berry-3-rgb),0.12)] dark:border-[rgba(var(--berry-3-rgb),0.2)]',
  workflow: 'bg-[rgba(var(--green-rgb),0.1)] text-green border border-[rgba(var(--green-rgb),0.25)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  contact: 'bg-blue-1 text-blue-3 border border-blue-2 dark:bg-[rgba(var(--blue-3-rgb),0.12)] dark:border-[rgba(var(--blue-3-rgb),0.2)]',
  fund: 'bg-violet-1 text-violet-3 border border-violet-2 dark:bg-[rgba(var(--violet-3-rgb),0.12)] dark:border-[rgba(var(--violet-3-rgb),0.2)]',
  style: 'bg-[rgba(var(--amber-rgb),0.1)] text-amber border border-[rgba(var(--amber-rgb),0.25)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
  context: 'bg-taupe-1 text-taupe-4 border border-taupe-2 dark:bg-surface-2 dark:border-taupe-3',
};
