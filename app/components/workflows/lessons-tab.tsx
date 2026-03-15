// ============================================
// LessonsTab — Linked lessons list
// ============================================

import { useEffect, useState } from 'react';
import { getLessons } from '~/services/brain';
import type { WorkflowTemplate, Lesson } from '~/services/types';

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
        <div className="lessons-tab-empty">
          <span className="lessons-tab-empty-text">No linked lessons</span>
          <span className="lessons-tab-empty-sub">Link lessons to help Cosimo follow your domain rules</span>
        </div>
        <button type="button" className="add-source-btn">+ Link Lesson</button>
      </div>
    );
  }

  return (
    <div>
      {lessons.map((lesson) => {
        const referencingNodes = nodesReferencingLesson(template, lesson.id);

        return (
          <div key={lesson.id} className="lesson-tab-card">
            <div className="lesson-tab-card-header">
              <span className="lesson-tab-card-diamond">◆</span>
              <span className="lesson-tab-card-title">{lesson.title}</span>
              <span className={`lesson-tab-card-scope lesson-scope-${lesson.scope}`}>
                {lesson.scope}
              </span>
            </div>

            {referencingNodes.length > 0 && (
              <div className="lesson-tab-card-nodes">
                <span className="lesson-tab-card-nodes-label">Used by:</span>
                {referencingNodes.map((name) => (
                  <span key={name} className="lesson-tab-card-node-chip">{name}</span>
                ))}
              </div>
            )}

            <div className="lesson-tab-card-preview">{lesson.preview}</div>

            <div className="lesson-tab-card-meta">
              <span className="lesson-tab-card-author">{lesson.author}</span>
              <span className="lesson-tab-card-sep">·</span>
              <span className="lesson-tab-card-date">Updated {lesson.updated}</span>
            </div>
          </div>
        );
      })}

      <button type="button" className="add-source-btn">+ Link Lesson</button>
    </div>
  );
}
