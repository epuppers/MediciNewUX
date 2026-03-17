// ============================================
// TriggersTab — Workflow trigger configuration
// ============================================

import type { WorkflowTemplate, TriggerType } from '~/services/types';
import { TRIGGER_CONFIG } from '~/lib/workflow-constants';

interface TriggersTabProps {
  template: WorkflowTemplate;
}

interface TriggerEntry {
  type: TriggerType;
  detail: string;
  detailType: 'path' | 'schedule' | 'command' | 'text';
  isPrimary: boolean;
}

/** Extracts all active triggers from a template's triggerConfig */
function extractTriggers(template: WorkflowTemplate): TriggerEntry[] {
  const triggers: TriggerEntry[] = [];
  const { triggerType, triggerConfig } = template;

  // Primary trigger
  if (triggerType === 'folder-watch' && triggerConfig.watchPath) {
    triggers.push({ type: 'folder-watch', detail: triggerConfig.watchPath, detailType: 'path', isPrimary: true });
  } else if (triggerType === 'schedule' && triggerConfig.schedule) {
    triggers.push({ type: 'schedule', detail: triggerConfig.schedule, detailType: 'schedule', isPrimary: true });
  } else if (triggerType === 'email' && triggerConfig.emailAddress) {
    triggers.push({ type: 'email', detail: triggerConfig.emailAddress, detailType: 'text', isPrimary: true });
  } else if (triggerType === 'manual') {
    triggers.push({ type: 'manual', detail: 'Triggered manually via Run button', detailType: 'text', isPrimary: true });
  } else if (triggerType === 'chat-command' && triggerConfig.chatCommand) {
    triggers.push({ type: 'chat-command', detail: triggerConfig.chatCommand, detailType: 'command', isPrimary: true });
  } else if (triggerType === 'chained') {
    triggers.push({ type: 'chained', detail: 'Triggered by another workflow', detailType: 'text', isPrimary: true });
  }

  // Secondary: chat command if present and not already the primary
  if (triggerType !== 'chat-command' && triggerConfig.chatCommand) {
    triggers.push({ type: 'chat-command', detail: triggerConfig.chatCommand, detailType: 'command', isPrimary: false });
  }

  // Secondary: schedule if present and not already the primary
  if (triggerType !== 'schedule' && triggerConfig.schedule) {
    triggers.push({ type: 'schedule', detail: triggerConfig.schedule, detailType: 'schedule', isPrimary: false });
  }

  return triggers;
}

/** Renders trigger detail text with appropriate styling */
function TriggerDetail({ detail, detailType }: { detail: string; detailType: TriggerEntry['detailType'] }) {
  if (detailType === 'command') {
    return <code className="font-mono text-[0.6875rem] text-violet-3 bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.1)] p-[1px_6px] rounded-[var(--r-sm)] border border-[rgba(var(--violet-3-rgb),0.12)] dark:border-[rgba(var(--violet-3-rgb),0.2)]">{detail}</code>;
  }
  if (detailType === 'path') {
    return <span className="font-sans text-[0.6875rem] text-taupe-3">{detail}</span>;
  }
  if (detailType === 'schedule') {
    return <span className="font-sans text-[0.6875rem] text-taupe-3">{detail}</span>;
  }
  return <span className="font-sans text-[0.6875rem] text-taupe-3">{detail}</span>;
}

/** Lists all active triggers for a workflow template */
export function TriggersTab({ template }: TriggersTabProps) {
  const triggers = extractTriggers(template);

  return (
    <div>
      {triggers.length === 0 && (
        <div className="font-sans text-xs text-taupe-3 text-center p-4">No triggers configured</div>
      )}

      {triggers.map((trigger, index) => {
        const TriggerIcon = TRIGGER_CONFIG[trigger.type]?.icon;
        return (
        <div key={`${trigger.type}-${index}`} className="flex items-start gap-2.5 p-2.5 border border-taupe-1 dark:border-taupe-2 rounded-[var(--r-lg)] bg-white dark:bg-surface-1 mb-2 transition-[border-color] duration-150 hover:border-taupe-2 dark:hover:border-taupe-3">
          <div className="shrink-0 w-7 h-7 flex items-center justify-center bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.12)] rounded-[var(--r-md)] text-violet-3">
            {TriggerIcon && <TriggerIcon className="size-3.5" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-4">{TRIGGER_CONFIG[trigger.type]?.label ?? trigger.type}</span>
              {trigger.isPrimary && (
                <span className="font-mono text-[0.5625rem] font-semibold uppercase tracking-[0.5px] p-[1px_5px] rounded-[var(--r-sm)] bg-[rgba(var(--violet-3-rgb),0.1)] dark:bg-[rgba(var(--violet-3-rgb),0.15)] text-violet-3">Primary</span>
              )}
            </div>
            <div className="mt-[3px]">
              <TriggerDetail detail={trigger.detail} detailType={trigger.detailType} />
            </div>
          </div>
        </div>
        );
      })}

      <button type="button" className="flex items-center justify-center gap-1.5 py-2 px-2.5 border border-dashed border-taupe-3 bg-transparent font-mono text-[0.6875rem] text-taupe-3 cursor-pointer mt-1.5 w-full transition-all duration-150 rounded-r-md hover:border-violet-3 hover:text-violet-3 hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)]">+ Add Trigger</button>
    </div>
  );
}
