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
      <Table className="data-tbl">
        <TableHeader>
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, rowIdx) => (
            <TableRow key={rowIdx}>
              {row.map((cell, cellIdx) => (
                <TableCell key={cellIdx} dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
