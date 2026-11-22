import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { flexRender, type RowData, type Table } from '@tanstack/react-table';
import { cn } from '../../lib/cn';

type DataTableProps<TData extends RowData> = {
  table: Table<TData>;
  caption: string;
  /** Extra last column (e.g. Edit / Delete). Kept out of the column defs so those stay static. */
  actions?: (row: TData) => ReactNode;
};

const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;
// The first column (the name) stays visible while the table scrolls sideways. The inset line
// marks its edge; a real border doesn't move with sticky cells in a collapsed table.
const STICKY = 'sticky left-0 z-10 shadow-[inset_-1px_0_0_rgba(40,45,60,.15)]';

// DESIGN.md §4 Admin: stone background, white rows split by hairlines, small-caps headers.
export function DataTable<TData extends RowData>({
  table,
  caption,
  actions,
}: DataTableProps<TData>) {
  return (
    // Scrolls sideways on its own, so the page never does (no horizontal scroll at 320px).
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id} className="border-b-[0.5px] border-navy/25">
              {group.headers.map((header, index) => {
                const sorted = header.column.getIsSorted();
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={sorted ? ARIA_SORT[sorted] : undefined}
                    className={cn(
                      'caps px-4 text-[10px] font-normal whitespace-nowrap text-slate',
                      index === 0 && `${STICKY} bg-stone`,
                    )}
                  >
                    {header.column.getCanSort() ? (
                      // A real button: keyboard and screen readers can sort; aria-sort says how.
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="caps inline-flex min-h-11 items-center gap-1.5 transition-colors duration-200 hover:text-navy"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon sorted={sorted} />
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                );
              })}
              {actions && (
                <th scope="col" className="caps px-4 text-right text-[10px] font-normal text-slate">
                  Actions
                </th>
              )}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b-[0.5px] border-navy/20 bg-white">
              {row.getVisibleCells().map((cell, index) =>
                // The first cell names the row, so it is a row header.
                index === 0 ? (
                  <th
                    key={cell.id}
                    scope="row"
                    className={cn('px-4 py-3 font-normal text-navy', STICKY, 'bg-white')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </th>
                ) : (
                  <td key={cell.id} className="px-4 py-3 text-navy">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ),
              )}
              {actions && (
                <td className="px-4 py-1 text-right whitespace-nowrap">{actions(row.original)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  const Icon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown;
  return (
    <Icon
      aria-hidden
      size={12}
      strokeWidth={1.5}
      className={sorted ? 'text-gold-text' : 'opacity-50'}
    />
  );
}
