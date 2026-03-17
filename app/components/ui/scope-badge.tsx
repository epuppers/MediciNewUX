// ============================================
// ScopeBadge — Displays "Personal" or "Company" scope indicator
// ============================================

import { SCOPE_CONFIG } from '~/lib/brain-constants';
import { cn } from '~/lib/utils';

interface ScopeBadgeProps {
  scope: 'user' | 'company';
  className?: string;
}

export function ScopeBadge({ scope, className }: ScopeBadgeProps) {
  const config = SCOPE_CONFIG[scope];
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}
