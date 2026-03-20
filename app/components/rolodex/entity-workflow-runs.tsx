// ============================================
// EntityWorkflowRuns — Recent workflow runs for an entity
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CircleCheck, Play, Clock, CircleX } from 'lucide-react';
import type { WorkflowRun, WorkflowTemplate } from '~/services/types';
import { getAllRuns, getTemplates } from '~/services/workflows';
import { cn } from '~/lib/utils';

interface EntityWorkflowRunsProps {
  entityId: string;
  linkedWorkflowIds: string[];
  className?: string;
}

const STATUS_CONFIG: Record<
  WorkflowRun['status'],
  { icon: typeof CircleCheck; colorClass: string; label: string }
> = {
  completed: { icon: CircleCheck, colorClass: 'text-[var(--green)]', label: 'Completed' },
  running: { icon: Play, colorClass: 'text-violet-3', label: 'Running' },
  waiting: { icon: Clock, colorClass: 'text-[var(--amber)]', label: 'Waiting' },
  failed: { icon: CircleX, colorClass: 'text-[var(--red)]', label: 'Failed' },
};

export function EntityWorkflowRuns({ entityId, linkedWorkflowIds, className }: EntityWorkflowRunsProps) {
  const navigate = useNavigate();
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [templateNames, setTemplateNames] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getAllRuns(), getTemplates()]).then(([allRuns, templates]) => {
      if (cancelled) return;

      // Build template name lookup
      const names: Record<string, string> = {};
      for (const t of templates) {
        names[t.id] = t.title;
      }
      setTemplateNames(names);

      // Filter runs matching this entity's linked workflow template IDs
      const linkedSet = new Set(linkedWorkflowIds);
      const matching = Object.values(allRuns).filter(
        (run) => linkedSet.has(run.templateId),
      );

      // Take up to 3 most recent (mock data is already ordered newest-first)
      setRuns(matching.slice(0, 3));
      setLoaded(true);
    });

    return () => { cancelled = true; };
  }, [entityId, linkedWorkflowIds]);

  // Don't render anything if no matching runs
  if (!loaded || runs.length === 0) return null;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <h3 className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-taupe-3">
        Recent Workflows
      </h3>
      <div role="list" className="flex flex-col gap-1">
        {runs.map((run) => {
          const config = STATUS_CONFIG[run.status];
          const StatusIcon = config.icon;
          const isRunning = run.status === 'running';

          return (
            <div
              key={run.threadId}
              role="listitem"
              tabIndex={0}
              className="flex items-center gap-2.5 py-1.5 px-2 rounded-[var(--r-md)] cursor-pointer hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
              onClick={() => navigate(`/workflows/${run.templateId}`)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  navigate(`/workflows/${run.templateId}`);
                }
              }}
            >
              {/* Status icon */}
              <StatusIcon
                className={cn(
                  'size-3.5 shrink-0',
                  config.colorClass,
                  isRunning && 'animate-pulse motion-reduce:animate-none',
                )}
              />

              {/* Template name + time */}
              <div className="min-w-0 flex-1">
                <span className="font-mono text-[0.8125rem] font-semibold text-taupe-5 dark:text-taupe-4 truncate block">
                  {templateNames[run.templateId] ?? run.templateId}
                </span>
                <span className="font-mono text-[0.625rem] text-taupe-2">
                  {run.startTime}
                </span>
              </div>

              {/* Status label */}
              <span
                className={cn(
                  'shrink-0 font-mono text-[0.5625rem] uppercase tracking-[0.05em] font-semibold',
                  config.colorClass,
                )}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
