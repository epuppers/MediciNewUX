// ============================================
// Entity Graph — SVG relationship graph for
// the Rolodex directory view (graph mode)
// ============================================

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '~/lib/utils';
import { Button } from '~/components/ui/button';
import { useEntityStore } from '~/stores/entity-store';
import { ENTITY_TYPE_COLOR_RGB } from '~/lib/entity-constants';
import type { Entity, EntitySchema, EntityTypeDefinition } from '~/services/types';

// ============================================
// Types
// ============================================

interface EntityGraphProps {
  entities: Entity[];
  schema: EntitySchema;
  onEntityClick: (entityId: string) => void;
  className?: string;
}

interface NodePosition {
  entityId: string;
  typeId: string;
  x: number;
  y: number;
  name: string;
  truncatedName: string;
  subtitle: string;
  icon: string;
  health: 'healthy' | 'warning' | 'critical' | null;
  colorRgb: string;
  typeDef: EntityTypeDefinition;
}

interface EdgePosition {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  sourceTypeId: string;
  colorRgb: string;
  label: string;
}

interface ClusterBounds {
  typeId: string;
  labelPlural: string;
  colorRgb: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  labelX: number;
  labelY: number;
}

// ============================================
// Constants
// ============================================

const SVG_WIDTH = 800;
const SVG_HEIGHT = 700;
const CENTER = { x: SVG_WIDTH / 2, y: SVG_HEIGHT / 2 };
const BASE_RADIUS = 260;
const INNER_RADIUS = 180;
const NODE_RADIUS = 24;
const MIN_ZOOM = 0.3;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.15;

/** Health status → CSS custom property for SVG fill */
const HEALTH_SVG_COLORS: Record<string, string> = {
  healthy: 'var(--green)',
  warning: 'var(--amber)',
  critical: 'var(--red)',
};

// ============================================
// Hooks
// ============================================

/** Check if reduced motion is active */
function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const check = () => {
      setReduced(document.documentElement.dataset.a11yMotion === 'reduce');
    };
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-a11y-motion'],
    });
    return () => observer.disconnect();
  }, []);
  return reduced;
}

// ============================================
// Layout computation
// ============================================

function computeLayout(
  entities: Entity[],
  schema: EntitySchema,
): { nodes: NodePosition[]; edges: EdgePosition[]; clusters: ClusterBounds[] } {
  // Group entities by type
  const typeGroups = new Map<string, Entity[]>();
  for (const entity of entities) {
    const group = typeGroups.get(entity.typeId) ?? [];
    group.push(entity);
    typeGroups.set(entity.typeId, group);
  }

  // Build type defs lookup
  const typeDefMap = new Map<string, EntityTypeDefinition>();
  for (const td of schema.entityTypes) {
    typeDefMap.set(td.id, td);
  }

  // Calculate arc segments proportional to entity count
  const activeTypes = Array.from(typeGroups.entries()).filter(([, g]) => g.length > 0);
  const totalEntities = activeTypes.reduce((sum, [, g]) => sum + g.length, 0);
  const MIN_ARC = (30 * Math.PI) / 180; // 30 degrees minimum
  const FULL_CIRCLE = 2 * Math.PI;
  const GAP = (5 * Math.PI) / 180; // 5-degree gap between segments
  const totalGap = GAP * activeTypes.length;
  const availableArc = FULL_CIRCLE - totalGap;

  // Assign arcs — proportional with minimum
  let arcs: { typeId: string; entities: Entity[]; arc: number }[] = [];
  let usedArc = 0;
  for (const [typeId, group] of activeTypes) {
    const proportional = (group.length / totalEntities) * availableArc;
    const arc = Math.max(MIN_ARC, proportional);
    arcs.push({ typeId, entities: group, arc });
    usedArc += arc;
  }

  // Normalize if we exceeded the available arc
  if (usedArc > availableArc) {
    const scale = availableArc / usedArc;
    arcs = arcs.map((a) => ({ ...a, arc: a.arc * scale }));
  }

  // Position nodes
  const nodeMap = new Map<string, NodePosition>();
  const nodes: NodePosition[] = [];
  let currentAngle = -Math.PI / 2; // start at top

  for (const { typeId, entities: groupEntities, arc } of arcs) {
    const typeDef = typeDefMap.get(typeId);
    const colorRgb = ENTITY_TYPE_COLOR_RGB[typeId] ?? 'var(--taupe-3-rgb)';
    const useDoubleRing = groupEntities.length > 8;

    for (let i = 0; i < groupEntities.length; i++) {
      const entity = groupEntities[i];
      // Position within the arc
      const t = groupEntities.length === 1
        ? 0.5
        : i / (groupEntities.length - 1);
      const angle = currentAngle + t * arc;

      // Alternate between outer and inner ring for large groups
      let radius = BASE_RADIUS;
      if (useDoubleRing) {
        radius = i % 2 === 0 ? BASE_RADIUS : INNER_RADIUS;
      }

      const x = CENTER.x + Math.cos(angle) * radius;
      const y = CENTER.y + Math.sin(angle) * radius;

      const truncatedName = entity.name.length > 12
        ? entity.name.slice(0, 12) + '\u2026'
        : entity.name;

      const node: NodePosition = {
        entityId: entity.id,
        typeId,
        x,
        y,
        name: entity.name,
        truncatedName,
        subtitle: entity.subtitle,
        icon: typeDef?.icon ?? '?',
        health: entity.health,
        colorRgb,
        typeDef: typeDef!,
      };

      nodes.push(node);
      nodeMap.set(entity.id, node);
    }

    currentAngle += arc + GAP;
  }

  // Build relationship type lookup
  const relTypeMap = new Map<string, (typeof schema.relationshipTypes)[number]>();
  for (const rt of schema.relationshipTypes) {
    relTypeMap.set(rt.id, rt);
  }

  // Build deduplicated edges
  const edgeSet = new Set<string>();
  const edges: EdgePosition[] = [];

  for (const entity of entities) {
    for (const rel of entity.relationships) {
      const key = [entity.id, rel.targetEntityId].sort().join('::');
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);

      const sourceNode = nodeMap.get(entity.id);
      const targetNode = nodeMap.get(rel.targetEntityId);
      if (!sourceNode || !targetNode) continue;

      // Resolve label from relationship type definition
      const relType = relTypeMap.get(rel.relationshipTypeId);
      const label = relType
        ? (rel.direction === 'forward' ? relType.forwardLabel : relType.reverseLabel)
        : rel.relationshipTypeId;

      edges.push({
        key,
        x1: sourceNode.x,
        y1: sourceNode.y,
        x2: targetNode.x,
        y2: targetNode.y,
        sourceTypeId: entity.typeId,
        colorRgb: ENTITY_TYPE_COLOR_RGB[entity.typeId] ?? 'var(--taupe-3-rgb)',
        label,
      });
    }
  }

  // Compute cluster bounds per type group
  const clusters: ClusterBounds[] = [];
  const CLUSTER_PAD = 40;

  for (const [typeId, group] of typeGroups) {
    const groupNodes = group
      .map((e) => nodeMap.get(e.id))
      .filter((n): n is NodePosition => !!n);
    if (groupNodes.length === 0) continue;

    const xs = groupNodes.map((n) => n.x);
    const ys = groupNodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = Math.max((maxX - minX) / 2 + CLUSTER_PAD, CLUSTER_PAD + NODE_RADIUS);
    const ry = Math.max((maxY - minY) / 2 + CLUSTER_PAD, CLUSTER_PAD + NODE_RADIUS);

    const typeDef = typeDefMap.get(typeId);
    clusters.push({
      typeId,
      labelPlural: typeDef?.labelPlural ?? typeId,
      colorRgb: ENTITY_TYPE_COLOR_RGB[typeId] ?? 'var(--taupe-3-rgb)',
      cx,
      cy,
      rx,
      ry,
      labelX: cx,
      labelY: cy - ry - 6,
    });
  }

  return { nodes, edges, clusters };
}

// ============================================
// EntityGraph — main component
// ============================================

export function EntityGraph({ entities, schema, onEntityClick, className }: EntityGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const reducedMotion = useReducedMotion();

  // Store state
  const graphZoom = useEntityStore((s) => s.graphZoom);
  const graphPan = useEntityStore((s) => s.graphPan);
  const setGraphZoom = useEntityStore((s) => s.setGraphZoom);
  const setGraphPan = useEntityStore((s) => s.setGraphPan);
  const activeTypeFilter = useEntityStore((s) => s.activeTypeFilter);

  // Local state
  const [isPanning, setIsPanning] = useState(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeKey, setHoveredEdgeKey] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Compute layout
  const layout = useMemo(
    () => computeLayout(entities, schema),
    [entities, schema],
  );

  // Zoom handlers
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, graphZoom + delta));
      setGraphZoom(newZoom);
    },
    [graphZoom, setGraphZoom],
  );

  const handleZoomIn = useCallback(() => {
    setGraphZoom(Math.min(MAX_ZOOM, graphZoom + ZOOM_STEP));
  }, [graphZoom, setGraphZoom]);

  const handleZoomOut = useCallback(() => {
    setGraphZoom(Math.max(MIN_ZOOM, graphZoom - ZOOM_STEP));
  }, [graphZoom, setGraphZoom]);

  const handleZoomReset = useCallback(() => {
    setGraphZoom(1);
    setGraphPan({ x: 0, y: 0 });
  }, [setGraphZoom, setGraphPan]);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      const target = e.target as SVGElement;
      if (target.closest('[data-graph-node]')) return;
      setIsPanning(true);
      panStart.current = { x: e.clientX, y: e.clientY, panX: graphPan.x, panY: graphPan.y };
    },
    [graphPan],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      setGraphPan({
        x: panStart.current.panX + dx,
        y: panStart.current.panY + dy,
      });
    },
    [isPanning, setGraphPan],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Node click
  const handleNodeClick = useCallback(
    (e: React.MouseEvent, entityId: string) => {
      e.stopPropagation();
      onEntityClick(entityId);
    },
    [onEntityClick],
  );

  // Node keyboard
  const handleNodeKeyDown = useCallback(
    (e: React.KeyboardEvent, entityId: string) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onEntityClick(entityId);
      }
    },
    [onEntityClick],
  );

  // Check if a node/edge matches the active filter (or no filter)
  const isFiltered = useCallback(
    (typeId: string) => {
      if (!activeTypeFilter) return false;
      return typeId !== activeTypeFilter;
    },
    [activeTypeFilter],
  );

  const zoomPercent = Math.round(graphZoom * 100);
  const transitionStyle = reducedMotion ? 'none' : 'transform 0.15s ease, opacity 0.15s ease';

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
      {/* SVG graph */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        className={cn(
          'absolute inset-0 h-full w-full',
          isPanning ? 'cursor-grabbing' : 'cursor-grab',
        )}
        role="img"
        aria-label={`Entity relationship graph showing ${entities.length} entities`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Zoom + pan transform layer */}
        <g
          transform={`translate(${graphPan.x}, ${graphPan.y}) scale(${graphZoom})`}
          style={{ transformOrigin: `${SVG_WIDTH / 2}px ${SVG_HEIGHT / 2}px` }}
        >
          {/* Background click target */}
          <rect
            x={-500}
            y={-500}
            width={SVG_WIDTH + 1000}
            height={SVG_HEIGHT + 1000}
            fill="transparent"
          />

          {/* Cluster backgrounds layer */}
          <g data-slot="graph-clusters">
            {layout.clusters.map((cluster) => {
              const dimmed = isFiltered(cluster.typeId);
              return (
                <g key={`cluster-${cluster.typeId}`} style={{ opacity: dimmed ? 0.15 : 1, transition: transitionStyle }}>
                  {/* Light mode fill */}
                  <ellipse
                    cx={cluster.cx}
                    cy={cluster.cy}
                    rx={cluster.rx}
                    ry={cluster.ry}
                    fill={`rgba(${cluster.colorRgb}, 0.03)`}
                    className="dark:hidden"
                  />
                  {/* Dark mode fill */}
                  <ellipse
                    cx={cluster.cx}
                    cy={cluster.cy}
                    rx={cluster.rx}
                    ry={cluster.ry}
                    fill={`rgba(${cluster.colorRgb}, 0.05)`}
                    className="hidden dark:block"
                  />
                  {/* Cluster type label */}
                  <text
                    x={cluster.labelX}
                    y={cluster.labelY}
                    textAnchor="middle"
                    fill={`rgba(${cluster.colorRgb}, 0.4)`}
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 11,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase' as const,
                      pointerEvents: 'none',
                    }}
                  >
                    {cluster.labelPlural}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Edges layer */}
          <g data-slot="graph-edges">
            {layout.edges.map((edge) => {
              const dimmed = isFiltered(edge.sourceTypeId);
              const isHovered = hoveredEdgeKey === edge.key;
              const showLabel = graphZoom > 0.7;

              // Edge label positioning
              const mx = (edge.x1 + edge.x2) / 2;
              const my = (edge.y1 + edge.y2) / 2;
              let angleDeg = Math.atan2(edge.y2 - edge.y1, edge.x2 - edge.x1) * (180 / Math.PI);
              if (angleDeg > 90 || angleDeg < -90) angleDeg += 180;

              return (
                <g key={edge.key}>
                  {/* Invisible wide hit target */}
                  <line
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke="transparent"
                    strokeWidth={10}
                    onMouseEnter={() => setHoveredEdgeKey(edge.key)}
                    onMouseLeave={() => setHoveredEdgeKey(null)}
                  />
                  {/* Visible edge */}
                  <line
                    x1={edge.x1}
                    y1={edge.y1}
                    x2={edge.x2}
                    y2={edge.y2}
                    stroke={`rgba(${edge.colorRgb}, ${isHovered ? 0.6 : 0.3})`}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{
                      opacity: dimmed ? 0.15 : 1,
                      transition: transitionStyle,
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Edge label */}
                  {showLabel && (
                    <g
                      transform={`translate(${mx}, ${my}) rotate(${angleDeg})`}
                      style={{ opacity: dimmed ? 0.15 : 1, transition: transitionStyle, pointerEvents: 'none' }}
                    >
                      <rect
                        x={-(edge.label.length * 3 + 4)}
                        y={-7}
                        width={edge.label.length * 6 + 8}
                        height={14}
                        rx={3}
                        fill="var(--white-pure)"
                        className="dark:fill-[var(--surface-1)]"
                      />
                      <text
                        x={0}
                        y={0}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="var(--taupe-3)"
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: 8,
                        }}
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes layer */}
          <g data-slot="graph-nodes">
            {layout.nodes.map((node) => {
              const dimmed = isFiltered(node.typeId);
              const isHovered = hoveredNodeId === node.entityId;
              const isFocused = focusedNodeId === node.entityId;
              const nodeScale = isHovered && !reducedMotion ? 1.1 : 1;

              return (
                <g
                  key={node.entityId}
                  data-graph-node={node.entityId}
                  tabIndex={0}
                  role="button"
                  aria-label={`${node.name}, ${node.typeDef.label}`}
                  style={{
                    transform: `translate(${node.x}px, ${node.y}px) scale(${nodeScale})`,
                    opacity: dimmed ? 0.15 : 1,
                    cursor: 'pointer',
                    outline: 'none',
                    transition: transitionStyle,
                  }}
                  onClick={(e) => handleNodeClick(e, node.entityId)}
                  onKeyDown={(e) => handleNodeKeyDown(e, node.entityId)}
                  onMouseEnter={() => setHoveredNodeId(node.entityId)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onFocus={() => setFocusedNodeId(node.entityId)}
                  onBlur={() => setFocusedNodeId(null)}
                >
                  {/* Focus ring */}
                  {isFocused && (
                    <circle
                      cx={0}
                      cy={0}
                      r={NODE_RADIUS + 4}
                      fill="none"
                      stroke="var(--violet-3)"
                      strokeWidth={2}
                    />
                  )}

                  {/* Node circle — fill */}
                  <circle
                    cx={0}
                    cy={0}
                    r={NODE_RADIUS}
                    fill="var(--white-pure)"
                    className="dark:fill-[var(--surface-1)]"
                  />

                  {/* Node circle — stroke */}
                  <circle
                    cx={0}
                    cy={0}
                    r={NODE_RADIUS}
                    fill="none"
                    stroke={`rgba(${node.colorRgb}, 1)`}
                    strokeWidth={2}
                  />

                  {/* Type icon */}
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={`rgba(${node.colorRgb}, 1)`}
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      pointerEvents: 'none',
                    }}
                  >
                    {node.icon}
                  </text>

                  {/* Name label */}
                  <text
                    x={0}
                    y={NODE_RADIUS + 14}
                    textAnchor="middle"
                    fill="var(--taupe-5)"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 10,
                      pointerEvents: 'none',
                    }}
                  >
                    {node.truncatedName}
                  </text>

                  {/* Health indicator dot */}
                  {node.health && (
                    <>
                      <circle
                        cx={NODE_RADIUS * 0.7}
                        cy={-NODE_RADIUS * 0.7}
                        r={4}
                        fill={HEALTH_SVG_COLORS[node.health] ?? 'var(--taupe-3)'}
                      />
                      {/* Critical pulse animation */}
                      {node.health === 'critical' && !reducedMotion && (
                        <circle
                          cx={NODE_RADIUS * 0.7}
                          cy={-NODE_RADIUS * 0.7}
                          r={4}
                          fill="none"
                          stroke={HEALTH_SVG_COLORS.critical}
                          strokeWidth={1.5}
                          opacity={0.6}
                        >
                          <animate
                            attributeName="r"
                            values="4;8;4"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            values="0.6;0;0.6"
                            dur="2s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                    </>
                  )}

                  {/* Tooltip (native SVG title) */}
                  <title>{node.name}{node.subtitle ? ` \u2014 ${node.subtitle}` : ''}</title>
                </g>
              );
            })}
          </g>
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-[var(--r-md)] border border-taupe-1 bg-white/90 p-1 backdrop-blur-sm dark:border-surface-3 dark:bg-surface-1/90">
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <ZoomIn className="size-3" />
        </Button>
        <span className="min-w-[3ch] text-center font-[family-name:var(--mono)] text-[0.625rem] text-taupe-4">
          {zoomPercent}%
        </span>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <ZoomOut className="size-3" />
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          onClick={handleZoomReset}
          aria-label="Reset zoom and pan"
        >
          <Maximize2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
