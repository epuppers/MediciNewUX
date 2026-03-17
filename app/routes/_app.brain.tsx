// ============================================
// Brain Layout Route — section header + child outlet
// ============================================

import { Outlet, useLocation } from 'react-router';
import { Button } from '~/components/ui/button';
import { useBrainStore } from '~/stores/brain-store';
import { useUIStore } from '~/stores/ui-store';

const BRAIN_SECTIONS = [
  { label: 'Memory', path: '/brain/memory', action: '+ Add Memory' },
  { label: 'Lessons', path: '/brain/lessons', action: '+ New Lesson' },
  { label: 'Data Graphs', path: '/brain/graph', action: null },
] as const;

/** Brain layout route — renders section header and child content. */
export default function BrainRoute() {
  const location = useLocation();

  const currentSection = BRAIN_SECTIONS.find((s) =>
    location.pathname.startsWith(s.path)
  ) ?? BRAIN_SECTIONS[0];

  return (
    <div className="flex h-full flex-col bg-off-white dark:bg-surface-0">
      {/* Section header */}
      <div className="main-header">
        <span className="header-title">{currentSection.label}</span>
        <div className="header-actions">
          {currentSection.action && (
            <Button
              variant="default"
              size="sm"
              className="header-btn border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 dark:border-taupe-2 font-mono text-[0.625rem] uppercase tracking-[0.05em] text-taupe-3 primary"
              onClick={() => {
                if (currentSection.label === 'Memory') {
                  useBrainStore.getState().toggleAddMemoryForm();
                } else if (currentSection.label === 'Lessons') {
                  useUIStore.getState().openCosimoPanel({ type: 'lesson', text: 'New Lesson' });
                }
              }}
            >
              {currentSection.action}
            </Button>
          )}
        </div>
      </div>

      {/* Child route content */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
