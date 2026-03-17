import { cn } from '~/lib/utils';

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}

export function FilterPill({ label, isActive, onClick, className }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'font-mono text-[0.6875rem] font-semibold px-[10px] py-[3px] border border-taupe-2 rounded-[var(--r-md)] bg-off-white text-taupe-3 cursor-pointer transition-all duration-100 tracking-[0.03em]',
        'dark:bg-surface-2 dark:border-taupe-3 dark:text-taupe-3',
        !isActive && 'hover:border-violet-2 hover:text-violet-3 dark:hover:border-violet-2 dark:hover:text-violet-2',
        isActive && 'bg-violet-3 text-white border-violet-2 border-b-violet-4 border-r-violet-4 dark:bg-violet-3 dark:border-violet-2 dark:text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-3',
        className
      )}
    >
      {label}
    </button>
  );
}
