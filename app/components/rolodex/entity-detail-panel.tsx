// ============================================
// EntityDetailPanel — Detail view shell with Overview tab
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { X, MoreHorizontal, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { Entity, EntitySchema, EntityTypeDefinition } from '~/services/types';
import { useEntityStore } from '~/stores/entity-store';
import { useUIStore } from '~/stores/ui-store';
import { getRelatedEntities } from '~/services/entities';
import { EntityInsightBar } from '~/components/rolodex/entity-insight-bar';
import { EntityPropertySection } from '~/components/rolodex/entity-property-section';
import { ActivityTimeline } from '~/components/rolodex/activity-timeline';
import { RelationshipsTab } from '~/components/rolodex/relationships-tab';
import { LinkedTab } from '~/components/rolodex/linked-tab';
import { EntityActionButton, executeAction, ACTION_ICON_COMPONENTS } from '~/components/rolodex/entity-action-button';
import { EntityWorkflowRuns } from '~/components/rolodex/entity-workflow-runs';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import { Button } from '~/components/ui/button';
import { ENTITY_HEALTH_TEXT, ENTITY_HEALTH_BG } from '~/lib/entity-constants';
import { cn } from '~/lib/utils';

// Beveled button classes — matches chat-header.tsx pattern
const panelBtnCls =
  "px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-taupe-4 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 active:border-t-taupe-3 active:border-l-taupe-3 active:border-b-taupe-2 active:border-r-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 [&_svg]:block [[data-a11y-labels=show]_&]:w-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2";

const panelIconCls = "[[data-a11y-labels=show]_&]:hidden";
const panelLabelCls = "hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap";

interface EntityDetailPanelProps {
  /** The entity to display */
  entity: Entity;
  /** The entity schema */
  schema: EntitySchema;
  /** Optional additional class names */
  className?: string;
}

const DETAIL_TABS = ['overview', 'timeline', 'relationships', 'linked'] as const;
const TAB_LABELS: Record<string, string> = {
  overview: 'Overview',
  timeline: 'Timeline',
  relationships: 'Relationships',
  linked: 'Linked',
};

/** Formats a numeric value in compact notation ($420M, $1.2B, $50K) */
function formatCompactValue(
  value: string | string[] | null | undefined,
  type: string,
): string {
  if (value == null || Array.isArray(value)) return '—';

  if (type === 'currency') {
    const num = Number(value);
    if (isNaN(num)) return value;
    const abs = Math.abs(num);
    const sign = num < 0 ? '-' : '';
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(abs % 1_000_000_000 === 0 ? 0 : 1)}B`;
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs % 1_000_000 === 0 ? 0 : 1)}M`;
    if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(abs % 1_000 === 0 ? 0 : 1)}K`;
    return `${sign}$${num}`;
  }

  if (type === 'percentage') return `${value}%`;

  return value;
}

/** EntityDetailPanel — rich detail view with header, insight bar, tabs, and tab content */
export function EntityDetailPanel({ entity, schema, className }: EntityDetailPanelProps) {
  const navigate = useNavigate();
  const selectEntity = useEntityStore((s) => s.selectEntity);
  const detailTab = useEntityStore((s) => s.detailTab);
  const setDetailTab = useEntityStore((s) => s.setDetailTab);
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);
  const [entityNames, setEntityNames] = useState<Record<string, string>>({});

  const typeDef = schema.entityTypes.find((t) => t.id === entity.typeId);

  // Build entity names map from related entities for timeline chips
  useEffect(() => {
    let cancelled = false;
    getRelatedEntities(entity.id).then((entities) => {
      if (!cancelled) {
        const names: Record<string, string> = {};
        for (const e of entities) {
          names[e.id] = e.name;
        }
        setEntityNames(names);
      }
    });
    return () => { cancelled = true; };
  }, [entity.id]);

  // Escape key closes panel
  const handleEscapeKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') selectEntity(null);
    },
    [selectEntity],
  );

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [handleEscapeKey]);

  const primaryActions = typeDef?.actions.filter((a) => a.primary) ?? [];
  const overflowActions = typeDef?.actions.filter((a) => !a.primary) ?? [];
  const healthLabels = typeDef?.healthIndicator?.labels as
    | Record<string, string>
    | undefined;

  return (
    <div
      data-slot="entity-detail-panel"
      className={cn('flex h-full flex-col bg-white dark:bg-surface-1', className)}
    >
      {/* HEADER */}
      <div
        className="sticky top-0 z-10 flex flex-col gap-2 px-4 py-3 border-b-2 border-solid bg-white dark:bg-surface-1"
        style={{
          borderImage:
            'linear-gradient(90deg, var(--taupe-2), var(--berry-2), var(--violet-2)) 1',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Entity type icon */}
          {typeDef && (
            <div
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-full text-lg',
                `bg-[rgba(${typeDef.colorRgb},0.1)]`,
              )}
            >
              {typeDef.icon}
            </div>
          )}

          {/* Name + subtitle */}
          <div className="min-w-0 flex-1">
            <h2 className="font-[family-name:var(--pixel)] text-lg text-taupe-5 tracking-[0.5px] leading-tight">
              {entity.name}
            </h2>
            {entity.subtitle && (
              <p className="font-mono text-[0.6875rem] text-taupe-3 mt-0.5 truncate">
                {entity.subtitle}
              </p>
            )}
          </div>

          {/* Health badge */}
          {entity.health && (
            <span
              className={cn(
                'shrink-0 font-mono text-[0.625rem] uppercase tracking-[0.05em] font-semibold px-2 py-[3px] rounded-[var(--r-sm)]',
                ENTITY_HEALTH_TEXT[entity.health],
                ENTITY_HEALTH_BG[entity.health],
              )}
            >
              {healthLabels?.[entity.health] ?? entity.health}
            </span>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("shrink-0", panelBtnCls)}
            onClick={() => selectEntity(null)}
            title="Close"
            aria-label="Close entity details"
          >
            <X className={cn("size-4", panelIconCls)} />
            <span className={panelLabelCls}>Close</span>
          </Button>
        </div>

        {/* Action buttons row */}
        {(primaryActions.length > 0 || overflowActions.length > 0) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {primaryActions.map((action) => (
              <EntityActionButton key={action.id} action={action} entity={entity} navigate={navigate} selectEntity={selectEntity} openCosimoPanel={openCosimoPanel} />
            ))}
            {overflowActions.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn("size-7", panelBtnCls)}
                  title="More actions"
                  aria-label="More actions"
                >
                  <MoreHorizontal className={cn("size-3.5", panelIconCls)} />
                  <span className={panelLabelCls}>More</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {overflowActions.map((action) => {
                    const OverflowIcon = ACTION_ICON_COMPONENTS[action.icon];
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={() => executeAction(action, entity, navigate, selectEntity, openCosimoPanel)}
                      >
                        {OverflowIcon && <OverflowIcon className="size-3.5" />}
                        {action.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* INSIGHT BAR */}
      <EntityInsightBar
        insights={entity.insights}
        onDismiss={(id) => console.log(`Dismiss insight: ${id}`)}
      />

      {/* TAB BAR */}
      <div className="flex border-b border-taupe-1 dark:border-taupe-2 px-4" role="tablist">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={detailTab === tab}
            onClick={() => setDetailTab(tab)}
            className={cn(
              'px-3 py-2 font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] cursor-pointer border-b-2 -mb-px',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2',
              detailTab === tab
                ? 'border-violet-3 text-violet-3'
                : 'border-transparent text-taupe-3 hover:text-taupe-5',
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="flex-1 overflow-y-auto p-4" role="tabpanel" aria-label={TAB_LABELS[detailTab]}>
        {detailTab === 'overview' && (
          <OverviewTab
            entity={entity}
            schema={schema}
            typeDef={typeDef}
            selectEntity={selectEntity}
            setDetailTab={setDetailTab}
          />
        )}

        {detailTab === 'timeline' && (
          <ActivityTimeline
            entityId={entity.id}
            entityNames={entityNames}
            onEntityClick={(id) => selectEntity(id)}
          />
        )}

        {detailTab === 'relationships' && (
          <RelationshipsTab
            entity={entity}
            schema={schema}
            onEntityClick={(id) => selectEntity(id)}
          />
        )}

        {detailTab === 'linked' && (
          <LinkedTab entity={entity} />
        )}
      </div>
    </div>
  );
}

// ============================================
// OverviewTab — Intelligence brief layout
// ============================================

interface OverviewTabProps {
  entity: Entity;
  schema: EntitySchema;
  typeDef: EntityTypeDefinition | undefined;
  selectEntity: (id: string | null) => void;
  setDetailTab: (tab: 'overview' | 'timeline' | 'relationships' | 'linked') => void;
}

function OverviewTab({ entity, schema, typeDef, selectEntity, setDetailTab }: OverviewTabProps) {
  const openCosimoPanel = useUIStore((s) => s.openCosimoPanel);
  const [relatedEntities, setRelatedEntities] = useState<Entity[]>([]);
  const [relLoading, setRelLoading] = useState(true);
  const [showProperties, setShowProperties] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setRelLoading(true);

    getRelatedEntities(entity.id)
      .then((entities) => {
        if (!cancelled) {
          setRelatedEntities(entities);
          setRelLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setRelLoading(false);
      });

    return () => { cancelled = true; };
  }, [entity.id]);

  // Resolve relationship labels for the quick relationships section
  const quickRelationships = entity.relationships.slice(0, 4).map((rel) => {
    const relType = schema.relationshipTypes.find((rt) => rt.id === rel.relationshipTypeId);
    const label = relType
      ? rel.direction === 'forward'
        ? relType.forwardLabel
        : relType.reverseLabel
      : rel.relationshipTypeId;
    const targetEntity = relatedEntities.find((e) => e.id === rel.targetEntityId);
    const targetTypeDef = targetEntity
      ? schema.entityTypes.find((t) => t.id === targetEntity.typeId)
      : null;
    return { rel, label, targetEntity, targetTypeDef };
  });

  return (
    <div className="flex flex-col gap-3">
      {/* 1. COSIMO BRIEF */}
      {entity.aiSummary && (
        <div className="bg-[rgba(var(--violet-3-rgb),0.04)] dark:bg-[rgba(var(--violet-3-rgb),0.08)] rounded-[var(--r-md)] p-3 border border-[rgba(var(--violet-3-rgb),0.1)] dark:border-[rgba(var(--violet-3-rgb),0.15)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="size-3 text-violet-3" />
            <span className="font-mono text-[0.625rem] font-semibold uppercase tracking-[0.05em] text-violet-3">
              Cosimo Brief
            </span>
          </div>
          <p className="font-sans text-[0.8125rem] text-taupe-5 dark:text-taupe-4 leading-relaxed">
            {entity.aiSummary}
          </p>
          <button
            type="button"
            className="mt-2 font-mono text-[0.625rem] text-violet-3 hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
            onClick={() => openCosimoPanel({ type: 'entity', text: entity.name })}
          >
            Ask Cosimo about {entity.name}
          </button>
        </div>
      )}

      {/* 1.5. RECENT WORKFLOWS */}
      {entity.linkedWorkflowIds.length > 0 && (
        <EntityWorkflowRuns
          entityId={entity.id}
          linkedWorkflowIds={entity.linkedWorkflowIds}
        />
      )}

      {/* 2. KEY METRICS STRIP */}
      {typeDef && typeDef.summaryProperties.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          {typeDef.summaryProperties.map((propId) => {
            const propDef = typeDef.properties.find((p) => p.id === propId);
            if (!propDef) return null;
            const rawValue = entity.properties[propId];
            const displayValue = formatCompactValue(rawValue, propDef.type);
            return (
              <div key={propId} className="flex flex-col">
                <span className="font-mono text-[0.5625rem] uppercase text-taupe-3 tracking-[0.05em]">
                  {propDef.label}
                </span>
                <span className="font-mono text-[1rem] font-bold text-taupe-5 dark:text-taupe-4">
                  {displayValue}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. QUICK RELATIONSHIPS */}
      {entity.relationships.length > 0 && (
        <div>
          <h3 className="font-mono text-[0.625rem] font-bold uppercase tracking-[0.08em] text-taupe-3 mb-1.5">
            Connected To
          </h3>
          {relLoading ? (
            <div className="flex flex-col gap-1.5">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5 py-1.5 px-2">
                  <div className="size-5 rounded-full bg-taupe-1 animate-pulse motion-reduce:animate-none" />
                  <div className="flex-1 h-3 rounded bg-taupe-1 animate-pulse motion-reduce:animate-none" />
                </div>
              ))}
            </div>
          ) : (
            <div role="list">
              {quickRelationships.map(({ rel, label, targetEntity, targetTypeDef }) => (
                <div
                  key={rel.targetEntityId}
                  role="listitem"
                  tabIndex={0}
                  className="flex items-center gap-2.5 py-1.5 px-2 rounded-[var(--r-md)] cursor-pointer hover:bg-[rgba(var(--violet-3-rgb),0.04)] dark:hover:bg-[rgba(var(--violet-3-rgb),0.08)] transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                  onClick={() => selectEntity(rel.targetEntityId)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectEntity(rel.targetEntityId);
                    }
                  }}
                >
                  {targetTypeDef && (
                    <div
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-full text-[0.625rem]',
                        `bg-[rgba(${targetTypeDef.colorRgb},0.1)]`,
                      )}
                    >
                      {targetTypeDef.icon}
                    </div>
                  )}
                  <span className="font-mono text-[0.8125rem] font-semibold text-taupe-5 dark:text-taupe-4 truncate">
                    {targetEntity?.name ?? rel.targetEntityId}
                  </span>
                  <span className="shrink-0 font-mono text-[0.6875rem] text-taupe-3">
                    {label}
                  </span>
                </div>
              ))}
              {entity.relationships.length > 4 && (
                <button
                  type="button"
                  className="mt-1 font-mono text-[0.625rem] text-violet-3 hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
                  onClick={() => setDetailTab('relationships')}
                >
                  View all {entity.relationships.length} relationships &rarr;
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. PROPERTY SECTIONS (collapsible) */}
      {typeDef && typeDef.detailSections.length > 0 && (
        <div>
          <button
            type="button"
            className="flex items-center gap-1 font-mono text-[0.625rem] text-taupe-3 hover:text-taupe-5 cursor-pointer focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2"
            onClick={() => setShowProperties((prev) => !prev)}
          >
            {showProperties ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
            {showProperties ? 'Hide Properties' : 'Show All Properties'}
          </button>
          {showProperties && (
            <div className="mt-2 flex flex-col gap-3">
              {typeDef.detailSections.map((section) => (
                <EntityPropertySection
                  key={section.label}
                  section={section}
                  properties={entity.properties}
                  propertyDefs={typeDef.properties}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
