// ============================================
// TriggerChip — Renders a trigger type icon + label
// ============================================

import type { TriggerType } from '~/services/types';
import { TRIGGER_CONFIG } from '~/lib/workflow-constants';
import { cn } from '~/lib/utils';

interface TriggerChipProps {
  type: TriggerType;
  size?: 'sm' | 'md';
  className?: string;
}

export function TriggerChip({ type, size = 'sm', className }: TriggerChipProps) {
  const config = TRIGGER_CONFIG[type];
  if (!config) return null;
  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'size-3' : 'size-3.5';
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  );
}
