import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { flexRender, type RowData, type Table } from '@tanstack/react-table';
import { cn } from '../../lib/cn';

declare module '@tanstack/react-table' {
  // Type parameters must match react-table's own declaration, even though they are unused here.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- required by declaration merging
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Hides the column (header, sort button and cells) below md, so the table fits a phone. */
    hideBelowMd?: boolean;
  }
}

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
const BELOW_MD_HIDDEN = 'max-md:hidden';
// Cell padding: tighter on phones so Name, Status and Actions fit at 320px; 16px from md.
const CELL_X = 'px-2.5 md:px-4';

// DESIGN.md §4 Admin: stone background, white rows split by hairlines, small-caps headers.
export function DataTable<TData extends RowData>({
  table,
  caption,
  actions,
}: DataTableProps<TData>) {
  return (
    // Scrolls sideways on its own, so the page never does (no horizontal scroll at 320px).
    // `relative` makes it the containing block of absolutely positioned descendants (the sr-only
    // text in the action buttons); without it they escape the scroller and widen the page.
    // Phones get no minimum width: the low-priority columns are hidden there instead.
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm md:min-w-[640px]">
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
                      'caps text-[10px] font-normal whitespace-nowrap text-slate',
                      CELL_X,
                      index === 0 && `${STICKY} bg-stone`,
                      header.column.columnDef.meta?.hideBelowMd && BELOW_MD_HIDDEN,
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
                <th
                  scope="col"
                  className={cn('caps text-right text-[10px] font-normal text-slate', CELL_X)}
                >
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
                    className={cn('py-3 font-normal text-navy', CELL_X, STICKY, 'bg-white')}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </th>
                ) : (
                  <td
                    key={cell.id}
                    className={cn(
                      'py-3 text-navy',
                      CELL_X,
                      cell.column.columnDef.meta?.hideBelowMd && BELOW_MD_HIDDEN,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ),
              )}
              {actions && (
                <td className={cn('py-1 text-right whitespace-nowrap', CELL_X)}>
                  {actions(row.original)}
                </td>
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
