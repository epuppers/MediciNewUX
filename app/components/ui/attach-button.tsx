import { Paperclip, Monitor, Cloud } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

interface AttachButtonProps {
  onAttach?: (type: 'computer' | 'drive') => void;
  disabled?: boolean;
  className?: string;
}

/** Reusable attach-file dropdown button with computer/cloud drive options */
export function AttachButton({ onAttach, disabled = false, className }: AttachButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn('cmd-btn', disabled && 'disabled', className)}
        disabled={disabled}
        title="Attach file"
        aria-label="Attach file"
      >
        <Paperclip className="h-4 w-4" />
        <span className="a11y-label">Attach</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="attach-dropdown p-0">
        <button
          type="button"
          className="attach-option"
          onClick={() => onAttach?.('computer')}
        >
          <Monitor className="h-4 w-4" />
          From computer
        </button>
        <button
          type="button"
          className="attach-option"
          onClick={() => onAttach?.('drive')}
        >
          <Cloud className="h-4 w-4" />
          From cloud drive
        </button>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
