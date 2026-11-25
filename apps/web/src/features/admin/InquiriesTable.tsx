import { useId, useState } from 'react';
import { Link } from 'react-router';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type FilterFn,
} from '@tanstack/react-table';
import type { Inquiry } from '@white-lotus/shared';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Select } from '../../components/ui/Select';
import { formatDateTime } from '../../lib/format';
import { INQUIRY_LIMIT, useAdminInquiries } from './api';
import { DataTable } from './DataTable';
import { TableSkeleton } from './TableSkeleton';

const PAGE_SIZE = 20;

// Search matches the person's name or email (case-insensitive), whichever column asks.
const nameOrEmail: FilterFn<Inquiry> = (row, _columnId, search: string) => {
  const needle = search.trim().toLowerCase();
  const { name, email } = row.original;
  return name.toLowerCase().includes(needle) || email.toLowerCase().includes(needle);
};

// Columns, fallback data and row ids at module scope: react-table needs stable inputs.
// The person's name comes first: it is the sticky row header while the table scrolls.
// Below md the Date and Property columns are hidden and their values sit under the name; email,
// phone and message stay (they are what an enquiry is for) and scroll inside the table.
const helper = createColumnHelper<Inquiry>();
const columns = [
  helper.accessor('name', {
    header: 'Name',
    sortingFn: 'text',
    cell: (info) => (
      <>
        {info.getValue()}
        <span className="mt-1 flex flex-col gap-1 text-[13px] text-slate md:hidden">
          <PropertyLink inquiry={info.row.original} />
          <EnquiryDate inquiry={info.row.original} />
        </span>
      </>
    ),
  }),
  // Sorted by the timestamp, shown as a readable date.
  helper.accessor((row) => Date.parse(row.created_at), {
    id: 'date',
    header: 'Date',
    sortingFn: 'basic',
    sortDescFirst: true,
    meta: { hideBelowMd: true },
    cell: (info) => <EnquiryDate inquiry={info.row.original} />,
  }),
  helper.accessor('property_name', {
    id: 'property',
    header: 'Property',
    sortingFn: 'text',
    meta: { hideBelowMd: true },
    // The property filter compares ids, so two listings with the same name stay apart.
    filterFn: (row, _columnId, propertyId: number) => row.original.property_id === propertyId,
    cell: (info) => <PropertyLink inquiry={info.row.original} />,
  }),
  helper.accessor('email', {
    header: 'Email',
    sortingFn: 'text',
    cell: (info) => (
      <a href={`mailto:${info.getValue()}`} className="text-link decoration-gold">
        {info.getValue()}
      </a>
    ),
  }),
  helper.accessor('phone', {
    header: 'Phone',
    enableSorting: false,
    cell: (info) => (
      // tel: links take digits and "+" only.
      <a
        href={`tel:${info.getValue().replace(/[^\d+]/g, '')}`}
        className="text-link whitespace-nowrap decoration-gold"
      >
        {info.getValue()}
      </a>
    ),
  }),
  helper.accessor('message', {
    header: 'Message',
    enableSorting: false,
    cell: (info) => <MessageCell text={info.getValue()} />,
  }),
];
const NO_ROWS: Inquiry[] = [];
const getRowId = (row: Inquiry) => String(row.id);

export function InquiriesTable() {
  const searchId = useId();
  const { data, isPending, isError, error, refetch } = useAdminInquiries();
  // Filter state in useState keeps one reference between renders. A new array each render
  // would re-run the filters, which resets the page, on every render.
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [search, setSearch] = useState('');
  const table = useReactTable({
    columns,
    data: data ?? NO_ROWS,
    getRowId,
    state: { columnFilters, globalFilter: search },
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: nameOrEmail,
    initialState: {
      sorting: [{ id: 'date', desc: true }], // newest first
      pagination: { pageIndex: 0, pageSize: PAGE_SIZE },
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // the page goes back to 1 when filters change
  });

  if (isPending) return <TableSkeleton label="Loading enquiries" />;
  if (isError) {
    return (
      <ErrorState
        title="We couldn't load the enquiries"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }
  if (data.length === 0) return <EmptyState title="No enquiries yet" />;

  // One option per property that has enquiries, by name.
  const properties = [...new Map(data.map((i) => [i.property_id, i.property_name]))]
    .map(([id, name]) => ({ value: String(id), label: name }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const propertyColumn = table.getColumn('property');
  const propertyFilter = propertyColumn?.getFilterValue();

  const matching = table.getFilteredRowModel().rows.length;
  const { pageIndex } = table.getState().pagination;
  const first = pageIndex * PAGE_SIZE + 1;
  const last = Math.min(first + PAGE_SIZE - 1, matching);

  function clearFilters() {
    setSearch('');
    setColumnFilters([]);
  }

  return (
    <>
      <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:max-w-2xl">
        <Select
          label="Property"
          value={typeof propertyFilter === 'number' ? String(propertyFilter) : ''}
          options={[{ value: '', label: 'All properties' }, ...properties]}
          onChange={(value) => propertyColumn?.setFilterValue(value ? Number(value) : undefined)}
        />
        <div>
          <label htmlFor={searchId} className="caps mb-2 block text-[10px] text-slate">
            Search
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or email"
            autoComplete="off"
            className="block min-h-11 w-full bg-white p-3 text-sm text-navy placeholder:text-slate"
          />
        </div>
      </div>

      <p aria-live="polite" className="mb-3 text-[13px] text-slate">
        {matching === 0
          ? 'No enquiries match.'
          : `Showing ${first}–${last} of ${matching} ${matching === 1 ? 'enquiry' : 'enquiries'}`}
        {data.length >= INQUIRY_LIMIT && ` (the newest ${INQUIRY_LIMIT} are loaded)`}
      </p>

      {matching === 0 ? (
        <EmptyState title="No enquiries match these filters" className="pt-4">
          <button
            type="button"
            onClick={clearFilters}
            className="text-link text-sm text-navy decoration-gold"
          >
            Clear filters
          </button>
        </EmptyState>
      ) : (
        <>
          <DataTable table={table} caption="Enquiries" />
          {table.getPageCount() > 1 && (
            <nav aria-label="Pages" className="mt-5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="btn-secondary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy"
              >
                Previous
              </button>
              <span className="text-[13px] text-slate tabular-nums">
                Page {pageIndex + 1} of {table.getPageCount()}
              </span>
              <button
                type="button"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="btn-secondary disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-navy"
              >
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </>
  );
}

function EnquiryDate({ inquiry }: { inquiry: Inquiry }) {
  return (
    <time dateTime={inquiry.created_at} className="whitespace-nowrap tabular-nums">
      {formatDateTime(inquiry.created_at)}
    </time>
  );
}

function PropertyLink({ inquiry }: { inquiry: Inquiry }) {
  return (
    <Link to={`/properties/${inquiry.property_id}`} className="text-link decoration-gold">
      {inquiry.property_name}
    </Link>
  );
}

// Longer than this, the message is clamped to two lines with a More / Less toggle.
const LONG_MESSAGE = 120;

function MessageCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= LONG_MESSAGE) return <p className="min-w-64 whitespace-pre-line">{text}</p>;
  return (
    <div className="min-w-64 max-w-md">
      <p className={expanded ? 'whitespace-pre-line' : 'line-clamp-2'}>{text}</p>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
        className="text-link min-h-11 text-[13px] text-slate decoration-gold"
      >
        {expanded ? 'Less' : 'More'}
      </button>
    </div>
  );
}
