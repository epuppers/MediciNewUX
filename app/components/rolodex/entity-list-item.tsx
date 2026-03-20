// ============================================
// EntityListItem — List row for an entity
// ============================================

import type { Entity, EntitySchema } from '~/services/types';
import { ENTITY_HEALTH_BG, ENTITY_HEALTH_TEXT, INSIGHT_COLORS } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';
import { Bell, AlertTriangle, Sparkles, AlertCircle, Trophy, Link } from 'lucide-react';

/** Insight type → icon component (same pattern as entity-insight-bar.tsx) */
const INSIGHT_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  reminder: Bell,
  alert: AlertTriangle,
  opportunity: Sparkles,
  anomaly: AlertCircle,
  milestone: Trophy,
};

interface EntityListItemProps {
  /** The entity to display */
  entity: Entity;
  /** The entity schema (used to look up type definition and property labels) */
  schema: EntitySchema;
  /** Called when the list item is clicked */
  onClick: (id: string) => void;
  /** Optional additional class names */
  className?: string;
}

/** Formats a property value for display in summary chips */
function formatSummaryValue(value: string | string[] | null, propType?: string): string | null {
  if (value == null) return null;
  if (Array.isArray(value)) return value.join(', ');
  if (propType === 'currency') {
    const num = Number(value);
    if (!isNaN(num)) return '$' + num.toLocaleString();
  }
  if (propType === 'percentage') return value + '%';
  return value;
}

/** A list row for an entity showing icon, name, summary properties, and health. */
export function EntityListItem({ entity, schema, onClick, className }: EntityListItemProps) {
  const typeDef = schema.entityTypes.find((t) => t.id === entity.typeId);

  const handleClick = () => onClick(entity.id);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(entity.id);
    }
  };

  // Gather up to 3 summary property values
  const summaryValues: string[] = [];
  if (typeDef) {
    for (const propId of typeDef.summaryProperties.slice(0, 3)) {
      const propDef = typeDef.properties.find((p) => p.id === propId);
      const formatted = formatSummaryValue(entity.properties[propId], propDef?.type);
      if (formatted) summaryValues.push(formatted);
    }
  }

  // Non-dismissed insights
  const activeInsights = entity.insights.filter((i) => !i.dismissed);
  const insightCount = activeInsights.length;
  const firstInsight = activeInsights[0] ?? null;
  const remainingCount = insightCount - 1;

  // Health label from schema
  const healthLabel =
    entity.health && typeDef?.healthIndicator?.labels
      ? typeDef.healthIndicator.labels[entity.health]
      : null;

  return (
    <div
      data-slot="entity-list-item"
      className={cn(
        'group flex items-center gap-3 px-3.5 py-2.5 bg-[var(--white)] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:border-t-violet-2 hover:border-l-violet-2 hover:border-b-violet-4 hover:border-r-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:bg-surface-1 dark:border-taupe-2 dark:hover:border-violet-2',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Entity type icon circle */}
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-full text-sm',
          `bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.1)]`,
        )}
      >
        {typeDef?.icon ?? '?'}
      </span>

      {/* Name + subtitle + inline insight */}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[0.8125rem] font-semibold text-taupe-5 truncate">{entity.name}</div>
        <div className="font-mono text-[0.6875rem] text-taupe-3 truncate">{entity.subtitle}</div>
        {firstInsight && (() => {
          const InsightIcon = INSIGHT_ICON_COMPONENTS[firstInsight.type];
          return (
            <div className="flex items-center gap-1 mt-0.5 min-w-0">
              {InsightIcon && (
                <InsightIcon className={cn('size-3 shrink-0', INSIGHT_COLORS[firstInsight.type])} />
              )}
              <span className="font-sans text-[0.6875rem] text-taupe-4 dark:text-taupe-3 truncate">
                {firstInsight.text}
              </span>
              {remainingCount > 0 && (
                <span className="font-mono text-[0.5625rem] text-taupe-2 shrink-0">
                  +{remainingCount} more
                </span>
              )}
            </div>
          );
        })()}
      </div>

      {/* Right: summary values · relationship count · health pill · insight badge */}
      <div className="flex items-center gap-2 shrink-0">
        {summaryValues.length > 0 && (
          <span className="hidden font-mono text-[0.6875rem] text-taupe-3 sm:inline">
            {summaryValues.join(' · ')}
          </span>
        )}

        {entity.relationships.length > 0 && (
          <span className="hidden items-center gap-0.5 font-mono text-[0.625rem] text-taupe-2 sm:flex">
            <Link className="size-2.5" />
            {entity.relationships.length}
          </span>
        )}

        {entity.health && healthLabel && (
          <span
            className={cn(
              'font-mono text-[0.5625rem] uppercase tracking-[0.05em] font-semibold px-1.5 py-[1px] rounded-[var(--r-sm)] whitespace-nowrap',
              ENTITY_HEALTH_TEXT[entity.health],
              ENTITY_HEALTH_BG[entity.health],
              entity.health === 'critical' && 'animate-[wf-pulse_2s_ease-in-out_infinite] motion-reduce:animate-none',
            )}
          >
            {healthLabel}
          </span>
        )}

        {insightCount > 0 && (
          <span className="font-mono text-[0.625rem] font-semibold text-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)] px-1.5 py-[1px] rounded-[var(--r-sm)]">
            {insightCount}
          </span>
        )}
      </div>
    </div>
  );
}
