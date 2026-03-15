// ============================================
// LessonDetail — Full lesson view for Brain > Lessons > {id}
// ============================================

import { useState, useRef } from 'react';
import { Link } from 'react-router';
import { Pencil, MessageSquare, Workflow, Trash2 } from 'lucide-react';
import { useUIStore } from '~/stores/ui-store';
import type { Lesson } from '~/services/types';
import { cn } from '~/lib/utils';

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
}

/** Full lesson detail view with content, linked workflows, and edit capabilities. */
export function LessonDetail({ lesson, onBack }: LessonDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (!isEditing) {
      requestAnimationFrame(() => {
        contentRef.current?.focus();
      });
    }
  };

  const handleEditWithCosimo = () => {
    openCosimoPanel({ type: 'lesson', text: lesson.title });
  };

  const workflowCount = lesson.linkedWorkflows?.length ?? 0;

  // Split content or preview into paragraphs for rendering
  const contentText = lesson.content ?? lesson.preview;
  const paragraphs = contentText.split('\n').filter((p) => p.trim().length > 0);

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="lesson-back-btn inline-flex items-center gap-1 self-start mb-4 focus-visible:outline-2 focus-visible:outline-[var(--violet-3)] rounded-[var(--r-sm)]"
      >
        ← Back to Lessons
      </button>

      {/* Title + scope badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <h2 className="font-[family-name:var(--pixel)] text-sm text-[var(--taupe-5)] dark:text-[var(--taupe-1)] leading-tight">
          {lesson.title}
        </h2>
        <span
          className={cn(
            'brain-scope-badge shrink-0',
            lesson.scope === 'user' ? 'scope-user' : 'scope-company'
          )}
        >
          {lesson.scope === 'user' ? 'Personal' : 'Company'}
        </span>
      </div>

      {/* Meta bar */}
      <div className="lesson-detail-meta">
        <span className="lesson-detail-stat">Referenced {lesson.usage} times</span>
        <span className="lesson-detail-stat">Last used {lesson.lastUsed}</span>
        <span className="lesson-detail-stat">Updated {lesson.updated} by {lesson.author}</span>
      </div>

      {/* Content area */}
      <div
        ref={contentRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        className={cn(
          'flex flex-col gap-5',
          isEditing && 'lesson-detail-body-editing outline-none'
        )}
      >
        {paragraphs.map((paragraph, idx) => (
          <div key={idx} className="lesson-block">
            <p>{paragraph}</p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-5">
        <button
          type="button"
          onClick={handleToggleEdit}
          className={cn(
            'bevel inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-md)] font-[family-name:var(--mono)] text-[11px] font-semibold transition-colors',
            isEditing
              ? 'bg-[var(--violet-3)] text-white border-[var(--violet-2)] hover:bg-[var(--violet-4)]'
              : 'bg-[var(--off-white)] text-[var(--taupe-4)] hover:bg-[var(--violet-1)] hover:text-[var(--violet-3)] dark:bg-[var(--surface-2)] dark:text-[var(--taupe-2)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)]'
          )}
        >
          <Pencil className="size-3.5" />
          {isEditing ? 'Done Editing' : 'Edit'}
        </button>
        <button
          type="button"
          onClick={handleEditWithCosimo}
          className="bevel inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-md)] bg-[var(--off-white)] text-[var(--violet-3)] font-[family-name:var(--mono)] text-[11px] font-semibold hover:bg-[var(--violet-1)] transition-colors dark:bg-[var(--surface-2)] dark:text-[var(--violet-2)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)]"
        >
          <MessageSquare className="size-3.5" />
          Edit with Cosimo
        </button>
        <button
          type="button"
          className="bevel inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-md)] bg-[var(--off-white)] text-[var(--red)] font-[family-name:var(--mono)] text-[11px] font-semibold hover:bg-[rgba(var(--red-rgb),0.08)] transition-colors dark:bg-[var(--surface-2)] dark:hover:bg-[rgba(var(--red-rgb),0.12)] ml-auto"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>

      {/* Linked workflows */}
      {workflowCount > 0 && (
        <section className="mt-5">
          <h3 className="font-[family-name:var(--pixel)] text-xs text-[var(--taupe-3)] uppercase tracking-wider mb-3">
            Linked Workflows
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {lesson.linkedWorkflows!.map((wfId) => (
              <Link
                key={wfId}
                to={`/workflows/${wfId}`}
                className="inline-flex items-center gap-1 rounded-[var(--r-md)] bg-[var(--off-white)] dark:bg-[var(--surface-2)] border border-[var(--taupe-2)] dark:border-[var(--taupe-3)] px-2 py-1 font-[family-name:var(--mono)] text-[10px] font-semibold text-[var(--violet-3)] dark:text-[var(--violet-2)] transition-colors hover:bg-[var(--violet-1)] hover:border-[var(--violet-2)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] focus-visible:outline-2 focus-visible:outline-[var(--violet-3)]"
              >
                <Workflow className="size-3" />
                {wfId}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
