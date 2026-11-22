import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toast } from 'sonner';
import type { Inquiry, Property } from '@white-lotus/shared';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApiError } from '../../lib/apiClient';
import { STATUS_LABELS, formatPrice } from '../../lib/format';
import { queryKeys } from '../../lib/queryKeys';
import { INQUIRY_LIMIT, useAdminProperties, useDeleteProperty } from './api';
import { DataTable } from './DataTable';

// Columns, fallback data and row ids at module scope: react-table needs stable inputs.
// Built-in sorting functions: `text` for names and labels, `basic` for numbers.
const helper = createColumnHelper<Property>();
const columns = [
  helper.accessor('name', { header: 'Name', sortingFn: 'text' }),
  helper.accessor('location', { header: 'Location', sortingFn: 'text' }),
  helper.accessor('price', {
    header: 'Price',
    sortingFn: 'basic',
    cell: (info) => <span className="tabular-nums">{formatPrice(info.getValue())}</span>,
  }),
  helper.accessor('bedrooms', { header: 'Beds', sortingFn: 'basic' }),
  // Sorted by the label people see, not the stored value.
  helper.accessor((row) => STATUS_LABELS[row.status], {
    id: 'status',
    header: 'Status',
    sortingFn: 'text',
  }),
];
const NO_ROWS: Property[] = [];
const getRowId = (row: Property) => String(row.id);

export function PropertiesTable() {
  const { data, isPending, isError, error, refetch } = useAdminProperties();
  const table = useReactTable({
    columns,
    data: data ?? NO_ROWS,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // client-side sorting by header click
  });
  const queryClient = useQueryClient();
  const deleteProperty = useDeleteProperty();
  const [toDelete, setToDelete] = useState<Property | null>(null);

  function confirmDelete() {
    if (!toDelete) return;
    const { id, name } = toDelete;
    deleteProperty.mutate(id, {
      onSuccess: () => toast.success(`${name} was deleted.`),
      onError: (err) => {
        // A 401 brings back the key prompt (apiClient interceptor); no toast needed.
        if (err instanceof ApiError && err.status === 401) return;
        toast.error(`Could not delete ${name}. ${err.message}`);
      },
      onSettled: () => setToDelete(null),
    });
  }

  if (isPending) return <TableSkeleton />;
  if (isError) {
    return (
      <ErrorState
        title="We couldn't load the properties"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }
  if (data.length === 0) return <EmptyState title="No properties yet" />;

  return (
    <>
      <DataTable
        table={table}
        caption="Properties"
        actions={(property) => (
          <button
            type="button"
            onClick={() => setToDelete(property)}
            className="text-link min-h-11 text-[13px] text-danger decoration-danger"
          >
            Delete<span className="sr-only"> {property.name}</span>
          </button>
        )}
      />
      <ConfirmDialog
        open={toDelete !== null}
        title={`Delete ${toDelete?.name ?? ''}?`}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        pending={deleteProperty.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      >
        {toDelete &&
          cascadeMessage(toDelete, queryClient.getQueryData<Inquiry[]>(queryKeys.inquiries))}
      </ConfirmDialog>
    </>
  );
}

/**
 * Deleting a property also deletes its inquiries (FK cascade). The count comes from the cached
 * inquiries (loaded by the key check) when there are any; that list stops at INQUIRY_LIMIT rows,
 * so a full list can only give a minimum.
 */
function cascadeMessage(property: Property, inquiries: Inquiry[] | undefined): string {
  const end = "This can't be undone.";
  const general = `Any enquiries for it will also be deleted. ${end}`;
  if (!inquiries) return general;

  const count = inquiries.filter((inquiry) => inquiry.property_id === property.id).length;
  const capped = inquiries.length >= INQUIRY_LIMIT;
  if (count === 0) return capped ? general : end;
  const noun = count === 1 ? 'enquiry' : 'enquiries';
  return capped
    ? `At least ${count} ${noun} for it will also be deleted. ${end}`
    : `Its ${count} ${noun} will also be deleted. ${end}`;
}

function TableSkeleton() {
  return (
    <div role="status">
      <span className="sr-only">Loading properties</span>
      <div aria-hidden="true" className="space-y-px">
        <Skeleton className="h-11 w-full" />
        {Array.from({ length: 5 }, (_, i) => (
          // Placeholders have no id and never reorder, so the index is a stable key here.
          <Skeleton key={i} className="h-12 w-full opacity-60" />
        ))}
      </div>
    </div>
  );
}
