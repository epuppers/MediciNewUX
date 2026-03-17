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

export const SCOPE_CONFIG: Record<string, { label: string; cssClass: string }> = {
  user: { label: 'Personal', cssClass: 'scope-user' },
  company: { label: 'Company', cssClass: 'scope-company' },
};
