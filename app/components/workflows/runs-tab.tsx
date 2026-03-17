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
      <EmptyState title="No runs yet" description="Run this workflow to see execution history" className="runs-empty" />
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
      {recentRuns.map((run) => (
        <RunRow key={run.id} run={run} onClick={(threadId) => navigate(`/chat/${threadId}`)} />
      ))}
    </div>
  );
}
