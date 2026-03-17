import { cn } from '~/lib/utils';

interface KVRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
}

export function KVRow({ label, value, valueClassName, className }: KVRowProps) {
  return (
    <div className={cn('flex justify-between py-1.5 border-b border-taupe-1 last:border-b-0', className)}>
      <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.08em]">{label}</span>
      <span className={cn('font-mono text-xs font-semibold text-taupe-5', valueClassName)}>{value}</span>
    </div>
  );
}
