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
      <div
        className="flex justify-between items-center px-4 py-2.5 border-b-2 border-solid bg-white dark:bg-surface-1 min-h-[44px]"
        style={{ borderImage: 'linear-gradient(90deg, var(--taupe-2), var(--berry-2), var(--violet-2)) 1' }}
      >
        <span className="font-[family-name:var(--pixel)] text-base text-taupe-5 tracking-[0.5px]">{currentSection.label}</span>
        <div className="flex gap-1.5 items-center">
          {currentSection.action && (
            <Button
              variant="default"
              size="sm"
              className="px-2.5 py-1 text-[0.6875rem] font-semibold bg-violet-3 text-white border border-solid border-t-violet-2 border-l-violet-2 border-b-[var(--violet-5,var(--violet-3))] border-r-[var(--violet-5,var(--violet-3))] cursor-pointer rounded-[var(--r-md)] hover:bg-[var(--violet-4,var(--violet-3))] focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:text-[var(--text-light,var(--white))] font-mono text-[0.625rem] uppercase tracking-[0.05em]"
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
