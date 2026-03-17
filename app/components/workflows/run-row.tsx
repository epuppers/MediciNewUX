// ============================================
// RunRow — Single run history row
// ============================================

import { StatusDot } from '~/components/ui/status-dot';
import { cn } from '~/lib/utils';
import type { RecentRun } from '~/services/types';

interface RunRowProps {
  run: RecentRun;
  onClick?: (threadId: string) => void;
  className?: string;
}

export function RunRow({ run, onClick, className }: RunRowProps) {
  const hasThread = !!run.threadId;
  return (
    <div
      className={cn('run-row', hasThread && onClick && 'run-row-linked', className)}
      onClick={() => hasThread && onClick?.(run.threadId!)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && hasThread && onClick) onClick(run.threadId!);
      }}
      role={hasThread && onClick ? 'button' : undefined}
      tabIndex={hasThread && onClick ? 0 : undefined}
    >
      <StatusDot status={run.status === 'success' ? 'success' : 'failed'} className="run-status-dot" />
      <span className="run-id">{run.id}</span>
      <span className="run-trigger">{run.trigger}</span>
      <span className="run-time">{run.time}</span>
      <span className="run-duration">{run.duration}</span>
    </div>
  );
}
