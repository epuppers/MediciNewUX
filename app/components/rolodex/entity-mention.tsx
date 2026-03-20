// ============================================
// EntityMention — Inline entity mention chip
// ============================================

import { useEntityStore } from '~/stores/entity-store';
import { ENTITY_TYPE_COLORS, ENTITY_TYPE_COLOR_RGB } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';

interface EntityMentionProps {
  /** The entity ID to link to */
  entityId: string;
  /** Display name shown in the chip */
  displayName: string;
  /** Entity type ID for color coding */
  typeId: string;
  /** Optional additional class names */
  className?: string;
}

/** Inline mention chip that links to an entity detail panel */
export function EntityMention({ entityId, displayName, typeId, className }: EntityMentionProps) {
  const colorClass = ENTITY_TYPE_COLORS[typeId] ?? 'text-violet-3';
  const colorRgb = ENTITY_TYPE_COLOR_RGB[typeId] ?? 'var(--violet-3-rgb)';

  const handleClick = () => {
    useEntityStore.getState().selectEntity(entityId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <span
      data-slot="entity-mention"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center font-mono text-[0.6875rem] font-semibold',
        'px-1.5 py-0.5 rounded-[var(--r-sm)] cursor-pointer',
        'hover:opacity-80 transition-opacity motion-reduce:transition-none',
        'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
        colorClass,
        `bg-[rgba(${colorRgb},0.06)]`,
        className,
      )}
    >
      {displayName}
    </span>
  );
}
