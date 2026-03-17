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
      className={cn(
        'flex items-center gap-3 py-2.5 px-3 bg-white dark:bg-surface-1 border border-taupe-2 rounded-r-md mb-1 transition-colors duration-150 hover:border-violet-2',
        hasThread && onClick && 'cursor-pointer hover:border-violet-3 hover:bg-[rgba(var(--violet-3-rgb),0.03)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)] active:bg-[rgba(var(--violet-3-rgb),0.06)] dark:active:bg-[rgba(var(--violet-3-rgb),0.12)] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-1',
        className,
      )}
      onClick={() => hasThread && onClick?.(run.threadId!)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && hasThread && onClick) onClick(run.threadId!);
      }}
      role={hasThread && onClick ? 'button' : undefined}
      tabIndex={hasThread && onClick ? 0 : undefined}
    >
      <StatusDot status={run.status === 'success' ? 'success' : 'failed'} className="w-2.5 h-2.5 border rounded-r-md shrink-0" />
      <span className="font-mono text-xs font-semibold text-taupe-5 dark:text-taupe-4 min-w-[80px]">{run.id}</span>
      <span className="font-mono text-[0.6875rem] text-taupe-3 flex-1">{run.trigger}</span>
      <span className="font-mono text-[0.6875rem] text-taupe-3">{run.time}</span>
      <span className="font-mono text-[0.6875rem] text-taupe-4 min-w-[60px] text-right">{run.duration}</span>
    </div>
  );
}
