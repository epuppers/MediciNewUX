// ============================================
// OverviewTab — Template overview info
// ============================================

import type { WorkflowTemplate } from '~/services/types';
import { KVRow } from '~/components/ui/kv-row';
import { SectionPanel } from '~/components/ui/section-panel';
import { RunRow } from './run-row';

/** Displays template overview with Status, Performance, and Recent Activity sections */
export function OverviewTab({ template }: { template: WorkflowTemplate }) {
  const { runs, recentRuns } = template;
  const lastRun = recentRuns.length > 0 ? recentRuns[0] : null;
  const lastRunTime = lastRun ? lastRun.time : '—';
  const lastRunStatus = lastRun ? lastRun.status : '—';
  const lastRunStatusClass =
    lastRunStatus === 'success' ? 'text-green' : lastRunStatus === 'failed' ? 'text-red' : '';
  const statusLabel = template.status.charAt(0).toUpperCase() + template.status.slice(1);
  const lastRunStatusLabel = lastRunStatus.charAt(0).toUpperCase() + lastRunStatus.slice(1);

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Status section */}
      <SectionPanel title="Status" className="!mb-0">
        <KVRow label="State" value={<>● {statusLabel}</>} valueClassName={`status-${template.status}`} />
        <KVRow label="Last Run" value={lastRunTime} />
        <KVRow label="Last Result" value={lastRunStatusLabel} valueClassName={lastRunStatusClass} />
        <KVRow label="Avg Duration" value={runs.avgDuration || '—'} />
      </SectionPanel>

      {/* Performance section */}
      <SectionPanel title="Performance" className="!mb-0">
        <KVRow label="Total Runs" value={runs.total || 0} />
        <KVRow label="Success Rate" value={runs.successRate ? `${runs.successRate}%` : '—'} valueClassName="text-green" />
        <KVRow label="Files Processed" value={runs.filesProcessed || 0} />
        <KVRow label="Created" value={template.createdDate} />
      </SectionPanel>

      {/* Recent Activity section */}
      {recentRuns.length > 0 && (
        <SectionPanel title="Recent Activity" className="col-span-full !mb-0">
          {recentRuns.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </SectionPanel>
      )}
    </div>
  );
}
