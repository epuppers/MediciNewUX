// ============================================
// FlowNode — Single node in the workflow flow graph
// ============================================

import type { FlowNode as FlowNodeType, FlowNodeType as NodeType, NodeStatus } from '~/services/types';
import { cn } from '~/lib/utils';

/** Configuration for graph layout dimensions */
export interface FlowGraphConfig {
  nodeWidth: number;
  nodeHeight: number;
  colSpacing: number;
  rowSpacing: number;
  edgeStroke: number;
}

interface FlowNodeProps {
  node: FlowNodeType;
  status?: NodeStatus;
  selected?: boolean;
  compact?: boolean;
  config: FlowGraphConfig;
  onClick?: (nodeId: string) => void;
}

/**
 * Renders a single node in the SVG flow graph.
 * Colors are determined by CSS classes per node type, with optional status overrides.
 */
export function FlowNodeComponent({ node, status, selected, compact, config, onClick }: FlowNodeProps) {
  const { nodeWidth, nodeHeight, colSpacing, rowSpacing } = config;
  const cx = node.x * colSpacing;
  const cy = node.y * rowSpacing;
  const x = cx - nodeWidth / 2;
  const y = cy - nodeHeight / 2;

  const isGate = node.type === 'gate';
  const isPending = status === 'pending';
  const isSkipped = status === 'skipped';
  const isRunning = status === 'running';

  const handleClick = () => {
    onClick?.(node.id);
  };

  // Build CSS class list for the node group
  const nodeClass = cn(
    'flow-node',
    `flow-node-${node.type}`,
    status && `flow-node-status-${status}`,
    selected && 'selected',
  );

  return (
    <g
      className={nodeClass}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      aria-label={`${node.type} node: ${node.title}`}
    >
      {/* Node rectangle — colors come from CSS classes */}
      <rect
        className="flow-node-rect"
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        rx={6}
        ry={6}
        strokeDasharray={isGate ? '6 3' : undefined}
      />

      {/* Lesson indicator dot */}
      {node.lesson && (
        <circle
          className="flow-node-lesson-dot"
          cx={x + nodeWidth - 8}
          cy={y + 8}
          r={3}
        />
      )}

      {/* Node text via foreignObject */}
      <foreignObject
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
      >
        <div className={cn('flow-node-fo', compact && 'compact')}>
          <div className="flow-node-title">
            {node.title}
          </div>
          {!compact && node.description && (
            <div className="flow-node-desc">
              {node.description}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}
