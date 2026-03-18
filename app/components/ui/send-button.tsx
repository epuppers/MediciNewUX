import { ArrowUp } from 'lucide-react';
import { cn } from '~/lib/utils';

interface SendButtonProps {
  onClick: () => void;
  disabled?: boolean;
  /** Size variant — 'default' for chat input, 'sm' for panels */
  size?: 'default' | 'sm';
  className?: string;
}

/** Reusable send-message button with ArrowUp icon */
export function SendButton({
  onClick,
  disabled = false,
  size = 'default',
  className,
}: SendButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'p-[8px_12px] min-h-9 text-xs font-semibold text-taupe-4 bg-taupe-1 border border-t-white border-l-white border-b-taupe-3 border-r-taupe-3 cursor-pointer flex items-center justify-center rounded-[var(--r-md)] hover:bg-berry-1 active:border-t-taupe-3 active:border-l-taupe-3 active:border-b-white active:border-r-white focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-default disabled:pointer-events-none [&_svg]:block dark:bg-surface-2 dark:text-taupe-3 dark:border-taupe-3 dark:hover:bg-[rgba(var(--violet-3-rgb),0.12)] bg-violet-3 text-white border-t-violet-2 border-l-violet-2 border-b-[var(--violet-5)] border-r-[var(--violet-5)] hover:bg-[var(--violet-4)] dark:text-[var(--text-light)] dark:bg-violet-3 dark:border-t-violet-2 dark:border-l-violet-2 dark:border-b-[var(--violet-5)] dark:border-r-[var(--violet-5)] dark:hover:bg-[var(--violet-4)]',
        size === 'sm' && 'h-[28px] w-[28px]',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      title="Send"
      aria-label="Send message"
    >
      <ArrowUp className={cn(size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4', '[[data-a11y-labels=show]_&]:hidden')} />
      <span className="hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap">Send</span>
    </button>
  );
}
