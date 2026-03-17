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
    { label: 'Active', value: activeCount.toString(), colorClass: 'text-[var(--green)]' },
    { label: 'Total Runs', value: totalRuns.toLocaleString(), colorClass: '' },
    { label: 'Failed', value: failedCount.toString(), colorClass: 'text-[var(--red)]' },
  ];

  return (
    <div className="mb-4 bg-[var(--white)] border-2 border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] dark:border-taupe-2">
      <div className="flex items-center gap-2 px-3 py-2 bg-taupe-5 border-b border-solid border-b-taupe-4 dark:bg-surface-2 dark:border-b-taupe-2">
        <div className="art-stripe" />
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 uppercase tracking-[0.1em] dark:text-taupe-4">Overview</span>
        <div className="art-stripe" />
      </div>
      <div className="flex items-center gap-0 py-2.5">
        {stats.map((stat, i) => (
          <span key={stat.label} className="contents">
            {i > 0 && <span className="w-px h-6 bg-taupe-2 shrink-0 dark:bg-surface-3" />}
            <span className="flex-1 flex items-baseline justify-center gap-2 px-3.5">
              <span className="font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-taupe-3">{stat.label}</span>
              <span className={`font-pixel text-[1.375rem] text-taupe-5 ${stat.colorClass}`}>{stat.value}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
