// ============================================
// FlowNode — Single node in the workflow flow graph
// ============================================

import type { FlowNode as FlowNodeType, FlowNodeType as NodeType, NodeStatus } from '~/services/types';
import { cn } from '~/lib/utils';

// old CSS: .flow-node, .flow-node-rect, .flow-node-fo, .flow-node-title, .flow-node-desc,
// .flow-node-lesson-dot, .flow-node-{type}, .flow-node-status-{status}, .selected → ported to Tailwind below

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

/** Node type → rect stroke/fill classes (light + dark) */
const NODE_RECT_CLASSES: Record<NodeType, string> = {
  input:  '[stroke:var(--blue-3)] [fill:var(--blue-1)] dark:[stroke:var(--blue-2)] dark:[fill:rgba(var(--blue-3-rgb),0.12)]',
  action: '[stroke:var(--violet-3)] [fill:var(--violet-1)] dark:[stroke:var(--violet-2)] dark:[fill:rgba(var(--violet-3-rgb),0.12)]',
  gate:   '[stroke:var(--amber)] [fill:rgba(var(--amber-rgb),0.08)] dark:[fill:rgba(var(--amber-rgb),0.12)]',
  branch: '[stroke:var(--taupe-3)] [fill:var(--off-white)] dark:[stroke:var(--taupe-2)] dark:[fill:var(--surface-2)]',
  output: '[stroke:var(--green)] [fill:rgba(var(--green-rgb),0.08)] dark:[fill:rgba(var(--green-rgb),0.12)]',
};

/** Run status → rect stroke/fill override classes (replaces type colors when present) */
const STATUS_RECT_CLASSES: Record<NodeStatus, string> = {
  completed: '[stroke:var(--green)] [fill:rgba(var(--green-rgb),0.08)] dark:[fill:rgba(var(--green-rgb),0.12)]',
  running:   '[stroke:var(--violet-3)] [fill:rgba(var(--violet-3-rgb),0.08)] dark:[fill:rgba(var(--violet-3-rgb),0.12)] animate-[wf-pulse-node_2s_ease-in-out_infinite] animate-wf-pulse-node',
  waiting:   '[stroke:var(--amber)] [fill:rgba(var(--amber-rgb),0.08)] dark:[fill:rgba(var(--amber-rgb),0.12)]',
  pending:   '[stroke:var(--taupe-2)] [fill:var(--taupe-1)] opacity-40',
  failed:    '[stroke:var(--red)] [fill:rgba(var(--red-rgb),0.08)] dark:[fill:rgba(var(--red-rgb),0.12)]',
  skipped:   '[stroke:var(--taupe-2)] [fill:var(--taupe-1)] opacity-40',
};

/**
 * Renders a single node in the SVG flow graph.
 * Colors are determined by lookup maps per node type, with optional status overrides.
 */
export function FlowNodeComponent({ node, status, selected, compact, config, onClick }: FlowNodeProps) {
  const { nodeWidth, nodeHeight, colSpacing, rowSpacing } = config;
  const cx = node.x * colSpacing;
  const cy = node.y * rowSpacing;
  const x = cx - nodeWidth / 2;
  const y = cy - nodeHeight / 2;

  const isGate = node.type === 'gate';
  const isSkipped = status === 'skipped';

  const handleClick = () => {
    onClick?.(node.id);
  };

  return (
    <g
      className="group cursor-pointer outline-none"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
      aria-label={`${node.type} node: ${node.title}`}
    >
      {/* Node rectangle — colors from lookup maps */}
      <rect
        className={cn(
          '[stroke-width:1.5] transition-[stroke-width,filter] duration-150',
          status ? STATUS_RECT_CLASSES[status] : NODE_RECT_CLASSES[node.type],
          'group-hover:[stroke-width:2.5] group-hover:brightness-105',
          'group-focus-visible:[stroke-width:2.5] group-focus-visible:brightness-105',
          'group-focus-visible:outline-2 group-focus-visible:outline-[var(--violet-3)] group-focus-visible:outline-offset-2',
          'group-active:brightness-95',
          selected && '[stroke-width:2.5] brightness-105 outline-2 outline-[var(--violet-3)] outline-offset-2',
        )}
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
          className="[fill:var(--violet-3)] [stroke:none] opacity-70"
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
        <div className={cn(
          'flex flex-col justify-center items-center text-center w-full h-full overflow-hidden pointer-events-none py-0.5 box-border',
          isSkipped && 'opacity-50',
        )}>
          <div className={cn(
            'font-[family-name:var(--mono)] font-semibold text-[color:var(--taupe-5)] leading-[1.2] overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box] break-words',
            compact ? 'text-[0.5625rem] [-webkit-line-clamp:1]' : 'text-[0.6875rem]',
            isSkipped && 'line-through opacity-50',
          )}>
            {node.title}
          </div>
          {!compact && node.description && (
            <div className="font-[family-name:var(--sans)] text-[0.625rem] text-[color:var(--taupe-3)] leading-[1.2] mt-px overflow-hidden text-ellipsis [-webkit-line-clamp:2] [-webkit-box-orient:vertical] [display:-webkit-box] break-words">
              {node.description}
            </div>
          )}
        </div>
      </foreignObject>
    </g>
  );
}
