import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useBrainStore } from '~/stores/brain-store';
import { TraitBadges } from './trait-badges';
import { MemoryFactCard } from './memory-fact';
import type { MemoryData, PersonalityTrait } from '~/services/types';
import { cn } from '~/lib/utils';

interface MemoryListProps {
  memory: MemoryData;
}

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'preference', label: 'Preference' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'contact', label: 'Contact' },
  { id: 'fund', label: 'Fund' },
  { id: 'style', label: 'Style' },
  { id: 'context', label: 'Context' },
];

/** Full memory view: role profile, personality traits, category filter, search, and fact list. */
export function MemoryList({ memory }: MemoryListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const memoryCategory = useBrainStore((s) => s.memoryCategory);
  const setMemoryCategory = useBrainStore((s) => s.setMemoryCategory);

  const traits: PersonalityTrait[] = useMemo(
    () =>
      memory.presetTraits.map((name) => ({
        name,
        active: memory.selectedTraits.includes(name),
      })),
    [memory.presetTraits, memory.selectedTraits]
  );

  const filteredFacts = useMemo(() => {
    let facts = memory.facts;

    if (memoryCategory !== 'all') {
      facts = facts.filter((f) => f.category === memoryCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      facts = facts.filter(
        (f) =>
          f.text.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q) ||
          f.linkedEntities?.some((e) => e.name.toLowerCase().includes(q))
      );
    }

    return facts;
  }, [memory.facts, memoryCategory, searchQuery]);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      {/* Role profile */}
      <section>
        <h3 className="mem-section-label">Role Profile</h3>
        <div className="mem-role-card">
          <p className="font-[family-name:var(--mono)] text-xs leading-[1.7] text-[var(--taupe-5)] dark:text-[var(--taupe-1)]">
            {memory.roleProfile}
          </p>
        </div>
      </section>

      {/* Personality traits */}
      <section>
        <h3 className="mem-section-label">Personality</h3>
        <div className="mem-personality">
          <TraitBadges traits={traits} />
        </div>
      </section>

      {/* Search & filter toolbar */}
      <div className="mem-facts-toolbar">
        {/* Search */}
        <div className="relative mb-2">
          <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-[var(--taupe-3)] pointer-events-none" />
          <input
            type="search"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mem-search-input"
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setMemoryCategory(cat.id)}
              className={cn(
                'mem-cat-pill',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]',
                memoryCategory === cat.id && 'active'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fact list */}
      <section className="flex flex-col gap-1.5">
        <h3 className="mem-section-label">
          Facts ({filteredFacts.length})
        </h3>
        {filteredFacts.length === 0 ? (
          <p className="py-4 text-center font-[family-name:var(--mono)] text-xs text-[var(--taupe-3)]">
            No memories match your filter.
          </p>
        ) : (
          filteredFacts.map((fact, index) => (
            <MemoryFactCard key={`${fact.category}-${index}`} fact={fact} />
          ))
        )}
      </section>
    </div>
  );
}
