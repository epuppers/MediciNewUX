// ============================================
// RunsTab — Run history table
// ============================================

import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { WorkflowTemplate } from '~/services/types';
import { cn } from '~/lib/utils';

interface RunsTabProps {
  template: WorkflowTemplate;
}

/** Displays run history for a workflow template */
export function RunsTab({ template }: RunsTabProps) {
  const navigate = useNavigate();
  const { runs, recentRuns } = template;

  const handleRowClick = useCallback(
    (threadId: string | null) => {
      if (threadId) {
        navigate(`/chat/${threadId}`);
      }
    },
    [navigate]
  );

  if (recentRuns.length === 0) {
    return (
      <div className="runs-empty">
        <span className="runs-empty-text">No runs yet</span>
        <span className="runs-empty-sub">Run this workflow to see execution history</span>
      </div>
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="runs-summary">
        <span>
          <span className="runs-summary-val">{runs.total || 0}</span> runs
        </span>
        <span className="runs-summary-sep">·</span>
        <span>
          <span className="runs-summary-val text-green">
            {runs.successRate ? `${runs.successRate}%` : '—'}
          </span>{' '}
          success
        </span>
        <span className="runs-summary-sep">·</span>
        <span>
          <span className="runs-summary-val">{runs.avgDuration || '—'}</span> avg
        </span>
      </div>

      {/* Run rows */}
      {recentRuns.map((run) => {
        const dotClass = run.status === 'success' ? 'success' : 'failed';
        const hasThread = !!run.threadId;
        return (
          <div
            key={run.id}
            className={cn('run-row', hasThread && 'run-row-linked')}
            onClick={() => handleRowClick(run.threadId)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && hasThread) handleRowClick(run.threadId);
            }}
            role={hasThread ? 'button' : undefined}
            tabIndex={hasThread ? 0 : undefined}
          >
            <div className={`run-status-dot ${dotClass}`} />
            <span className="run-id">{run.id}</span>
            <span className="run-trigger">{run.trigger}</span>
            <span className="run-time">{run.time}</span>
            <span className="run-duration">{run.duration}</span>
          </div>
        );
      })}
    </div>
  );
}
