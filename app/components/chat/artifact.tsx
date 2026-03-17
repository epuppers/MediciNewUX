import { useState } from 'react';
import { ChevronDown, ChevronUp, Workflow } from 'lucide-react';
import type { Artifact as ArtifactType, ArtifactTableData, ArtifactMetadataData, ArtifactFlowGraphData } from '~/services/types';
import { DataTable } from '~/components/chat/data-table';
import { cn } from '~/lib/utils';

interface ArtifactProps {
  artifact: ArtifactType;
  className?: string;
}

/**
 * Renders an inline artifact within an AI message.
 * Supports four types: metadata (key-value pairs), table (DataTable),
 * flow-graph (placeholder), and text (formatted content).
 * Styled to match the original .artifact / .art-bar / .art-body pattern.
 */
export function Artifact({ artifact, className }: ArtifactProps) {
  const [collapsed, setCollapsed] = useState(false);

  function handleToggle() {
    setCollapsed((prev) => !prev);
  }

  return (
    <div className={cn('m-[10px_0_10px_30px] border-2 border-t-taupe-2 border-l-taupe-2 border-b-taupe-4 border-r-taupe-4 bg-white dark:bg-surface-1 dark:border-taupe-2 rounded-[var(--r-md)] overflow-hidden', className)}>
      {/* Art bar — title bar with stripes */}
      <div className="flex items-center gap-2 p-[6px_10px] bg-taupe-5 dark:bg-surface-2 border-b border-taupe-4 rounded-t-[var(--r-sm)]">
        <div className="w-2.5 h-2.5 bg-red border border-t-[var(--red-hi,var(--red))] border-l-[var(--red-hi,var(--red))] border-b-[var(--red-lo,var(--red))] border-r-[var(--red-lo,var(--red))] shrink-0 rounded-[var(--r-md)] cursor-pointer" />
        <div className="art-stripe" />
        <span className="font-mono text-[0.6875rem] font-semibold text-taupe-1 dark:text-taupe-4 whitespace-nowrap">
          {artifact.title}
        </span>
        <div className="art-stripe" />
        <button
          onClick={handleToggle}
          className="shrink-0 flex w-5 h-5 items-center justify-center rounded-[var(--r-sm)] text-taupe-3 bg-transparent border-none cursor-pointer transition-colors duration-100 hover:text-taupe-1"
          aria-label={collapsed ? 'Expand artifact' : 'Collapse artifact'}
        >
          {collapsed ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronUp className="h-3.5 w-3.5" />
          )}
          <span className="a11y-label">{collapsed ? 'Expand' : 'Collapse'}</span>
        </button>
      </div>

      {/* Art body */}
      {!collapsed && (
        <div className="p-3 overflow-x-auto">
          <ArtifactBody artifact={artifact} />
        </div>
      )}
    </div>
  );
}

/** Renders the artifact body based on artifact type */
function ArtifactBody({ artifact }: { artifact: ArtifactType }) {
  switch (artifact.type) {
    case 'table': {
      const data = artifact.data as ArtifactTableData;
      return <DataTable columns={data.headers} rows={data.rows} />;
    }

    case 'metadata': {
      const data = artifact.data as ArtifactMetadataData;
      return (
        <div className="space-y-0">
          {data.entries.map((entry, i) => (
            <div key={i} className="flex justify-between py-1.5 border-b border-taupe-1 last:border-b-0">
              <span className="font-mono text-[0.6875rem] text-taupe-3 uppercase tracking-[0.08em]">{entry.label}</span>
              <span className="font-mono text-xs font-semibold text-taupe-5">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }

    case 'flow-graph': {
      const data = artifact.data as ArtifactFlowGraphData;
      return (
        <div className="flex items-center justify-center rounded-[var(--r-md)] border border-dashed border-taupe-2 bg-[rgba(var(--violet-3-rgb),0.04)] dark:bg-[rgba(var(--violet-3-rgb),0.08)] p-8">
          <div className="flex flex-col items-center gap-2 text-taupe-3">
            <Workflow className="h-8 w-8 opacity-50" />
            <span className="font-[family-name:var(--mono)] text-xs">
              Flow Graph: {data.templateId}
            </span>
          </div>
        </div>
      );
    }

    case 'text': {
      const content = artifact.data as string;
      return (
        <div
          className="text-[13px] leading-relaxed font-[family-name:var(--sans)] text-taupe-5 [&_p]:mb-2 [&_p:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );
    }

    default:
      return null;
  }
}
