import { Search } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { FilterPill } from '~/components/ui/filter-pill';

interface SearchFilterBarProps {
  placeholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: {
    options: readonly { id: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
  };
  className?: string;
}

export function SearchFilterBar({
  placeholder = 'Search...',
  searchValue,
  onSearchChange,
  filters,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={className}>
      <div className="relative mb-2">
        <Search className="absolute left-[10px] top-1/2 size-3.5 -translate-y-1/2 text-taupe-3 pointer-events-none" />
        <Input
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-[30px] pr-[10px] py-[7px] font-mono text-xs text-taupe-5 bg-off-white border-2 border-t-taupe-3 border-l-taupe-3 border-b-taupe-1 border-r-taupe-1 rounded-none focus:border-violet-3 focus-visible:ring-0 dark:bg-surface-2 dark:border-surface-0 dark:border-r-surface-3 dark:border-b-surface-3 dark:focus:border-violet-3"
        />
      </div>
      {filters && (
        <div className="flex flex-wrap gap-1">
          {filters.options.map((opt) => (
            <FilterPill
              key={opt.id}
              label={opt.label}
              isActive={filters.value === opt.id}
              onClick={() => filters.onChange(opt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
