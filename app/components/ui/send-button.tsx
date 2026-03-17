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
        'cmd-btn cmd-primary',
        size === 'sm' && 'h-[28px] w-[28px]',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      title="Send"
      aria-label="Send message"
    >
      <ArrowUp className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
      <span className="a11y-label">Send</span>
    </button>
  );
}
