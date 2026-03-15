import { useNavigate } from 'react-router';
import { MoreHorizontal, Pencil, Trash2, User, Building, FileText, Landmark } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~/components/ui/dropdown-menu';
import type { MemoryFact as MemoryFactType, LinkedEntity } from '~/services/types';
import { cn } from '~/lib/utils';

interface MemoryFactProps {
  fact: MemoryFactType;
  onEntityClick?: (name: string) => void;
}

/** Renders the icon for a linked entity based on its type. */
function EntityIcon({ type }: { type: string }) {
  const cls = 'size-3';
  switch (type) {
    case 'person':
      return <User className={cls} />;
    case 'fund':
      return <Landmark className={cls} />;
    case 'document':
      return <FileText className={cls} />;
    default:
      return <Building className={cls} />;
  }
}

/** Category badge class mapping */
const CAT_CLASS: Record<string, string> = {
  preference: 'cat-preference',
  workflow: 'cat-workflow',
  contact: 'cat-contact',
  fund: 'cat-fund',
  style: 'cat-style',
  context: 'cat-context',
};

/** A single memory fact card with category badge, entity chips, and edit/delete actions. */
export function MemoryFactCard({ fact, onEntityClick }: MemoryFactProps) {
  const navigate = useNavigate();

  const handleEntityClick = (entity: LinkedEntity) => {
    if (onEntityClick) {
      onEntityClick(entity.name);
    }
    navigate(`/brain/graph?entity=${encodeURIComponent(entity.name)}`);
  };

  return (
    <div
      className="group mem-fact-card"
      data-category={fact.category}
    >
      {/* Top row: category badge + menu */}
      <div className="flex items-center justify-between mb-1.5 relative">
        <span
          className={cn(
            'font-[family-name:var(--mono)] text-[10px] font-bold uppercase tracking-[0.06em] rounded-[var(--r-md)] px-[7px] py-[2px]',
            CAT_CLASS[fact.category] || 'cat-context'
          )}
        >
          {fact.category}
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger
            className="mem-fact-menu-btn rounded p-1 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="bottom">
            <DropdownMenuItem>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Fact text */}
      <p className="mem-fact-text">{fact.text}</p>

      {/* Meta row: source + date */}
      <div className="flex justify-between items-center">
        {fact.source && (
          <span className="mem-fact-source">{fact.source}</span>
        )}
        {fact.date && (
          <span className="mem-fact-date">{fact.date}</span>
        )}
      </div>

      {/* Entity chips */}
      {fact.linkedEntities && fact.linkedEntities.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {fact.linkedEntities.map((entity) => (
            <button
              key={entity.name}
              type="button"
              onClick={() => handleEntityClick(entity)}
              className="mem-entity-chip"
            >
              <EntityIcon type={entity.type} />
              {entity.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
