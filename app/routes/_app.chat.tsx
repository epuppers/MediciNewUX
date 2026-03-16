import { Outlet, useMatches } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";

/** Suggestion chips for the empty thread state */
const SUGGESTIONS = [
  { label: 'Distribution comparison', prompt: 'Compare Q3 and Q4 distributions across all active funds' },
  { label: 'NAV review', prompt: 'Pull the latest NAV report for Fund IV and flag any valuation changes above 10%' },
  { label: 'Covenant check', prompt: 'Summarize all outstanding covenant violations across the loan book' },
  { label: 'Capital call', prompt: 'Generate a capital call notice for the next tranche' },
];

/**
 * Chat layout route — wraps thread detail routes.
 * When no thread is selected (index), shows a centered placeholder.
 */
export default function ChatRoute() {
  const matches = useMatches();
  // Check if a child thread route is matched (has threadId param)
  const hasChildRoute = matches.some(
    (m) => m.id === "routes/_app.chat.$threadId"
  );

  if (!hasChildRoute) {
    return (
      <div className="empty-thread">
        <div className="empty-thread-icon">◆</div>
        <div className="empty-thread-title">What can Cosimo help with?</div>
        <div className="empty-thread-sub">
          Ask about fund performance, document analysis, compliance checks, or anything across your portfolio.
        </div>
        <div className="empty-thread-suggestions">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              className="empty-thread-chip"
              data-suggestion={s.prompt}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return <Outlet />;
}

/** Loading skeleton — 6 thread items in sidebar placeholder */
export function HydrateFallback() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <div className="w-full max-w-md space-y-3 px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-md p-3">
            <Skeleton className="size-8 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
