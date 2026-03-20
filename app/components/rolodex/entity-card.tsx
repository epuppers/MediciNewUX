// ============================================
// EntityCard — Grid card for an entity
// ============================================

import type { Entity, EntitySchema } from '~/services/types';
import { ENTITY_HEALTH_COLORS, ENTITY_HEALTH_TEXT, ENTITY_HEALTH_BG, INSIGHT_COLORS } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';
import { Bell, AlertTriangle, Sparkles, AlertCircle, Trophy } from 'lucide-react';

/** Insight type → icon component (same pattern as entity-list-item.tsx) */
const INSIGHT_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  reminder: Bell,
  alert: AlertTriangle,
  opportunity: Sparkles,
  anomaly: AlertCircle,
  milestone: Trophy,
};

interface EntityCardProps {
  /** The entity to display */
  entity: Entity;
  /** The entity schema (used to look up type definition and property labels) */
  schema: EntitySchema;
  /** Called when the card is clicked */
  onClick: (id: string) => void;
  /** All entities (used to resolve relationship target types for avatar circles) */
  allEntities?: Entity[];
  /** Optional additional class names */
  className?: string;
}

/** Formats a property value for card display */
function formatCardValue(value: string | string[] | null, propType?: string): string {
  if (value == null) return '—';
  if (Array.isArray(value)) return value.join(', ');
  if (propType === 'currency') {
    const num = Number(value);
    if (!isNaN(num)) return '$' + num.toLocaleString();
  }
  if (propType === 'percentage') return value + '%';
  return value;
}

/** A grid card for an entity showing icon, name, health, summary properties, and type. */
export function EntityCard({ entity, schema, onClick, allEntities, className }: EntityCardProps) {
  const typeDef = schema.entityTypes.find((t) => t.id === entity.typeId);

  const handleClick = () => onClick(entity.id);
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick(entity.id);
    }
  };

  // Health label from schema
  const healthLabels = typeDef?.healthIndicator?.labels;
  const healthLabel =
    entity.health && healthLabels
      ? healthLabels[entity.health]
      : entity.health;

  // Non-dismissed insights
  const activeInsights = entity.insights.filter((i) => !i.dismissed);

  return (
    <div
      data-slot="entity-card"
      className={cn(
        'group flex flex-col bg-[var(--white)] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 rounded-[var(--r-md)] cursor-pointer transition-colors duration-150 motion-reduce:transition-none hover:border-t-violet-2 hover:border-l-violet-2 hover:border-b-violet-4 hover:border-r-violet-4 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:bg-surface-1 dark:border-taupe-2 dark:hover:border-violet-2',
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      {/* Header: icon + name + health badge */}
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-taupe-1 dark:border-taupe-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-full text-sm',
            `bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.1)]`,
          )}
        >
          {typeDef?.icon ?? '?'}
        </span>
        <span className="font-mono text-[0.8125rem] font-semibold text-taupe-5 truncate flex-1 min-w-0">
          {entity.name}
        </span>
        {entity.health && healthLabel && (
          <span
            className={cn(
              'font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] px-2 py-[3px] border rounded-[var(--r-sm)] whitespace-nowrap',
              ENTITY_HEALTH_TEXT[entity.health],
              ENTITY_HEALTH_BG[entity.health],
              `border-current`,
            )}
          >
            {healthLabel}
          </span>
        )}
      </div>

      {/* Body: summary + summary properties */}
      <div className="flex-1 px-3.5 py-2.5">
        <div className="font-sans text-[0.6875rem] text-taupe-3 line-clamp-2 mb-2">
          {entity.aiSummary || entity.subtitle}
        </div>
        {typeDef && (
          <div className="flex flex-col gap-1">
            {typeDef.summaryProperties.map((propId) => {
              const propDef = typeDef.properties.find((p) => p.id === propId);
              if (!propDef) return null;
              return (
                <div key={propId} className="flex justify-between">
                  <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.08em]">
                    {propDef.label}
                  </span>
                  <span className="font-mono text-[0.6875rem] font-semibold text-taupe-5">
                    {formatCardValue(entity.properties[propId], propDef.type)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insight preview */}
      {activeInsights.length > 0 && (
        <div className="border-t border-taupe-1 dark:border-taupe-2 px-3.5 py-2 flex flex-col gap-1">
          {activeInsights.slice(0, 2).map((insight) => {
            const InsightIcon = INSIGHT_ICON_COMPONENTS[insight.type];
            return (
              <div key={insight.id} className="flex items-center gap-1 min-w-0">
                {InsightIcon && (
                  <InsightIcon className={cn('size-3 shrink-0', INSIGHT_COLORS[insight.type])} />
                )}
                <span className="font-sans text-[0.6875rem] text-taupe-4 dark:text-taupe-3 truncate">
                  {insight.text}
                </span>
              </div>
            );
          })}
          {activeInsights.length > 2 && (
            <span className="font-mono text-[0.5625rem] text-taupe-2">
              +{activeInsights.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Footer: entity type pill + relationship avatars + insight badge */}
      <div className="flex items-center justify-between px-3.5 pt-1.5 pb-2 border-t border-taupe-1 dark:border-taupe-2">
        <span
          className={cn(
            'font-mono text-[0.625rem] font-semibold px-2 py-[2px] rounded-[var(--r-sm)]',
            `text-${typeDef?.color ?? 'taupe-3'}`,
            `bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.08)]`,
            `dark:bg-[rgba(${typeDef?.colorRgb ?? 'var(--taupe-3-rgb)'},0.12)]`,
          )}
        >
          {typeDef?.label ?? entity.typeId}
        </span>
        {/* Relationship avatars */}
        {allEntities && entity.relationships.length > 0 && (() => {
          const visibleRels = entity.relationships.slice(0, 3);
          const overflowCount = entity.relationships.length - 3;
          return (
            <div className="flex items-center">
              {visibleRels.map((rel, i) => {
                const target = allEntities.find((e) => e.id === rel.targetEntityId);
                const targetType = target
                  ? schema.entityTypes.find((t) => t.id === target.typeId)
                  : null;
                return (
                  <span
                    key={rel.targetEntityId}
                    className={cn(
                      'flex size-4 items-center justify-center rounded-full text-[0.5rem] border border-[var(--white)] dark:border-surface-1',
                      `bg-[rgba(${targetType?.colorRgb ?? 'var(--taupe-3-rgb)'},0.15)]`,
                      i > 0 && '-ml-1',
                    )}
                  >
                    {targetType?.icon ?? '?'}
                  </span>
                );
              })}
              {overflowCount > 0 && (
                <span className="font-mono text-[0.5625rem] text-taupe-2 ml-1">
                  +{overflowCount}
                </span>
              )}
            </div>
          );
        })()}

        {activeInsights.length > 0 && (
          <span className="font-mono text-[0.625rem] font-semibold text-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)] px-1.5 py-[1px] rounded-[var(--r-sm)]">
            {activeInsights.length}
          </span>
        )}
      </div>
    </div>
  );
}
