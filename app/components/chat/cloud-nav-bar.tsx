// ============================================
// CloudNavBar — Breadcrumb navigation + search for cloud drive tab
// ============================================
// Sits above the file list in the cloud drive panel.
// Shows breadcrumb path and compact search input.

import { Search, X } from 'lucide-react';
import { cn } from '~/lib/utils';

/** Props for the CloudNavBar component */
interface CloudNavBarProps {
  /** Breadcrumb path segments (e.g., ['Documents', 'Finance', 'Q4']) */
  breadcrumb: string[];
  /** Provider display name (e.g., 'SharePoint', 'Google Drive') */
  provider: string;
  /** Current search input value */
  searchQuery: string;
  /** Callback when search input changes */
  onSearchChange: (query: string) => void;
  /** Callback when a breadcrumb segment is clicked (index in the breadcrumb array) */
  onBreadcrumbClick: (index: number) => void;
  /** Callback to clear search and return to browse */
  onClearSearch: () => void;
  /** Whether search results are currently being shown */
  searchActive: boolean;
}

/**
 * CloudNavBar — breadcrumb navigation and search input for the cloud drive tab.
 * Shows provider > path segments as clickable breadcrumbs, with a compact search bar below.
 */
export function CloudNavBar({
  breadcrumb,
  provider,
  searchQuery,
  onSearchChange,
  onBreadcrumbClick,
  onClearSearch,
  searchActive,
}: CloudNavBarProps) {
  /** All segments: provider first, then breadcrumb path */
  const segments = [provider, ...breadcrumb];

  return (
    <div
      data-slot="cloud-nav-bar"
      className="bg-off-white dark:bg-surface-1 border-b border-taupe-2 dark:border-surface-3 px-2.5 py-1.5 shrink-0"
    >
      {/* Row 1 — Breadcrumb */}
      <div className="flex items-center gap-1 min-h-5 overflow-hidden">
        {searchActive ? (
          <span className="font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-4">
            Search results
          </span>
        ) : (
          segments.map((segment, i) => {
            const isLast = i === segments.length - 1;
            return (
              <span key={i} className="flex items-center gap-1 min-w-0">
                {i > 0 && (
                  <span className="font-[family-name:var(--mono)] text-[0.6875rem] text-taupe-3 dark:text-taupe-3 shrink-0">
                    ›
                  </span>
                )}
                {isLast ? (
                  <span className="font-[family-name:var(--mono)] text-[0.6875rem] font-semibold text-taupe-5 dark:text-taupe-4 truncate">
                    {segment}
                  </span>
                ) : (
                  <button
                    type="button"
                    className={cn(
                      'font-[family-name:var(--mono)] text-[0.6875rem] text-taupe-4 dark:text-taupe-3 cursor-pointer truncate',
                      'hover:text-violet-3 dark:hover:text-violet-3',
                      'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
                    )}
                    onClick={() => onBreadcrumbClick(i)}
                  >
                    {segment}
                  </button>
                )}
              </span>
            );
          })
        )}
      </div>

      {/* Row 2 — Search */}
      <div className="relative mt-1.5">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-taupe-3 dark:text-taupe-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={cn(
            'w-full min-h-7 pl-7 pr-7 font-[family-name:var(--mono)] text-[0.6875rem] text-taupe-5 dark:text-taupe-4',
            'bg-off-white dark:bg-surface-0 border',
            'border-t-taupe-3 border-l-taupe-3 border-b-taupe-1 border-r-taupe-1',
            'dark:border-t-surface-0 dark:border-l-surface-0 dark:border-b-surface-3 dark:border-r-surface-3',
            'rounded-[var(--r-sm)] outline-none',
            'placeholder:text-taupe-3 dark:placeholder:text-taupe-3',
            'focus-visible:border-violet-3 dark:focus-visible:border-violet-3'
          )}
        />
        {searchActive && (
          <button
            type="button"
            className={cn(
              'absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded-[var(--r-sm)]',
              'text-taupe-3 dark:text-taupe-3 cursor-pointer',
              'hover:text-taupe-5 hover:bg-taupe-1 dark:hover:text-taupe-4 dark:hover:bg-surface-2',
              'focus-visible:outline-2 focus-visible:outline-violet-3 focus-visible:outline-offset-2'
            )}
            onClick={onClearSearch}
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
