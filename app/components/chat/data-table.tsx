import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '~/components/ui/table';

interface DataTableProps {
  /** Column header labels */
  columns: string[];
  /** Row data — each row is an array of cell values matching column order */
  rows: string[][];
  /** Optional className for the outer wrapper */
  className?: string;
}

/**
 * Renders a data table inside an artifact.
 * Uses .data-tbl class for monospace font, clean borders,
 * and horizontal scroll on overflow.
 */
export function DataTable({ columns, rows, className }: DataTableProps) {
  return (
    <div className={className}>
      <Table className="font-[family-name:var(--mono)] text-xs">
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i} className="text-left px-2.5 py-1.5 text-xs font-semibold tracking-widest uppercase text-[var(--taupe-3)] border-b-2 border-[var(--taupe-2)] dark:border-[var(--taupe-3)]">{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <TableCell key={cellIdx} className="px-2.5 py-1.5 text-[var(--taupe-5)] border-b border-[var(--taupe-1)] dark:border-[var(--surface-3)]" dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
