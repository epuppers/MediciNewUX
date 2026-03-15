// ============================================
// WorkflowStats — Stats bar above the workflow library grid
// ============================================

import type { WorkflowTemplate } from '~/services/types';

interface WorkflowStatsProps {
  /** All workflow templates to compute stats from */
  templates: WorkflowTemplate[];
}

/** Stats bar showing Total Templates, Active count, Total Runs, and Failed count. */
export function WorkflowStats({ templates }: WorkflowStatsProps) {
  const totalTemplates = templates.length;
  const activeCount = templates.filter((t) => t.status === 'active').length;
  const totalRuns = templates.reduce((sum, t) => sum + t.runs.total, 0);

  // Count failed runs from recentRuns arrays
  const failedCount = templates.reduce(
    (sum, t) => sum + t.recentRuns.filter((r) => r.status === 'failed').length,
    0
  );

  const stats = [
    { label: 'Total', value: totalTemplates.toString(), colorClass: '' },
    { label: 'Active', value: activeCount.toString(), colorClass: 'green' },
    { label: 'Total Runs', value: totalRuns.toLocaleString(), colorClass: '' },
    { label: 'Failed', value: failedCount.toString(), colorClass: 'red' },
  ];

  return (
    <div className="wf-stats-section bevel">
      <div className="wf-stats-section-bar">
        <div className="art-stripe" />
        <span className="detail-section-title">Overview</span>
        <div className="art-stripe" />
      </div>
      <div className="wf-stats-body">
        {stats.map((stat, i) => (
          <span key={stat.label} className="contents">
            {i > 0 && <span className="wf-stats-sep" />}
            <span className="wf-stat-inline">
              <span className="wf-stat-inline-label">{stat.label}</span>
              <span className={`wf-stat-inline-val ${stat.colorClass}`}>{stat.value}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
