import { useBrainStore } from '~/stores/brain-store';
import type { GraphData } from '~/services/types';
import { cn } from '~/lib/utils';

// ============================================
// Graph Breadcrumb — You > Category > Entity
// ============================================

interface GraphBreadcrumbProps {
  graphData: GraphData;
}

/** Breadcrumb navigation for the entity graph drill-down. */
export function GraphBreadcrumb({ graphData }: GraphBreadcrumbProps) {
  const { graphLevel, graphActiveCategory, graphSelectedEntity, navigateGraph } =
    useBrainStore();

  // Resolve category label
  const categoryLabel = graphActiveCategory
    ? graphData.categories.find((c) => c.id === graphActiveCategory)?.label ?? graphActiveCategory
    : null;

  // Resolve entity label
  let entityLabel: string | null = null;
  if (graphSelectedEntity && graphActiveCategory) {
    const nodes = graphData.nodes[graphActiveCategory] ?? [];
    const node = nodes.find((n) => n.id === graphSelectedEntity);
    entityLabel = node?.label ?? graphSelectedEntity;
  }

  return (
    <nav className="flex items-center gap-0.5" aria-label="Graph navigation">
      <button
        type="button"
        className={cn(
          'font-mono text-[0.6875rem] font-semibold bg-transparent border-none px-1 py-0.5 transition-colors',
          graphLevel === 'root'
            ? 'text-taupe-5 cursor-default'
            : 'text-taupe-3 cursor-pointer hover:text-taupe-5'
        )}
        onClick={() => navigateGraph('root')}
        data-nav="root"
      >
        You
      </button>

      {(graphLevel === 'cluster' || graphLevel === 'entity') && categoryLabel && (
        <>
          <span className="font-mono text-[0.6875rem] text-taupe-2 pointer-events-none" aria-hidden="true">
            &rsaquo;
          </span>
          <button
            type="button"
            className={cn(
              'font-mono text-[0.6875rem] font-semibold bg-transparent border-none px-1 py-0.5 transition-colors',
              graphLevel === 'cluster'
                ? 'text-taupe-5 cursor-default'
                : 'text-taupe-3 cursor-pointer hover:text-taupe-5'
            )}
            onClick={() => navigateGraph(graphActiveCategory!)}
            data-nav={graphActiveCategory}
          >
            {categoryLabel}
          </button>
        </>
      )}

      {graphLevel === 'entity' && entityLabel && (
        <>
          <span className="font-mono text-[0.6875rem] text-taupe-2 pointer-events-none" aria-hidden="true">
            &rsaquo;
          </span>
          <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 cursor-default px-1 py-0.5">{entityLabel}</span>
        </>
      )}
    </nav>
  );
}
