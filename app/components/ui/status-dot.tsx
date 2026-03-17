import { cn } from '~/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-green',
  failed: 'bg-red',
  running: 'bg-violet-3',
  waiting: 'bg-amber',
  muted: 'bg-taupe-3',
};

const SIZE_MAP = {
  sm: 'w-1.5 h-1.5',
  md: 'w-2 h-2',
};

interface StatusDotProps {
  status: 'success' | 'failed' | 'running' | 'waiting' | 'muted';
  pulse?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusDot({ status, pulse, size = 'sm', className }: StatusDotProps) {
  const shouldPulse = pulse ?? status === 'running';
  return (
    <span
      className={cn(
        'inline-block rounded-full',
        SIZE_MAP[size],
        STATUS_COLORS[status],
        shouldPulse && 'animate-[wf-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none',
        className,
      )}
    />
  );
}
