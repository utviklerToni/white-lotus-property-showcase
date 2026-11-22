import { Skeleton } from '../../components/ui/Skeleton';

/** Header bar plus five row placeholders while an admin table loads. */
export function TableSkeleton({ label }: { label: string }) {
  return (
    <div role="status">
      <span className="sr-only">{label}</span>
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
