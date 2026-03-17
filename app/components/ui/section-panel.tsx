// ============================================
// SectionPanel — Reusable detail-section wrapper with 3D border
// ============================================

import { cn } from '~/lib/utils';

interface SectionPanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Wraps content in a detail-section container with art-stripe header bar */
export function SectionPanel({ title, children, className }: SectionPanelProps) {
  return (
    <div className={cn('bg-white border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 mb-3 rounded-md dark:bg-surface-1 dark:border-taupe-2', className)}>
      <div className="flex items-center gap-2 px-3 py-2 bg-taupe-5 border-b border-taupe-4 dark:bg-surface-2 dark:border-taupe-2">
        <div className="art-stripe" />
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 uppercase tracking-[0.1em] dark:text-taupe-4">{title}</span>
        <div className="art-stripe" />
      </div>
      <div className="p-[14px] dark:bg-surface-1">
        {children}
      </div>
    </div>
  );
}
