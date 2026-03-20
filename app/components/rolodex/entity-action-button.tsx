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
import { Button } from '~/components/ui/button';

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
) {
  const handlers: Record<EntityActionType, () => void> = {
    'start-chat': () => {
      selectEntity(null);
      navigate('/chat');
    },
    'trigger-workflow': () => {
      selectEntity(null);
      navigate(`/workflows/${action.target ?? ''}`);
    },
    'compose-email': () => {
      const email = entity.properties.email;
      if (typeof email === 'string' && email) {
        window.open(`mailto:${email}`, '_self');
      }
    },
    'add-note': () => {
      console.log(`Action: add-note for ${entity.id}`);
    },
    'schedule-meeting': () => {
      console.log(`Action: schedule-meeting for ${entity.id}`);
    },
    'external-link': () => {
      if (action.target) {
        const url = action.target.replace('{entityId}', entity.id);
        window.open(url, '_blank');
      }
    },
    'create-task': () => {
      console.log(`Action: create-task for ${entity.id}`);
    },
  };
  handlers[action.type]();
}

/** Renders an action button for a primary entity action */
export function EntityActionButton({
  action,
  entity,
  navigate,
  selectEntity,
}: {
  action: EntityActionDefinition;
  entity: Entity;
  navigate: ReturnType<typeof useNavigate>;
  selectEntity: (id: string | null) => void;
}) {
  const IconComponent = ACTION_ICON_COMPONENTS[action.icon];
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1 font-mono text-[0.625rem] uppercase tracking-[0.05em]"
      onClick={() => executeAction(action, entity, navigate, selectEntity)}
    >
      {IconComponent && <IconComponent className="size-3.5" />}
      {action.label}
    </Button>
  );
}
