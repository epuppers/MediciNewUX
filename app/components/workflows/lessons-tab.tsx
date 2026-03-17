// ============================================
// LessonsTab — Linked lessons list
// ============================================

import { useEffect, useState } from 'react';
import { getLessons } from '~/services/brain';
import type { WorkflowTemplate, Lesson } from '~/services/types';
import { cn } from '~/lib/utils';

const ADD_BTN = 'flex items-center justify-center gap-1.5 py-2 px-2.5 border border-dashed border-taupe-3 bg-transparent font-mono text-[0.6875rem] text-taupe-3 cursor-pointer mt-1.5 w-full transition-all duration-150 rounded-r-md hover:border-violet-3 hover:text-violet-3 hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)]';

const SCOPE_COLORS: Record<string, string> = {
  company: 'text-blue-3 bg-[rgba(var(--blue-3-rgb),0.08)] dark:bg-[rgba(var(--blue-3-rgb),0.12)] border border-[rgba(var(--blue-3-rgb),0.15)] dark:border-[rgba(var(--blue-3-rgb),0.2)]',
  user: 'text-violet-3 bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.12)] border border-[rgba(var(--violet-3-rgb),0.15)] dark:border-[rgba(var(--violet-3-rgb),0.2)]',
};

interface LessonsTabProps {
  template: WorkflowTemplate;
}

/** Finds which nodes in the template reference a given lesson ID */
function nodesReferencingLesson(template: WorkflowTemplate, lessonId: string): string[] {
  return template.nodes
    .filter((n) => n.lesson === lessonId)
    .map((n) => n.title);
}

/** Displays lessons linked to a workflow template */
export function LessonsTab({ template }: LessonsTabProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    let cancelled = false;
    getLessons().then((allLessons) => {
      if (!cancelled) {
        const linked = allLessons.filter((l) =>
          template.linkedLessons.includes(l.id)
        );
        setLessons(linked);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [template.linkedLessons]);

  if (lessons.length === 0 && template.linkedLessons.length === 0) {
    return (
      <div>
        <div className="flex flex-col items-center py-8 px-4 text-center">
          <span className="font-mono text-xs font-semibold text-taupe-3 mb-1">No linked lessons</span>
          <span className="font-sans text-[0.6875rem] text-taupe-2 dark:text-taupe-3">Link lessons to help Cosimo follow your domain rules</span>
        </div>
        <button type="button" className={ADD_BTN}>+ Link Lesson</button>
      </div>
    );
  }

  return (
    <div>
      {lessons.map((lesson) => {
        const referencingNodes = nodesReferencingLesson(template, lesson.id);

        return (
          <div key={lesson.id} className="border border-taupe-1 rounded-r-lg p-3 mb-2 bg-white dark:bg-surface-1 transition-colors duration-150 hover:border-violet-2">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-violet-3 text-[0.5625rem] shrink-0">◆</span>
              <span className="font-mono text-xs font-semibold text-taupe-5 dark:text-taupe-4 flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{lesson.title}</span>
              <span className={cn(
                'font-mono text-[0.5625rem] uppercase tracking-[0.5px] py-px px-1.5 rounded-r-sm shrink-0',
                SCOPE_COLORS[lesson.scope],
              )}>
                {lesson.scope}
              </span>
            </div>

            {referencingNodes.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 mb-1.5">
                <span className="font-sans text-[0.625rem] text-taupe-3">Used by:</span>
                {referencingNodes.map((name) => (
                  <span key={name} className="font-mono text-[0.625rem] text-violet-3 bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.1)] border border-[rgba(var(--violet-3-rgb),0.12)] dark:border-[rgba(var(--violet-3-rgb),0.18)] rounded-r-sm py-px px-1.5">{name}</span>
                ))}
              </div>
            )}

            <div className="font-sans text-[0.6875rem] text-taupe-3 leading-[1.4] mb-2 line-clamp-2">{lesson.preview}</div>

            <div className="flex items-center gap-1">
              <span className="font-mono text-[0.625rem] text-taupe-2 dark:text-taupe-3">{lesson.author}</span>
              <span className="text-[0.625rem] text-taupe-2 dark:text-taupe-3">·</span>
              <span className="font-mono text-[0.625rem] text-taupe-2 dark:text-taupe-3">Updated {lesson.updated}</span>
            </div>
          </div>
        );
      })}

      <button type="button" className={ADD_BTN}>+ Link Lesson</button>
    </div>
  );
}
