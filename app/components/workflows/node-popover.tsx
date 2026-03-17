// ============================================
// NodePopover — Detail popover shown on flow graph node click
// ============================================

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { useUIStore } from '~/stores/ui-store';
import { cn } from '~/lib/utils';
import type { FlowNode, FlowNodeType } from '~/services/types';

interface NodePopoverProps {
  /** The flow node to display details for */
  node: FlowNode;
  /** The template this node belongs to */
  templateId: string;
  /** Whether the popover is open */
  open: boolean;
  /** Called when the popover should close */
  onClose: () => void;
  /** Screen position to anchor the popover near */
  anchorPosition: { x: number; y: number };
}

/** Maps node type to display label */
function nodeTypeLabel(type: FlowNodeType): string {
  const labels: Record<FlowNodeType, string> = {
    input: 'Input',
    action: 'Action',
    gate: 'Gate',
    branch: 'Branch',
    output: 'Output',
  };
  return labels[type];
}

const TYPE_COLORS: Record<FlowNodeType, string> = {
  input: 'text-blue-3 bg-[rgba(var(--blue-3-rgb),0.1)]',
  action: 'text-violet-3 bg-[rgba(var(--violet-3-rgb),0.1)]',
  gate: 'text-amber bg-[rgba(var(--amber-rgb),0.1)]',
  branch: 'text-taupe-3 dark:text-taupe-4 bg-[rgba(var(--taupe-3-rgb),0.1)] dark:bg-[rgba(var(--taupe-3-rgb),0.15)]',
  output: 'text-green bg-[rgba(var(--green-rgb),0.1)]',
};

/**
 * Popover that shows detailed information about a flow graph node.
 * Anchored near the clicked node position using an invisible trigger element.
 */
export function NodePopover({
  node,
  templateId,
  open,
  onClose,
  anchorPosition,
}: NodePopoverProps) {
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);

  const handleEditWithCosimo = () => {
    openCosimoPanel({ type: 'node', text: node.title });
    onClose();
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <PopoverTrigger
        render={<span />}
        style={{
          position: 'fixed',
          left: anchorPosition.x,
          top: anchorPosition.y,
          width: 1,
          height: 1,
          pointerEvents: 'none',
          opacity: 0,
        }}
      />
      <PopoverContent className="w-80 bg-white dark:bg-off-white border border-taupe-2 rounded-[var(--r-lg)] shadow-[0_4px_16px_rgba(0,0,0,0.12)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)] !p-3.5 !gap-0 !ring-0" side="right" sideOffset={12}>
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            'font-mono text-[0.625rem] font-semibold uppercase tracking-[0.5px] p-[2px_8px] rounded-[var(--r-sm)]',
            TYPE_COLORS[node.type],
          )}>
            {nodeTypeLabel(node.type)}
          </span>
          <button
            className="w-6 h-6 flex items-center justify-center border-none bg-transparent text-taupe-3 dark:text-taupe-3 text-base cursor-pointer rounded-[var(--r-sm)] leading-none hover:bg-taupe-1 hover:text-taupe-4 dark:hover:bg-taupe-2 dark:hover:text-taupe-4 active:bg-taupe-2 dark:active:bg-taupe-1 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1"
            onClick={onClose}
            aria-label="Close popover"
          >
            <span className="icon-char">✕</span>
            <span className="a11y-label">Close</span>
          </button>
        </div>

        <div className="font-mono text-[0.8125rem] font-semibold text-taupe-4 dark:text-taupe-5 mb-1.5">{node.title}</div>

        <div className="font-sans text-xs text-taupe-3 dark:text-taupe-4 leading-normal mb-3">{node.description}</div>

        {node.lesson && (
          <div className="bg-[rgba(var(--violet-3-rgb),0.04)] dark:bg-[rgba(var(--violet-3-rgb),0.1)] border border-[rgba(var(--violet-3-rgb),0.12)] dark:border-[rgba(var(--violet-3-rgb),0.2)] rounded-[var(--r-md)] p-2.5 mb-3">
            <div className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.5px] text-violet-3 mb-1">Linked Lesson</div>
            <div className="font-mono text-[0.6875rem] font-semibold text-taupe-4 dark:text-taupe-5 mb-1">
              <span className="text-violet-3 text-[0.5rem]">◆</span>{' '}
              {node.lesson}
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            className="node-popover-cosimo-btn font-mono text-[0.6875rem] font-semibold text-white bg-violet-3 border-none rounded-[var(--r-md)] p-[6px_14px] cursor-pointer transition-[background] duration-100 hover:bg-[var(--violet-4)] active:bg-berry-3 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
            onClick={handleEditWithCosimo}
          >
            <span className="icon-char">✦</span> Edit with Cosimo
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
