// ============================================
// LinkedTab — Cross-linked items (threads, workflows, lessons, tasks)
// ============================================

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MessageSquare, GitBranch, BookOpen, CheckSquare } from 'lucide-react';
import type { Entity } from '~/services/types';
import { useEntityStore } from '~/stores/entity-store';
import { getThreads } from '~/services/threads';
import { getTemplates } from '~/services/workflows';
import { getLessons } from '~/services/brain';
import { EmptyState } from '~/components/ui/empty-state';
import { cn } from '~/lib/utils';

interface LinkedTabProps {
  /** The entity whose linked items to display */
  entity: Entity;
  /** Optional additional class names */
  className?: string;
}

interface LinkedSection {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  ids: string[];
  getPath: (id: string) => string | null;
}

interface ResolvedName {
  title: string;
  subtitle?: string;
}

/** LinkedTab — displays chat threads, workflows, lessons, and tasks linked to an entity */
export function LinkedTab({ entity, className }: LinkedTabProps) {
  const navigate = useNavigate();
  const selectEntity = useEntityStore((s) => s.selectEntity);
  const [loading, setLoading] = useState(true);
  const [names, setNames] = useState<Record<string, ResolvedName>>({});

  useEffect(() => {
    let cancelled = false;

    async function resolveNames() {
      try {
        const [threads, templates, lessons] = await Promise.all([
          getThreads(),
          getTemplates(),
          getLessons(),
        ]);

        if (cancelled) return;

        const map: Record<string, ResolvedName> = {};

        for (const thread of threads) {
          map[thread.id] = {
            title: thread.title,
            subtitle: thread.timestamp,
          };
        }

        for (const template of templates) {
          map[template.id] = {
            title: template.title,
            subtitle: template.description.length > 80
              ? template.description.slice(0, 80) + '…'
              : template.description,
          };
        }

        for (const lesson of lessons) {
          map[lesson.id] = { title: lesson.title };
        }

        setNames(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    resolveNames();
    return () => { cancelled = true; };
  }, []);

  const sections: LinkedSection[] = [
    {
      key: 'threads',
      label: 'Chat Threads',
      icon: MessageSquare,
      ids: entity.linkedThreadIds,
      getPath: (id) => `/chat/${id}`,
    },
    {
      key: 'workflows',
      label: 'Workflows',
      icon: GitBranch,
      ids: entity.linkedWorkflowIds,
      getPath: (id) => `/workflows/${id}`,
    },
    {
      key: 'lessons',
      label: 'Lessons',
      icon: BookOpen,
      ids: entity.linkedLessonIds,
      getPath: (id) => `/brain/lessons/${id}`,
    },
    {
      key: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      ids: entity.linkedKanbanCardIds,
      getPath: () => null,
    },
  ];

  const nonEmptySections = sections.filter((s) => s.ids.length > 0);

  if (nonEmptySections.length === 0) {
    return (
      <EmptyState
        title="No linked items"
        description="Cosimo automatically links related conversations, workflows, and knowledge as you work. They'll appear here."
      />
    );
  }

  if (loading) {
    return (
      <div className={cn('flex flex-col gap-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2.5 py-2 px-2">
            <div className="flex-1 h-3 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    );
  }

  const handleItemClick = (section: LinkedSection, id: string) => {
    const path = section.getPath(id);
    if (path) {
      selectEntity(null);
      navigate(path);
    } else {
      console.log(`Navigate to task: ${id}`);
    }
  };

  const getDisplayName = (sectionKey: string, id: string): ResolvedName => {
    if (names[id]) return names[id];
    if (sectionKey === 'tasks') return { title: `Task: ${id}` };
    return { title: id };
  };

  return (
    <div data-slot="linked-tab" className={cn('flex flex-col', className)}>
      {nonEmptySections.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.key}>
            {/* Section header */}
            <div className="flex items-center justify-between py-2 border-b border-taupe-1 dark:border-taupe-2">
              <div className="flex items-center gap-1.5">
                <SectionIcon className="size-3 text-taupe-3" />
                <span className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.12em] text-taupe-3">
                  {section.label}
                </span>
              </div>
              <span className="font-mono text-[0.625rem] text-taupe-2">
                {section.ids.length}
              </span>
            </div>

            {/* Item rows */}
            {section.ids.map((id) => {
              const display = getDisplayName(section.key, id);
              return (
                <div
                  key={id}
                  role="button"
                  tabIndex={0}
                  className="flex items-center justify-between gap-2 py-2 px-2 rounded-[var(--r-md)] hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)] cursor-pointer transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                  onClick={() => handleItemClick(section, id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleItemClick(section, id);
                    }
                  }}
                >
                  <span className="text-taupe-5 font-mono text-[0.8125rem] hover:underline truncate">
                    {display.title}
                  </span>
                  {display.subtitle && (
                    <span className="font-mono text-[0.625rem] text-taupe-2 truncate shrink-0 max-w-[45%] text-right">
                      {display.subtitle}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
