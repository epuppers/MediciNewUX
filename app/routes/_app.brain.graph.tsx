// ============================================
// Brain Graph Route — entity knowledge graph
// ============================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouteError } from 'react-router';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '~/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { getGraphData } from '~/services/brain';
import { EntityGraph } from '~/components/brain/entity-graph';
import { EntityDetail } from '~/components/brain/entity-detail';
import type { GraphNode } from '~/services/types';
import type { Route } from './+types/_app.brain.graph';

/** Loads graph data for the entity graph visualization. */
export async function loader() {
  const graphData = await getGraphData();
  return { graphData };
}

/** Brain Graph route — renders entity graph SVG with optional detail panel. */
export default function BrainGraphRoute({ loaderData }: Route.ComponentProps) {
  const { graphData } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const entityParam = searchParams.get('entity');

  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(
    entityParam
  );

  // Sync URL param to state on mount/change
  useEffect(() => {
    if (entityParam) {
      setSelectedEntityId(entityParam);
    }
  }, [entityParam]);

  // Resolve selected entity node and its category (supports both ID and label lookup)
  const selectedEntity = useMemo<{ node: GraphNode; category: string } | null>(() => {
    if (!selectedEntityId) return null;
    for (const cat of Object.keys(graphData.nodes)) {
      const node = graphData.nodes[cat].find(
        (n) => n.id === selectedEntityId || n.label === selectedEntityId
      );
      if (node) return { node, category: cat };
    }
    return null;
  }, [selectedEntityId, graphData]);

  const handleSelectEntity = (id: string) => {
    setSelectedEntityId(id);
    setSearchParams({ entity: id }, { replace: true });
  };

  const handleNavigateToRelated = (id: string) => {
    handleSelectEntity(id);
  };

  const handleCloseDetail = () => {
    setSelectedEntityId(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="relative h-full overflow-hidden">
      {/* Graph area (full) */}
      <EntityGraph
        graphData={graphData}
        selectedEntityId={selectedEntityId}
        onSelectEntity={handleSelectEntity}
      />

      {/* Detail panel — slides up from bottom inside the graph container */}
      {selectedEntity && (
        <EntityDetail
          entity={selectedEntity.node}
          entityCategory={selectedEntity.category}
          graphData={graphData}
          onNavigate={handleNavigateToRelated}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}

/** Error boundary for graph loading errors */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error('Graph route error:', error);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="mt-2">
          An unexpected error occurred while loading the knowledge graph.
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

/** Loading skeleton — graph area + detail panel */
export function HydrateFallback() {
  return (
    <div className="relative h-full overflow-hidden">
      {/* Graph area skeleton */}
      <div className="h-full w-full p-6">
        <Skeleton className="h-full w-full rounded-[var(--r-lg)]" />
      </div>
    </div>
  );
}
