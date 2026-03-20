// ============================================
// EntityActionButton — Primary action button for entity detail
// ============================================

import { useNavigate } from 'react-router';
import {
  Mail,
  MessageSquare,
  StickyNote,
  CheckSquare,
  Calendar,
  FileText,
  ArrowDownUp,
  FileSpreadsheet,
  Table,
} from 'lucide-react';
import type { Entity, EntityActionDefinition, EntityActionType } from '~/services/types';
import type { CosimoContextType } from '~/stores/ui-store';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';

/** Map action icon names to Lucide components */
export const ACTION_ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail,
  MessageSquare,
  StickyNote,
  CheckSquare,
  Calendar,
  FileText,
  ArrowDownUp,
  FileSpreadsheet,
  Table,
};

/** Execute an entity action — navigating, opening URLs, or logging */
export function executeAction(
  action: EntityActionDefinition,
  entity: Entity,
  navigate: ReturnType<typeof useNavigate>,
  selectEntity: (id: string | null) => void,
  openCosimoPanel?: (context?: { type: CosimoContextType; text: string }) => void,
) {
  const handlers: Record<EntityActionType, () => void> = {
    'start-chat': () => {
      openCosimoPanel?.({ type: 'entity', text: `Chat about ${entity.name}` });
    },
    'trigger-workflow': () => {
      selectEntity(null);
      navigate(`/workflows/${action.target ?? ''}?entity=${entity.id}&entityName=${encodeURIComponent(entity.name)}`);
    },
    'compose-email': () => {
      const email = entity.properties.email;
      if (typeof email === 'string' && email) {
        window.open(`mailto:${email}?subject=${encodeURIComponent(`Re: ${entity.name}`)}`, '_self');
      }
    },
    'add-note': () => {
      // TODO: Open inline note editor
      console.log(`Action: add-note for ${entity.id}`);
    },
    'schedule-meeting': () => {
      // TODO: Open calendar with entity pre-filled
      console.log(`Action: schedule-meeting for ${entity.id}`);
    },
    'external-link': () => {
      if (action.target) {
        const url = action.target.replace('{entityId}', entity.id);
        window.open(url, '_blank');
      }
    },
    'create-task': () => {
      // TODO: Open task creation panel
      console.log(`Action: create-task for ${entity.id}`);
    },
  };
  handlers[action.type]();
}

// Beveled button classes — matches chat-header.tsx pattern
const actionBtnCls =
  "px-1.5 py-1 flex items-center justify-center text-[0.6875rem] font-semibold text-taupe-4 bg-off-white border border-solid border-t-taupe-2 border-l-taupe-2 border-b-taupe-3 border-r-taupe-3 cursor-pointer rounded-[var(--r-md)] hover:bg-berry-1 hover:text-berry-5 active:border-t-taupe-3 active:border-l-taupe-3 active:border-b-taupe-2 active:border-r-taupe-2 focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2 dark:border-taupe-2 dark:hover:text-berry-3 dark:hover:bg-berry-1 [&_svg]:block [[data-a11y-labels=show]_&]:w-auto [[data-a11y-labels=show]_&]:h-7 [[data-a11y-labels=show]_&]:px-2";

// Icon classes — hidden when labels mode is active
const actionIconCls = "[[data-a11y-labels=show]_&]:hidden";

// Label classes — hidden by default, shown when labels mode is active
const actionLabelCls = "hidden [[data-a11y-labels=show]_&]:inline font-[family-name:var(--mono)] font-semibold text-[0.625rem] tracking-[0.03em] whitespace-nowrap";

/** Renders an action button for a primary entity action */
export function EntityActionButton({
  action,
  entity,
  navigate,
  selectEntity,
  openCosimoPanel,
}: {
  action: EntityActionDefinition;
  entity: Entity;
  navigate: ReturnType<typeof useNavigate>;
  selectEntity: (id: string | null) => void;
  openCosimoPanel?: (context?: { type: CosimoContextType; text: string }) => void;
}) {
  const IconComponent = ACTION_ICON_COMPONENTS[action.icon];
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={actionBtnCls}
      title={action.label}
      aria-label={action.label}
      onClick={() => executeAction(action, entity, navigate, selectEntity, openCosimoPanel)}
    >
      {IconComponent && <IconComponent className={cn("size-3.5", actionIconCls)} />}
      <span className={actionLabelCls}>{action.label}</span>
    </Button>
  );
}
