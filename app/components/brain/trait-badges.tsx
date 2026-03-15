import { useState } from 'react';
import { cn } from '~/lib/utils';
import type { PersonalityTrait } from '~/services/types';

interface TraitBadgesProps {
  traits: PersonalityTrait[];
}

/** Grid of toggleable personality trait badges. Active traits show berry styling. */
export function TraitBadges({ traits: initialTraits }: TraitBadgesProps) {
  const [traits, setTraits] = useState<PersonalityTrait[]>(initialTraits);

  const handleToggle = (index: number) => {
    setTraits((prev) =>
      prev.map((t, i) => (i === index ? { ...t, active: !t.active } : t))
    );
  };

  return (
    <div className="flex flex-wrap gap-1.5">
      {traits.map((trait, index) => (
        <button
          key={trait.name}
          type="button"
          onClick={() => handleToggle(index)}
          className={cn(
            'mem-trait-tag',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--violet-3)]',
            trait.active && 'active'
          )}
        >
          {trait.name}
          {trait.active && <span className="ml-1 text-[13px] opacity-70">×</span>}
        </button>
      ))}
    </div>
  );
}
