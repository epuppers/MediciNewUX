// ============================================
// RunsTab — Run history table
// ============================================

import { useNavigate } from 'react-router';
import type { WorkflowTemplate } from '~/services/types';
import { EmptyState } from '~/components/ui/empty-state';
import { RunRow } from './run-row';

interface RunsTabProps {
  template: WorkflowTemplate;
}

/** Displays run history for a workflow template */
export function RunsTab({ template }: RunsTabProps) {
  const navigate = useNavigate();
  const { runs, recentRuns } = template;

  if (recentRuns.length === 0) {
    return (
      <EmptyState title="No runs yet" description="Run this workflow to see execution history" className="flex flex-col items-center gap-1 py-8 px-4 text-center" />
    );
  }

  return (
    <div>
      {/* Summary bar */}
      <div className="flex items-center gap-2 py-2 px-3 mb-2 bg-[rgba(var(--violet-3-rgb),0.04)] dark:bg-[rgba(var(--violet-3-rgb),0.08)] border border-taupe-2 rounded-r-md font-mono text-[0.6875rem] text-taupe-3">
        <span>
          <span className="font-semibold text-taupe-5 dark:text-taupe-4">{runs.total || 0}</span> runs
        </span>
        <span className="text-taupe-2">·</span>
        <span>
          <span className="font-semibold text-taupe-5 dark:text-taupe-4 text-green">
            {runs.successRate ? `${runs.successRate}%` : '—'}
          </span>{' '}
          success
        </span>
        <span className="text-taupe-2">·</span>
        <span>
          <span className="font-semibold text-taupe-5 dark:text-taupe-4">{runs.avgDuration || '—'}</span> avg
        </span>
      </div>

      {/* Run rows */}
      {recentRuns.map((run) => (
        <RunRow key={run.id} run={run} onClick={(threadId) => navigate(`/chat/${threadId}`)} />
      ))}
    </div>
  );
}
