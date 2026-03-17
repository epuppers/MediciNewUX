// ============================================
// FlowEdge — Edge line between two nodes in the flow graph
// ============================================

import type { FlowEdge as FlowEdgeType, FlowNode } from '~/services/types';
import type { FlowGraphConfig } from './flow-node';
import { cn } from '~/lib/utils';

// old CSS: .flow-edge, .flow-edge-label → ported to Tailwind below

interface FlowEdgeProps {
  edge: FlowEdgeType;
  nodes: FlowNode[];
  config: FlowGraphConfig;
  compact?: boolean;
}

/**
 * Renders an edge (line with arrowhead) connecting two flow graph nodes.
 * Calculates start from bottom-center of source and end at top-center of target.
 * Branch edges display their condition label at the midpoint.
 */
export function FlowEdgeComponent({ edge, nodes, config, compact }: FlowEdgeProps) {
  const { nodeWidth, nodeHeight, colSpacing, rowSpacing } = config;

  const fromNode = nodes.find((n) => n.id === edge.from);
  const toNode = nodes.find((n) => n.id === edge.to);

  if (!fromNode || !toNode) return null;

  // Bottom center of source node
  const x1 = fromNode.x * colSpacing;
  const y1 = fromNode.y * rowSpacing + nodeHeight / 2;

  // Top center of target node
  const x2 = toNode.x * colSpacing;
  const y2 = toNode.y * rowSpacing - nodeHeight / 2;

  // Midpoint for label
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;

  // If nodes are in the same column, draw a straight line
  // Otherwise draw an L-shaped path via a vertical then horizontal segment
  const isStraight = x1 === x2;

  const edgeClass = cn(
    '[fill:none] [stroke:var(--taupe-3)]',
    compact ? '[stroke-width:1]' : '[stroke-width:1.5]',
  );

  return (
    <g>
      {isStraight ? (
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          className={edgeClass}
          markerEnd="url(#arrowhead)"
        />
      ) : (
        <path
          d={`M ${x1} ${y1} L ${x1} ${my} L ${x2} ${my} L ${x2} ${y2}`}
          className={edgeClass}
          markerEnd="url(#arrowhead)"
        />
      )}

      {/* Branch label at midpoint */}
      {edge.label && (
        <>
          <rect
            x={mx - edge.label.length * 3.2}
            y={my - 8}
            width={edge.label.length * 6.4}
            height={14}
            rx={3}
            fill="var(--off-white)"
          />
          <text
            x={mx}
            y={my}
            textAnchor="middle"
            dominantBaseline="central"
            className="font-[family-name:var(--sans)] text-[0.5625rem] [fill:var(--taupe-3)] pointer-events-none [paint-order:stroke_fill] [stroke:var(--off-white)] [stroke-width:3px] [stroke-linejoin:round] dark:[stroke:var(--surface-1)]"
          >
            {edge.label}
          </text>
        </>
      )}
    </g>
  );
}
