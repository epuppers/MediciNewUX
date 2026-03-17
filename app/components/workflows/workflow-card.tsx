// ============================================
// WorkflowCard — Library card for a workflow template
// ============================================

import type { WorkflowTemplate } from '~/services/types';
import { TriggerChip } from './trigger-chip';

/** Map of template status to CSS class */
const STATUS_CLASS: Record<WorkflowTemplate['status'], string> = {
  active: 'status-active',
  draft: 'status-draft',
  paused: 'status-paused',
  archived: 'status-archived',
};

interface WorkflowCardProps {
  /** The workflow template to display */
  template: WorkflowTemplate;
  /** Map of lesson IDs to lesson titles for displaying linked lesson chips */
  lessonNames?: Record<string, string>;
  /** Called when the card is clicked to view template detail */
  onSelect: (id: string) => void;
  /** Called when the Run button is clicked */
  onRun: (id: string) => void;
}

/** A library card for a workflow template, showing status, trigger, description, and run stats. */
export function WorkflowCard({ template, lessonNames, onSelect, onRun }: WorkflowCardProps) {
  const handleCardClick = () => {
    onSelect(template.id);
  };

  const handleRunClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRun(template.id);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(template.id);
    }
  };

  // Determine last run status for the dot indicator
  const lastRun = template.recentRuns[0];
  let runDotClass = 'muted';
  let runLabel = 'No runs';
  if (lastRun) {
    runDotClass = lastRun.status === 'success' ? 'green' : lastRun.status === 'failed' ? 'red' : 'muted';
    runLabel = `${template.runs.total} runs · ${lastRun.time}`;
  }

  return (
    <div
      className="wf-card"
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Header: title + status + trigger + run btn */}
      <div className="wf-card-header">
        <div className="wf-card-header-left">
          <span className="wf-card-title">{template.title}</span>
          <span className={`wf-card-status font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3 ${STATUS_CLASS[template.status]}`}>
            {template.status}
          </span>
          <TriggerChip type={template.triggerType} className="wf-card-trigger-chip" />
        </div>
        <button
          className="wf-card-run-btn"
          onClick={handleRunClick}
          aria-label={`Run ${template.title}`}
        >
          ▶ Run
        </button>
      </div>

      {/* Body: description */}
      <div className="wf-card-body">
        <span className="wf-card-desc">{template.description}</span>
      </div>

      {/* Footer: lesson chip + run status */}
      <div className="wf-card-footer">
        {template.linkedLessons.length > 0 && (
          <span className="wf-card-lesson-chip" title={lessonNames?.[template.linkedLessons[0]] ?? template.linkedLessons[0]}>
            ◆ {lessonNames?.[template.linkedLessons[0]] ?? template.linkedLessons[0]}
          </span>
        )}
        <span className="wf-card-run-status">
          <span className={`wf-run-dot ${runDotClass}`} />
          {runLabel}
        </span>
      </div>
    </div>
  );
}
