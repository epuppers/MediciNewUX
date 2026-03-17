import { useState } from 'react';
import { cn } from '~/lib/utils';

interface TraitBadgesProps {
  selectedTraits: string[];
  presetTraits: string[];
}

const TAG_BASE = 'font-mono text-[0.6875rem] font-semibold px-[10px] py-1 border border-taupe-2 rounded-[var(--r-md)] bg-off-white text-taupe-4 cursor-pointer transition-all duration-100 tracking-[0.02em] select-none hover:border-berry-2 hover:text-berry-3 dark:bg-surface-2 dark:border-taupe-3 dark:text-taupe-3 dark:hover:border-berry-2 dark:hover:text-berry-2';

const TAG_ACTIVE = 'bg-berry-3 text-white border-t-berry-2 border-l-berry-2 border-b-berry-5 border-r-berry-5 hover:bg-berry-4 hover:text-white dark:text-white';

const TAG_DISABLED = 'opacity-35 cursor-default hover:border-taupe-2 hover:text-taupe-4';

/** Personality trait badges split into selected / presets / custom input sections. */
export function TraitBadges({ selectedTraits: initialSelected, presetTraits }: TraitBadgesProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [customInput, setCustomInput] = useState('');

  const removeTrait = (name: string) => {
    setSelected((prev) => prev.filter((t) => t !== name));
  };

  const addTrait = (name: string) => {
    if (!selected.includes(name)) {
      setSelected((prev) => [...prev, name]);
    }
  };

  const addCustomTrait = () => {
    const trimmed = customInput.trim();
    if (trimmed && !selected.includes(trimmed)) {
      setSelected((prev) => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomTrait();
    }
  };

  return (
    <>
      {/* Selected traits */}
      <div className="flex flex-wrap gap-1.5 mb-2.5 min-h-[28px]">
        {selected.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => removeTrait(name)}
            className={cn(
              TAG_BASE,
              TAG_ACTIVE,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-3'
            )}
          >
            {name}
            <span className="ml-1 text-[0.8125rem] opacity-70">&times;</span>
          </button>
        ))}
      </div>

      {/* Preset traits */}
      <div className="flex flex-wrap gap-1.5 mb-2.5 pt-2.5 border-t border-taupe-1">
        {presetTraits.map((name) => {
          const isSelected = selected.includes(name);
          return (
            <button
              key={name}
              type="button"
              onClick={() => !isSelected && addTrait(name)}
              className={cn(
                TAG_BASE,
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-3',
                isSelected && TAG_DISABLED
              )}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Custom trait input */}
      <div className="flex gap-1.5 pt-2.5 border-t border-taupe-1">
        <input
          type="text"
          className="flex-1 px-[10px] py-[5px] font-mono text-xs text-taupe-5 bg-off-white border border-taupe-2 rounded-[var(--r-md)] outline-none focus:border-violet-3 dark:bg-surface-2 dark:border-taupe-3 dark:text-taupe-3"
          placeholder="Add a custom trait..."
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          className={cn(
            'px-3 py-[5px] font-mono text-[0.6875rem] font-semibold text-taupe-5 bg-off-white border border-t-taupe-1 border-l-taupe-1 border-b-taupe-2 border-r-taupe-2 rounded-[var(--r-md)] cursor-pointer hover:bg-berry-1 hover:text-berry-5 dark:bg-surface-2 dark:border-taupe-3 dark:text-taupe-3 dark:hover:bg-[rgba(var(--berry-3-rgb),0.12)] dark:hover:text-berry-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-3'
          )}
          onClick={addCustomTrait}
        >
          Add
        </button>
      </div>
    </>
  );
}
