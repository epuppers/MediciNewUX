// ============================================
// WorkflowPanel — Right-side panel for workflow run context
// ============================================
// Shows compact flow graph with node statuses, input/output
// manifests, and exceptions for the active workflow run.

import { useEffect, useState } from 'react';
import { useChatStore } from '~/stores/chat-store';
import { useResizePanel } from '~/hooks/use-resize-panel';
import { getTemplate } from '~/services/workflows';
import { FlowGraph } from '~/components/workflows/flow-graph';
import type { WorkflowRun, WorkflowTemplate } from '~/services/types';
import { cn } from '~/lib/utils';

interface WorkflowPanelProps {
  run: WorkflowRun;
}

/** Color lookup for exception dot by type */
const EXCEPTION_DOT_COLORS: Record<string, string> = {
  inference: 'bg-blue-3',
  'low-confidence': 'bg-amber',
  'conflicting-value': 'bg-red',
  'format-unknown': 'bg-taupe-3',
};

/** Status badge color classes by run status */
const STATUS_CLASSES: Record<WorkflowRun['status'], string> = {
  completed: 'text-green bg-[rgba(var(--green-rgb),0.08)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  running: 'text-violet-3 bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.12)]',
  waiting: 'text-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
  failed: 'text-red bg-[rgba(var(--red-rgb),0.08)] dark:bg-[rgba(var(--red-rgb),0.12)]',
};

/**
 * WorkflowPanel — right-side panel showing workflow run context.
 * Displays compact flow graph with status colors, input/output manifests,
 * and exception list. Controlled by useChatStore.workflowPanelOpen.
 */
export function WorkflowPanel({ run }: WorkflowPanelProps) {
  const isOpen = useChatStore((s) => s.workflowPanelOpen);
  const close = useChatStore((s) => s.closeWorkflowPanel);

  const [template, setTemplate] = useState<WorkflowTemplate | null>(null);
  const { currentWidth, isDragging, handleMouseDown } = useResizePanel({
    initialWidth: 360,
    minWidth: 280,
    maxWidth: 600,
    side: 'right',
  });

  // Load template data for the run
  useEffect(() => {
    let cancelled = false;
    getTemplate(run.templateId).then((t) => {
      if (!cancelled) setTemplate(t);
    });
    return () => { cancelled = true; };
  }, [run.templateId]);

  if (!isOpen) return null;

  return (
    <>
      {/* Resize handle */}
      <div
        className={cn('resize-handle resize-handle-wfpanel w-[5px] cursor-col-resize shrink-0 relative z-10 block', isDragging && 'dragging')}
        onMouseDown={handleMouseDown}
      />

      <div
        className={cn(
          'w-0 overflow-hidden border-l-2 border-transparent bg-white flex flex-col shrink-0 transition-[width,border-color] duration-200 ease-out rounded-r-lg',
          isOpen && 'border-l-taupe-2 dark:border-l-surface-0',
          isDragging && 'min-w-[280px] select-none'
        )}
        style={{ width: currentWidth }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 min-h-[38px] bg-white border-b border-taupe-2 shrink-0 gap-2 dark:bg-off-white dark:border-surface-3">
          <div className="flex items-baseline gap-1.5 min-w-0 overflow-hidden">
            <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 whitespace-nowrap overflow-hidden text-ellipsis">
              {template?.title ?? 'Workflow Run'}
            </span>
            <span className="font-mono text-[0.625rem] text-taupe-3 whitespace-nowrap">
              Run {run.runId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <RunStatusBadge status={run.status} />
            <button
              className="px-2 py-1 font-mono text-xs text-taupe-3 bg-transparent border-none cursor-pointer rounded-r-sm hover:text-red hover:bg-[rgba(var(--red-rgb),0.08)] active:opacity-70 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1"
              onClick={close}
              aria-label="Close workflow panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto">
          {/* Compact Flow Graph */}
          {template && (
            <div className="p-3 border-b border-taupe-2 shrink-0 min-h-[120px] flex items-center justify-center bg-off-white overflow-hidden dark:bg-surface-0 dark:border-surface-3">
              <FlowGraph
                nodes={template.nodes}
                edges={template.edges}
                compact
                nodeStatuses={run.nodeStatuses}
              />
            </div>
          )}

          {/* Input Manifest */}
          <div className="px-3 py-2.5 border-b border-taupe-1 dark:border-surface-3">
            <div className="font-mono text-[0.5625rem] text-taupe-3 uppercase tracking-[0.05em] mb-1.5 flex items-center gap-1">
              <span>📄</span>
              <span>Input Files</span>
            </div>
            <div className="font-sans text-xs text-taupe-5">
              {run.inputManifest.map((file) => (
                <div key={file.name} className="flex items-center gap-1.5 py-1">
                  <span className="text-[0.6875rem] text-taupe-3 shrink-0">
                    {file.fileCount ? '📁' : '📄'}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-taupe-5 whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
                  <span className="font-mono text-[0.625rem] text-taupe-3 ml-auto shrink-0">
                    {file.fileCount ? `${file.fileCount} files` : file.size ?? ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Exceptions */}
          {run.exceptions.length > 0 && (
            <div className="px-3 py-2.5 border-b border-taupe-1 dark:border-surface-3">
              <div className="font-mono text-[0.5625rem] text-taupe-3 uppercase tracking-[0.05em] mb-1.5 flex items-center gap-1">
                <span style={{ color: 'var(--amber)' }}>⚠</span>
                <span>Exceptions ({run.exceptions.length})</span>
              </div>
              <div className="font-sans text-xs text-taupe-5">
                {run.exceptions.map((exc, i) => (
                  <div key={`${exc.nodeId}-${i}`} className="flex gap-1.5 py-1.5 border-b border-taupe-1 last:border-b-0 dark:border-surface-3">
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0 mt-[5px]',
                      EXCEPTION_DOT_COLORS[exc.type] ?? 'bg-amber'
                    )} />
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-[0.5625rem] font-semibold uppercase text-taupe-3 tracking-[0.03em]">{exc.type.replace(/-/g, ' ')}</div>
                      <div className="font-sans text-[0.6875rem] text-taupe-4 mt-0.5 leading-[1.4] dark:text-taupe-3">{exc.description}</div>
                      {exc.confidence !== null && (
                        <div className="font-mono text-[0.625rem] text-taupe-3 mt-0.5">
                          Confidence: {exc.confidence}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Output Manifest */}
          {run.outputManifest.length > 0 && (
            <div className="px-3 py-2.5 border-b border-taupe-1 last:border-b-0 dark:border-surface-3">
              <div className="font-mono text-[0.5625rem] text-taupe-3 uppercase tracking-[0.05em] mb-1.5 flex items-center gap-1">
                <span>📦</span>
                <span>Output</span>
              </div>
              <div className="font-sans text-xs text-taupe-5">
                {run.outputManifest.map((file) => (
                  <div key={file.name} className="flex items-center gap-1.5 py-1">
                    <span className="text-[0.6875rem] text-taupe-3 shrink-0">📄</span>
                    <span className="font-mono text-[0.6875rem] text-taupe-5 whitespace-nowrap overflow-hidden text-ellipsis">{file.name}</span>
                    <span className="font-mono text-[0.625rem] text-taupe-3 ml-auto shrink-0">{file.size ?? ''}</span>
                  </div>
                ))}
                {run.outputManifest[0]?.path && (
                  <div className="font-mono text-[0.625rem] text-taupe-3 ml-auto shrink-0 mt-1">
                    {run.outputManifest[0].path}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ============================================
// Helpers
// ============================================

/** Status badge with appropriate color for run status. */
function RunStatusBadge({ status }: { status: WorkflowRun['status'] }) {
  const labels: Record<WorkflowRun['status'], string> = {
    completed: 'Completed',
    running: 'Running',
    waiting: 'Waiting',
    failed: 'Failed',
  };

  return (
    <span className={cn(
      'font-mono text-[0.625rem] font-semibold px-2 py-0.5 rounded-r-sm whitespace-nowrap',
      STATUS_CLASSES[status]
    )}>
      {labels[status]}
    </span>
  );
}
