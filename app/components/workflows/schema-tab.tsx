// ============================================
// SchemaTab — Template input/output schema
// ============================================

import type { WorkflowTemplate } from '~/services/types';
import { SectionPanel } from '~/components/ui/section-panel';
import { cn } from '~/lib/utils';

const TYPE_COLORS: Record<string, string> = {
  string: 'text-blue-3 border-blue-3 bg-[rgba(var(--blue-3-rgb),0.06)] dark:bg-[rgba(var(--blue-3-rgb),0.12)]',
  number: 'text-violet-3 border-violet-3 bg-[rgba(var(--violet-3-rgb),0.06)] dark:bg-[rgba(var(--violet-3-rgb),0.12)]',
  date: 'text-amber border-amber bg-[rgba(var(--amber-rgb),0.06)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
  currency: 'text-green border-green bg-[rgba(var(--green-rgb),0.06)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  enum: 'text-berry-3 border-berry-3 bg-[rgba(var(--berry-3-rgb),0.06)] dark:bg-[rgba(var(--berry-3-rgb),0.12)]',
  boolean: 'text-taupe-3 border-taupe-3 bg-[rgba(var(--taupe-3-rgb),0.06)] dark:bg-[rgba(var(--taupe-3-rgb),0.12)]',
};

const FORMAT_COLORS: Record<string, string> = {
  pdf: 'text-red border-red bg-[rgba(var(--red-rgb),0.08)] dark:bg-[rgba(var(--red-rgb),0.12)]',
  xlsx: 'text-green border-green bg-[rgba(var(--green-rgb),0.08)] dark:bg-[rgba(var(--green-rgb),0.12)]',
  csv: 'text-blue-3 border-blue-3 bg-[rgba(var(--blue-3-rgb),0.08)] dark:bg-[rgba(var(--blue-3-rgb),0.12)]',
  docx: 'text-violet-3 border-violet-3 bg-[rgba(var(--violet-3-rgb),0.08)] dark:bg-[rgba(var(--violet-3-rgb),0.12)]',
  json: 'text-amber border-amber bg-[rgba(var(--amber-rgb),0.08)] dark:bg-[rgba(var(--amber-rgb),0.12)]',
};

/** Displays input and output schema for a workflow template */
export function SchemaTab({ template }: { template: WorkflowTemplate }) {
  const { inputSchema, outputSchema } = template;

  return (
    <div>
      {/* Input Schema */}
      <SectionPanel title="Input Schema">
        {inputSchema.description && (
          <p className="font-sans text-[0.8125rem] text-taupe-4 dark:text-taupe-3 leading-normal mb-3.5">{inputSchema.description}</p>
        )}

        {inputSchema.fields.length > 0 && (
          <div className="flex flex-col">
            {inputSchema.fields.map((field) => (
              <div key={field.name} className="py-2.5 border-b border-taupe-1 dark:border-surface-3 last:border-b-0 last:pb-0 first:pt-0">
                <div className="flex items-center gap-2 mb-[3px]">
                  <span className="font-mono text-xs font-bold text-taupe-5 dark:text-taupe-4">{field.name}</span>
                  <span className={cn(
                    'font-mono text-[0.625rem] font-semibold py-px px-1.5 border rounded-r-sm uppercase tracking-[0.04em]',
                    TYPE_COLORS[field.type],
                  )}>
                    {field.type}
                  </span>
                  {field.required && (
                    <span className="font-mono text-[0.5625rem] font-semibold text-red uppercase tracking-[0.06em]">Required</span>
                  )}
                </div>
                <div className="font-sans text-xs text-taupe-3 leading-[1.4]">{field.description}</div>
                {field.type === 'enum' && field.options && field.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {field.options.map((opt) => (
                      <span key={opt} className="font-mono text-[0.625rem] py-[2px] px-1.5 bg-off-white dark:bg-taupe-1 border border-taupe-2 text-taupe-4 rounded-r-sm">{opt}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionPanel>

      {/* Output Schema */}
      <SectionPanel title="Output Schema" className="mt-3">
        <div className="flex items-center gap-2.5 mb-3.5">
          {outputSchema.format && (
            <span className={cn(
              'font-mono text-[0.625rem] font-semibold py-px px-1.5 border rounded-r-sm uppercase tracking-[0.04em]',
              FORMAT_COLORS[outputSchema.format],
            )}>
              {outputSchema.format.toUpperCase()}
            </span>
          )}
          {outputSchema.destination && (
            <span className="font-mono text-xs text-taupe-3">{outputSchema.destination}</span>
          )}
        </div>

        {outputSchema.columns && outputSchema.columns.length > 0 && (
          <div className="mt-0">
            <div className="font-mono text-[0.625rem] font-semibold text-taupe-3 uppercase tracking-[0.08em] mb-2">Columns</div>
            <div className="flex flex-wrap gap-1.5">
              {outputSchema.columns.map((col) => (
                <span key={col} className="font-mono text-[0.6875rem] font-medium py-[3px] px-2 bg-off-white dark:bg-taupe-1 border border-taupe-2 text-taupe-5 rounded-r-sm">{col}</span>
              ))}
            </div>
          </div>
        )}
      </SectionPanel>
    </div>
  );
}
