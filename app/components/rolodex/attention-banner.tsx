// ============================================
// AttentionBanner — Morning briefing summary for Rolodex
// ============================================

import { useMemo, useState } from 'react';
import { Bell, AlertTriangle, Sparkles, AlertCircle, Trophy, ChevronUp, ChevronDown } from 'lucide-react';
import type { Entity, EntitySchema, EntityInsight } from '~/services/types';
import { ENTITY_HEALTH_COLORS, ENTITY_HEALTH_TEXT, INSIGHT_COLORS } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';

interface AttentionBannerProps {
  /** All entities (unfiltered) */
  entities: Entity[];
  /** The entity schema */
  schema: EntitySchema;
  /** Called when an entity name is clicked */
  onEntityClick: (entityId: string) => void;
  /** Optional additional class names */
  className?: string;
}

/** Map insight type to its Lucide icon component */
const INSIGHT_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  reminder: Bell,
  alert: AlertTriangle,
  opportunity: Sparkles,
  anomaly: AlertCircle,
  milestone: Trophy,
};

interface HealthAlert {
  entityId: string;
  entityName: string;
  health: string;
  label: string;
  typeIcon: string;
}

interface InsightWithEntity {
  insight: EntityInsight;
  entityId: string;
  entityName: string;
}

/** Compact attention banner summarizing health alerts and insights across all entities. */
export function AttentionBanner({ entities, schema, onEntityClick, className }: AttentionBannerProps) {
  const [collapsed, setCollapsed] = useState(false);

  const { healthAlerts, topInsights, summaryCounts, attentionCount, worstHealth } = useMemo(() => {
    // 1. Health alerts
    const alerts: HealthAlert[] = [];
    for (const entity of entities) {
      if (entity.health === 'warning' || entity.health === 'critical') {
        const typeDef = schema.entityTypes.find((t) => t.id === entity.typeId);
        const label = typeDef?.healthIndicator?.labels?.[entity.health] ?? entity.health;
        alerts.push({
          entityId: entity.id,
          entityName: entity.name,
          health: entity.health,
          label,
          typeIcon: typeDef?.icon ?? '?',
        });
      }
    }
    // Sort critical first, then warning
    alerts.sort((a, b) => {
      if (a.health === 'critical' && b.health !== 'critical') return -1;
      if (a.health !== 'critical' && b.health === 'critical') return 1;
      return 0;
    });

    // 2. Active insights (top 3 most recent)
    const allInsights: InsightWithEntity[] = [];
    for (const entity of entities) {
      for (const insight of entity.insights) {
        if (!insight.dismissed) {
          allInsights.push({ insight, entityId: entity.id, entityName: entity.name });
        }
      }
    }
    allInsights.sort((a, b) =>
      new Date(b.insight.generatedAt).getTime() - new Date(a.insight.generatedAt).getTime()
    );
    const top3 = allInsights.slice(0, 3);

    // 3. Summary counts
    const countsByType: Record<string, number> = {};
    for (const entity of entities) {
      countsByType[entity.typeId] = (countsByType[entity.typeId] ?? 0) + 1;
    }
    const counts = schema.entityTypes
      .filter((t) => t.showInNav)
      .sort((a, b) => a.navOrder - b.navOrder)
      .map((t) => ({ label: t.labelPlural, count: countsByType[t.id] ?? 0 }))
      .filter((c) => c.count > 0);

    const worst = alerts.some((a) => a.health === 'critical') ? 'critical' : alerts.length > 0 ? 'warning' : null;

    return {
      healthAlerts: alerts,
      topInsights: top3,
      summaryCounts: counts,
      attentionCount: alerts.length,
      worstHealth: worst,
    };
  }, [entities, schema]);

  const hasContent = healthAlerts.length > 0 || topInsights.length > 0;

  // Summary line
  const summaryLine = (
    <div className="font-mono text-[0.6875rem] text-taupe-3">
      {summaryCounts.map((c, i) => (
        <span key={c.label}>
          {i > 0 && ' · '}
          <span className="text-taupe-4">{c.count}</span> {c.label.toLowerCase()}
        </span>
      ))}
      {attentionCount > 0 && (
        <>
          <span> — </span>
          <span className={cn(worstHealth ? ENTITY_HEALTH_TEXT[worstHealth] : '')}>
            {attentionCount} need{attentionCount === 1 ? 's' : ''} attention
          </span>
        </>
      )}
    </div>
  );

  return (
    <div
      data-slot="attention-banner"
      className={cn(
        'relative bg-[rgba(var(--violet-3-rgb),0.03)] dark:bg-[rgba(var(--violet-3-rgb),0.06)]',
        'border-b border-taupe-1 dark:border-surface-3 px-4 py-3',
        className,
      )}
    >
      {/* Top-right controls */}
      {hasContent && (
        <div className="absolute top-2 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => console.log('Dismiss all insights')}
            className="font-mono text-[0.625rem] text-taupe-3 uppercase tracking-[0.05em] hover:text-taupe-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
          >
            Dismiss all
          </button>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="text-taupe-3 hover:text-taupe-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
            aria-label={collapsed ? 'Expand attention banner' : 'Collapse attention banner'}
          >
            {collapsed ? <ChevronDown className="size-3.5" /> : <ChevronUp className="size-3.5" />}
          </button>
        </div>
      )}

      {/* Collapsed: summary only */}
      {(!hasContent || collapsed) && summaryLine}

      {/* Expanded: alerts + insights + summary */}
      {hasContent && !collapsed && (
        <div className="flex flex-col gap-2">
          {/* Health alert chips */}
          {healthAlerts.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pr-24">
              {healthAlerts.map((alert) => (
                <button
                  key={alert.entityId}
                  type="button"
                  onClick={() => onEntityClick(alert.entityId)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[var(--r-sm)]',
                    'bg-[rgba(var(--taupe-3-rgb),0.06)] dark:bg-[rgba(var(--taupe-3-rgb),0.1)]',
                    'hover:bg-[rgba(var(--taupe-3-rgb),0.12)] dark:hover:bg-[rgba(var(--taupe-3-rgb),0.16)]',
                    'cursor-pointer transition-colors duration-150 motion-reduce:transition-none',
                    'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
                  )}
                >
                  <span className={cn('size-1.5 rounded-full shrink-0', ENTITY_HEALTH_COLORS[alert.health])} />
                  <span className="font-mono text-[0.75rem] font-semibold text-taupe-5 dark:text-taupe-4">
                    {alert.entityName}
                  </span>
                  <span className="font-mono text-[0.6875rem] text-taupe-3">({alert.label})</span>
                </button>
              ))}
            </div>
          )}

          {/* Insight previews */}
          {topInsights.length > 0 && (
            <div className="flex flex-col gap-1 pr-24">
              {topInsights.map(({ insight, entityId, entityName }) => {
                const IconComponent = INSIGHT_ICON_COMPONENTS[insight.type];
                const colorClass = INSIGHT_COLORS[insight.type] ?? 'text-taupe-3';

                return (
                  <div key={insight.id} className="flex items-center gap-2 min-w-0">
                    {IconComponent && (
                      <IconComponent className={cn('size-3.5 shrink-0', colorClass)} />
                    )}
                    <span className="font-sans text-[0.8125rem] text-taupe-5 dark:text-taupe-4 truncate">
                      {insight.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => onEntityClick(entityId)}
                      className="shrink-0 font-mono text-[0.6875rem] text-taupe-3 hover:text-violet-3 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                    >
                      — {entityName}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Summary line */}
          {summaryLine}
        </div>
      )}
    </div>
  );
}
