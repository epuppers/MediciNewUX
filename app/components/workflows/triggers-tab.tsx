// ============================================
// TriggersTab — Workflow trigger configuration
// ============================================

import {
  FolderOpen,
  Terminal,
  Clock,
  Mail,
  MousePointerClick,
  Link2,
} from 'lucide-react';
import type { WorkflowTemplate, TriggerType } from '~/services/types';

interface TriggersTabProps {
  template: WorkflowTemplate;
}

/** Icon component for a given trigger type */
function triggerIcon(type: TriggerType) {
  const icons: Record<TriggerType, React.ReactNode> = {
    'folder-watch': <FolderOpen className="size-3.5" />,
    'chat-command': <Terminal className="size-3.5" />,
    schedule: <Clock className="size-3.5" />,
    email: <Mail className="size-3.5" />,
    manual: <MousePointerClick className="size-3.5" />,
    chained: <Link2 className="size-3.5" />,
  };
  return icons[type] ?? null;
}

/** Human-readable label for a trigger type */
function triggerLabel(type: TriggerType): string {
  const labels: Record<TriggerType, string> = {
    'folder-watch': 'Folder Watch',
    'chat-command': 'Chat Command',
    schedule: 'Schedule',
    email: 'Email',
    manual: 'Manual',
    chained: 'Chained',
  };
  return labels[type] ?? type;
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
    return <code className="trigger-detail-command">{detail}</code>;
  }
  if (detailType === 'path') {
    return <span className="trigger-detail-path">{detail}</span>;
  }
  if (detailType === 'schedule') {
    return <span className="trigger-detail-schedule">{detail}</span>;
  }
  return <span className="trigger-detail-text">{detail}</span>;
}

/** Lists all active triggers for a workflow template */
export function TriggersTab({ template }: TriggersTabProps) {
  const triggers = extractTriggers(template);

  return (
    <div>
      {triggers.length === 0 && (
        <div className="trigger-empty">No triggers configured</div>
      )}

      {triggers.map((trigger, index) => (
        <div key={`${trigger.type}-${index}`} className="trigger-item">
          <div className="trigger-item-icon">
            {triggerIcon(trigger.type)}
          </div>
          <div className="trigger-item-body">
            <div className="trigger-item-header">
              <span className="trigger-item-type">{triggerLabel(trigger.type)}</span>
              {trigger.isPrimary && (
                <span className="trigger-item-badge trigger-primary">Primary</span>
              )}
            </div>
            <div className="trigger-item-detail">
              <TriggerDetail detail={trigger.detail} detailType={trigger.detailType} />
            </div>
          </div>
        </div>
      ))}

      <button type="button" className="add-source-btn">+ Add Trigger</button>
    </div>
  );
}
